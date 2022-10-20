# Project Scaffold

Project Scaffold is a proposed 'medium code' tool to help accelerate the creation of fullstack CRUD applications. The goal should be that, in order to get started, the user only needs to define their database schema and relationships using a schema config file

If you are familiar with 'low code' or 'no code' solutions that allow you to create basic applications in a drag and drop UI environment, this should be a few steps up from that, the user will provide their database models (or generate them using a tool like sequelize-auto) and will immedieatly have a full stack CRUD application up and running with sane defaults, ready to be expanded on.

One of the primary goals here is to provide a good jumping off point for new projects and allows the user to quickly validate the data model. It can also provide Bitovi with a quick, easy, way to spin up new projects allowing us to take on smaller (budget and scope) projects in a cost-effective way.

# Tech Stack
* Koa
* Sequelize
* TypeScript
* React / Angular


# Key Features
* Fullstack CRUD application framework
* Provide sane defaults for validation, authentication, middleware
* Share models and validation logic between frontend and backend
* Easy to extend and overwrite the framework defaults
* Easy to integrate into existing Koa projects
* Ergonomic support for relationships in frontend forms and backend queries

# Project Management Steps
* Initial brainstorming and idea came from Justin
* Research into existing projects and solutions
    * Redwoodjs
    * Blitzjs
    * Retool
    * Adonis
    * Paljs
* Technology review research
    * What are the most important things to support
    * What are the 'industry standard' tools and libraries to use
    * Look at trends, developer surveys, blog posts, npm downloads, github stars, etc
* Determining a 'wish list' of things those existing projects either dont do well or are missing completely
    * Coming up with a list of differentiators
    * Coming up with a list of ranked importance features
* Create a RICE score for different technologies and features.
    * The RICE scoring model is a prioritization framework designed to help product managers determine which products, features, and other initiatives to put on their roadmaps by scoring these items according to four factors. These factors, which form the acronym RICE, are reach, impact, confidence, and effort.
* Initial prototyping of the most important areas
    * Database schema definitions
    * Default Middleware testing
    * Wildcard routes mapping to Models
    * Model relationships
    * Ability to overwrite Middleware behavior 
    * Ability to inject Scaffold as a Middleware in an existing Koa project
    * Ability to use Scaffold as a node module in another project



 