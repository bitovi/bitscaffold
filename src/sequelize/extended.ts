/* eslint-disable @typescript-eslint/no-explicit-any */

import { Scaffold } from "..";
import {
  getValidAttributesAndAssociations,
  handleCreateAssociations,
  handleUpdateAssociations,
} from "./associations";
import { handleUpdateBelongs } from "./associations/sequelize.patch";
import { handleCreateBelongs } from "./associations/sequelize.post";

/**
 * ExtendSequelize is a function that replaces some model functions
 * in Sequelize, so users can call
 * original Scaffold Model that was used to generate it.
 *
 */
export function extendSequelize(Sequelize, scaffold: Scaffold) {
  const origCreate = Sequelize.Model.create;
  const origUpdate = Sequelize.Model.update;

  // associationKey => Has
  // Sequence => ForeignKey ?? underscored/camelCase/ ?? Nothingness

  Sequelize.Model.create = async function (attributes: Record<string, any>) {
    const associations = scaffold.associationsLookup[this.name];

    let modelData: any;
    let currentModelAttributes = attributes;

    const {
      // validAssociationsInAttributes,
      externalAssociations,
      belongsAssociation,
      currentModelAttributes: _attributes,
    } = getValidAttributesAndAssociations(attributes, associations);
    currentModelAttributes = _attributes;
    // All associations
    const validAssociationsInAttributes = [
      ...externalAssociations,
      ...belongsAssociation,
    ];

    // If there are no associations, create the model with all attributes.
    if (validAssociationsInAttributes.length === 0) {
      return origCreate.apply(this, [attributes]);
    }

    const transaction = await scaffold.orm.transaction();

    try {
      if (belongsAssociation.length > 0) {
        const { modelData: _model } = await handleCreateBelongs(
          this,
          origCreate,
          currentModelAttributes,
          belongsAssociation,
          associations,
          attributes,
          transaction
        );
        modelData = _model;
      }

      if (externalAssociations.length > 0) {
        // create the model first if it does not exist
        if (!modelData) {
          modelData = await origCreate.apply(this, [
            currentModelAttributes,
            { transaction },
          ]);
        }
        await handleCreateAssociations(
          scaffold,
          this,
          externalAssociations,
          associations,
          attributes,
          transaction,
          modelData.id
        );
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

    const {
      externalAssociations,
      belongsAssociation,
      currentModelAttributes: _attributes,
    } = getValidAttributesAndAssociations(attributes, associations);
    currentModelAttributes = _attributes;

    const validAssociationsInAttributes = [
      ...externalAssociations,
      ...belongsAssociation,
    ];

    // If there are no associations, create the model with all attributes.
    if (validAssociationsInAttributes.length === 0) {
      return origUpdate.apply(this, [attributes, ops]);
    }

    const transaction = await scaffold.orm.transaction();

    try {
      if (belongsAssociation.length > 0) {
        const { modelData: _model } = await handleUpdateBelongs(
          this,
          ops,
          origUpdate,
          currentModelAttributes,
          belongsAssociation,
          associations,
          attributes,
          transaction
        );
        modelUpdateData = _model;
      }
      if (externalAssociations.length > 0) {
        if (!modelUpdateData) {
          modelUpdateData = await origUpdate.apply(this, [
            currentModelAttributes,
            {
              ...ops,
              transaction,
            },
          ]);
        }
        await handleUpdateAssociations(
          scaffold,
          this,
          externalAssociations,
          associations,
          attributes,
          transaction,
          modelId
        );
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
