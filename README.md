# Flora Backend API

Express REST API for the Flora flower shop project. The server works with a PostgreSQL database through Sequelize, validates request bodies with Joi, documents endpoints with Swagger UI, and supports bouquet image uploads through Multer.

## Tech Stack

- Node.js 20+
- Express
- PostgreSQL
- Sequelize
- Joi
- Multer
- Cloudinary
- Swagger UI

## Local Setup

```bash
npm install
cp .env.example .env
npm start
```

Fill `.env` with real values before starting the server:

```env
PORT=3000
DB_URL=postgresql://user:password@host:5432/dbname
CLD_NAME=your_cloudinary_cloud_name
CLD_API_KEY=your_cloudinary_api_key
CLD_API_SECRET=your_cloudinary_api_secret
ADMIN_USER=admin
ADMIN_PASSWORD=change_me
```

Optional seed command:

```bash
npm run seed
```

The seed script imports initial bouquet data from the neighboring frontend project (`../1_hw_flora/db.json`) in this local workspace.

## Available URLs

- Health check: `/health`
- API root: `/api`
- Bouquets API: `/api/bouquets`
- Swagger UI: `/api-docs`
- Admin panel: `/admin`

The admin panel is protected with Basic Auth. Mutating API routes are protected as well: `POST`, `PUT`, `DELETE`, `PATCH /favorite`, and `PATCH /photo`.

## Bouquets API

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/bouquets` | Get all bouquets |
| GET | `/api/bouquets/:id` | Get one bouquet by id |
| POST | `/api/bouquets` | Create bouquet |
| PUT | `/api/bouquets/:id` | Update bouquet |
| DELETE | `/api/bouquets/:id` | Delete bouquet |
| PATCH | `/api/bouquets/:id/favorite` | Toggle favorite status |
| PATCH | `/api/bouquets/:id/photo` | Upload bouquet photo |

## Image Uploads

The project uses Multer to receive uploaded files into the temporary `temp/` directory. After that, the original image is uploaded to Cloudinary, the temp file is removed, and the returned URL is saved in the bouquet's `photoURL` field.

Image optimization is intentionally delegated to Cloudinary delivery transformations (`f_auto`, `q_auto`, width transformations, and browser-specific formats such as WebP/AVIF when available). This keeps the Render free tier backend lightweight and avoids long server-side image processing during admin uploads.

This intentionally replaces permanent local storage in `public/photos`. Local storage can work during development, but on Render free tier the filesystem is ephemeral: uploaded files may disappear after redeploys, restarts, or new instances. Cloudinary keeps uploaded bouquet photos persistent and publicly available, which makes the deployed backend more stable.

When a bouquet is deleted, its Cloudinary image is removed as well. When a photo is replaced with the same slug, Cloudinary overwrites the existing public id; if the slug changed, the old image is cleaned up after the new upload succeeds.

The `public/photos/.gitkeep` directory is kept in the repository to match the original course structure and to leave room for a local-storage fallback if needed.

## Deploy

The repository includes `render.yaml` for Render deployment:

- web service: `npm install` + `npm start`
- PostgreSQL database
- required environment variables for database, Cloudinary, and admin auth

After deployment, check:

- `GET /health`
- `GET /api/bouquets`
- `/api-docs`
- `/admin`
