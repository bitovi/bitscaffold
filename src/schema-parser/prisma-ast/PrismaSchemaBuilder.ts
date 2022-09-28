import * as schema from './getSchema';
import { PrintOptions, printSchema } from './printSchema';

/** Returns the function type Original with its return type changed to NewReturn. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ReplaceReturnType<Original extends (...args: any) => any, NewReturn> = (
  ...a: Parameters<Original>
) => NewReturn;

/**
 * Methods with return values that do not propagate the builder should not have
 * their return value modified by the type replacement system below
 * */
type ExtractKeys = 'getSchema' | 'getSubject' | 'getParent' | 'print';

/** These keys preserve the return value context that they were given */
type NeutralKeys = 'break' | 'comment' | 'attribute' | 'enumerator';

/** Keys allowed when you call .datasource() or .generator() */
type DatasourceOrGeneratorKeys = 'assignment';

/** Keys allowed when you call .enum("name") */
type EnumKeys = 'enumerator';

/** Keys allowed when you call .field("name") */
type FieldKeys = 'attribute';

/** Keys allowed when you call .model("name") */
type ModelKeys = 'blockAttribute' | 'field';

/**
 * Utility type for making the PrismaSchemaBuilder below readable:
 * Removes methods from the builder that are prohibited based on the context
 * the builder is in. For example, you can add fields to a model, but you can't
 * add fields to an enum or a datasource.
 */
type PrismaSchemaSubset<
  Universe extends keyof ConcretePrismaSchemaBuilder,
  Method
> = ReplaceReturnType<
  ConcretePrismaSchemaBuilder[Universe],
  PrismaSchemaBuilder<Exclude<keyof ConcretePrismaSchemaBuilder, Method>>
>;

/**
 * The brain of this whole operation: depending on the key of the method name
 * we receive, filter the available list of method calls the user can make to
 * prevent them from making invalid calls, such as builder.datasource().field()
 * */
type PrismaSchemaBuilder<K extends keyof ConcretePrismaSchemaBuilder> = {
  [U in K]: U extends ExtractKeys
    ? ConcretePrismaSchemaBuilder[U]
    : U extends NeutralKeys
    ? ConcretePrismaSchemaBuilder[U] //ReplaceReturnType<ConcretePrismaSchemaBuilder[U], PrismaSchemaBuilder<K>>
    : U extends 'datasource'
    ? PrismaSchemaSubset<U, 'datasource' | EnumKeys | FieldKeys | ModelKeys>
    : U extends 'generator'
    ? PrismaSchemaSubset<U, EnumKeys | FieldKeys | ModelKeys>
    : U extends 'model'
    ? PrismaSchemaSubset<U, DatasourceOrGeneratorKeys | EnumKeys | FieldKeys>
    : U extends 'field'
    ? PrismaSchemaSubset<U, DatasourceOrGeneratorKeys | EnumKeys>
    : U extends 'enum'
    ? PrismaSchemaSubset<U, DatasourceOrGeneratorKeys | ModelKeys | FieldKeys>
    : PrismaSchemaSubset<
        U,
        DatasourceOrGeneratorKeys | EnumKeys | FieldKeys | ModelKeys | 'comment'
      >;
};

type Arg =
  | string
  | {
      name: string;
      function?: Arg[];
    };
type Parent = schema.Block | undefined;
type Subject = schema.Block | schema.Field | undefined;

export class ConcretePrismaSchemaBuilder {
  private schema: schema.Schema;
  private _subject: Subject;
  private _parent: Parent;

  constructor(source = '') {
    this.schema = schema.getSchema(source);
  }

  /** Prints the schema out as a source string */
  print(options: PrintOptions = {}): string {
    return printSchema(this.schema, options);
  }

  /** Returns the underlying schema object for more advanced use cases. */
  getSchema(): schema.Schema {
    return this.schema;
  }

  /** Adds or updates a generator block based on the name. */
  generator(name: string, provider: string): this {
    const generator: schema.Generator = this.schema.list.reduce<
      schema.Generator
    >(
      (memo, block) =>
        block.type === 'generator' && block.name === name ? block : memo,
      {
        type: 'generator',
        name,
        assignments: [
          { type: 'assignment', key: 'provider', value: `"${provider}"` },
        ],
      }
    );

    this.schema.list.push(generator);
    this._subject = generator;
    return this;
  }

  drop(name: string): this {
    const index = this.schema.list.findIndex(
      block => 'name' in block && block.name === name
    );
    this.schema.list.splice(index, 1);
    return this;
  }

