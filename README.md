# Notes API (Express + MongoDB)

Minimal REST API with user auth (cookies) and per-user private notes.

## Quickstart
```bash
npm i
cp .env.example .env   # set MONGO_URL, PORT
npm run dev            # or: npm start
```
Expected:
```
✅ MongoDB connection established successfully
Server is running on http://localhost:<PORT>
```

## Environment
```
PORT=3000
MONGO_URL=<your-mongodb-connection-string>
NODE_ENV=development
```
> Do not commit `.env`.

## Auth model
- Cookies: `accessToken` (15m), `refreshToken` (1d), `sessionId` (1d)
- Cookie options: `{ httpOnly: true, secure: true, sameSite: 'none' }`
- Sessions rotate on **login** and **refresh**
- Protected routes require `accessToken` cookie

## Endpoints

### Health
- `GET /` → `{ "ok": true }`

### Auth (public)
- `POST /auth/register` — body: `{ "email": "user@test.local", "password": "qwertyui" }` → `201` + auth cookies
- `POST /auth/login` — same body → `200` + rotated cookies (or `401`)
- `POST /auth/refresh` — from cookies → `200 { "message": "Session refreshed" }`
- `POST /auth/logout` — clears cookies → `204`

### Notes (protected)
- `GET /notes` → list only current user's notes
- `POST /notes` — body: `{ "title": "...", "content": "...", "tag": "..." }` → `201`
- `GET /notes/:id` → note or `404`
- `PATCH /notes/:id` → updated note or `404`
- `DELETE /notes/:id` → deleted note or `404`

## Validation
- Celebrate/Joi for bodies
- Custom email regex (shared in register/login)
- Password: min 8 chars

## CORS
Enable credentials and your frontend origin. In cloud (e.g. Render) use:
```js
app.set('trust proxy', 1);
```

## Postman (short)
1) Register → `201`, cookies set  
2) GET `/notes` with cookies → `200 []`  
3) Create note → `201`  
4) Refresh → `200`  
5) Logout → `204` → GET `/notes` → `401`
