import request from "supertest";

export async function GET(server, path) {
    const result = await request(server).get(path).set("authorization", "test");

    let json;
    try {
        json = JSON.parse(result.text);
    } catch (err) {
        console.error(result.text);
        throw err;
    }

    return {
        text: result.text,
        status: result.statusCode,
        json: json,
    };
}

export async function POST(server, path, payload) {
    const result = await request(server)
        .post(path)
        .set("authorization", "test")
        .send(payload);

    let json;
    try {
        json = JSON.parse(result.text);
    } catch (err) {
        console.error(result.text);
        throw err;
    }

    return {
        text: result.text,
        status: result.statusCode,
        json: json,
    };
}
