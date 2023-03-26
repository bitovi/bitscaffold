/* eslint-disable @typescript-eslint/no-explicit-any */

import { Scaffold } from "..";
import { getValidAttributesAndNoBelongs } from "./associations";
import {
  handleUpdatebelongs,
  handleUpdateOne,
  handleUpdateToMany,
} from "./associations/sequelize.patch";
import {
  handleBelongs,
  handleHasOne,
  handleMany,
} from "./associations/sequelize.post";

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
    let currentModelAttributes = attributes;
    let noBelongsTo = 0;

    const {
      validAssociationsInAttributes,
      noBelongsTo: _n,
      currentModelAttributes: _attributes,
    } = getValidAttributesAndNoBelongs(attributes, associations);
    currentModelAttributes = _attributes;
    noBelongsTo = _n;

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

        const modelName = this.name;

        if (associationDetails.type === "belongsTo") {
          const {
            updatedModelAttributes,
            modelCreated,
            noBelongsTo: n,
          } = await handleBelongs(
            currentModelAttributes,
            associationDetails,
            associationAttribute,
            origCreate,
            this,
            transaction,
            noBelongsTo
          );

          currentModelAttributes = updatedModelAttributes;
          modelData = modelCreated;
          noBelongsTo = n;
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
    const modelId = ops.where?.id;
    let modelUpdateData: any;
    let currentModelAttributes = attributes;
    let noBelongsTo = 0;

    const {
      validAssociationsInAttributes,
      noBelongsTo: _n,
      currentModelAttributes: _attributes,
    } = getValidAttributesAndNoBelongs(attributes, associations);
    currentModelAttributes = _attributes;
    noBelongsTo = _n;

    // If there are no associations, create the model with all attributes.
    if (validAssociationsInAttributes.length === 0) {
      return origUpdate.apply(this, [attributes, ops]);
    }

    const transaction = await scaffold.orm.transaction();

    try {
      for (const association of validAssociationsInAttributes) {
        const associationDetails = associations[association];
        const associationAttribute = attributes[association];

        const modelName = this.name;

        if (associationDetails.type === "belongsTo") {
          const {
            modelUpdated,
            updatedModelAttributes,
            noBelongsTo: n,
          } = await handleUpdatebelongs(
            currentModelAttributes,
            associationDetails,
            associationAttribute,
            ops,
            origUpdate,
            this,
            transaction,
            noBelongsTo
          );
          noBelongsTo = n;
          modelUpdateData = modelUpdated;
          currentModelAttributes = updatedModelAttributes;
        } else {
          if (!modelUpdateData) {
            modelUpdateData = await origUpdate.apply(this, [
              currentModelAttributes,
              {
                ...ops,
                transaction,
              },
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
