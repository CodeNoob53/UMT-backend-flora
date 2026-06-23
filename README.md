# Flora Backend API

![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-5.x-000000?logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![Sequelize](https://img.shields.io/badge/Sequelize-6.x-52B0E7?logo=sequelize&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-images-3448C5?logo=cloudinary&logoColor=white)
![Swagger](https://img.shields.io/badge/Swagger-API%20docs-85EA2D?logo=swagger&logoColor=black)
![Render](https://img.shields.io/badge/Deploy-Render-46E3B7?logo=render&logoColor=black)

Backend та адмін-панель для проєкту Flora flower shop. Сервер зберігає букети й замовлення в PostgreSQL, перевіряє вхідні дані через Joi, документує API через Swagger UI та завантажує фото букетів у Cloudinary.

<p align="center">
  <img src="./flora_admin_prew.avif" alt="Прев'ю адмін-панелі Flora" width="920">
</p>

## Можливості

- CRUD для букетів: створення, редагування, видалення, favorite, bestseller, лічильник замовлень і фото.
- Публічне створення замовлень із фронтенду.
- Захищене керування замовленнями в адмінці.
- Статуси замовлень: `new`, `processed`, `completed`, `cancelled`.
- Автоматичне збільшення `orders` у букета після створення замовлення з `productId`.
- Basic Auth для адмін-панелі та всіх адміністративних змін.
- Завантаження фото в Cloudinary та очищення старих фото при видаленні або заміні.
- Swagger-документація за адресою `/api-docs`.
- Конфігурація для деплою на Render через `render.yaml`.

## Технології

| Рівень | Інструменти |
| --- | --- |
| Runtime | Node.js 20+, Express 5 |
| База даних | PostgreSQL, Sequelize |
| Валідація | Joi |
| Завантаження фото | Multer, Cloudinary |
| Документація | Swagger UI |
| Адмін-панель | Static HTML/CSS/JS |
| Деплой | Render |

## Структура проєкту

```text
config/        Налаштування бази даних і Cloudinary
controllers/   Обробники HTTP-запитів
helpers/       Спільні утиліти для upload, errors, async handlers
middlewares/   Auth, upload і validation middleware
models/        Sequelize-моделі
public/admin/  Файли адмін-панелі
routes/        API та admin routes
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

Додаткові seed-команди:

```bash
npm run seed
npm run seed:orders
```

`npm run seed` імпортує початкові букети із сусіднього фронтенд-проєкту `../1_hw_flora/db.json`.

`npm run seed:orders` створює демо-замовлення, прив'язує їх до наявних букетів і задає різний час створення, щоб адмінка виглядала реалістичніше.

## Доступні адреси

| URL | Опис |
| --- | --- |
| `/health` | Перевірка стану сервера |
| `/api` | Корінь API |
| `/api/bouquets` | API букетів |
| `/api/orders` | API замовлень |
| `/api-docs` | Swagger UI |
| `/admin` | Захищена адмін-панель |

## Авторизація

Адмін-панель використовує Basic Auth через змінні `ADMIN_USER` і `ADMIN_PASSWORD`.

Захищені маршрути:

- зміни букетів: `POST`, `PUT`, `DELETE`, `PATCH /favorite`, `PATCH /photo`;
- адміністративні дії із замовленнями: `GET`, `GET /:id`, `PATCH /:id/status`, `DELETE`.

Фронтенд може публічно створювати замовлення через `POST /api/orders`.

## Bouquets API

| Method | Endpoint | Опис |
| --- | --- | --- |
| GET | `/api/bouquets` | Отримати всі букети |
| GET | `/api/bouquets/:id` | Отримати один букет за id |
| POST | `/api/bouquets` | Створити букет |
| PUT | `/api/bouquets/:id` | Оновити букет |
| DELETE | `/api/bouquets/:id` | Видалити букет |
| PATCH | `/api/bouquets/:id/favorite` | Перемкнути favorite |
| PATCH | `/api/bouquets/:id/photo` | Завантажити фото букета |

## Orders API

| Method | Endpoint | Опис |
| --- | --- | --- |
| GET | `/api/orders` | Отримати всі активні замовлення для адмінки |
| GET | `/api/orders/:id` | Отримати одне замовлення за id |
| POST | `/api/orders` | Створити замовлення з фронтенду |
| PATCH | `/api/orders/:id/status` | Оновити статус замовлення |
| DELETE | `/api/orders/:id` | М'яко видалити замовлення |

Якщо замовлення створюється з `productId`, backend автоматично збільшує `orders` у відповідного букета на передану `quantity`.

Замовлення мають Sequelize timestamps: `createdAt`, `updatedAt`, а також soft-delete поле `deletedAt`.

## Завантаження фото

Multer приймає файл у тимчасову директорію `temp/`. Після цього backend завантажує оригінальне зображення в Cloudinary, видаляє тимчасовий файл і зберігає отриманий URL у полі `photoURL` букета.

Оптимізація зображень навмисно делегована Cloudinary delivery transformations: `f_auto`, `q_auto`, width transformations тощо. Це розвантажує backend на Render free tier і прибирає довгу серверну обробку фото під час завантаження з адмінки.

Це рішення замінює постійне локальне збереження в `public/photos`. Локальне збереження може працювати під час розробки, але на Render free tier filesystem є ephemeral: файли можуть зникати після redeploy, restart або запуску нового instance. Cloudinary зберігає фото стабільно й робить їх доступними публічно.

Коли букет видаляється, його фото в Cloudinary також видаляється. Коли фото замінюється з тим самим slug, Cloudinary перезаписує існуючий public id. Якщо slug змінився, старе фото очищується після успішного завантаження нового.

Директорія `public/photos/.gitkeep` залишена в репозиторії, щоб відповідати початковій структурі курсового проєкту й залишити місце для локального fallback, якщо він знадобиться.

## Деплой

У репозиторії є `render.yaml` для деплою на Render:

- web service: `npm install` + `npm start`;
- PostgreSQL database;
- required environment variables для database, Cloudinary та admin auth.

Після деплою варто перевірити:

```text
GET /health
GET /api/bouquets
/api-docs
/admin
```

## Примітки

- Swagger JSON зберігається в `swagger.json`.
- Адмін-панель є статичною і знаходиться в `public/admin`.
- Backend не використовує server-side image processing через Render free tier; оптимізацію доставки фото виконує Cloudinary.
