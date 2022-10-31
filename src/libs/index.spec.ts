import request from "supertest";
import http from "node:http";
import { Scaffold } from ".";
import Koa from "koa";
import { ScaffoldModel, DataTypes } from "../types";

export const Team: ScaffoldModel = {
  name: "Team",
  attributes: {
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
  },
};

describe("Library", () => {
  beforeAll(() => {
    jest.setTimeout(60000);
  });

  it("should act as middleware", async () => {
    const external = new Koa();
    const scaffold = new Scaffold([Team], {});
    await scaffold.isReady();

    external.use(scaffold.defaults());
    const server = http.createServer(external.callback());

    const result = await request(server)
      .get("/api/Team")
      .set("authorization", "test");
    expect(result.statusCode).toBe(200);
  });
});
