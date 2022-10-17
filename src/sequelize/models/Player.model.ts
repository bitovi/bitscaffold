import { Table, Column, Model, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { Team } from "./Team.model"

@Table
export class Player extends Model {
    @Column
    firstName: string;

    @Column
    lastName: string;

    @Column
    startDate: Date;

    @Column
    endDate: Date;

    @ForeignKey(() => Team)
    @Column
    teamId: number;

    @BelongsTo(() => Team)
    team: Team
}
