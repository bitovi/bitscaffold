export class Employee {
    static get tableName() {
        return 'employee'
    }

    static get validation() {
        return {
            start_date: {
                lt: "end_date"
            },
            end_date: {
                gt: "start_date"
            }
        }
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
                type: "date",
                required: false
            },
            end_date: {
                type: "date",
                required: false
            }
        }
    }

    static get relationships() {
        return {
            HasMany: {
                Skill: {
                    from: "id", // employee.id
                    to: "id", // skill.id
                    through: "employee__skill" // employee__skill.employee_id and employee__skill.skill.id
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
            HasMany: {
                Employee: {
                    from: "id", // skill.id
                    to: "id", // employee.id
                    through: "employee__skill" // employee__skill.employee_id and employee__skill.skill.id
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
