import Bouquet from '../models/Bouquet.js';
import { HttpError } from '../helpers/HttpError.js';
import { Op } from 'sequelize';

export const getAll = ({ page, perPage, category, bestseller } = {}) => {
  const where = {};
  if (category !== undefined) where.category = category;
  if (bestseller !== undefined) where.bestseller = bestseller === 'true' || bestseller === true;

  const hasPagination = page && perPage;
  if (!hasPagination) return Bouquet.findAll({ where, order: [['orders', 'DESC']] });

  const p = Math.max(1, Number(page));
  const pp = Math.max(1, Number(perPage));

  return Bouquet.findAndCountAll({
    where,
    order: [['orders', 'DESC']],
    limit: pp,
    offset: (p - 1) * pp,
  }).then(({ rows, count }) => ({
    data: rows,
    items: count,
    pages: Math.max(1, Math.ceil(count / pp)),
  }));
};

export const getById = async id => {
  const bouquet = await Bouquet.findByPk(id);
  if (!bouquet) throw HttpError.notFound();
  return bouquet;
};

export const create = data => Bouquet.create(data);

export const update = async (id, data) => {
  const bouquet = await Bouquet.findByPk(id);
  if (!bouquet) throw HttpError.notFound();
  return bouquet.update(data);
};

export const remove = async id => {
  const bouquet = await Bouquet.findByPk(id);
  if (!bouquet) throw HttpError.notFound();
  await bouquet.destroy();
  return bouquet;
};

export const toggleFavorite = async id => {
  const bouquet = await Bouquet.findByPk(id);
  if (!bouquet) throw HttpError.notFound();
  return bouquet.update({ favorite: !bouquet.favorite });
};

export const updatePhoto = async (id, photoData) => {
  const bouquet = await Bouquet.findByPk(id);
  if (!bouquet) throw HttpError.notFound();
  return bouquet.update(photoData);
};
