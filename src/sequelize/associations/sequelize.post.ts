/* eslint-disable @typescript-eslint/no-explicit-any */
import { Scaffold } from "../..";
import { IAssociationBody } from "../types";

export const handleHasOne = async (
  scaffold: Scaffold,
  association: IAssociationBody<Record<string, any>>,
  model: { name: string; id?: string }
) => {
  const data = {
    ...association.attributes,
    [`${model.name.toLowerCase()}_id`]: model.id,
  };
  return await scaffold.model[association.details.model].create(data);
};

export const handleHasMany = async (
  scaffold: Scaffold,
  association: IAssociationBody<Array<Record<string, any>>>,
  model: { name: string; id?: string }
) => {
  const data = association.attributes.map((attribute) => ({
    ...attribute,
    [`${model.name.toLowerCase()}_id`]: model.id,
  }));
  return await scaffold.model[association.details.model].bulkCreate(data);
};

export const handleManyToMany = async (
  scaffold: Scaffold,
  association: IAssociationBody<Array<Record<string, any>>>,
  model: { name: string; id?: string }
) => {
  // Create an instance of the model using the id
  const modelInstance = await scaffold.model[model.name].findByPk(model.id);
  if (!modelInstance) {
    return;
  }
  const isCreate = !association.attributes[0].id;
  let joinData: Array<any> = [];
  if (isCreate) {
    // Create the models first if the id is not present
    const associationData = await scaffold.model[
      association.details.model
    ].bulkCreate(association.attributes);
    joinData = associationData.map((data) => data.getDataValue("id"));
  } else {
    // Assign the ids to the through table if the model is present
    joinData = association.attributes.map((data) => data.id);
  }
  return await modelInstance[`add${association.details.model}s`](joinData);
};
