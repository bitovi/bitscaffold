# Scaffold Export Naming Conventions

## General Notes

The Scaffold class exports a number of accessors that provide per-Model functions for different common CRUD and REST API operations. Some of these include - Parameter pasring - create / update data validation - response formatting / serialization - ORM query operations - combinations of the above

## Naming Conventions

```
scaffold.[accessor].[modelName].[function]
```

Accessor

- Everything
- Parse
- Middleware
- Serialize
- Model

# Exceptions

handleEverythingKoaMiddleware
