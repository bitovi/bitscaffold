import { Table, Column, Model, HasMany, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Project } from './Project.model';
@Table
export class Role extends Model {
    @Column
    start_date: Date;

    @Column
    start_confidence: number;

    @Column
    end_date: Date;

    @Column
    end_confidence: number;

    @ForeignKey(() => Project)
    @Column
    project_id: number;

    @BelongsTo(() => Project)
    projects: Project[]
}

/**
-- public."role" definition

-- Drop table

-- DROP TABLE "role";

CREATE TABLE "role" (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    start_date date NOT NULL,
    start_confidence float4 NOT NULL,
    end_date date NULL,
    end_confidence float4 NULL,
    project_id uuid NOT NULL,
    CONSTRAINT role_pkey PRIMARY KEY (id)
);
CREATE INDEX role_project_id_index ON public.role USING btree (project_id);


-- public."role" foreign keys

ALTER TABLE public."role" ADD CONSTRAINT role_project_id_foreign FOREIGN KEY (project_id) REFERENCES project(id) ON DELETE CASCADE ON UPDATE CASCADE;
 */