# Scaffold Export Naming Conventions

# General Notes

The Scaffold class exports a number of properties that provide functions, generally per-Model, for different common CRUD and REST API operations. Some of these include

- Parameter parsing
- create / update data validation
- response formatting / serialization
- ORM query operations
- combinations of the above

# Naming Conventions

The general naming convention is as follows

### `scaffold.[accessor].[name].[operation]`

- `scaffold` is a variable that points to your Scaffold instance with some assumed number of loaded models. This will always be the entry point into Scaffold.

- `accessor` is a string acting as a namespace to indicate which subset of functions you want to use. This will always be some property exported from `Scaffold` itself and should have TypeScript support showing the different available options.

- `name` is a property value that will correspond to one of your loaded models. These models come from the values passed to `Scaffold` at creation. Each of your model contains a `name` fields, these properties will reflect those `name` fields.

  - By convention, because this is being used as a class, the name should start with a capital letter.

- `operation` is a property that reflects the different ORM/CRUD operations that you would like to perform or prepare data for. Because this is called off a specific model the general properties and attribute validation for that model will apply when running the operation.



# `scaffold.middleware.[modelName|allModels]` 

### `scaffold.middleware.[modelName].[findAll|findOne|findAndCountAll|create|update|destroy|crud]`
All of the `middleware` functions export a Koa Middleware that can be passed directly to a Koa app.use or a Koa router.[verb] function, mounted to a specific URL/path. The normal [modelName] export expects to be used with: 

- `findAll`
- `findOne`
- `findAndCountAll`
- `create`
- `update`
- `destroy`
- `crud`

Usage Examples:
```
router.get("/get-all-skills", scaffold.middleware.Skill.findAll)
router.get("/count-all-skills", scaffold.middleware.Skill.findAndCountAll)
router.get("/get-one-skill/:id", scaffold.middleware.Skill.findOne)
```

A bit more unusual case, but that could be done, is a `router.all` that then uses the `crud` helper to perform the correct operation
```
router.all("/crud-skills", scaffold.middleware.Skill.crud)
router.all("/crud-skills/:id", scaffold.middleware.Skill.crud)
```

### `scaffold.middleware.allModels.[frontend|schema|crud|everything]`
In certain cases there are 'allModels' exports that can be used in place of a single `name`. Here is an example of those more general versions:

```
app.use(scaffold.middleware.allModels.everything) // Maybe use `all` here because `everything` is already used as an accessor name? or `allOperations` to go with `allModels`?
```

If you wanted to use a Koa Router to provide the model and id information to your endpoints
```
router.all('/custom/:model', scaffold.middleware.allModels.crud)
router.all('/custom/:model/:id', scaffold.middleware.allModels.crud)
```

These global middleware functions can act against all models and need a bit more information in order to match them against a specific URL. These should generally be used with an `app.use`. They *can* be used with a specific URL and Router as seen above, but the URL must specify the parameters :model and :id in order for Scaffold to resolve the model (and id) correctly. 

Used with: 
- `frontend`
- `schema`
- `crud`
- `everything`

Usage Examples:

The `frontend` function specifically could be used to serve the HTML/JS required to view the webapp
```
app.use(scaffold.middleware.allModels.frontend)
```

The `schema` operation could be used to return schema information to the caller, getting meta information about the underlying models themselves. Something like this would be required for creating a 'low-code' type solution from this tool.
```
app.use(scaffold.middleware.allModels.schema)
```

The `crud` operation could be used to attach listeners for every CRUD operation specifically, create, read, update, delete only.
```
app.use(scaffold.middleware.allModels.crud)
```

The `everything` operation would be used to hook up all of the above in a single go.
```
app.use(scaffold.middleware.allModels.everything)
```

# `scaffold.parse.[modelName]`

### `scaffold.parse.[modelName].[findAll|findOne|findAndCountAll|create|update|destroy]`
The `parse` functions take a given model and return options that can be passed to the ORM to make a corresponding model query.

- `findAll`: (`query`: ParsedUrlQuery) => `FindOptions`;
- `findOne`: (`query`: ParsedUrlQuery, id: Identifier) => `FindOptions`;
- `findAndCountAll`: (`query`: ParsedUrlQuery) => `FindOptions`;
- `create`: (`body`: unknown) => `CreateOptions`;
- `update`: (`body`: unknown, `id`?: Identifier) => `UpdateOptions`;
- `destroy`: (`query`: ParsedUrlQuery, `id`?: Identifier) => `DestroyOptions`;

