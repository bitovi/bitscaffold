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
