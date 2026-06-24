import 'dotenv/config';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { resolve, dirname } from 'path';
import sequelize from '../config/db.js';
import Feedback from '../models/Feedback.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const dbJson = JSON.parse(
  await readFile(resolve(__dirname, '../../1_hw_flora/db.json'), 'utf-8')
);

await sequelize.authenticate();
await sequelize.sync();

const rows = dbJson.feedbacks.map(f => ({ author: f.author, text: f.text }));

await Feedback.destroy({ where: {} });
await Feedback.bulkCreate(rows);

console.log(`Seeded ${rows.length} feedbacks`);
await sequelize.close();
