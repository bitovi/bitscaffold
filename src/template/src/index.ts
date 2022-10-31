import { Scaffold } from "../../exports";
import { Player, Team } from "./schema/Example";
import Koa from "koa";

const app = new Koa();
const scaffold = new Scaffold([Player, Team], { prefix: "/scaffold/" });

app.use(scaffold.defaults());

app.use(async (ctx) => {
  ctx.body = "Hello World";
});

app.listen(3000, () => {
  console.log("Started on port 3000");
});
