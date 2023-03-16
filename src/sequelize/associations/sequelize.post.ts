/* eslint-disable @typescript-eslint/no-explicit-any */
import { Scaffold } from "../..";
import { IAssociationBody } from "../types";

export const sequelizeCreateWithAssociations = async function (
  attributes: Record<string, any>
) {
  const associations = this.scaffold.associationsLookup[this.name];
  const associationsKeys = Object.keys(associations);
  const validAssociationsInRequest: Array<any> = [];
  const requestKeys = Object.keys(attributes);
  let dataAttributes: any = attributes;
  let modelId: string | undefined;

  // Details on Belongs
  const isBelong = ["belongsTo", "belongsToMany"];
  let noBelongsTo = 0;

  // GET ALL ASSOCIATION ATTRIBUTES AND SEPARATE THEM FROM DATA LEFT
  associationsKeys.forEach((association) => {
    if (requestKeys.includes(association)) {
      validAssociationsInRequest.push(association);
      const { [association]: _, ...data } = dataAttributes;
      dataAttributes = data;
      const associationDetails = associations[association];
      if (isBelong.includes(associationDetails.type)) {
        noBelongsTo++;
      }
    }
  });

  if (validAssociationsInRequest.length === 0) {
    return this.origCreate.apply(this, [attributes]);
  }

  // CREATE THE OTHER ASSOCIATIONS
  for (const association of validAssociationsInRequest) {
    const associationDetails = associations[association];
    const associationAttribute = attributes[association];

    const associationName = associationDetails.model.toLowerCase();
    const modelName = this.name.toLowerCase();

    const isBelong = ["belongsTo", "belongstoMany"];

    if (isBelong.includes(associationDetails.type)) {
      dataAttributes = {
        ...dataAttributes,
        [`${associationName}_id`]: associationAttribute?.id,
      };
      noBelongsTo--;
      if (noBelongsTo === 0) {
        const modelData = await this.origCreate.apply(this, [dataAttributes]);
        modelId = modelData.id;
      }
    } else {
      if (!modelId) {
        const modelData = await this.origCreate.apply(this, [dataAttributes]);
        modelId = modelData.id;
      }
      switch (associationDetails.type) {
        case "hasOne":
          handleHasOne(
            this.scaffold,
            { details: associationDetails, attributes: associationAttribute },
            { name: modelName, id: modelId }
          );
          break;
        case "hasMany":
          handleHasMany(
            this.scaffold,
            { details: associationDetails, attributes: associationAttribute },
            { name: modelName, id: modelId }
          );
          break;
        case "manyToMany":
          handleManyToMany(
            this.scaffold,
            { details: associationDetails, attributes: associationAttribute },
            { name: modelName, id: modelId }
          );
          break;
        default:
          break;
      }
    }
  }
};

export const handleHasOne = async (
  scaffold: Scaffold,
  association: IAssociationBody<Record<string, any>>,
  model: { name: string; id?: string }
) => {
  const data = {
    ...association.attributes,
    [`${model.id}_id`]: model.id,
  };
  return await scaffold.model[association.details.model].create(data);
};

export const handleHasMany = async (
  scaffold: Scaffold,
  association: IAssociationBody<Array<Record<string, any>>>,
  model: { name: string; id?: string }
) => {
  const data = association.attributes.map((attribute) => ({
    ...attribute,
    [`${model.id}_id`]: model.id,
  }));
  return await scaffold.model[association.details.model].bulkCreate(data);
};

export const handleManyToMany = async (
  scaffold: Scaffold,
  association: IAssociationBody<Array<Record<string, any>>>,
  model: { name: string; id?: string }
) => {
  // Check if id is present in the attribute object
  const isCreate = !association.attributes[0].id;
  let joinData: Array<any> = [];
  if (isCreate) {
    // Create the models first if the id is not present
    const associationData = await scaffold.model[
      association.details.model
    ].bulkCreate(association.attributes);
    joinData = associationData.map((data) => {
      return {
        [`${model.id}_id`]: model.id,
        [`${association.details.model.toLowerCase()}_id`]:
          data.getDataValue("id"),
      };
    });
  } else {
    // Assign the ids to the through table if the model is present
    joinData = association.attributes.map((data) => {
      return {
        [`${model.id}_id`]: model.id,
        [`${association.details.model.toLowerCase()}_id`]: data.id,
      };
    });
  }
  return await scaffold.model[
    association.details.joinTable as string
  ]?.bulkCreate(joinData);
};
