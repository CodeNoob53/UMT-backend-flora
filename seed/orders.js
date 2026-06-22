import 'dotenv/config';
import sequelize from '../config/db.js';
import Bouquet from '../models/Bouquet.js';
import Order from '../models/Order.js';

await sequelize.authenticate();
await sequelize.sync();

const bouquets = await Bouquet.findAll({
  order: [['orders', 'DESC']],
  limit: 5,
});

const product = index => {
  const bouquet = bouquets[index % bouquets.length];
  if (!bouquet) return {};

  return {
    productId: bouquet.id,
    productTitle: bouquet.title,
    productPrice: bouquet.price,
  };
};

const orders = [
  {
    name: 'Anna Reed',
    phone: '+1 (555) 014-7120',
    address: '456 Floral Ave, Sydney NSW 2000 AU',
    message: 'Please deliver after 4 PM and add a small card.',
    quantity: 1,
    status: 'new',
    ...product(0),
  },
  {
    name: 'Mia Johnson',
    phone: '+1 (555) 018-2201',
    address: '22 Garden Street, Apt 8',
    message: 'Birthday bouquet, pastel colors preferred.',
    quantity: 2,
    status: 'new',
    ...product(1),
  },
  {
    name: 'Sofia Miller',
    phone: '+1 (555) 011-9044',
    address: 'Office reception, 18 Rose Lane',
    message: 'Corporate delivery. Please call before arrival.',
    quantity: 1,
    status: 'processed',
    ...product(2),
  },
  {
    name: 'Emily Carter',
    phone: '+1 (555) 016-3312',
    address: '',
    message: 'I will pick it up today.',
    quantity: 1,
    status: 'new',
    ...product(3),
  },
  {
    name: 'Olivia Brown',
    phone: '+1 (555) 019-8472',
    address: '74 Bloom Road',
    message: 'Cancel if same-day delivery is not available.',
    quantity: 1,
    status: 'cancelled',
    ...product(4),
  },
];

await Order.destroy({ where: {}, force: true });
await Order.bulkCreate(orders);

console.log(`Seeded ${orders.length} orders`);
await sequelize.close();
