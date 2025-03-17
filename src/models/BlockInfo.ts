import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

class BlockInfo extends Model {
  public id!: number;
  public name!: string;
  public plsBlock!: number;
  public bnbBlock!: number;
}

BlockInfo.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    plsBlock: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    bnbBlock: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "block_info",
    timestamps: false,
  }
);

export default BlockInfo;
