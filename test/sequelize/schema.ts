export class Employee {
    static get tableName() {
        return 'employee'
    }

    static get relationships() {
        return {
            skills: {
                relation: 'ManyToManyRelation',
                modelClass: Skill,
                join: {
                    from: 'employee.id',
                    through: {
                        from: 'employee__skill.employee_id',
                        to: 'employee__skill.skill_id'
                    },
                    to: 'skill.id'
                }
            }
        }
    }

}


export class Skill {
    static get tableName() {
        return 'skill'
    }

    static get fields () {
        return {
            id: {
                type: "uuid",
                primary: true
            },
            name: {
                type: "string",
            }
        }
    }

    static get relationships() {
        return {
            employees: {
                relation: 'ManyToManyRelation',
                modelClass: Employee,
                join: {
                    from: 'skill.id',
                    through: {
                        from: 'employee__skill.skill_id',
                        to: 'employee__skill.employee_id'
                    },
                    to: 'employee.id'
                }
            }
        }
    }
}