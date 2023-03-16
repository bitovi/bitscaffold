/* eslint-disable @typescript-eslint/no-explicit-any */
import { Scaffold } from "..";
import { sequelizeCreateWithAssociations } from "./associations/sequelize.post";

/**
 * ExtendSequelize is a function that replaces some model functions
 * in Sequelize, so users can call
 * original Scaffold Model that was used to generate it.
 *
 */
export function extendSequelize(Sequelize, scaffold: Scaffold) {
  this.origCreate = Sequelize.Model.Create;
  this.scaffold = scaffold;

  // this will include the Create
  Sequelize.Model.create = sequelizeCreateWithAssociations.bind(this);

  return Sequelize;
}
