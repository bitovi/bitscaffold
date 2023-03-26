/* eslint-disable @typescript-eslint/no-explicit-any */
import { Scaffold } from "../..";
import { handleUpdateMany, handleUpdateOne } from "./sequelize.patch";
import { handleCreateHasOne, handleCreateMany } from "./sequelize.post";

export const getValidAttributesAndAssociations = (
  attributes: any,
  associations: any
) => {
  const associationsKeys = Object.keys(associations);
  const attributeKeys = Object.keys(attributes);
  let currentModelAttributes = attributes;

  // Details on Belongs
  const belongsAssociation: Array<string> = []; // the total no of associations that the current model Belongs to
  const externalAssociations: Array<any> = []; // this associations do not belong in the current model.

  // GET ALL ASSOCIATION ATTRIBUTES AND SEPARATE THEM FROM DATA LEFT
  associationsKeys.forEach((association) => {
    if (attributeKeys.includes(association)) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [association]: _, ...data } = currentModelAttributes;
      currentModelAttributes = data;
      const associationDetails = associations[association];
      if (associationDetails.type === "belongsTo") {
        belongsAssociation.push(association);
      } else {
        externalAssociations.push(association);
      }
    }
  });

  return {
    // validAssociationsInAttributes,
    belongsAssociation,
    externalAssociations,
    currentModelAttributes,
  };
};

export const handleCreateAssociations = async (
  scaffold: Scaffold,
  model: any,
  validAssociations: Array<string>,
  associations: any,
  attributes: any,
  transaction: any,
  modelId: string
) => {
  for (const association of validAssociations) {
    const associationDetails = associations[association];
    const associationAttribute = attributes[association];

    switch (associationDetails.type) {
      case "hasOne":
        await handleCreateHasOne(
          scaffold,
          {
            details: associationDetails,
            attributes: associationAttribute,
          },
          { name: model.name, id: modelId },
          transaction
        );
        break;
      case "hasMany":
      case "belongsToMany":
        await handleCreateMany(
          scaffold,
          {
            details: associationDetails,
            attributes: associationAttribute,
          },
          { name: model.name, id: modelId },
          transaction
        );
        break;
      default:
        break;
    }
  }
};

export const handleUpdateAssociations = async (
  scaffold: Scaffold,
  model: any,
  validAssociations: Array<string>,
  associations: any,
  attributes: any,
  transaction: any,
  modelId: string
) => {
  for (const association of validAssociations) {
    const associationDetails = associations[association];
    const associationAttribute = attributes[association];

    switch (associationDetails.type) {
      case "hasOne":
        await handleUpdateOne(
          scaffold,
          {
            details: associationDetails,
            attributes: associationAttribute,
          },
          {
            name: model.name,
            id: modelId,
          },
          transaction
        );
        break;
      case "hasMany":
      case "belongsToMany":
        await handleUpdateMany(
          scaffold,
          {
            details: associationDetails,
            attributes: associationAttribute,
          },
          {
            name: model.name,
            id: modelId,
          },
          transaction
        );
        break;
      default:
        break;
    }
  }
};
