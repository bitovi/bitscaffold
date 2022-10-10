export class Employee {
    static get tableName() {
        return 'employee'
    }

    static get fields() {
        return {
            id: {
                type: "uuid",
                primary: true,
                required: true
            },
            name: {
                type: "string",
                required: true, // NOT NULL
            },
            start_date: {
                type: "datetime",
                required: false
            },
            end_date: {
                type: "datetime",
                required: false
            }
        }
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

    static get fields() {
        return {
            id: {
                type: "uuid",
                primary: true, // CONSTRAINT skill_pkey PRIMARY KEY (id)
                required: true
            },
            name: {
                type: "string",
                unique: true, // CONSTRAINT skill_name_unique UNIQUE (name)
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

/**
-- public.employee definition

-- Drop table

-- DROP TABLE employee;

CREATE TABLE employee (
	id uuid NOT NULL DEFAULT uuid_generate_v4(),
	"name" varchar(255) NOT NULL,
	start_date date NULL,
	end_date date NULL,
	CONSTRAINT employee_pkey PRIMARY KEY (id)
);
 */


/**
-- public.skill definition

-- Drop table

-- DROP TABLE skill;

CREATE TABLE skill (
	id uuid NOT NULL DEFAULT uuid_generate_v4(),
	"name" varchar(255) NULL,
	CONSTRAINT skill_name_unique UNIQUE (name),
	CONSTRAINT skill_pkey PRIMARY KEY (id)
);
 */


/**
-- public.employee__skill definition

-- Drop table

-- DROP TABLE employee__skill;

CREATE TABLE employee__skill (
	employee_id uuid NOT NULL,
	skill_id uuid NOT NULL,
	CONSTRAINT employee__skill_pkey PRIMARY KEY (employee_id, skill_id)
);


-- public.employee__skill foreign keys

ALTER TABLE public.employee__skill ADD CONSTRAINT employee__skill_employee_id_foreign FOREIGN KEY (employee_id) REFERENCES employee(id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE public.employee__skill ADD CONSTRAINT employee__skill_skill_id_foreign FOREIGN KEY (skill_id) REFERENCES skill(id) ON DELETE CASCADE ON UPDATE CASCADE;
 */

