import * as inflection from "inflection";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Scaffold } from "../..";
import { IAssociationBody } from "../types";

export const handleUpdateOne = async (
  scaffold: Scaffold,
  association: IAssociationBody<Array<Record<string, any>>>,
  model: { name: string; id: string }
) => {
  await scaffold.model[association.details.model].update(
    association.attributes,
    {
      where: {
        [`${model.name}_id`]: model.id,
      },
    }
  );
};

export const handleUpdateToMany = async (
  scaffold: Scaffold,
  association: IAssociationBody<Array<Record<string, any>>>,
  model: { name: string; id: string }
) => {
  const modelInstance = await scaffold.model[model.name].findByPk(model.id);
  console.log("model=>", model);
  if (!modelInstance) {
    return;
  }
  const joinIds: Array<string> = association.attributes.map((data) => data.id);
  if (joinIds.length === 0) return;
  const modelNameInPlural = inflection.pluralize(association.details.model);
  return await modelInstance[`set${modelNameInPlural}`](joinIds);
};
