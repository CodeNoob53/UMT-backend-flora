import * as bouquetService from '../services/bouquetService.js';
import { processImage } from '../helpers/processImage.js';
import { deleteBouquetImage } from '../helpers/cloudinaryImages.js';
import { HttpError } from '../helpers/HttpError.js';
import { asyncHandler } from '../helpers/asyncHandler.js';

export const getAll = asyncHandler(async (req, res) => {
  const { _page, _per_page, category, bestseller } = req.query;
  const result = await bouquetService.getAll({ page: _page, perPage: _per_page, category, bestseller });
  res.json(result);
});

export const getById = asyncHandler(async (req, res) => {
  const bouquet = await bouquetService.getById(req.params.id);
  res.json(bouquet);
});

export const create = asyncHandler(async (req, res) => {
  const bouquet = await bouquetService.create(req.body);
  res.status(201).json(bouquet);
});

export const update = asyncHandler(async (req, res) => {
  const bouquet = await bouquetService.update(req.params.id, req.body);
  res.json(bouquet);
});

export const remove = asyncHandler(async (req, res) => {
  const existing = await bouquetService.getById(req.params.id);
  await deleteBouquetImage(existing);

  const bouquet = await bouquetService.remove(req.params.id);
  res.json(bouquet);
});

export const toggleFavorite = asyncHandler(async (req, res) => {
  const bouquet = await bouquetService.toggleFavorite(req.params.id);
  res.json(bouquet);
});

export const updatePhoto = asyncHandler(async (req, res) => {
  if (!req.file) throw HttpError.badRequest('Photo file is required');

  const bouquet = await bouquetService.getById(req.params.id);
  const slug = bouquet.slug ?? `bouquet-${bouquet.id}`;

  await deleteBouquetImage(bouquet);
  const photoData = await processImage(req.file.path, slug);
  const updated = await bouquetService.updatePhoto(req.params.id, photoData);
  res.json(updated);
});
