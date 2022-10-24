import { ScaffoldModel } from "../../../types";

export const Foo: ScaffoldModel = {
  name: "Foo",
  attributes: {
    name: "string",
  },
  hasOne: [
    { target: "Bar", options: { as: "Bar" } },
    { target: "Bar", options: { as: "Baz" } },
  ],
};
