import * as orderService from '../services/orderService.js';
import { asyncHandler } from '../helpers/asyncHandler.js';

export const getAll = asyncHandler(async (req, res) => {
  const orders = await orderService.getAll();
  res.json(orders);
});

export const getById = asyncHandler(async (req, res) => {
  const order = await orderService.getById(req.params.id);
  res.json(order);
});

export const create = asyncHandler(async (req, res) => {
  const order = await orderService.create(req.body);
  res.status(201).json(order);
});

export const updateStatus = asyncHandler(async (req, res) => {
  const order = await orderService.updateStatus(req.params.id, req.body.status);
  res.json(order);
});

export const remove = asyncHandler(async (req, res) => {
  const order = await orderService.remove(req.params.id);
  res.json(order);
});
