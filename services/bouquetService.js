import Bouquet from '../models/Bouquet.js';
import { HttpError } from '../helpers/HttpError.js';

export const getAll = () => Bouquet.findAll();

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
