import Koa from "koa";
import path from "path";
import { Scaffold } from "@bitovi/scaffold";
import { Player, Team, User } from "./Models"

const app = new Koa();

const scaffold = new Scaffold([Player, Team, User], {
    name: "Scaffold Demo",
    prefix: "/api",
    db: {
        dialect: 'sqlite',
        storage: path.join(__dirname, 'example.sqlite')
    }
});
const router = scaffold.router();


router.get("/User", async (ctx, next) => {
    if (ctx.headers.authorization !== "custom-value") {
        ctx.throw(401, "Bad Auth Token");
    }

    const data = await scaffold.models.User.findAll(scaffold.userParseParams(ctx.params))
    ctx.body = scaffold.serializeToJSONAPI(data)
});
app.use(scaffold.handleEverythingMiddleware());

app.use(async (ctx) => {
    ctx.body = "Hello From Koa";
});

app.listen(3000, () => {
    console.log("Started on port 3000");
});