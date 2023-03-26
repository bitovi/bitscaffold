import * as inflection from "inflection";
import { Transaction } from "sequelize";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Scaffold } from "../..";
import { IAssociationBody } from "../types";

export const handleCreateBelongs = async (
  model: any,
  origCreate: any,
  currentModelAttributes: any,
  belongsAssociation: Array<string>,
  associations: any,
  attributes: any,
  transaction: Transaction
) => {
  const updatedModelAttributes = belongsAssociation.map((association) => {
    const associationDetails = associations[association];
    const associationAttribute = attributes[association];
    const associationName = associationDetails.model.toLowerCase();
    const key = `${associationName}_id`;
    return {
      ...currentModelAttributes,
      [key]: associationAttribute?.id,
    };
  });
  const modelData = await origCreate.apply(model, [
    updatedModelAttributes,
    { transaction },
  ]);
  return {
    modelData,
  };
};

export const handleCreateHasOne = async (
  scaffold: Scaffold,
  association: IAssociationBody<Record<string, any>>,
  model: { name: string; id?: string },
  transaction: any
) => {
  const data = {
    ...association.attributes,
    [`${model.name.toLowerCase()}_id`]: model.id,
  };
  return await scaffold.model[association.details.model].create(data, {
    transaction,
  });
};

export const handleCreateMany = async (
  scaffold: Scaffold,
  association: IAssociationBody<Array<Record<string, any>>>,
  model: { name: string; id?: string },
  transaction: any
) => {
  // Create an instance of the model using the id
  const modelInstance = await scaffold.model[model.name].findByPk(model.id, {
    transaction,
  });
  if (!modelInstance) {
    return;
  }
  const isCreate = !association.attributes[0].id;
  let joinIds: Array<string> = [];
  if (isCreate) {
    // Create the models first and add their ids to the joinIds.
    const associationData = await scaffold.model[
      association.details.model
    ].bulkCreate(association.attributes, { transaction });
    joinIds = associationData.map((data) => data.getDataValue("id"));
  } else {
    // Assign the ids to the through table if the model is present
    joinIds = association.attributes.map((data) => data.id);
  }
  const modelNameInPlural = inflection.pluralize(association.details.model);
  return await modelInstance[`add${modelNameInPlural}`](joinIds, {
    transaction,
  });
};
