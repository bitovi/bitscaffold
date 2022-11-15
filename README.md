<i>The following is an example of what a GitHub Readme or Homepage for Scaffold might include. It attempts to describe the project workflow, the reasons to use the project, and the technology stack in a way that helps define the project direction. See [Confluence for more information](https://bitovi.atlassian.net/wiki/spaces/SCAFFOLD/overview)!</i>

<h1 style="text-align: center;">@bitovi/scaffold</h1>

[![Join our Slack](https://img.shields.io/badge/slack-join%20chat-611f69.svg)](https://www.bitovi.com/community/slack?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

## About Scaffold

Scaffold is a web application framework designed to accelerate the development of new, or enhancement of existing, CRUD applications. If all you need is a simple CRUD application Scaffold can provide you with a fully functional system straight from your database schema. If you have more specialized requirements Scaffold makes it easy to customize every part of the application to meet your needs.

Scaffold enables you to make changes to your database schema and customize app behavior independently. When using code generation tools you have to write your schema and then generate your code, but once you start making customizations you cant re-run the generator without losing your customizations.

Scaffold is NOT code generation, its a system of modular and hierarchial libraries that can be consumed piecemeal to use as much or as little of Scaffolds abilities as you require.

## Quick Start Guide

Create a new Koa + Scaffold project. You can use `npm init` to create a new nodejs project.

```bash
npm init
```

Install Scaffold along with the Koa web framework into your newly defined project

```bash
npm i koa @bitovi/scaffold
```

Create an `index.js` file containing the following 'Hello World' example code

```typescript
import Koa from "koa";
import path from "path";
import { Scaffold, DataTypes } from "@bitovi/scaffold";

const User = {
  name: "User",
  attributes: {
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
  },
};

const app = new Koa();
const scaffold = new Scaffold([Example], {
  name: "Scaffold Demo",
  prefix: "/api/",
  db: {
    dialect: "sqlite",
    storage: path.join(__dirname, "example.sqlite"),
  },
});

app.use(scaffold.handleEverythingMiddleware());

app.use(async (ctx) => {
  ctx.body = "Hello From Koa";
});

app.listen(3000, () => {
  console.log("Started on port 3000");
});
```

Run the example using `node index.js` to see it in action! At this point you can created an entire application that can perform CRUD operations to a persistant sqlite database for our example `User` model.

```bash
node index.js
```

To check that things are working correctly you can try the following URLs:

- http://localhost:3000/api/\_scaffold/
  - This is a test URL that will show the loaded Scaffold endpoints
  - You should see a GET, PUT, POST and DELETE endpoints for the User model
- http://localhost:3000/test
  - This is a URL that is NOT being handled by Scaffold
  - You should see 'Hello From Koa' as this endpoint hits the default non-CRUD handler

Thats it! You have a basic CRUD application up and running. For more examples and detailed usage of what you can do with Scaffold, take a look at the more complete 'Getting Started Tutorial' below.

## Need help or have questions?

This project is supported by [Bitovi, a Nodejs consultancy](https://www.bitovi.com/backend-consulting/nodejs-consulting). You can get help or ask questions on our:

- [Slack Community](https://www.bitovi.com/community/slack)
- [Twitter](https://twitter.com/bitovi)

Or, you can hire us for training, consulting, or development. [Set up a free consultation.](https://www.bitovi.com/backend-consulting/nodejs-consulting)

## How It Works

A project using Scaffold is generally made up of a few different parts, the backend service layer, the frontend display layer, and a database schema layer. Scaffold builds on top of the popular Koa web framework and can be added to any Koa app via Middleware.

Scaffold, using your database schema files, can inject REST endpoints into the Koa application providing CRUD operations, data validation, authentication tools, and more with zero configuration. Unlike many other tools all of this processing is done at runtime and does not require any code generators to function.

The first part is a Koa Application, Koa is a robust web framework for creating web applications and APIs in a modern, expressive, way focusing on async Middleware functions.

Scaffold can be integrated into any Koa Application as Middleware.

## Getting Started Tutorial

Create a new Koa + Scaffold project. You can use `npm init` to create a new nodejs project.

```bash
npm init
```

Install Scaffold along with the Koa web framework into your newly defined project

```bash
npm i koa @bitovi/scaffold
```

Create an `index.js` file containing the following 'Hello World' example code

```typescript
import Koa from "koa";
import path from "path";
import { Scaffold, DataTypes } from "@bitovi/scaffold";

const User = {
  name: "User",
  attributes: {
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
  },
};

const app = new Koa();
const scaffold = new Scaffold([User], {
  name: "Scaffold Demo",
  prefix: "/api",
  db: {
    dialect: "sqlite",
    storage: path.join(__dirname, "example.sqlite"),
  },
});

app.use(scaffold.handleEverythingMiddleware());

app.use(async (ctx) => {
  ctx.body = "Hello From Koa";
});

app.listen(3000, () => {
  console.log("Started on port 3000");
});
```

At this point you have created a Koa application with Scaffold connected as Middleware. In this above example we are configuring Scaffold to use sqlite as a database and to store any of our data in the `example.sqlite` file.

The most important step in working with Scaffold is creating Models that define the data within your application. Lets take a look at this example `Models.js` file containing two different exported Models:

```typescript
import { DataTypes } from "@bitovi/scaffold/types";

export const Player = {
  name: "Player",
  attributes: {
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    startDate: DataTypes.DATE,
    endDate: DataTypes.DATE,
  },
  belongsTo: [{ target: "Team" }],
};

export const Team = {
  name: "Team",
  attributes: {
    name: DataTypes.STRING,
  },
  hasMany: [{ target: "Player", options: { as: "players" } }],
};
```

This is pretty simple!

The only things you are required to provide are a `name` for your model and the `attributes` that will be held within it. These attributes will map into columns inside your database table. If you have written ORM models before, specifically Sequelize, this should look pretty familiar to you. Scaffold uses Sequelize, a Node.js and TypeScript compatible ORM, under the hood to talk to your database.

Now that we have a Schema defined, we can update our application code accordingly:

```typescript
import Koa from "koa";
import path from "path";
import { Scaffold, DataTypes } from "@bitovi/scaffold";
import { Player, Team } from "./Models";

const app = new Koa();
const scaffold = new Scaffold([Player, Team], {
  name: "Scaffold Demo",
  prefix: "/api",
  db: {
    dialect: "sqlite",
    storage: path.join(__dirname, "example.sqlite"),
  },
});

app.use(scaffold.handleEverythingMiddleware());

app.use(async (ctx) => {
  ctx.body = "Hello From Koa";
});

app.listen(3000, () => {
  console.log("Started on port 3000");
});
```

In the above example, if we run our application, Scaffold will create CRUD application endpoints for our newly imported `Player` and `Team` models automatically. If you try any other URLs you will get back the default 'Hello From Koa' response.

If you create additional schema files you can simply import them the same way, passing them into the array in the Scaffold constructor. This step will take care of not only adding your schema files, but also validating them against eachother, setting up relationships, and configuring the behavior of the frontend components for you.

Next we can start up the Scaffold to see everything in action.

```
node index.js
```

Once you see `Started on port 3000` you can open your browser to http://localhost:3000/ to see things in action. The default homepage will show you a list of the current loaded models with a link to their respective page.

<img src="img/Screen Shot 2022-11-04 at 1.02.36 PM.png" alt="list of resources" />

Navigate to [http://localhost:3000/Players](http://localhost:3000/Players) and you will see a page containing a list of all the Players in our database. Because we have not yet created any, this list will be empty.

<img src="img/Screen Shot 2022-11-04 at 1.03.18 PM.png" alt="empty list of players" />

Navigate to [http://localhost:3000/Players/new](http://localhost:3000/Players/new) by clicking on the provided 'Create Player' button at the bottom of the page. From here, fill in the first name and last name fields, and click "Save":

<img src="img/Screen Shot 2022-11-04 at 1.04.13 PM.png" alt="Create a new player" />

Navigate to [http://localhost:3000/Players](http://localhost:3000/Players), and you will see the user that you just created has been fetched from the database and displayed for you!

<img src="img/Screen Shot 2022-11-04 at 1.05.33 PM.png" alt="populated list of players" />

Just like that we created an example Player within the database! A lot of things happened under the hood here, with Scaffold handling all of the frontend forms as well as backend default behavior for creating these records.

Lets try one more thing using the Scaffold defaults before we move on to customizing things.

Navigate to [http://localhost:3000/Team/new](http://localhost:3000/Team/new), fill out the 'Name' field. Because a Team can have many players assigned to it, you can select your existing users from the dropdown, and click "Save" to create the new team:

<img src="img/Screen Shot 2022-11-04 at 1.11.15 PM.png" alt="Create a new team" />

Just like the player list, if you navigate to Navigate to [http://localhost:3000/Teams](http://localhost:3000/Teams), you can see the Team you just created.

<img src="img/Screen Shot 2022-11-04 at 1.13.31 PM.png" alt="populated list of teams" />

## Project Customization

While Scaffold gives you a lot of power out of the box many applications, especially as they grow in complexity, need to apply custom rules and logic to their CRUD operations. Scaffold is prepared for this as well, allowing you to easily and flexibly override any of the default behavior to fit your needs. Even though you have customized the solution you can still use many of the Scaffold helper functions and features to accelerate even your custom workflow development.

For example, if you had a new `User` model that needed special authorization rules you can quickly add this functionality yourself while still retaining all the other benefits of the Scaffold system.

Lets take a look at our same sample application again, but this time make a few customizations

```typescript
import Koa from "koa";
import path from "path";
import { Scaffold } from "@bitovi/scaffold";
import { Player, Team, User } from "./Models";

const app = new Koa();

const scaffold = new Scaffold([Player, Team, User], {
  name: "Scaffold Demo",
  prefix: "/api",
  db: {
    dialect: "sqlite",
    storage: path.join(__dirname, "example.sqlite"),
  },
});
const router = scaffold.router();

router.get("/User", async (ctx, next) => {
  if (ctx.headers.authorization !== "custom-value") {
    ctx.throw(401, "Bad Auth Token");
  }

  const data = await scaffold.models.User.findAll(
    scaffold.userParseParams(ctx.params)
  );
  ctx.body = scaffold.serializeToJSONAPI(data);
});

app.use(scaffold.handleEverythingMiddleware());

app.use(async (ctx) => {
  ctx.body = "Hello From Koa";
});

app.listen(3000, () => {
  console.log("Started on port 3000");
});
```

From this example you can see a few of the functions that Scaffold exports for you. These model functions, along with more generic helpers, allow you to manipulate models, format data, and parse incoming request params with ease.

## Application Data Validation

One of the most important things when building CRUD applications is data integrity. Scaffold can help here as well by providing easy hooks to provide validation logic. These functions are extremely helpful when trying to compare between values within your model when creating or updateing a record.

For an example, if we created an Employee model that describes someone working at a company, we might want to know the first name, last name, as well as their start date, and end date of employment.

An important validation here would be to verify that we don't create (or update) a user to have an end_date that is before their start date!

```typescript
export const Employee = {
  name: "Employee",
  attributes: {
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    start_date: DataTypes.DATE,
    end_date: DataTypes.DATE,
  },
  validation: {
    startDateBeforeEndDate() {
      if (
        this.start_date &&
        this.end_date &&
        this.start_date <= this.end_date
      ) {
        throw new Error("START_DATE_MUST_BE_BEFORE_END_DATE");
      }
    },
  },
};
```

## Model Relationships

Scaffold can help you define and build complex relationships between different models within your application. In our previous examples we have used Players and Teams to briefly describe a relationship. Lets take a look at that example again:

```typescript
import { DataTypes } from "@bitovi/scaffold/types";

export const Player = {
  name: "Player",
  attributes: {
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    startDate: DataTypes.DATE,
    endDate: DataTypes.DATE,
  },
  belongsTo: [{ target: "Team" }],
};

export const Team = {
  name: "Team",
  attributes: {
    name: DataTypes.STRING,
  },
  hasMany: [{ target: "Player", options: { as: "players" } }],
};
```

We can see that the `Player` has a `belongsTo` property that names `Team` as the target. Similarially, the `Team` contains a `hasMany` property that names `Player` as the target. Given this description we can reason that a Team can have many players and each Player can belong to a single Team.

For another example lets look at `Movies` and `Actors`. Unlike `Players` and `Teams` an Actor CAN be in more than one Movie and a Movie can contain many Actors. How could we describe this sort of relationship?

```typescript
import { DataTypes } from "@bitovi/scaffold/types";

export const Actor = {
  name: "Actor",
  attributes: {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    name: DataTypes.STRING,
  },
  belongsToMany: [{ target: "Movie", options: { through: "ActorMovies" } }],
};

export const Movie = {
  name: "Movie",
  attributes: {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    name: DataTypes.STRING,
  },
  belongsToMany: [{ target: "Actor", options: { through: "ActorMovies" } }],
};
```

In this case both models contain a belongsToMany type relationship. One of the differences here is that we need another table to help us define this complex many-to-many relationship. We can see this as the `through` option providing a table name of `ActorMovies`.

For more information on these relationships and the options available check the [documentation for Sequelize](https://sequelize.org/docs/v6/core-concepts/assocs/).

## Local Development

Are you a developer looking to work on the Scaffold library itself within a local project? You can connect a local cloned copy of Scaffold to your project using `npm link`.

1. Clone this repository: `git@github.com:bitovi/bitscaffold.git`
2. Change into the bitscaffold directory: `cd bitscaffold`
3. Run `npm install` to pull in the build dependencies
4. Run `npm run build` to create the JavaScript exports needed for external projects
5. Run `npm link`. This will create a link from the global `node_modules` folder to your bitscaffold directory
6. Switch over to your existing Scaffold project directory, `cd my-scaffold-project`
7. Create the link to this project with `npm link bitscaffold`
8. You may need to re-run `npm link bitscaffold` if you run other `npm install` like commands in your project repository
