import 'dotenv/config';
import app from './app.js';
import sequelize from './config/db.js';
import Order from './models/Order.js';

const PORT = process.env.PORT ?? 3000;

sequelize
  .authenticate()
  .then(() => {
    console.log('Database connection successful');
    return sequelize.sync();
  })
  .then(() => Order.sync({ alter: true }))
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('Database connection failed:', err.message);
    process.exit(1);
  });
