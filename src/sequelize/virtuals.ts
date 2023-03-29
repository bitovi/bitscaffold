export const addVirtuals = function ({ queryOptions, scaffold, modelName }) {
  let options: any = {
    include: []
  }

  if (queryOptions) {
    if (!queryOptions.attributes) {
      options.include = { all: true }
    } else {
      queryOptions.attributes.forEach((attribute) => {
        const scaffoldVirtuals = scaffold.virtuals[modelName]

        if (
          scaffoldVirtuals &&
          scaffoldVirtuals[attribute] &&
          scaffoldVirtuals[attribute] !== ''
        ) {
          options.include.push(...options.include, scaffoldVirtuals[attribute])
        }
      })

      if (queryOptions.include) {
        if (Array.isArray(queryOptions.include)) {
          options.include.push(...queryOptions.include)
        } else {
          options.include.push(queryOptions.include)
        }

        delete queryOptions.include
      }
    }

    options = Object.assign(options, queryOptions)
  } else {
    options.include = { all: true }
  }

  options.include.length < 1 && delete options.include

  return options
}
