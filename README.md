# nodejs-hw (branch: `01-express`)

Minimal Express server for a notes collection. It demonstrates basic routing, middleware, logging, and error handling. The project uses **ESM** (`"type": "module"`) and **ESLint flat config** (`eslint.config.mjs`).

## Features

- `dotenv` with `PORT` (falls back to `3000` locally)
- `cors` enabled
- `express.json()` enabled
- `pino-http` logger (pretty output in development)
- 404 middleware (`{ "message": "Route not found" }`)
- 500 error middleware (`{ "message": <error message> }`)
- Routes:
  - `GET /notes` → `{"message":"Retrieved all notes"}`
  - `GET /notes/:noteId` → `{"message":"Retrieved note with ID: <id>" }`
  - `GET /test-error` → throws a simulated error (returns 500)
  - `GET /health` → healthcheck (status/uptime)
- Flat ESLint config only (no `.eslintrc.json`)

## Tech Stack

- Node.js 20+
- Express 4
- ESM modules
- ESLint flat config + Prettier
- pino / pino-http (with `pino-pretty` in dev)
