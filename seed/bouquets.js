import 'dotenv/config';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { resolve, dirname } from 'path';
import sequelize from '../config/db.js';
import Bouquet from '../models/Bouquet.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const dbJson = JSON.parse(
  await readFile(resolve(__dirname, '../../1_hw_flora/db.json'), 'utf-8')
);

await sequelize.authenticate();
await sequelize.sync();

const products = dbJson.products.map(p => ({
  title: p.title,
  text: p.text ?? null,
  description: p.description ?? null,
  price: p.price,
  photoURL: null,
  favorite: false,
  bestseller: p.bestseller ?? false,
  orders: p.orders ?? 0,
  category: p.category ?? 'bouquet',
  slug: p.slug ?? p.id,
  alt: p.alt ?? null,
  breakpoints: p.breakpoints ?? ['mob', 'tab', 'pc'],
  fallback: p.fallback ?? null,
}));

await Bouquet.bulkCreate(products);
console.log(`Seeded ${products.length} bouquets`);
await sequelize.close();
