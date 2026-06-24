import Bouquet from '../models/Bouquet.js';
import { HttpError } from '../helpers/HttpError.js';
import { Op } from 'sequelize';

// When bestseller=true, return manually flagged ones first, then top sellers by
// orders count (no duplicates), up to the requested limit.
async function getBestsellers(perPage) {
  const manual = await Bouquet.findAll({
    where: { bestseller: true },
    order: [['orders', 'DESC']],
  });

  if (manual.length >= perPage) {
    const slice = manual.slice(0, perPage);
    return { data: slice, items: perPage, pages: 1 };
  }

  const manualIds = manual.map(b => b.id);
  const needed = perPage - manual.length;

  const auto = await Bouquet.findAll({
    where: { id: { [Op.notIn]: manualIds.length ? manualIds : [0] } },
    order: [['orders', 'DESC']],
    limit: needed,
  });

  const combined = [...manual, ...auto];
  return { data: combined, items: combined.length, pages: 1 };
}

export const getAll = ({ page, perPage, category, bestseller } = {}) => {
  const isBestseller = bestseller === 'true' || bestseller === true;

  if (isBestseller) {
    const pp = Math.max(1, Number(perPage) || 18);
    return getBestsellers(pp);
  }

  const where = {};
  if (category !== undefined) where.category = category;
  if (bestseller !== undefined) where.bestseller = isBestseller;

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
