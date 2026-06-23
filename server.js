import 'dotenv/config';
import { DataTypes } from 'sequelize';
import app from './app.js';
import sequelize from './config/db.js';

const PORT = process.env.PORT ?? 3000;

async function ensureOrderSoftDeleteColumn() {
  const queryInterface = sequelize.getQueryInterface();
  const table = await queryInterface.describeTable('Orders');

  if (!table.deletedAt) {
    await queryInterface.addColumn('Orders', 'deletedAt', {
      type: DataTypes.DATE,
      allowNull: true,
    });
  }
}

sequelize
  .authenticate()
  .then(() => {
    console.log('Database connection successful');
    return sequelize.sync();
  })
  .then(() => ensureOrderSoftDeleteColumn())
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('Database connection failed:', err.message);
    process.exit(1);
  });
