# VietSeed Trackers

A web application for tracking cassava (sắn/khoai mif) seed sources and monitoring plant disease outbreaks across regions in Vietnam. Features include disease diagnostics via image upload, an interactive outbreak map, a seed market, and a disease knowledge base.

## Features

- **Disease Diagnostics** — Upload a plant image to identify potential diseases and their probabilities
- **Outbreak Map** — Interactive map (Leaflet + OpenStreetMap) showing disease outbreak locations by region, severity, and cassava variety
- **Disease Library** — Browse and read about cassava diseases in detail
- **Cassava Varieties** — Browse tracked cassava seed varieties
- **Seed Market** — Marketplace listing for seed suppliers
- **Blog** — News and agricultural updates

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Ant Design, Tailwind CSS, React Leaflet |
| Backend | Directus 9 (headless CMS / REST API) |
| Database | SQLite (default), PostgreSQL supported |
| Map tiles | OpenStreetMap |

## Project Structure

```
vietseedtrackers/
├── backend/    # Directus headless CMS
└── frontend/   # React application
```

---

## Getting Started

### Prerequisites

- Node.js >= 14
- npm

---

### Backend

```bash
cd backend
cp .env.example .env
npm install
npx directus start
```

The backend API will be available at `http://localhost:8055`.

The Directus admin panel is accessible at `http://localhost:8055/admin`.

Default admin credentials (from `.env.example`):
- Email: `admin@directus.com`
- Password: `123`

> **Note:** Change the `KEY`, `SECRET`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` values in `.env` before deploying to production.

#### Backend Environment Variables

| Variable | Description | Default |
|---|---|---|
| `HOST` | Host the API listens on | `0.0.0.0` |
| `PORT` | Port Directus runs on | `8055` |
| `PUBLIC_URL` | Public URL of the API | `http://localhost:8055` |
| `DB_CLIENT` | Database driver (`sqlite3`, `pg`, `mysql`) | `sqlite3` |
| `DB_FILENAME` | SQLite file path | `./data.db` |
| `KEY` | Unique project identifier key | — |
| `SECRET` | Secret string for token signing | — |
| `ACCESS_TOKEN_TTL` | Access token validity duration | `15m` |

---

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm start
```

The frontend will be available at `http://localhost:3000`.

#### Frontend Environment Variables

| Variable | Description | Default |
|---|---|---|
| `REACT_APP_URL` | Frontend base URL | `http://localhost:3000` |
| `REACT_APP_DIRECTUS_URL` | Backend API URL | `http://localhost:8055` |

---

## Database

The backend uses **SQLite** by default, stored at `backend/data.db`. To switch to PostgreSQL, update the following in `backend/.env`:

```env
DB_CLIENT="pg"
DB_HOST="localhost"
DB_PORT=5432
DB_DATABASE="directus"
DB_USER="postgres"
DB_PASSWORD="secret"
```

---

## Notes

- The disease classification in `Diagnostics` currently uses a **mock implementation** that returns random probabilities. Replace `postDiagnosticClassify` in `frontend/src/services/axios/diagnostics.js` with a real ML model endpoint when available.
- Uploaded images are stored locally under `backend/uploads/`.
- The map is centered on Vietnam and uses area codes from the backend to match disease records to geographic regions.
