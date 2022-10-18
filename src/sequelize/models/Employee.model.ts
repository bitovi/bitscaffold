import { Table, Column, Model, HasMany } from 'sequelize-typescript';

@Table
export class Employee extends Model {
    @Column
    name: string;

    @Column
    start_date: Date;

    @Column
    end_date: Date;
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