These functions are expected to be used more directly, usually when defining user-created middleware. 

For example `scaffold.parse.Skill.findAll` takes the URL query params and returns Sequelize `FindOptions`. For this sort of request the query params are processed to see if there are any filters, sorts, or other restrictions being placed on the findAll query.

```typescript
  router.get("/skills", async (ctx: Context) => {
    const params = await scaffold.parse.Skill.findAll(ctx.query);
    const result = await scaffold.model.Skill.findAll(params);
    ctx.body = result;
  });
```

The returned FindOptions are something that can be directly understood by the ORM and our follow up call to `scaffold.model.Skill.findAll` takes advantage of this to do the actual database lookup for Skills.

### `scaffold.parse.allModels`
This export probably does not need to exist as it doesnt make sense in the context of creating options for a specific ORM query.

# `scaffold.model.[modelName]`

### `scaffold.model.[modelName].[findAll|findOne|findAndCountAll|create|update|destroy]`
The `model` functions take a given model and perform the underlying ORM query option on it.

- `findAll`: (`ops`: FindOptions) => `Model[]`;
- `findOne`: (`ops`: FindOptions, `id`: Identifier) => `Model`;
- `findAndCountAll`: (`ops`: FindOptions) => `{count: number, rows: Model[]}`;
- `create`: (`body`: unknown, `ops`: CreateOptions) => `data`;
- `update`: (`body`: unknown, `ops`: UpdateOptions, `id`?: Identifier) => `number`;
- `destroy`: (`ops`: DestroyOptions, `id`?: Identifier) => `number`;

### `scaffold.model.allModels`
This export probably does not need to exist as it doesnt make sense in the context of ORM queries.


# `scaffold.everything.[modelName]`

### `scaffold.everything.[modelName].[findAll|findOne|findAndCountAll|create|update|destroy]`

Functions very similar to the `middleware` export but is expected to be used more directly, usually when defining user-created middleware. 

The `everything` functions takes the same properties as `parse` but goes further than just building the query options. This function will do a complete operation of parsing the request, performing the ORM query operation and then serializing the resulting data to JSON:API format.

- `findAll`: (`query`: ParsedUrlQuery) => `FindOptions`;
- `findOne`: (`query`: ParsedUrlQuery, id: Identifier) => `FindOptions`;
- `findAndCountAll`: (`query`: ParsedUrlQuery) => `FindOptions`;
- `create`: (`body`: unknown) => `CreateOptions`;
- `update`: (`body`: unknown, `id`?: Identifier) => `UpdateOptions`;
- `destroy`: (`query`: ParsedUrlQuery, `id`?: Identifier) => `DestroyOptions`;

For example `scaffold.everything.Skill.findAll` takes the URL query params and directly returns JSON:API ready response data.

```typescript
  router.get("/skills", async (ctx: Context) => {
    const result = await scaffold.everything.Skill.findAll(ctx.query);
    ctx.body = result;
  });
```

### `scaffold.everything.allModels`
This export probably does not need to exist as it doesnt make sense in the context of creating options for a specific ORM query.


# `scaffold.serialize.[modelName]`

### `scaffold.serialize.[modelName].[findAll|findOne|findAndCountAll|create|update|destroy|error]`
Functions expected to be used to create valid JSON:API response data. Normally these functions will take Model data that was returned from the ORM query. This export also includes a slightly different function for helping create JSON:API compliant Error responses.

- `findAll`: (`data`: Model[], `ops`: SerializerOptions) => `JSON:API Response`;
- `findOne`: (`data`: Model, `ops`: SerializerOptions) => `JSON:API Response`;
- `findAndCountAll`:(`data`: {count: number; rows: Model[]}, `ops`: SerializerOptions) => `JSON:API Response`;
- `create`: (`data`: Model, `ops`: SerializerOptions) => `JSON:API Response`;
- `update`: (`count`: number, `ops`: SerializerOptions) => `JSON:API Response`;
- `destroy`: (`count`: number, `ops`: SerializerOptions) => `JSON:API Response`;
- `error`: (`ops`: JSONAPIErrorOptions ) => `HTTP Error Response`