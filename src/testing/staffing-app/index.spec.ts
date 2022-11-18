import { createStaffingAppInstance } from "./staffing";
import { createServer, GET } from "../utils";

describe("Staffing App Example", () => {
  const [app, scaffold] = createStaffingAppInstance();
  beforeAll(async () => {
    await scaffold.createDatabase();
  });

  it("should handle an end to end test", async () => {
    const server = createServer(app);

    const findall = await GET(server, "/api/Assignment");
    expect(findall).toBeTruthy();
    expect(findall.status).toBe(200);
    expect(findall.deserialized).toHaveProperty("length");
    expect(findall.deserialized.length).toBe(0);
  });

  afterAll(async () => {
    await scaffold.orm.close();
  });
});
