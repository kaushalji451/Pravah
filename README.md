# Pravah

Pravah is a Gurugram-focused water intelligence app that helps users check a locality or society for flood-survey data, rainfall, elevation, risk level, and rainwater harvesting potential.

## Project overview

- Backend: Node.js + Express
- Frontend: React + Vite
- Data sources: GMDA, OpenStreetMap Nominatim, Open-Meteo, Open-Elevation
- Main purpose: review waterlogging risk and rainwater harvesting potential for Gurugram locations

## Project structure

```bash
project/
├── backend/
│   ├── config/
│   ├── routes/
│   ├── services/
│   ├── scripts/
│   ├── server.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   └── .env.example
├── README.md
└── package.json (optional if used at root)
```

## Prerequisites

- Node.js 18.17+
- npm
- A browser for the frontend

## Backend setup

```bash
cd backend
npm install
```

Create or update the backend `.env` file with the required values. The app expects settings such as:

```env
PORT=5000
CORS_ORIGINS=http://localhost:3000
DEMO_MODE=false
NOMINATIM_USER_AGENT=YourAppName/1.0
```

Then run:

```bash
npm run dev
```

Backend runs at:

```text
http://localhost:5000
```

Useful backend command:

```bash
npm run inspect:gmda
```

This helps check the live GMDA field mapping used by the app.

## Frontend setup

```bash
cd frontend
npm install
```

Create a `.env.local` file in the frontend folder:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

Then run:

```bash
npm run dev
```

Frontend runs at:

```text
http://localhost:3000
```

## Production build

```bash
cd frontend
npm run build
```

## Main app flow

1. User searches a society or locality.
2. Backend finds the nearest matching location.
3. GMDA + rainfall + elevation + geocoding data are fetched.
4. Risk score and rainwater harvesting calculation are generated.
5. Frontend displays the location summary and dashboard.

## Environment notes

- The backend uses GMDA survey data and public datasets.
- The frontend connects to the backend through `NEXT_PUBLIC_API_BASE_URL`.
- `CORS_ORIGINS` must include the frontend address.
- `DEMO_MODE=true` is for testing with synthetic records only.

## Useful links

- Backend API base: `http://localhost:5000`
- Frontend app: `http://localhost:3000`

## Notes

- This project is designed mainly for Gurugram locations.
- If GMDA is not available, the app can be run in demo mode for testing.
- Keep the backend and frontend both running together for normal use.
