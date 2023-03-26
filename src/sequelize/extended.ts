/* eslint-disable @typescript-eslint/no-explicit-any */

import { Scaffold } from "..";
import { getValidAttributesAndNoBelongs } from "./associations";
import {
  handleUpdateOne,
  handleUpdateToMany,
} from "./associations/sequelize.patch";
import { handleHasOne, handleMany } from "./associations/sequelize.post";

/**
 * ExtendSequelize is a function that replaces some model functions
 * in Sequelize, so users can call
 * original Scaffold Model that was used to generate it.
 *
 */
export function extendSequelize(Sequelize, scaffold: Scaffold) {
  const origCreate = Sequelize.Model.create;
  const origUpdate = Sequelize.Model.update;

  Sequelize.Model.create = async function (attributes: Record<string, any>) {
    const associations = scaffold.associationsLookup[this.name];
    let modelData: any;

    let {
      // eslint-disable-next-line prefer-const
      validAssociationsInAttributes,
      noBelongsTo,
      currentModelAttributes,
    } = getValidAttributesAndNoBelongs(attributes, associations);

    // If there are no associations, create the model with all attributes.
    if (validAssociationsInAttributes.length === 0) {
      return origCreate.apply(this, [attributes]);
    }

    const transaction = await scaffold.orm.transaction();

    try {
      // CREATE THE OTHER ASSOCIATIONS
      for (const association of validAssociationsInAttributes) {
        const associationDetails = associations[association];
        const associationAttribute = attributes[association];

        const associationName = associationDetails.model.toLowerCase();
        const modelName = this.name;

        if (associationDetails.type === "belongsTo") {
          currentModelAttributes = {
            ...currentModelAttributes,
            [`${associationName}_id`]: associationAttribute?.id,
          };
          noBelongsTo--;
          // only create a model when all belongs to has been converted.
          if (noBelongsTo === 0) {
            modelData = await origCreate.apply(this, [
              currentModelAttributes,
              { transaction },
            ]);
          }
        } else {
          // Create a model data if one has not been created
          if (!modelData) {
            modelData = await origCreate.apply(this, [
              currentModelAttributes,
              { transaction },
            ]);
          }
          switch (associationDetails.type) {
            case "hasOne":
              await handleHasOne(
                scaffold,
                {
                  details: associationDetails,
                  attributes: associationAttribute,
                },
                { name: modelName, id: modelData.id },
                transaction
              );
              break;
            case "hasMany":
            case "belongsToMany":
              await handleMany(
                scaffold,
                {
                  details: associationDetails,
                  attributes: associationAttribute,
                },
                { name: modelName, id: modelData.id },
                transaction
              );
              break;
            default:
              break;
          }
        }
      }
      await transaction.commit();
    } catch (error) {
      console.log("error =>", error);
      await transaction.rollback();
      throw new Error(error);
    }

    return modelData;
  };

  Sequelize.Model.update = async function (attributes: any, ops: any) {
    const associations = scaffold.associationsLookup[this.name];
    let modelUpdateData: any;
    const modelId = ops.where?.id;

    let {
      // eslint-disable-next-line prefer-const
      validAssociationsInAttributes,
      noBelongsTo,
      currentModelAttributes,
    } = getValidAttributesAndNoBelongs(attributes, associations);

    // If there are no associations, create the model with all attributes.
    if (validAssociationsInAttributes.length === 0) {
      return origUpdate.apply(this, [attributes, ops]);
    }

    const transaction = await scaffold.orm.transaction();

    try {
      for (const association of validAssociationsInAttributes) {
        const associationDetails = associations[association];
        const associationAttribute = attributes[association];

        const associationName = associationDetails.model.toLowerCase();
        const modelName = this.name;

        if (associationDetails.type === "belongsTo") {
          currentModelAttributes = {
            ...currentModelAttributes,
            [`${associationName}_id`]: associationAttribute?.id,
          };
          noBelongsTo--;
          // only create a model when all belongs to has been converted.
          if (noBelongsTo === 0) {
            modelUpdateData = await origUpdate.apply(this, [
              currentModelAttributes,
              ops,
            ]);
          }
        } else {
          if (!modelUpdateData) {
            modelUpdateData = await origUpdate.apply(this, [
              currentModelAttributes,
              ops,
            ]);
          }
          switch (associationDetails.type) {
            case "hasOne":
              await handleUpdateOne(
                scaffold,
                {
                  details: associationDetails,
                  attributes: associationAttribute,
                },
                {
                  name: modelName,
                  id: modelId,
                },
                transaction
              );
              break;
            case "hasMany":
            case "belongsToMany":
              await handleUpdateToMany(
                scaffold,
                {
                  details: associationDetails,
                  attributes: associationAttribute,
                },
                {
                  name: modelName,
                  id: modelId,
                },
                transaction
              );
              break;
            default:
              break;
          }
        }
      }
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw new Error(error);
    }

    return modelUpdateData;
  };

  return Sequelize;
}
