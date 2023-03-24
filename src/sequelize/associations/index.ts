export const getValidAttributesAndNoBelongs = (
  attributes: any,
  associations: any
) => {
  const associationsKeys = Object.keys(associations);
  const validAssociationsInAttributes: Array<any> = [];

  const attributeKeys = Object.keys(attributes);

  let currentModelAttributes = attributes;

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

  return {
    validAssociationsInAttributes,
    noBelongsTo,
    currentModelAttributes,
  };
};
