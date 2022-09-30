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
> cd my-redwood-project
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

BitScaffold uses Sequelize, a Node.js and TypeScript compatible ORM, under the hood to talk to your database. BitScaffold will do all the work for you to convert your `schema.bitscaffold` file into ORM Models and validation middleware at runtime. 

Now let's start up the service to see our CRUD app in action. Thats it!

> `npm run start`

Navigate to [http://localhost:3000/user/new](http://localhost:3000/user/new), fill in the first name and last name fields, and click "Save":

<img src="" alt="Create a new user" /> [no frontend exists yet to show this]

Navigate to [http://localhost:3000/users](http://localhost:3000/users), and you will see the user that you just created has been fetched from the database and displayed for you!

<img src="" alt="Display user list" /> [no frontend exists yet to show this]


Just like that we created an example User within the database. When you ran `npm run start` Scaffold did all the work to connect to your database, create all the pages, routes, forms and services necessary to perform all CRUD operations against the User table.
