import { createStaffingAppInstance } from "./staffing";
import { createServer, GET, POST } from "../utils";

describe("Staffing App Example", () => {
  const [app, scaffold] = createStaffingAppInstance();
  beforeAll(async () => {
    await scaffold.createDatabase();
  });

  it("should handle get Assignments", async () => {
    const server = createServer(app);

    const findall = await GET(server, "/api/Assignment");
    expect(findall).toBeTruthy();
    expect(findall.status).toBe(200);
    expect(findall.deserialized).toHaveProperty("length");
    expect(findall.deserialized.length).toBe(0);
  });

  it("should handle get Employee", async () => {
    const server = createServer(app);

    const findall = await GET(server, "/api/Employee");
    expect(findall).toBeTruthy();
    expect(findall.status).toBe(200);
    expect(findall.deserialized).toHaveProperty("length");
    expect(findall.deserialized.length).toBe(0);
  });

  it("should handle get Project", async () => {
    const server = createServer(app);

    const findall = await GET(server, "/api/Project");
    expect(findall).toBeTruthy();
    expect(findall.status).toBe(200);
    expect(findall.deserialized).toHaveProperty("length");
    expect(findall.deserialized.length).toBe(0);
  });

  it("should handle get Role", async () => {
    const server = createServer(app);

    const findall = await GET(server, "/api/Role");
    expect(findall).toBeTruthy();
    expect(findall.status).toBe(200);
    expect(findall.deserialized).toHaveProperty("length");
    expect(findall.deserialized.length).toBe(0);
  });

  it("should handle get Skill", async () => {
    const server = createServer(app);

    const findall = await GET(server, "/api/Skill");
    expect(findall).toBeTruthy();
    expect(findall.status).toBe(200);
    expect(findall.deserialized).toHaveProperty("length");
    expect(findall.deserialized.length).toBe(0);
  });

  it("should handle complex validation", async () => {
    const server = createServer(app);

    const assignment = await POST(server, "/api/Assignment", {
      employee_id: 1,
      start_date: new Date(),
      end_date: new Date()
    });

    expect(assignment).toBeTruthy();
  });


  afterAll(async () => {
    await scaffold.orm.close();
  });
});
