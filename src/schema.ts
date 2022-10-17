import { BitScaffoldSchema } from "./types";

const schema2: BitScaffoldSchema = {
    models: {
        Foo: {
            name: "foo",
            fields: {
                id: {
                    type: "integer",
                    primary: true,
                    required: true,
                    autoIncrement: true
                }
            }
        }
    }
}


const schema: BitScaffoldSchema = {
    "models": {
        "Foo": {
            "name": "foo",
            "fields": {
                "id": {
                    "type": "integer",
                    "primary": true,
                    "required": true,
                    "autoIncrement": true
                }
            },
            "hasOne": [
                "Bar",
                "Baz"
            ]
        },
        "Bar": {
            "name": "bar",
            "fields": {
                "id": {
                    "type": "integer",
                    "primary": true,
                    "required": true,
                    "autoIncrement": true
                }
            },
            "belongsTo": [
                "Foo"
            ],
            "hasOne": "Baz"
        },
        "Baz": {
            "name": "baz",
            "fields": {
                "id": {
                    "type": "integer",
                    "primary": true,
                    "required": true,
                    "autoIncrement": true
                },
                "example": {
                    "type": "string",
                    "required": true
                }
            },
            "belongsTo": [
                "Foo",
                "Bar"
            ]
        },
        "Team": {
            "name": "team",
            "fields": {
                "id": {
                    "type": "integer",
                    "primary": true,
                    "required": true,
                    "autoIncrement": true
                },
                "name": {
                    "type": "string",
                    "required": true
                }
            },
            "hasMany": [
                "Player"
            ]
        },
        "Player": {
            "fields": {
                "id": {
                    "type": "integer",
                    "primary": true,
                    "required": true,
                    "autoIncrement": true
                },
                "firstName": {
                    "type": "string",
                    "required": true
                },
                "lastName": {
                    "type": "string",
                    "required": true
                },
                "startDate": {
                    "type": "date",
                    "required": true
                },
                "endDate": {
                    "type": "date",
                    "required": true
                }
            },
            "belongsTo": [
                "Team"
            ],
        },
        "Movie": {
            "fields": {
                "id": {
                    "type": "integer",
                    "primary": true,
                    "required": true,
                    "autoIncrement": true
                },
                "name": {
                    "type": "string",
                    "required": true
                }
            },
            "belongsToMany": {
                "model": "Actor",
                "through": "actor__movie"
            }
        },
        "Actor": {
            "fields": {
                "id": {
                    "type": "integer",
                    "primary": true,
                    "required": true,
                    "autoIncrement": true
                },
                "firstName": {
                    "type": "string",
                    "required": true
                },
                "lastName": {
                    "type": "string",
                    "required": true
                }
            },
            "belongsToMany": {
                "model": "Movie",
                "through": "actor__movie"
            }
        }
    }
}


export default schema;