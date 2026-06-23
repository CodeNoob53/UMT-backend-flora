import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Order = sequelize.define(
  'Order',
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
    },
    message: {
      type: DataTypes.TEXT,
    },
    quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    productId: {
      type: DataTypes.INTEGER,
    },
    productTitle: {
      type: DataTypes.STRING,
    },
    productPrice: {
      type: DataTypes.INTEGER,
    },
    status: {
      type: DataTypes.ENUM('new', 'processed', 'completed', 'cancelled'),
      defaultValue: 'new',
    },
  },
  {
    timestamps: true,
    paranoid: true,
  }
);

export default Order;
