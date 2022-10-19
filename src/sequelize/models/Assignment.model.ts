import { Table, Column, HasMany, Model } from "../../types";
import { Player } from "./Player.model"

@Table
export class Assignment extends Model {
    @Column
    name: string;

    @HasMany(() => Player)
    players: Player[];
}


/**
-- public."assignment" definition

-- Drop table

-- DROP TABLE "assignment";

CREATE TABLE "assignment" (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    employee_id uuid NOT NULL,
    role_id uuid NOT NULL,
    start_date date NOT NULL,
    end_date date NULL,
    CONSTRAINT assignment_pkey PRIMARY KEY (id)
);
CREATE INDEX assignment_employee_id_index ON public.assignment USING btree (employee_id);
CREATE INDEX assignment_role_id_index ON public.assignment USING btree (role_id);


-- public."assignment" foreign keys

ALTER TABLE public."assignment" ADD CONSTRAINT assignment_employee_id_foreign FOREIGN KEY (employee_id) REFERENCES employee(id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE public."assignment" ADD CONSTRAINT assignment_role_id_foreign FOREIGN KEY (role_id) REFERENCES "role"(id) ON DELETE CASCADE ON UPDATE CASCADE;
 */

