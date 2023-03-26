import * as inflection from "inflection";
import { Transaction } from "sequelize";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Scaffold } from "../..";
import { IAssociationBody } from "../types";

export const handleBelongs = async (
  currentModelAttributes: any,
  associationDetails: any,
  associationAttribute: any,
  origCreate: any,
  model: any,
  transaction: Transaction,
  noBelongsTo: number
) => {
  const associationName = associationDetails.model.toLowerCase();
  const updatedModelAttributes = {
    ...currentModelAttributes,
    [`${associationName}_id`]: associationAttribute?.id,
  };
  let modelCreated: any;
  noBelongsTo--;
  // only create a model when all belongs to has been converted.
  if (noBelongsTo === 0) {
    modelCreated = await origCreate.apply(model, [
      updatedModelAttributes,
      { transaction },
    ]);
  }
  return {
    modelCreated,
    updatedModelAttributes,
    noBelongsTo,
  };
};

export const handleHasOne = async (
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

export const handleMany = async (
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
