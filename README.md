<i>The following is an example of what a GitHub Readme or Homepage for BitScaffold might include. It attempts to describe the project workflow, the reasons to use the project, and the technology stack in a way that helps define the project direction. See [Confluence for more information](https://bitovi.atlassian.net/wiki/spaces/SCAFFOLD/overview)!</i>

<h1 style="text-align: center;">BitScaffold</h1>
<p style="text-align: center;">Created by Bitovi</p>

## About BitScaffold

BitScaffold is a full-stack, TypeScript powered, web application framework designed to accelerate the development of CRUD applications, allowing you to quickly and easily spin up new projects in a cost-effective way.

At the highest level, BitScaffold is a ‘medium code’ solution to take you from database schema straight to fully functioning CRUD application. Your project schema is evaluated at run time removing the need for build scripts or generator commands.

By handling the basics for you, BitScaffold lets you focus on what makes your application special, instead of spending time building boilerplate and tweaking configurations. Plus, because BitScaffold processes your schema at run-time you can quickly and easily modify your application without worrying about complicated generators or build steps.

## BitScaffold Quick Start (New Project)

- Run `npx bitscaffold my-project-name`
- Answer the prompts to configure your project
- Change into the `my-project-name` directory
- Create your `schema.bitscaffold` file (check this file into git!)
- Run: `npm run start`
- View your brand new CRUD app at http://localhost:3000/


## Technologies

BitScaffold attempts to simplify the developer experience by letting you focus on your data and provides you existing libraries to solve the common problems developers have:

- React
- Angular
- REST (Koa / Express)
- Sequelize

## How It Works

A BitScaffold project is split into three parts, a frontend, a backend, and your data schema. The BitScaffold repository contains everything you need to get going with sane defaults for your frontend and backend, you just provide the schema.

When the application starts up, the Scaffold will create REST endpoints based on your database tables, with data validation and authentication for free. When a user hits the frontend URL your schema will be used again to create frontend forms and components to read, create, update, and delete records with all of the same data validation applied to the frontend forms.


## Getting Started Tutorial

Create a BitScaffold project with `npx bitscaffold my-bitscaffold-project`:

> ```
> npx bitscaffold my-bitscaffold-project
> ```

Then change into that directory and create your project definition file:

> ```
> cd my-bitscaffold-project
> ```

## Project Schema

BitScaffold wouldn't be a full-stack framework without a database layer. Everything is based on your project definition. Open the `schema.bitscaffold` file and take a look at the `User` model definition example. Your schema file is defined in simple JSON so it can be easily shared between the frontend and backend of your application.

```json
{
    "models": {
        "User": {
            "id": {
                "type": "UUID",
                "primary": true,
                "autoIncrement": true
            },
            "firstName": {
                "type": "STRING"
            },
            "lastName": {
                "type": "STRING"
            }
        }
    },
    "config": {

    }
}
```

```typescript
export class User {
    static get tableName() {
        return 'user'
    }

    static get fields() {
        return {
            id: {
                type: "uuid",
                primary: true,
                required: true
            },
            firstName: {
                type: "string",
                required: true,
            },
            lastName: {
                type: "date",
                required: false
            }
        }
    }
}

```


BitScaffold uses Sequelize, a Node.js and TypeScript compatible ORM, under the hood to talk to your database. BitScaffold will do all the work for you to convert your `schema.bitscaffold` file into ORM Models and validation middleware at runtime. 

Now let's start up the service to see our CRUD app in action. Thats it!

> `npm run start`

Navigate to [http://localhost:3000/user/new](http://localhost:3000/user/new), fill in the first name and last name fields, and click "Save":

<img src="" alt="Create a new user" /> [no frontend exists yet to show this]

Navigate to [http://localhost:3000/users](http://localhost:3000/users), and you will see the user that you just created has been fetched from the database and displayed for you!

<img src="" alt="Display user list" /> [no frontend exists yet to show this]


Just like that we created an example User within the database. When you ran `npm run start` Scaffold did all the work to connect to your database, create all the pages, routes, forms and services necessary to perform all CRUD operations against the User table.

## Project Customization

While Scaffold gives you a lot of power out of the box, if you do require custom logic outside of the defaults, it is easy to start creating your own override routes. For example, if you had a `User` table that needed special authorization rules you can quickly add this functionality yourself while still retaining all the other benefits of the Scaffold system.

Inside the `Routes.ts` file you can see the main `/api/:model` routes that, by default, call into the Scaffold Default Middleware functions. These functions are really a collection of other middleware functions that provide the default behavior.

To create custom route behavior, first create a new override route:
```typescript
    router.get('/api/User',
    // No behavior defined yet
    )
```

This route tells the Scaffold that if it sees `GET /api/User` it should now use this route instead of the default. You can, optionally, import more granular middleware functions and use them as needed or handle everything yourself and write your own.

```typescript
    import {
        scaffoldFindAllMiddleware,
        scaffoldFindModelMiddleware
    } from "./middleware";
```

Taking a look at these functions as examples, the `scaffoldFindModelMiddleware` is used to tell Scaffold which database table is relevant for this request. By default Scaffold will use the URL to determine this, but you can also pass an override directly to the middleware function.

This will tell the function that it should use the User table, even if the URL was defined as something different. 
```typescript
scaffoldFindModelMiddleware('User')
```

The `scaffoldFindAllMiddleware` can be used next to tell Scaffold to perform a 'find all' against the User table

These built in functions are, under the hood, Koa Middleware. More documentation of how exactly this works can be found with the [Koa project](). You can also define your own Middleware functions to provide any custom logic that you see fit.


In short, you will create an `async` function that takes two parameters, a `ctx` or Context and a `next` function. The Context will contain information about the incoming request, the request body, headers, and more. The `next` function should be called when your middleware is complete.

The most basic middleware we could create
```typescript
        async (ctx, next) => {
            // do something special for test auth here!
            console.log("You hit the custom function! Cool!")
            await next()
        }
```

Putting it all together, we can create a custom route, with custom logic, while still letting Scaffold do most of the heavy lifting for you. Here is a more complete example:

```typescript
    router.post('/api/User',
        scaffoldAuthorizationMiddleware(),
        async (ctx, next) => {
            // do something special for test auth here!
            signale.info("Special User Override Auth Middleware");
            await next()
        },
        scaffoldFindModelMiddleware('User'),
        scaffoldValidationMiddleware(), // built in, used by the default handlers
        scaffoldCreateMiddleware() // built in, used by the default handler
    )
```


## Application Data Validation
Scaffold allows you to define validation rules within your models to make sure that the data that ends up in your database takes the form you expect. You can define these rules in one place and they will be automatically used in both the frontend and backend, stopping most invalid requests from ever reaching your backend in the first place.


Inside your schema file, you can optionally define a validation function. Within this function you can specify field names, mongodb-style operators, and which other field they might rely on. In the example below we can validate that an employee start date must be before their end date, and the end date must be after the start date.

```typescript
    static get validation() {
        return {
            start_date: {
                lt: "end_date"
            },
            end_date: {
                gt: "start_date"
            }
        }
    }
```

For more open ended examples, you can use the `regex` operator to do some basic validation for string length, emails, or other more specific types.
```typescript
    static get validation() {
        return {
            name: {
                regex: "^[a-zA-Z]{7}$"
            },
            end_date: {
                gt: "start_date"
            }
        }
    }
```

## Model Relationships
Scaffold can help you define and build relationships between different models within your application. For example, if you had a system that delt with scheduling employees on certain projects, you might have a User as well as a Project. However, a Project should have a manager (who is a user) as well as N number of people working on that project. Similarly, we should be able to check a user to find out what project they are on. 

If we expand our config example from before, we have added additional fields that define the relationships between different models within the system.

the `type` is defined here as a relationship type followed by the Model that it relates to. The sourceKey for the relationship is provided as the name of the property and the foreignKey can be set if needed (the default is id).

```json
{
    "models": {
        "User": {
            "id": {
                "type": "UUID",
                "primary": true,
                "autoIncrement": true
            },
            "firstName": {
                "type": "STRING",
                "required": true
            },
            "lastName": {
                "type": "STRING",
                "required": true
            },
            "projects": {
                "required": false,
                "type": "hasMany:Projects",
                "foreignKey": "id",
            }
        },
        "Project": {
            "id": {
                "type": "UUID",
                "primary": true,
                "autoIncrement": true
            },
            "name": {
                "type": "STRING"
            },
            "manager": {
                "type":"hasOne:User",
                "foreignKey": "id",
            },
            "users": {
                "type":"hasMany:User",
                "foreignKey": "id",
            }
        }
    },
    "config": {

    }
}
```

Inside your typescript config file you can add an optional `relationships` function that provides that mapping between different models.

```typescript
    static get relationships() {
        return {
            skills: {
                relation: 'ManyToManyRelation',
                modelClass: Skill,
                join: {
                    from: 'employee.id',
                    through: {
                        from: 'employee__skill.employee_id',
                        to: 'employee__skill.skill_id'
                    },
                    to: 'skill.id'
                }
            }
        }
    }
```


Given this definition file, Scaffold can provide this additional joined information if requested. Same on the frontend, if you want to create a new project, you will see a drop down with a list of users to assign. The relationship type can also hint to the frontend what type of form you should see displayed.

<img src="" alt="Create a new user with project dropdown" /> [no frontend exists yet to show this]




## Integrating With Your Existing App
If you already have an existing Koa or Express application you can still take advantage of Scaffold! Because Scaffold is enabled through Koa Middleware, you can simply use the `ScaffoldWrapperMiddleware` and add it to the top `app.use` section of your project. Then simply provide a Scaffold schema file as usual and you're good to go.

At runtime, just like normal, the middleware will parse your Scaffold schema to create models and will update your REST server to add the normal scaffold routes.

@TODO: Some way to deal with route collision. 

## Local Development
If you want to develop the Scaffold Framework itself, locally, you can use `npm link` to point a scaffold project to your local Scaffold repository.

Assuming you keep your repositories somewhere like `~/GitHub/`... 

1) Clone this repository: git@github.com:bitovi/bitscaffold.git
2) `cd bitscaffold`
3) Run `npm run build` to create the JavaScript needed for external projects
4) Run `npm link`. This will create a link from the global node_modules folder to your bitscaffold directory
5) Switch over to your existing BitScaffold project directory, `cd my-scaffold-project`
6) Create the link to this project with `npm link bitscaffold`
7) You may need to re-run `npm link bitscaffold` if you run other `npm install` like commands in this repository


## Key Features

1. Ability to overwrite the logic that the system produces 'by default')*
2. Getting started simplicity, CRUD page for a single table, Demoability.
3. Ability to leverage benefits of the system even after overwriting the default logic
4. Natural interfaces to manipulate and explore the joins and relationships, both backend and frontend
5. Validations defined in one place, work for both the frontend and backend
6. Ability to integrate with existing Koa or Express projects

7. Support of 'business logic' side effects
8. Can be used as a no-code solution for the lifetime of the project/application
9. Works with the users chosen tech stack [Angular, Vie, Python, etc] 