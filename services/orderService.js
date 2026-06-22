import Order from '../models/Order.js';
import Bouquet from '../models/Bouquet.js';
import { HttpError } from '../helpers/HttpError.js';
import sequelize from '../config/db.js';

export const getAll = () => Order.findAll({ order: [['createdAt', 'DESC']] });

export const getById = async id => {
  const order = await Order.findByPk(id);
  if (!order) throw HttpError.notFound();
  return order;
};

export const create = data => sequelize.transaction(async transaction => {
  if (data.productId) {
    const bouquet = await Bouquet.findByPk(data.productId, { transaction });
    if (!bouquet) throw HttpError.notFound('Bouquet not found');

    if (!data.productTitle) data.productTitle = bouquet.title;
    if (!data.productPrice) data.productPrice = bouquet.price;
  }

  const order = await Order.create(data, { transaction });

  if (data.productId) {
    await Bouquet.increment(
      { orders: data.quantity ?? 1 },
      { where: { id: data.productId }, transaction }
    );
  }

  return order;
});

export const updateStatus = async (id, status) => {
  const order = await getById(id);
  return order.update({ status });
};

export const remove = async id => {
  const order = await getById(id);
  await order.destroy();
  return order;
};
