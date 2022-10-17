import { Table, Column, Model, HasMany } from 'sequelize-typescript';
import { Player } from "./Player.model"

@Table
export class Team extends Model {
    @Column
    name: string;

    @HasMany(() => Player)
    players: Player[];
}
