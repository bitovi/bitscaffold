import request from "supertest";
import http from "node:http";
import { Scaffold } from ".";
import Koa from "koa";

describe("Library", () => {
  beforeAll(() => {
    jest.setTimeout(60000);
  });

  it("should act as middleware", async () => {
    const koa = new Koa()
    const scaffold = new Scaffold([], {});

    koa.use(scaffold.defaults());
    const server = http.createServer(koa.callback());

    const result = await request(server).get('/api/scaffold/User')
    expect(result.statusCode).toBe(200);
  });
});
