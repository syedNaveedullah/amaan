import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/sqlconnection.js";
class Currency extends Model {}

Currency.init(
  {
    sno: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    exchangeName:{                 
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    baseCurrency: {                  //USD OR INR
      type: DataTypes.STRING,
      allowNull: false,
    },
    fromCurrency: {                 //
      type: DataTypes.DECIMAL(10, 4),
      allowNull: false,
    },  
    quoteCurrency:{
      type: DataTypes.STRING,
      allowNull: false,
    },
    toCurrency: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: false,
    },
    profit_percent: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Currency",
    tableName: "currencies",
    timestamps: true,
  }
);

export default Currency;
