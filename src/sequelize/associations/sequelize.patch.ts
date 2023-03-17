// export const sequelizeUpdateWithAssociations = async function( attributes: Record<string, any> ) {
//   const associations = this.scaffold.associationsLookup[this.name];
//   const associationsKeys = Object.keys(associations);
//   const validAssociationsInAttributes: Array<any> = [];

//   const attributeKeys = Object.keys(attributes);

//   let currentModelAttributes = attributes;
//   let modelId: string | undefined; // Id of the current model when created

//   // Details on Belongs
//   let noBelongsTo = 0; // the total no of associations that the current model Belongs to

//   // GET ALL ASSOCIATION ATTRIBUTES AND SEPARATE THEM FROM DATA LEFT
//   associationsKeys.forEach((association) => {
//     if (attributeKeys.includes(association)) {
//       validAssociationsInAttributes.push(association);
//       const { [association]: _, ...data } = currentModelAttributes;
//       currentModelAttributes = data;
//       const associationDetails = associations[association];
//     if (associationDetails.type === 'belongsTo') {
//         noBelongsTo++;
//       }
//     }
//   });

//   // If there are no associations, create the model with all attributes.
//   if (validAssociationsInAttributes.length === 0) {
//     return this.origCreate.apply(this, [attributes]);
//   }

// }
