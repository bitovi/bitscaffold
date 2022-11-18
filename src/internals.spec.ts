import { Scaffold } from "./index";
import { ScaffoldSymbolModel, DataTypes, ScaffoldModel } from "./types";

describe("Internal Tests", () => {
  const Model: ScaffoldModel = {
    name: "Model",
    attributes: {
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
  };

  it("should test url is valid scaffold shape", async () => {
    const scaffold = new Scaffold([Model], { prefix: "/api" });

    // Test expected good paths
    expect(scaffold.isValidScaffoldRoute("GET", "/api/Model/1")).toBe(true);
    expect(
      scaffold.isValidScaffoldRoute("GET", "/api/Model/1?params=true")
    ).toBe(true);
    expect(scaffold.isValidScaffoldRoute("GET", "/api/Model")).toBe(true);

    // Test expected bad paths
    expect(scaffold.isValidScaffoldRoute("GET", "/api/Unknown")).toBe(false);
    expect(scaffold.isValidScaffoldRoute("GET", "/api/Unknown/1")).toBe(false);

    await scaffold.orm.close();
  });

  it("should test valid scaffold model in url", async () => {
    const scaffold = new Scaffold([Model], { prefix: "/api" });

    // Test expected good paths
    expect(scaffold.getScaffoldModelNameForRoute("/api/Model/1")).toBe("Model");
    expect(
      scaffold.getScaffoldModelNameForRoute("/api/Model/1?params=true")
    ).toBe("Model");
    expect(scaffold.getScaffoldModelNameForRoute("/api/Model")).toBe("Model");

    // Test expected bad paths
    expect(scaffold.getScaffoldModelNameForRoute("/api/Unknown")).toBe(false);
    expect(scaffold.getScaffoldModelNameForRoute("/api/Unknown/1")).toBe(false);

    await scaffold.orm.close();
  });

  it("should test the existance of scaffold symbol on models", async () => {
    const scaffold = new Scaffold([Model], { prefix: "/api" });

    const model2 = scaffold.model.Model[ScaffoldSymbolModel];
    expect(model2).toBeTruthy();
    expect(model2).toHaveProperty("attributes");
    expect(model2).toHaveProperty("name");

    await scaffold.orm.close();
  });
});
