import 'dotenv/config';
import sequelize from '../config/db.js';
import Bouquet from '../models/Bouquet.js';
import Order from '../models/Order.js';

await sequelize.authenticate();

try {
  await sequelize.query('ALTER TYPE "enum_Orders_status" ADD VALUE IF NOT EXISTS \'completed\';');
} catch (error) {
  if (error.original?.code !== '42704') throw error;
}

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

const now = Date.now();
const hours = value => value * 60 * 60 * 1000;
const timestamp = (createdHoursAgo, updatedHoursLater = 0) => {
  const createdAt = new Date(now - hours(createdHoursAgo));
  const updatedAt = new Date(createdAt.getTime() + hours(updatedHoursLater));

  return { createdAt, updatedAt };
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
    ...timestamp(2),
  },
  {
    name: 'Mia Johnson',
    phone: '+1 (555) 018-2201',
    address: '22 Garden Street, Apt 8',
    message: 'Birthday bouquet, pastel colors preferred.',
    quantity: 2,
    status: 'completed',
    ...product(1),
    ...timestamp(7, 2),
  },
  {
    name: 'Sofia Miller',
    phone: '+1 (555) 011-9044',
    address: 'Office reception, 18 Rose Lane',
    message: 'Corporate delivery. Please call before arrival.',
    quantity: 1,
    status: 'completed',
    ...product(2),
    ...timestamp(12, 3),
  },
  {
    name: 'Emily Carter',
    phone: '+1 (555) 016-3312',
    address: '',
    message: 'I will pick it up today.',
    quantity: 1,
    status: 'processed',
    ...product(3),
    ...timestamp(18, 1),
  },
  {
    name: 'Olivia Brown',
    phone: '+1 (555) 019-8472',
    address: '74 Bloom Road',
    message: 'Cancel if same-day delivery is not available.',
    quantity: 1,
    status: 'cancelled',
    ...product(4),
    ...timestamp(25, 1),
  },
  {
    name: 'Grace Wilson',
    phone: '+1 (555) 013-4470',
    address: '11 Lily Court',
    message: 'Anniversary order, please make it elegant.',
    quantity: 1,
    status: 'completed',
    ...product(0),
    ...timestamp(32, 5),
  },
  {
    name: 'Lily Moore',
    phone: '+1 (555) 017-5932',
    address: 'Hotel lobby, 5 Queen Street',
    message: 'Guest pickup at reception.',
    quantity: 3,
    status: 'completed',
    ...product(1),
    ...timestamp(40, 6),
  },
  {
    name: 'Chloe Taylor',
    phone: '+1 (555) 012-8088',
    address: '99 Orchard Road',
    message: 'Please use soft pink wrapping.',
    quantity: 1,
    status: 'new',
    ...product(2),
    ...timestamp(49),
  },
];

await Order.destroy({ where: {}, force: true });
await Order.bulkCreate(orders);

console.log(`Seeded ${orders.length} orders`);
await sequelize.close();
