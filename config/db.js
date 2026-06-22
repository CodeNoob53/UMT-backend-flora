import { Sequelize } from 'sequelize';
import 'dotenv/config';

const isProduction = process.env.NODE_ENV === 'production';

const sequelize = new Sequelize(process.env.DB_URL, {
  dialect: 'postgres',
  dialectOptions: isProduction
    ? { ssl: { require: true, rejectUnauthorized: false } }
    : {},
  logging: false,
});

export default sequelize;
