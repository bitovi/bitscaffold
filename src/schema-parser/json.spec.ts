import { parseSchemaFile, printSchemaFile, readSchemaFile } from "./json";

describe("schema-parser", () => {
  it("should parse a simple json schema", async () => {
    const file = await readSchemaFile(
      "test/fixtures/test-json-schema/schema.bitscaffold"
    );
    const content = await parseSchemaFile(file);
    printSchemaFile(content);
  });
});
