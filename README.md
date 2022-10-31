<i>The following is an example of what a GitHub Readme or Homepage for Scaffold might include. It attempts to describe the project workflow, the reasons to use the project, and the technology stack in a way that helps define the project direction. See [Confluence for more information](https://bitovi.atlassian.net/wiki/spaces/SCAFFOLD/overview)!</i>

<h1 style="text-align: center;">@bitovi/scaffold</h1>

[![Join our Slack](https://img.shields.io/badge/slack-join%20chat-611f69.svg)](https://www.bitovi.com/community/slack?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

## About Scaffold

Scaffold is a full-stack, TypeScript powered, web application framework designed to accelerate the development of CRUD applications. In short, Scaffold is a 'medium code' solution to take you straight from your database schema to fully functioning CRUD application.

If all you need is a simple CRUD application, you can finish right there with a fully functioning app.
If you need more features or side effects you can provide as much customization as you need. Scaffold makes it easy to override the default behavior so you can concentrate on what makes your application special and not just more boilerplate.

Scaffold should make it quick and easy to create, test, and validate your application and data model right from the start

## Scaffold Quick Start (New Project)

- Run `npx @bitovi/scaffold my-project-name`
- Answer the prompts to configure your project
- Run `cd my-project-name`
- Take a look at the example `Foo.ts` schema inside `./src/schema/`
  - Optional: Customize this file to see how the behavior can change!
- Run `npm run start`
- View your brand new CRUD app at http://localhost:3000/
  - Optional: See the backend routes listed at http://localhost:3000/api/\_routes/
- Check out the documentation to further customize your application

## Need help or have questions?

This project is supported by [Bitovi, a Nodejs consultancy](https://www.bitovi.com/backend-consulting/nodejs-consulting). You can get help or ask questions on our:

- [Slack Community](https://www.bitovi.com/community/slack)
- [Twitter](https://twitter.com/bitovi)

Or, you can hire us for training, consulting, or development. [Set up a free consultation.](https://www.bitovi.com/backend-consulting/nodejs-consulting)

## Technologies

Scaffold attempts to simplify the developer experience by letting you focus on your data and provides you existing libraries to solve the common problems developers have:

- React
- Angular
- REST (Koa / Express)
- Sequelize

## How It Works

A Scaffold project is split into three parts, a frontend, a backend, and your data schema. The Scaffold repository contains everything you need to get going with sane defaults for your frontend and backend, you just provide the schema.

When the application starts up, Scaffold will create REST endpoints based on your database tables, with basic data validation and authentication straight out of the box. When a user hits the frontend URL your schema will be used again to create frontend forms and components to read, create, update, and delete records with all of the same data validation applied to the frontend forms.

## Getting Started Tutorial

Create a new Scaffold project

> ```
> npx @bitovi/scaffold my-project-name
> ```

Change in to the project directory and start creating your schema files:

> ```
> cd my-project-name
> ```

You can find an example Schema file inside the `src/schema/` folder. Open up `Example.ts` and you should see the following:

```typescript
import { ScaffoldModel, DataTypes } from "@bitovi/scaffold/types";

export const Player: ScaffoldModel = {
  name: "Player",
  attributes: {
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    startDate: DataTypes.DATE,
    endDate: DataTypes.DATE,
  },
};
```

This is pretty simple! The only things you are required to provide are a `name` for your model and the `attributes` that will be held within your database. If you have written ORM models before, specifically Sequelize, this should look pretty familiar to you. Scaffold uses Sequelize, a Node.js and TypeScript compatible ORM, under the hood to talk to your database.

If you created any additional schema files you will need to tell Scaffold to load them at start up.

Open up the `src/index.ts` file and take a look at how your schema files are passed in to the main Scaffold application.

`src/index.ts`

```typescript
import { Scaffold } from "@bitovi/scaffold";

import { Player } from "./models/Player";
import { Team } from "./models/Player";

async function init() {
  // Provide Scaffold with a list of models and other options if required
  const scaffold = new Scaffold([Player, Team], { port: 3000 });

  // Start off with the defaults, Scaffold will build all of the CRUD routes, datbase
  // access, and other handlers for you. No other work needed!
  await scaffold.makeScaffoldDefaults();

  // Start the service listening, in this case on port 3000 from our options above
  await scaffold.listen();
}

init();
```

To add additional schema files, simply import them at the top and pass them into the `createScaffoldApplication` call. `createScaffoldApplication` will take care of validating your schemas, their relationships, and creating a test database when the application starts.

Next we can start up the Scaffold to see everything in action. By default the application will start up on port 3000, but you can change this in the `src/index.ts` if you want.

Run the Scaffold Service

> `npm run start`

You should see some helpful output printed to your console showing what is happening with your different schemas, relationships, and validations. See the following example output:

```
Creating Scaffold Application
ℹ  info      Creating Scaffold Application
ℹ  info      Creating Koa Application Defaults
ℹ  info      Creating Sequelize instance
ℹ  info      Attaching Sequelize instance to Context
ℹ  info      Attaching Models to Sequelize instance
ℹ  info      Creating Model Player
ℹ  info      Creating Model Team
ℹ  info      Creating Model associations Player
ℹ  info      Creating Model associations Team
ℹ  info      Running Sequelize Model Sync
ℹ  info        SQL: Executing (default): DROP TABLE IF EXISTS `Players`;
ℹ  info        SQL: Executing (default): DROP TABLE IF EXISTS `Teams`;
ℹ  info        SQL: Executing (default): PRAGMA foreign_keys = OFF
ℹ  info        SQL: Executing (default): DROP TABLE IF EXISTS `Players`;
ℹ  info        SQL: Executing (default): DROP TABLE IF EXISTS `Teams`;
ℹ  info        SQL: Executing (default): PRAGMA foreign_keys = ON
ℹ  info        SQL: Executing (default): DROP TABLE IF EXISTS `Teams`;
ℹ  info        SQL: Executing (default): CREATE TABLE IF NOT EXISTS `Teams` (`id` INTEGER PRIMARY KEY AUTOINCREMENT, `name` VARCHAR(255));
ℹ  info        SQL: Executing (default): PRAGMA INDEX_LIST(`Teams`)
ℹ  info        SQL: Executing (default): DROP TABLE IF EXISTS `Players`;
ℹ  info        SQL: Executing (default): CREATE TABLE IF NOT EXISTS `Players` (`id` INTEGER PRIMARY KEY AUTOINCREMENT, `firstName` VARCHAR(255), `lastName` VARCHAR(255), `startDate` DATETIME, `endDate` DATETIME, `TeamId` INTEGER REFERENCES `Teams` (`id`) ON DELETE SET NULL ON UPDATE CASCADE);
ℹ  info        SQL: Executing (default): PRAGMA INDEX_LIST(`Players`)
ℹ  info      Attaching default Routes
Starting Scaffold Application
ℹ  info      Starting Scaffold Application listening
Started on port 3000
```

Once you see `Started on port 3000` you can open your browser to http://localhost:3000/ to see things in action.

Navigate to [http://localhost:3000/Player/new](http://localhost:3000/Player/new), fill in the first name and last name fields, and click "Save":

<img src="https://via.placeholder.com/800x600" alt="Create a new player" />

Navigate to [http://localhost:3000/Players](http://localhost:3000/Players), and you will see the user that you just created has been fetched from the database and displayed for you!

<img src="https://via.placeholder.com/800x600" alt="Display player list" />

Just like that we created an example Player within the database. When you ran `npm run start` Scaffold did all the work to connect to your database, create all the pages, routes, forms and services necessary to perform all CRUD operations against the Player table.

Navigate to [http://localhost:3000/Team/new](http://localhost:3000/Team/new), fill out the 'Name' field. Because a Team can have many players assigned to it, you can select your existing users from the dropdown, and click "Save" to create the new team:

<img src="https://via.placeholder.com/800x600" alt="Create a new team" />

Just like the player list, if you navigate to Navigate to [http://localhost:3000/Teams](http://localhost:3000/Teams), you can see the Team you just created.

<img src="https://via.placeholder.com/800x600" alt="Display team list" />

## Project Customization

While Scaffold gives you a lot of power out of the box, if you do require custom logic outside of the defaults, it is easy to start creating your own routes. For example, if you had a `User` table that needed special authorization rules you can quickly add this functionality yourself while still retaining all the other benefits of the Scaffold system.

Taking a look back at the example we had before:

`src/index.ts`

```typescript
import { Scaffold } from "@bitovi/scaffold";

import { Player } from "./models/Player";
import { Team } from "./models/Player";

async function init() {
  // Provide Scaffold with a list of models and other options if required
  const scaffold = new Scaffold([Player, Team], { port: 3000 });

  // Start off with the defaults, Scaffold will build all of the CRUD routes, datbase
  // access, and other handlers for you. No other work needed!
  await scaffold.makeScaffoldDefaults();

  // Start the service listening, in this case on port 3000 from our options above
  await scaffold.listen();
}

init();
```

If we wanted to add a new model called User but with different behavior, we could do the following:

`src/index.ts`

```typescript
import { Scaffold } from "@bitovi/scaffold";

import { Player } from "./models/Player";
import { Team } from "./models/Player";
import { User } from "./models/User";

async function init() {
  // Provide Scaffold with a list of models and other options if required
  const scaffold = new Scaffold([Player, Team, User], { port: 3000 });

  // Start off by defining your special behavior for Users.
  await scaffold.custom.create(User, async (ctx, next) => {
    ctx.body = "Instead of the Default, do this!";
    ctx.status = 201;
    await next();
  });

  // Finish off with the defaults, Scaffold will build all of the CRUD routes, database
  // access, and other handlers for you. No other work needed!
  await scaffold.makeScaffoldDefaults();

  // Start the service listening, in this case on port 3000 from our options above
  await scaffold.listen();
}

init();
```

In this case we provided a custom creation override for the User model. In this case we simply return a string instead of creating the record.

```typescript
// Start off by defining your special behavior for Users.
await scaffold.custom.create(User, async (ctx, next) => {
  ctx.body = "Instead of the Default, do this!";
  ctx.status = 201;
  await next();
});
```

The other basic custom override functions that are provided out of the box are `create`, `update`, `delete`, `findOne` and `findAll`. Each of these CRUD operations can be overridden for a specific model using this same pattern.

However, what if we want to perform our own data fetching as part of the CRUD operations, or even access other schemas from our system? This is also easily done. Scaffold provides some helper functions to let you get under the hood access directly to the ORM where you are then free to do anything you want!

Lets take a look at a more complete example:

```typescript
// Create a custom Create handler for the User model so we can provide some
// additional information, such as a createdAt property
await scaffold.custom.create(User, async (ctx, next) => {
  const model = scaffold.resolveORMModel(Skill);
  const result = await model.create({ ...ctx.body, createdAt: new Date() });

  ctx.body = result;
  ctx.status = 201;
  await next();
});

// Create a custom Update handler for the User model so we can provide some
// additional information, such as a modifiedAt property
await scaffold.custom.update(User, async (ctx, next) => {
  const model = scaffold.resolveSequelizeModel(Skill);
  const result = await model.update(
    { ...ctx.body, modifiedAt: new Date() },
    {
      where: {
        id: ctx.params.id,
      },
    }
  );

  ctx.body = result;
  ctx.status = 200;
  await next();
});
```

Creating custom route overrides is great, but what if we want to get a little more granular. We can also create overrides for the ORM data fetching itself, while keeping the remainder of the default behavior in place.

```typescript
    await scaffold.orm.create(User, async (model, body) => {
        body.createdAt = new Date():
        const result = await model.create(body)
        return result;
    });

    await scaffold.orm.update(User, async (model, clause, body) => {
        body.modifiedAt = new Date():
        const result = await model.update(body, clause)
        return result;
    });
```

If you want to create additional endpoints that are completely unrelated to your schema and CRUD operations, you can also easily do so

```typescript
await scaffold.custom.get("/api/totally-custom-route", async (ctx, next) => {
  ctx.body = "Something Totally Custom";
  ctx.status = 200;
  await next();
});
```

## Application Data Validation

Scaffold allows you to define validation rules within your models to make sure that the data that ends up in your database takes the form you expect. You can define these rules in one place and they will be automatically used in both the frontend and backend, stopping most invalid requests from ever reaching your backend in the first place.

Inside your schema file, you can optionally define a set of validation functions. Within this function you can specify custom rules for your fields, and which other field they might rely on. In the example below we can validate that an player start date must be before their end date, and the end date must be after the start date.

If our check for start and end date fails our validation rules, we can throw an error letting the system know that the requested state was invalid.

```typescript
export const Player: ScaffoldModel = {
  name: "Player",
  attributes: {
    // sic
  },
  validation: {
    async startDateBeforeEndDate() {
      if (this.startDate && this.endDate && this.startDate >= this.endDate) {
        throw new Error("START_DATE_MUST_BE_BEFORE_END_DATE");
      }
    },
    async endDateAfterStartDate() {
      if (this.startDate && this.endDate && this.startDate >= this.endDate) {
        throw new Error("START_DATE_MUST_BE_BEFORE_END_DATE");
      }
    },
  },
  belongsTo: [{ target: "Team" }],
};
```

## Model Relationships

Scaffold can help you define and build relationships between different models within your application. In our examples above we have used the Player and Teams schemas, where a Player belongs to a Team and a Team can have many different Players assigned to it.

Taking a look at the example schema again, we can see that the `Player` has a `belongsTo` property that names `Team` as the target. Similarially, the `Team` contains a `hasMany` property that names `Player` as the target. The `Team` also has some options provided to name the relationship as `players`

Given this relationship, we could query the `Team` and would get back an array of players on its `players` property.

```typescript
import { ScaffoldModel, DataTypes } from "../../../types";

export const Player: ScaffoldModel = {
  name: "Player",
  attributes: {
    // sic
  },
  validation: {
    // sic
  },
  belongsTo: [{ target: "Team" }],
};

export const Team: ScaffoldModel = {
  name: "Team",
  attributes: {
    // sic
  },
  hasMany: [{ target: "Player", options: { as: "players" } }],
};
```

## Integrating With Your Existing App

If you already have an existing Koa or Express application you can still take advantage of Scaffold! Because Scaffold is enabled through Koa Middleware, you can simply use the `ScaffoldWrapperMiddleware` and add it to the top `app.use` section of your project. Then simply provide a Scaffold schema file as usual and you're good to go.

At runtime, just like normal, the middleware will parse your Scaffold schema to create models and will update your REST server to add the normal scaffold routes.

## Local Development

If you want to develop the Scaffold Framework itself, locally, you can use `npm link` to point a scaffold project to your local Scaffold repository.

Assuming you keep your repositories somewhere like `~/GitHub/`...

1. Clone this repository: git@github.com:bitovi/bitscaffold.git
2. `cd bitscaffold`
3. Run `npm run build` to create the JavaScript needed for external projects
4. Run `npm link`. This will create a link from the global node_modules folder to your bitscaffold directory
5. Switch over to your existing Scaffold project directory, `cd my-scaffold-project`
6. Create the link to this project with `npm link bitscaffold`
7. You may need to re-run `npm link bitscaffold` if you run other `npm install` like commands in this repository
