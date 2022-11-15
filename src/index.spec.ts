import { Scaffold } from "./index";

describe("Initial Tests", () => {

    const Model = {
        name: "Model",
        attributes: {},
    }

    it("should test url is valid scaffold shape", async () => {
        const scaffold = new Scaffold([Model], { prefix: "/api" });

        // Test expected good paths
        expect(scaffold.isValidScaffoldRoute('GET', '/api/Model/1')).toBe(true);
        expect(scaffold.isValidScaffoldRoute('GET', '/api/Model/1?params=true')).toBe(true);
        expect(scaffold.isValidScaffoldRoute('GET', '/api/Model')).toBe(true);

        // Test expected bad paths
        expect(scaffold.isValidScaffoldRoute('GET', '/api/Unknown')).toBe(false);
        expect(scaffold.isValidScaffoldRoute('GET', '/api/Unknown/1')).toBe(false);

        await scaffold.orm.close()
    });

    it("should test valid scaffold model in url", async () => {
        const scaffold = new Scaffold([Model], { prefix: "/api" });

        // Test expected good paths
        expect(scaffold.getScaffoldModelForRoute('/api/Model/1')).toBe("Model");
        expect(scaffold.getScaffoldModelForRoute('/api/Model/1?params=true')).toBe("Model");
        expect(scaffold.getScaffoldModelForRoute('/api/Model')).toBe("Model");

        // Test expected bad paths
        expect(scaffold.getScaffoldModelForRoute('/api/Unknown')).toBe(false);
        expect(scaffold.getScaffoldModelForRoute('/api/Unknown/1')).toBe(false);

        await scaffold.orm.close()
    });
});