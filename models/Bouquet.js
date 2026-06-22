import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Bouquet = sequelize.define('Bouquet', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  text: {
    type: DataTypes.STRING,
  },
  description: {
    type: DataTypes.TEXT,
  },
  price: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  photoURL: {
    type: DataTypes.STRING,
  },
  favorite: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  bestseller: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  orders: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  category: {
    type: DataTypes.STRING,
    defaultValue: 'bouquet',
  },
  slug: {
    type: DataTypes.STRING,
    unique: true,
  },
  alt: {
    type: DataTypes.STRING,
  },
});

export default Bouquet;
