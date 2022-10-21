import { createScaffoldApplication } from "../index";
import { POST } from "./utils";
import http from "node:http";

import PlayerTS from "./models/ts/Player";
import TeamTS from "./models/ts/Team";


describe("Validation Tests", () => {
    beforeAll(() => {
        jest.setTimeout(60000);
    });

    it("should fail validtion if there are extra properties", async () => {
        const app = await createScaffoldApplication([new PlayerTS, new TeamTS]);
        const server = http.createServer(app.callback());

        console.log("Creating a new Player");
        const result2 = await POST(server, "/api/Player", {
            firstName: "First Name" + new Date(),
            lastName: "Last Name" + new Date(),
            middleName: "Middle Name Does Not Exist"
        });

        // Expect us to get a proper created result back
        expect(result2.status).toBe(400);
        expect(result2.json.errors).toHaveLength(1);
        expect(result2.json.errors[0]).toContain("middleName");
    })

    it("should fail validtion if startDate > endDate", async () => {
        const app = await createScaffoldApplication([new PlayerTS, new TeamTS]);
        const server = http.createServer(app.callback());

        console.log("Creating a new Player");
        const result2 = await POST(server, "/api/Player", {
            firstName: "First Name" + new Date(),
            lastName: "Last Name" + new Date(),
            startDate: new Date("2022-05-22"),
            endDate: new Date("2021-05-22")
        });

        // Expect us to get a proper created result back
        expect(result2.status).toBe(400);
        expect(result2.json.errors).toHaveLength(1);
    })
})
