import { Table, Column, Model, HasMany } from 'sequelize-typescript';

@Table
export class Project extends Model {
    @Column
    name: string;

    @Column
    description: string;
}


/**
-- public.project definition

-- Drop table

-- DROP TABLE project;

CREATE TABLE project (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    "name" varchar(255) NOT NULL,
    description text NULL,
    CONSTRAINT project_pkey PRIMARY KEY (id)
);
 */