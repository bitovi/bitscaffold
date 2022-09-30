## Project Schema

BitScaffold wouldn't be a full-stack framework without a database layer. Everything is based on your project definition. Open the `schema.bitscaffold` file and take a look at the `User` model definition example. Your schema file is defined in simple JSON so it can be easily shared between the frontend and backend of your application.


> Q: What should this actually look like exactly? Should it directly use Sequelize names for Types? 

```json
{
    "models": {
        "User": {
            "id": {
                "type": "UUID",
                "primary": true,
            },
            "firstName": {
                "type": "String"
            },
            "lastName": {
                "type": "String"
            }
        }
    },
    "config": {

    }
}
```

> Something like this to allow shortcut formats for simple fields
> Should also allow for `default` properties to set fields. How do we define the functions or options?
```json
{
    "models": {
        "User": {
            "id": {
                "type": "UUID",
                "primary": true,
            },
            "firstName": "String", // We should probably allow this, shortcut format
            "lastName": "String", // We should probably allow this, shortcut format
            "createdAt": {
                "type": "DateTime",
                "default": "now()" // How should we define the function to run `new Date()` at create time...
            }
        }
    },
    "config": {

    }
}
```

> Another reasonable option is JavaScript (or TypeScript) as the configuration format
```typescript
export function models(DataTypes) {
    return {
        User: {
            id: {
                type: DataTypes.STRING,
                primary: true,
            },
            firstName: DataTypes.STRING, // We should probably allow this, shortcut format
            lastName: DataTypes.STRING, // We should probably allow this, shortcut format
            createdAt: {
                type: DataTypes.DATE,
                default: "now()" // How should we define the function to run `new Date()` at create time...
            }
        }
    }
}

export function config() {
    return {
        projectName: "My Project Name"
    }
}
```

