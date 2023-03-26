import * as inflection from "inflection";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Scaffold } from "../..";
import { IAssociationBody } from "../types";

export const handleUpdatebelongs = async (
  currentModelAttributes: any,
  associationDetails: any,
  associationAttribute: any,
  ops: any,
  origUpdate: any,
  model: any,
  transaction: any,
  noBelongsTo: number
) => {
  const associationName = associationDetails.model.toLowerCase();
  const updatedModelAttributes = {
    ...currentModelAttributes,
    [`${associationName}_id`]: associationAttribute?.id,
  };
  let modelUpdated: any;
  currentModelAttributes = {
    ...currentModelAttributes,
    [`${associationName}_id`]: associationAttribute?.id,
  };
  noBelongsTo--;
  // only create a model when all belongs to has been converted.
  if (noBelongsTo === 0) {
    modelUpdated = await origUpdate.apply(model, [
      currentModelAttributes,
      {
        ...ops,
        transaction,
      },
    ]);
  }

  return {
    updatedModelAttributes,
    modelUpdated,
    noBelongsTo,
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

export const handleUpdateToMany = async (
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
