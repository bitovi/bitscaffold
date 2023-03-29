/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  Sequelize,
  Model,
  CreateOptions,
  ModelStatic,
  Attributes,
  UpdateOptions,
} from "sequelize";
import { Col, Fn, Literal, MakeNullishOptional } from "sequelize/types/utils";
import { Scaffold } from "..";
import {
  getValidAttributesAndAssociations,
  handleCreateAssociations,
  handleUpdateAssociations,
} from "./associations";
import { handleUpdateBelongs } from "./associations/sequelize.patch";
import { handleCreateBelongs } from "./associations/sequelize.post";
import { IAssociation } from "./types";
import { addVirtuals } from "./virtuals";

/**
 * ExtendSequelize is a function that replaces some model functions
 * in Sequelize, so users can call
 * original Scaffold Model that was used to generate it.
 *
 */

export function extendedSequelize(scaffold: Scaffold) {
  const origFindAll = Model.findAll;
  const origFindOne = Model.findOne;
  const origFindByPk = Model.findByPk;
  const origFindOrCreate = Model.findOrCreate;
  const origCreate = Model.create;
  const origUpdate = Model.update;

  Model.create = async function <
    M extends Model,
    O extends CreateOptions<Attributes<M>> = CreateOptions<Attributes<M>>
  >(
    this: ModelStatic<M>,
    attributes: MakeNullishOptional<M["_creationAttributes"]> | undefined,
    options?: O
  ) {
    const associations = scaffold.associationsLookup[this.name];
    const modelPrimaryKey = this.primaryKeyAttribute;

    let modelData:
      | undefined
      | (O extends { returning: false } | { ignoreDuplicates: true }
          ? void
          : M);
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
      return origCreate.apply(this, [attributes, options]);
    }

    const transaction = await scaffold.orm.transaction();

    try {
      if (belongsAssociation.length > 0) {
        const { modelData: _model } = await handleCreateBelongs(
          this,
          origCreate,
          currentModelAttributes,
          belongsAssociation,
          associations as Record<string, IAssociation>,
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
          associations as Record<string, IAssociation>,
          attributes,
          transaction,
          modelData?.[modelPrimaryKey]
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

  Model.update = async function <M extends Model<any, any>>(
    this: ModelStatic<M>,
    attributes: {
      [key in keyof Attributes<M>]?:
        | Fn
        | Col
        | Literal
        | Attributes<M>[key]
        | undefined;
    },
    ops: Omit<UpdateOptions<Attributes<M>>, "returning"> & {
      returning: Exclude<
        UpdateOptions<Attributes<M>>["returning"],
        undefined | false
      >;
    }
  ) {
    const associations = scaffold.associationsLookup[this.name];
    const modelPrimaryKey = this.primaryKeyAttribute;

    if (!ops.where?.[modelPrimaryKey]) {
      throw new Error("Primary key does not exist");
    }
    const modelId = ops.where[modelPrimaryKey];
    let modelUpdateData: [affectedCount: number, affectedRows: M[]] | undefined;
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
          associations as Record<string, IAssociation>,
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
          associations as Record<string, IAssociation>,
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

  Model.findAll = async function (queryOptions) {
    const options = addVirtuals({
      queryOptions,
      scaffold,
      modelName: this.name,
    });

    return await origFindAll.apply(this, [options]);
  };

  Model.findOne = async function (queryOptions) {
    const options = addVirtuals({
      queryOptions,
      scaffold,
      modelName: this.name,
    });

    return await origFindOne.apply(this, [options]);
  };

  Model.findByPk = async function (id, queryOptions) {
    const options = addVirtuals({
      queryOptions,
      scaffold,
      modelName: this.name,
    });

    return await origFindByPk.apply(this, [id, options]);
  };

  Model.findOrCreate = async function (queryOptions) {
    const options = addVirtuals({
      queryOptions,
      scaffold,
      modelName: this.name,
    });

    return await origFindOrCreate.apply(this, [options]);
  };

  return Sequelize;
}
