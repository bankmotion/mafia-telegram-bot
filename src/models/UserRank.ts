import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

class UserRank extends Model {
  public id!: number;
  public address!: string;
  public name!: string;
  public gender!: number;
  public rankXp!: number;
  public img!: number;
  public chainType!: string;
  public worth!: number;
  public family!: string;
}

UserRank.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      defaultValue: "",
    },
    gender: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    rankXp: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    img: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    chainType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    worth: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    family: {
      type: DataTypes.STRING,
      defaultValue: "",
    },
  },
  {
    sequelize,
    tableName: "user_rank",
    timestamps: false,
  }
);

export default UserRank;