  /** Sets the datasource for the schema. */
  datasource(provider: string, url: string | { env: string }): this {
    const datasource: schema.Datasource = {
      type: 'datasource',
      name: 'db',
      assignments: [
        {
          type: 'assignment',
          key: 'url',
          value:
            typeof url === 'string'
              ? `"${url}"`
              : { type: 'function', name: 'env', params: [`"${url.env}"`] },
        },
        { type: 'assignment', key: 'provider', value: provider },
      ],
    };
    const existingIndex = this.schema.list.findIndex(
      block => block.type === 'datasource'
    );
    this.schema.list.splice(
      existingIndex,
      existingIndex !== -1 ? 1 : 0,
      datasource
    );
    this._subject = datasource;
    return this;
  }

  /** Adds or updates a model based on the name. Can be chained with .field() or .modelAttribute() to add to it. */
  model(name: string): this {
    const model: schema.Model = { type: 'model', name, properties: [] };
    this.schema.list.push(model);
    this._subject = model;
    return this;
  }

  /** Adds or updates an enum based on the name. Can be chained with .enumerator() to add a value to it. */
  enum(name: string, enumeratorNames: string[] = []): this {
    const e: schema.Enum = {
      type: 'enum',
      name,
      enumerators: enumeratorNames.map(name => ({ type: 'enumerator', name })),
    };
    this.schema.list.push(e);
    this._subject = e;
    return this;
  }

  enumerator(value: string): this {
    const subject = this.getSubject<schema.Enum>();
    if (!subject || !('type' in subject) || subject.type !== 'enum') {
      throw new Error('Subject must be a prisma model!');
    }

    subject.enumerators.push({ type: 'enumerator', name: value });
    return this;
  }

  /**
   * Returns the current subject, such as a model, field, or enum.
   * @example
   * builder.getModel('User').field('firstName').getSubject() // the firstName field
   * */
  private getSubject<S extends Subject>(): S {
    return this._subject as S;
  }

  /** Returns the parent of the current subject when in a nested context. The parent of a field is its model. */
  private getParent<S extends Parent = schema.Model>(): S {
    return this._parent as S;
  }

  /**
   * Adds a block-level attribute to the current model.
   * @example
   * builder.model('Project')
   *   .blockAttribute("map", "projects")
   *   .blockAttribute("unique", ["firstName", "lastName"]) // @@unique([firstName, lastName])
   * */
  blockAttribute(
    name: string,
    args?: string | string[] | Record<string, schema.Value>
  ): this {
    let subject = this.getSubject<schema.Model>();
    if (!subject || !('type' in subject) || subject.type !== 'model') {
      const parent = this.getParent<schema.Model>();
      if (!parent || !('type' in parent) || parent.type !== 'model')
        throw new Error('Subject must be a prisma model!');

      subject = this._subject = parent;
    }

    const attributeArgs = ((): schema.AttributeArgument[] => {
      if (!args) return [] as schema.AttributeArgument[];
      if (typeof args === 'string')
        return [{ type: 'attributeArgument', value: `"${args}"` }];
      if (Array.isArray(args))
        return [{ type: 'attributeArgument', value: { type: 'array', args } }];
      return Object.entries(args).map(([key, value]) => ({
        type: 'attributeArgument',
        value: { type: 'keyValue', key, value },
      }));
    })();

    const property: schema.ModelAttribute = {
      type: 'attribute',
      kind: 'model',
      name,
      args: attributeArgs,
    };
    subject.properties.push(property);
    return this;
  }

  /** Adds an attribute to the current field. */
  attribute<T extends schema.Field>(
    name: string,
    args?: Arg[] | Record<string, string[]>
  ): this {
    const parent = this.getParent();
    const subject = this.getSubject<T>();
    if (!parent || !('type' in parent) || parent.type !== 'model') {
      throw new Error('Parent must be a prisma model!');
    }

    if (!subject || !('type' in subject) || subject.type !== 'field') {
      throw new Error('Subject must be a prisma field!');
    }

    if (!subject.attributes) subject.attributes = [];
    const attribute = subject.attributes.reduce<schema.Attribute>(
      (memo, attr) =>
        attr.type === 'attribute' && attr.name === name ? attr : memo,
      {
        type: 'attribute',
        kind: 'field',
        name,
      }
    );

    if (Array.isArray(args)) {
      const mapArg = (arg: Arg): schema.Value | schema.Func => {
        return typeof arg === 'string'
          ? arg
          : {
              type: 'function',
              name: arg.name,
              params: arg.function?.map(mapArg) ?? [],
            };
      };

      if (args.length > 0)
        attribute.args = args.map(arg => ({
          type: 'attributeArgument',
          value: mapArg(arg),
        }));
    } else if (typeof args === 'object') {
      attribute.args = Object.entries(args).map(([key, value]) => ({
        type: 'attributeArgument',
        value: { type: 'keyValue', key, value: { type: 'array', args: value } },
      }));
    }

    if (!subject.attributes.includes(attribute))
      subject.attributes.push(attribute);

    return this;
  }

