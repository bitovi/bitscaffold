import * as inflection from "inflection";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Scaffold } from "../..";
import { IAssociationBody } from "../types";

export const handleUpdateBelongs = async (
  model: any,
  ops: any,
  origUpdate: any,
  currentModelAttributes: any,
  belongsAssociation: Array<string>,
  associations: any,
  attributes: any,
  transaction: any
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
  const modelData = await origUpdate.apply(model, [
    updatedModelAttributes,
    { ...ops, transaction },
  ]);
  return {
    modelData,
  };
};

export const handleUpdateOne = async (
  scaffold: Scaffold,
  association: IAssociationBody<Array<Record<string, any>>>,
  model: { name: string; id: string },
  transaction: any
) => {
  await scaffold.model[association.details.model].update(
    association.attributes,
    {
      where: {
        [`${model.name}_id`]: model.id,
      },
      transaction,
    }
  );
};

export const handleUpdateMany = async (
  scaffold: Scaffold,
  association: IAssociationBody<Array<Record<string, any>>>,
  model: { name: string; id: string },
  transaction: any
) => {
  const modelInstance = await scaffold.model[model.name].findByPk(model.id);
  if (!modelInstance) {
    return;
  }
  const joinIds: Array<string> = association.attributes.map((data) => data.id);
  if (joinIds.length === 0) return;
  const modelNameInPlural = inflection.pluralize(association.details.model);
  return await modelInstance[`set${modelNameInPlural}`](joinIds, {
    transaction,
  });
};
