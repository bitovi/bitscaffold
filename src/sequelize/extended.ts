/* eslint-disable @typescript-eslint/no-explicit-any */
// import { Scaffold } from "..";

import { Scaffold } from "..";
import {
  handleHasMany,
  handleHasOne,
  handleManyToMany,
} from "./associations/sequelize.post";

/**
 * ExtendSequelize is a function that replaces some model functions
 * in Sequelize, so users can call
 * original Scaffold Model that was used to generate it.
 *
 */
export function extendSequelize(Sequelize, scaffold: Scaffold) {
  const origCreate = Sequelize.Model.create;
  // eslint-disable-next-line @typescript-eslint/no-this-alias

  Sequelize.Model.create = async function (attributes: Record<string, any>) {
    const associations = scaffold.associationsLookup[this.name];
    const associationsKeys = Object.keys(associations);
    const validAssociationsInAttributes: Array<any> = [];

    console.log("associations =>", associations);

    const attributeKeys = Object.keys(attributes);

    let currentModelAttributes = attributes;
    let modelData: any;

    // Details on Belongs
    let noBelongsTo = 0; // the total no of associations that the current model Belongs to

    // GET ALL ASSOCIATION ATTRIBUTES AND SEPARATE THEM FROM DATA LEFT
    associationsKeys.forEach((association) => {
      if (attributeKeys.includes(association)) {
        validAssociationsInAttributes.push(association);
        const { [association]: _, ...data } = currentModelAttributes;
        currentModelAttributes = data;
        const associationDetails = associations[association];
        if (associationDetails.type === "belongsTo") {
          noBelongsTo++;
        }
      }
    });

    // If there are no associations, create the model with all attributes.
    if (validAssociationsInAttributes.length === 0) {
      return origCreate.apply(this, [attributes]);
    }

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
          modelData = await origCreate.apply(this, [currentModelAttributes]);
        }
      } else {
        if (!modelData) {
          modelData = await origCreate.apply(this, [currentModelAttributes]);
        }
        switch (associationDetails.type) {
          case "hasOne":
            await handleHasOne(
              scaffold,
              {
                details: associationDetails,
                attributes: associationAttribute,
              },
              { name: modelName, id: modelData.id }
            );
            break;
          case "hasMany":
            await handleHasMany(
              scaffold,
              {
                details: associationDetails,
                attributes: associationAttribute,
              },
              { name: modelName, id: modelData.id }
            );
            break;
          case "belongsToMany":
            await handleManyToMany(
              scaffold,
              {
                details: associationDetails,
                attributes: associationAttribute,
              },
              { name: modelName, id: modelData.id }
            );
            // await modelData[`add${associationDetails.model}`]()
            break;
          default:
            break;
        }
      }
    }

    return modelData;
  };

  // Sequelize.Model.update = async function (...args) {
  //   await origCreate.apply(this, [args]);
  // };

  return Sequelize;
}
