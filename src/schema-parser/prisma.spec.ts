import { parseSchemaFile, printSchemaFile, readSchemaFile } from "./prisma";

describe("schema-parser", () => {
  it("should parse a simple prisma-like schema", async () => {
    const file = await readSchemaFile(
      "test/fixtures/test-basic-schema/schema.bitscaffold"
    );
    const content = parseSchemaFile(file);
    printSchemaFile(content);
  });
});
