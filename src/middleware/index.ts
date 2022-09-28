const compose = require('koa-compose');

export const scaffoldValidationMiddleware = (ctx, next) => {
    // Perform some lookups for the model
    // Perform some lookusp for the validation
    next()
}

export const scaffoldFindAllMiddleware = (ctx, next) => {
    // Perform some lookups for the model
    // Perform some findAll database query
    next()
}

export const scaffoldFindOneMiddleware = (ctx, next) => {
    // Perform some lookups for the model
    // Perform some findOne database query
    next()
}

export const scaffoldCreateMiddleware = (ctx, next) => {
    // Perform some lookups for the model
    // Perform some create database query
    next()
}



export const scaffoldAuthorizationMiddleware = (ctx, next) => {
    // Perform some lookups for the model options
    // Perform some authorization checks
    next()
}


export const scaffoldCreateDefaultMiddleware = compose([
    scaffoldAuthorizationMiddleware,
    scaffoldValidationMiddleware,
    scaffoldCreateMiddleware
]);

export const scaffoldFindOneDefaultMiddleware = compose([
    scaffoldAuthorizationMiddleware,
    scaffoldValidationMiddleware,
    scaffoldFindOneMiddleware
]);

export const scaffoldFindAllDefaultMiddleware = compose([
    scaffoldAuthorizationMiddleware,
    scaffoldValidationMiddleware,
    scaffoldFindAllMiddleware
]);