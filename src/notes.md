I have a custom database schema/model, very much based on Sequelize Model attributes, that gets turned into Sequelize models at runtime. I would like to, somehow, tell typescript that the things being loaded in should: 
1) Show up as valid models on the sequelize.models.* object
2) Have the proper auto-complete for the different fields from the schema file

Is this even possible? And how would I go about doing it if so? 

Here is an example schema:
```
const attributes: ModelAttributes<Model> = {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    integerProperty: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
    },
    stringProperty: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
};

```

The part that really matters here is the `attributes`. Those can map directly to a Sequelize `ModelAttributes<Model>` type, I believe. The attributes are later passed to `sequelize.define` to actually create the model internally, which is then attached to `sequelize.models['model_name_here]`

```
// Register our model with Sequelize, it ends up attached to sequelize.models.*
const ScaffoldTest = sequelize.define(
    ScaffoldTestSchema.name,
    ScaffoldTestSchema.attributes
);
```

If I just create an object with some attributes and tell it that it is a SequelizeTest I get some of the errors that I would expect. I get an error on badProperty because it wasnt defined on the model attributes.
```
const test: Model<typeof ScaffoldTest> = {
    badProperty: "test",
    stringProperty: "good",
    integerProperty: 1,
};
```

However using it inside of a model query doesnt seem to apply the same validation and I'm not sure how to use the Generics to tell it what the type is... the following does not show any errors... 
```
const test = {
    badProperty: "test",
    stringProperty: "good",
    integerProperty: 1,
};

const record = ScaffoldTest.create(test);
```

And similar for something like a findAll, I would want it to show me attribute options for like the where clause...
```

// How do I tell findAll that it has those properties available?
ScaffoldTest.findAll({
    // I would like this to also tell me what attributes are valid...
    where: {
        badProperty: "test",
        integerProperty: 1
    }
}).then((result) => {
    console.log(result);
})
```