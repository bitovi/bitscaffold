import * as inflection from "inflection";
import { Attributes, ModelStatic, Transaction } from "sequelize";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Scaffold } from "../..";
import { IAssociation, IAssociationBody } from "../types";

export const handleCreateBelongs = async (
  model: ModelStatic<any>,
  origCreate: any,
  currentModelAttributes: Attributes<any>,
  belongsAssociation: Array<string>,
  associations: Record<string, IAssociation>,
  attributes: Attributes<any>,
  transaction: Transaction
) => {
  const updatedModelAttributes = currentModelAttributes;
  belongsAssociation.forEach((association) => {
    const associationDetails = associations[association];
    const associationAttribute = attributes[association];
    const key = associationDetails.key;
    updatedModelAttributes[key] = associationAttribute?.id;
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
  transaction: Transaction
) => {
  const key = association.details.key;
  const data = {
    ...association.attributes,
    [key]: model.id,
  };
  return await scaffold.model[association.details.model].create(data, {
    transaction,
  });
};

export const handleCreateMany = async (
  scaffold: Scaffold,
  association: IAssociationBody<Array<Record<string, any>>>,
  model: { name: string; id?: string },
  transaction: Transaction
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
