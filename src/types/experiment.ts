
import { DataTypes, ModelAttributes, Model, Sequelize, InferAttributes, InferCreationAttributes, ModelStatic, ModelCtor } from "sequelize";
const _seqModelSymbol = Symbol('underlying-sequelize-model');

interface ScaffoldModelDefinition {
    attributes: ModelAttributes;
    name: string
}

type InferModel<T extends Model<any, any>> = Model<InferAttributes<T>, InferCreationAttributes<T>>;

interface ScaffoldModel<T extends InferModel<T>> extends ScaffoldModelDefinition {
    // eslint-disable-next-line @typescript-eslint/ban-types
    findAll: ModelCtor<T>['findAll'];
}

export const Skill: ScaffoldModelDefinition = {
    name: "Skill",
    attributes: {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
    }
};

interface SkillModel extends InferModel<SkillModel> {
    id: string,
    name: string
}

const sequelize = new Sequelize("sqlite::memory:", {
    logging: false,
});

function createModel<Q extends Model<any, any>, T extends ScaffoldModelDefinition = ScaffoldModelDefinition>(modeldef: T): ScaffoldModel<Q> {
    const temp = sequelize.define<Q>(modeldef.name, modeldef.attributes);

    const model: ScaffoldModel<Q> = {
        name: modeldef.name,
        attributes: modeldef.attributes,
        findAll: temp.findAll
    }

    return model;
}


const TestSkillModel = createModel<SkillModel>(Skill);
const result = TestSkillModel.findAll({ attributes: ["name", "id", "fish"] })
console.log(result);


function pickObjectKeys<T, K extends keyof T>(obj: T, keys: K[]) {
    const result = {} as Pick<T, K>
    for (const key of keys) {
        if (key in obj) {
            result[key] = obj[key]
        }
    }
    return result
}

const language = {
    name: "TypeScript",
    age: 8,
    extensions: ['ts', 'tsx']
}

const ageAndExtensions = pickObjectKeys(language, ['age', 'extensions']);
console.log(ageAndExtensions);