# Notes API — Express + MongoDB

A simple REST API for managing notes. Built with **Express**, **MongoDB** (via **Mongoose**), and **ES Modules**. Includes structured routing, request logging, CORS, and centralized error handling.

> Requires **Node.js 20+**.

---

## Features

- MongoDB connection via Mongoose (`MONGO_URL`).
- Request logging with **pino-http**.
- CORS enabled.
- Centralized error handler (consistent JSON errors).
- Clean project structure (`routes/`, `controllers/`, `models/`, `middleware/`, `db/`).
- Timestamps on models (`createdAt`, `updatedAt`).

---

## Getting Started

```bash
git clone <your-repo-url>
cd nodejs-hw
cp .env.example .env   # fill in MONGO_URL
npm i
npm run dev            # nodemon src/server.js
# or
npm start              # node src/server.js
```

Expected startup logs:
```
✅ MongoDB connection established successfully
Server is running on http://localhost:3000
```

---

## Environment Variables

Create a **.env** file (names must match):
```
PORT=3000
MONGO_URL=mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true&w=majority
```

An example file **.env.example** is included.

---

## Project Structure

```
src/
  controllers/
    notesController.js
  db/
    connectMongoDB.js
  middleware/
    errorHandler.js
    logger.js
    notFoundHandler.js
  models/
    Note.js
  routes/
    notesRoutes.js
  server.js
notes.json
```

- `server.js` — loads dotenv, sets up Express/CORS/pino, connects to MongoDB **before** starting the server, mounts routes, and wires `notFoundHandler` + `errorHandler`.
- `db/connectMongoDB.js` — MongoDB connection helper (logs a success message).
- `middleware/logger.js` — `pino-http` setup (pretty logging in development is supported).
- `middleware/notFoundHandler.js` — returns `{ "message": "Route not found" }` for unknown routes.
- `middleware/errorHandler.js` — uses `err.status || err.statusCode || 500`, returns `{ "message": err.message }`.
- `routes/notesRoutes.js` — full paths (`/notes`, `/notes/:noteId`) mounted at `'/'` in `server.js`.

---

## Data Model

**Note**

```js
title:   { type: String, required: true,  trim: true }
content: { type: String, required: false, trim: true, default: "" }
tag:     { type: String, enum: ["Work","Personal","Meeting","Shopping","Ideas","Travel","Finance","Health","Important","Todo"], default: "Todo" }
```

Schema options:
```js
{ timestamps: true } // automatically adds createdAt / updatedAt
```

---

## API

Base URL: `http://localhost:3000` (or your deployed URL)

| Method | Path               | Success | Response Body         |
|------: |--------------------| ------: |-----------------------|
|  GET   | `/notes`           |   200   | Array of notes        |
|  GET   | `/notes/:noteId`   |   200   | Note object           |
|  POST  | `/notes`           |   201   | Created note object   |
| PATCH  | `/notes/:noteId`   |   200   | Updated note object   |
| DELETE | `/notes/:noteId`   |   200   | **Deleted note object** |

Error responses:
- Unknown route → **404** `{ "message": "Route not found" }`
- Note not found (valid but missing id) → **404** `{ "message": "Note not found" }`
- Other errors (including validation) → **500** `{ "message": "<error>" }`

---

## Examples (cURL)

```bash
# list
curl -i http://localhost:3000/notes

# create
curl -i -X POST http://localhost:3000/notes   -H "Content-Type: application/json"   -d '{"title":"Smoke","content":"hello","tag":"Ideas"}'

# get by id
curl -i http://localhost:3000/notes/<_id>

# partial update
curl -i -X PATCH http://localhost:3000/notes/<_id>   -H "Content-Type: application/json"   -d '{"title":"Updated"}'

# delete
curl -i -X DELETE http://localhost:3000/notes/<_id>

# non-existing valid id
curl -i http://localhost:3000/notes/000000000000000000000000

# unknown route
curl -i http://localhost:3000/does-not-exist
```

> Use only enum values for `tag` (see model above).

---

## Seeding (optional)

A sample dataset is available in **`notes.json`**. Import it into the `notes` collection of the database referenced by your `MONGO_URL` (the model name `note` maps to collection `notes`).

---

## Deployment (Render)

1. Create a new **Web Service** from your repository/branch.
2. Set environment variables: `PORT`, `MONGO_URL`.
3. Ensure MongoDB Atlas → **Network Access** allows connections (e.g., `0.0.0.0/0` for testing).
4. After start, check logs for: `✅ MongoDB connection established successfully`.
5. Test the endpoints using the public URL.

---

## NPM Scripts

```jsonc
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "lint": "eslint .",
    "format": "prettier -w ."
  }
}
```

---

## Troubleshooting

- **POST returns 500 with validation error**: make sure you send JSON (Body → raw → JSON) and include a `title`; `tag` must be one of the enum values.
- **ObjectId errors (CastError)**: the `:noteId` path segment is a placeholder — send a real 24‑char hex id (e.g., value returned from POST).
- **Empty responses**: verify your `MONGO_URL` points to the database where you imported `notes.json`.
