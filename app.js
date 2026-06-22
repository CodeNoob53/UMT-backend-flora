import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { createRequire } from 'module';
import swaggerUi from 'swagger-ui-express';
import apiRouter from './routes/api/index.js';
import { basicAuth } from './middlewares/basicAuth.js';
import { notFound } from './middlewares/notFound.js';
import { errorHandler } from './middlewares/errorHandler.js';

const require = createRequire(import.meta.url);
const swaggerDocument = require('./swagger.json');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/admin', basicAuth, express.static('public/admin'));
app.use(express.static('public'));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api', apiRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
