import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Feedback = sequelize.define('Feedback', {
  author: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
});

export default Feedback;
