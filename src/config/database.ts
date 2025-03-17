import { Sequelize } from "sequelize";
import { Config } from "./config";

console.log({pass: Config.MYSQL.Password})
const sequelize = new Sequelize(
  Config.MYSQL.Name,
  Config.MYSQL.User,
  Config.MYSQL.Password,
  {
    host: "127.0.0.1",
    dialect: "mysql",
    logging: false,
  }
);

export default sequelize;
