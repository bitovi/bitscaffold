import { Table, Column, Model, HasMany, Unique, PrimaryKey, AllowNull } from 'sequelize-typescript';

@Table
export class Skill extends Model {
    @Column @Unique @AllowNull(false)
    name: string;
}

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