  /** Add an assignment to a generator or datasource */
  assignment<T extends schema.Generator | schema.Datasource>(
    key: string,
    value: string
  ): this {
    const subject = this.getSubject<T>();
    if (
      !subject ||
      !('type' in subject) ||
      !['generator', 'datasource'].includes(subject.type)
    )
      throw new Error('Subject must be a prisma generator or datasource!');

    function tap<T>(subject: T, callback: (s: T) => void) {
      callback(subject);
      return subject;
    }

    const assignment = subject.assignments.reduce<schema.Assignment>(
      (memo, assignment) =>
        assignment.type === 'assignment' && assignment.key === key
          ? tap(assignment, a => {
              a.value = `"${value}"`;
            })
          : memo,
      {
        type: 'assignment',
        key,
        value: `"${value}"`,
      }
    );

    if (!subject.assignments.includes(assignment))
      subject.assignments.push(assignment);

    return this;
  }

  private blockInsert(statement: schema.Break | schema.Comment): this {
    let subject = this.getSubject<schema.Block>();
    const allowed = ['datasource', 'enum', 'generator', 'model'];
    if (!subject || !('type' in subject) || !allowed.includes(subject.type)) {
      const parent = this.getParent<schema.Block>();
      if (!parent || !('type' in parent) || !allowed.includes(parent.type)) {
        throw new Error('Subject must be a prisma block!');
      }

      subject = this._subject = parent;
    }

    switch (subject.type) {
      case 'datasource': {
        subject.assignments.push(statement);
        break;
      }
      case 'enum': {
        subject.enumerators.push(statement);
        break;
      }
      case 'generator': {
        subject.assignments.push(statement);
        break;
      }
      case 'model': {
        subject.properties.push(statement);
        break;
      }
    }
    return this;
  }

  /** Add a line break */
  break(): this {
    const lineBreak: schema.Break = { type: 'break' };
    return this.blockInsert(lineBreak);
  }

  /**
   * Add a comment. Regular comments start with // and do not appear in the
   * prisma AST. Node comments start with /// and will appear in the AST,
   * affixed to the node that follows the comment.
   * */
  comment(text: string, node = false): this {
    const comment: schema.Comment = {
      type: 'comment',
      text: `//${node ? '/' : ''} ${text}`,
    };
    return this.blockInsert(comment);
  }

  /**
   * Add a comment to the schema. Regular comments start with // and do not appear in the
   * prisma AST. Node comments start with /// and will appear in the AST,
   * affixed to the node that follows the comment.
   * */
  schemaComment(text: string, node = false): this {
    const comment: schema.Comment = {
      type: 'comment',
      text: `//${node ? '/' : ''} ${text}`,
    };
    this.schema.list.push(comment);
    return this;
  }

  /** Add a field to the current model. The field can be customized further with one or more .attribute() calls. */
  field(name: string, fieldType: string | schema.Func): this {
    let subject = this.getSubject<schema.Model>();
    if (!subject || !('type' in subject) || subject.type !== 'model') {
      const parent = this.getParent<schema.Model>();
      if (!parent || !('type' in parent) || parent.type !== 'model')
        throw new Error('Subject must be a prisma model!');

      subject = this._subject = parent;
    }

    const field: schema.Field = {
      type: 'field',
      name,
      fieldType,
    };
    subject.properties.push(field);
    this._parent = subject;
    this._subject = field;
    return this;
  }

  /**
   * Returns the current subject, allowing for more advanced ways of
   * manipulating the schema.
   * */
  then<R extends schema.Block>(callback: (subject: R) => R): this {
    callback(this._subject as R);
    return this;
  }
}

export function createPrismaSchemaBuilder(
  source?: string
): PrismaSchemaBuilder<
  Exclude<
    keyof ConcretePrismaSchemaBuilder,
    DatasourceOrGeneratorKeys | EnumKeys | FieldKeys | ModelKeys
  >
> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new ConcretePrismaSchemaBuilder(source) as any;
}
