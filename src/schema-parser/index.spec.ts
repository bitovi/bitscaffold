import { parseSchemaFile, printSchemaFile, readSchemaFile } from "./index";

describe("schema-parser", () => {
  it("should parse a simple schema", async () => {
    const file = await readSchemaFile(
      "test/fixtures/test-basic-schema/schema.bitscaffold"
    );
    const content = parseSchemaFile(file);
    printSchemaFile(content);
  });
});
