import http from "node:http";
import Koa from "koa";
import request from "supertest";

export function createServer(app: Koa) {
  return http.createServer(app.callback());
}

function parse(result) {
  let json;
  let text;
  let status;

  if (!result) {
    throw new Error("Invalid Result");
  }

  if (result.statusCode) {
    status = result.statusCode;
  }

  if (result.text) {
    text = result.text

    try {
      const temp = JSON.parse(result.text);
      json = temp;
    } catch (err) {
      // do nothing, its just not JSON probvably
    }
  }

  return {
    text,
    status,
    json
  }


}

export async function GET(server, path) {
  const result = await request(server).get(path).set("authorization", "test");
  return parse(result);
}

export async function DELETE(server, path) {
  const result = await request(server)
    .delete(path)
    .set("authorization", "test");

  return parse(result);
}

export async function POST(server, path, payload) {
  const result = await request(server)
    .post(path)
    .set("authorization", "test")
    .send(payload);

  return parse(result);
}

export async function PUT(server, path, payload) {
  const result = await request(server)
    .put(path)
    .set("authorization", "test")
    .send(payload);

  return parse(result);
}
