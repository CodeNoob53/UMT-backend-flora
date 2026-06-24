# Flora Backend API

![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-5.x-000000?logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![Sequelize](https://img.shields.io/badge/Sequelize-6.x-52B0E7?logo=sequelize&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-images-3448C5?logo=cloudinary&logoColor=white)
![Swagger](https://img.shields.io/badge/Swagger-API%20docs-85EA2D?logo=swagger&logoColor=black)
![Render](https://img.shields.io/badge/Deploy-Render-46E3B7?logo=render&logoColor=black)

Backend та адмін-панель для проєкту Flora flower shop. Сервер зберігає букети, замовлення та відгуки в PostgreSQL, перевіряє вхідні дані через Joi, документує API через Swagger UI та завантажує фото букетів у Cloudinary.

<p align="center">
  <img src="./flora_admin_prew.avif" alt="Прев'ю адмін-панелі Flora" width="920">
</p>

## Можливості

- CRUD для букетів: створення, редагування, видалення, favorite, bestseller, лічильник замовлень і фото.
- **Bestseller логіка**: ручно позначені (`bestseller=true`) — завжди перші за кількістю замовлень; далі автоматично добираються найпопулярніші за `orders` без дублів.
- Публічний перегляд відгуків (`GET /api/feedbacks`).
- Публічне створення замовлень із фронтенду.
- Захищене керування замовленнями в адмінці.
- Статуси замовлень: `new`, `processed`, `completed`, `cancelled`.
- Автоматичне збільшення `orders` у букета після створення замовлення з `productId`.
- Basic Auth для адмін-панелі та всіх адміністративних змін.
- Завантаження фото в Cloudinary (eager AVIF-трансформації); URL-трансформації для retina на фронтенді.
- Swagger-документація за адресою `/api-docs`.
- Конфігурація для деплою на Render через `render.yaml`.

## Технології

| Рівень | Інструменти |
| --- | --- |
| Runtime | Node.js 20+, Express 5 |
| База даних | PostgreSQL 16, Sequelize 6 |
| Валідація | Joi |
| Завантаження фото | Multer, Cloudinary |
| Документація | Swagger UI |
| Адмін-панель | Static HTML/CSS/JS |
| Деплой | Render |

## Структура проєкту

```text
config/        Налаштування бази даних і Cloudinary
controllers/   Обробники HTTP-запитів
helpers/       Утиліти: upload, errors, async handlers
middlewares/   Auth, upload і validation middleware
models/        Sequelize-моделі (Bouquet, Order, Feedback)
public/admin/  Файли адмін-панелі
routes/        API routes
schemas/       Joi-схеми валідації
seed/          Скрипти для демо-даних
services/      Бізнес-логіка
```

## Локальний запуск

```bash
npm install
cp .env.example .env
npm start
```

Перед запуском потрібно заповнити `.env`:

```env
PORT=3000
DB_URL=postgresql://user:password@host:5432/dbname
CLD_NAME=your_cloudinary_cloud_name
CLD_API_KEY=your_cloudinary_api_key
CLD_API_SECRET=your_cloudinary_api_secret
ADMIN_USER=admin
ADMIN_PASSWORD=change_me
```

Seed-команди:

```bash
npm run seed             # букети з ../1_hw_flora/db.json
npm run seed:feedbacks   # відгуки з ../1_hw_flora/db.json
npm run seed:orders      # демо-замовлення
```

## Доступні адреси

| URL | Опис |
| --- | --- |
| `/health` | Перевірка стану сервера |
| `/api/bouquets` | API букетів |
| `/api/products` | Аліас `/api/bouquets` (сумісність з фронтендом) |
| `/api/orders` | API замовлень |
| `/api/feedbacks` | Відгуки (read-only) |
| `/api-docs` | Swagger UI |
| `/admin` | Захищена адмін-панель |

## Авторизація

Адмін-панель використовує Basic Auth через змінні `ADMIN_USER` і `ADMIN_PASSWORD`.

Захищені маршрути:

- зміни букетів: `POST`, `PUT`, `DELETE`, `PATCH /favorite`, `PATCH /photo`;
- адміністративні дії із замовленнями: `GET`, `GET /:id`, `PATCH /:id/status`, `DELETE`.

Фронтенд може публічно створювати замовлення через `POST /api/orders` і читати відгуки через `GET /api/feedbacks`.

## Bouquets API

| Method | Endpoint | Auth | Опис |
| --- | --- | --- | --- |
| GET | `/api/bouquets` | — | Отримати букети (підтримує `_page`, `_per_page`, `category`, `bestseller`) |
| GET | `/api/bouquets/:id` | — | Отримати один букет за id |
| POST | `/api/bouquets` | Basic | Створити букет |
| PUT | `/api/bouquets/:id` | Basic | Оновити букет |
| DELETE | `/api/bouquets/:id` | Basic | Видалити букет |
| PATCH | `/api/bouquets/:id/favorite` | Basic | Перемкнути favorite |
| PATCH | `/api/bouquets/:id/photo` | Basic | Завантажити фото букета |

### Параметри GET `/api/bouquets`

| Параметр | Тип | Опис |
| --- | --- | --- |
| `_page` | number | Номер сторінки (разом із `_per_page`) |
| `_per_page` | number | Кількість елементів на сторінку |
| `category` | string | Фільтр за категорією |
| `bestseller` | boolean | `true` — повертає ручно позначені + топ по orders без дублів |

При пагінації відповідь має формат `{ data, items, pages }`. Без пагінації — plain array.

## Orders API

| Method | Endpoint | Auth | Опис |
| --- | --- | --- | --- |
| GET | `/api/orders` | Basic | Активні замовлення для адмінки |
| GET | `/api/orders/:id` | Basic | Одне замовлення за id |
| POST | `/api/orders` | — | Створити замовлення з фронтенду |
| PATCH | `/api/orders/:id/status` | Basic | Оновити статус |
| DELETE | `/api/orders/:id` | Basic | М'яке видалення |

Якщо замовлення створюється з `productId`, backend автоматично збільшує `orders` у відповідного букета на передану `quantity`.

## Feedbacks API

| Method | Endpoint | Auth | Опис |
| --- | --- | --- | --- |
| GET | `/api/feedbacks` | — | Отримати всі відгуки |

## Завантаження фото

Multer приймає файл у тимчасову директорію `temp/`. Backend завантажує оригінал у Cloudinary з eager AVIF-трансформаціями для всіх брейкпоінтів (моб/планшет/ПК, @1x/@2x/@3x) — вони pre-генеруються асинхронно на CDN. У базі зберігається `secure_url` оригіналу.

Фронтенд будує `<picture>` з `<source>` для AVIF retina вставляючи трансформацію в URL:
```
https://res.cloudinary.com/.../upload/f_avif,w_670,c_fill,q_auto/v.../bouquet.jpg
```

При видаленні букета або заміні фото — старий файл у Cloudinary очищується через `public_id`, отриманий парсингом `secure_url`.

> Render free tier має ephemeral filesystem — локальне збереження файлів не підходить для продакшну. Cloudinary вирішує цю проблему.

## Деплой

У репозиторії є `render.yaml` для деплою на Render:

- web service: `npm install` + `npm start`;
- PostgreSQL 16 database;
- required environment variables для database, Cloudinary та admin auth.

Після деплою перевірити:

```
GET /health
GET /api/bouquets
GET /api/feedbacks
/api-docs
/admin
```
