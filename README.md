# Pravah — Urban Water Intelligence for Gurugram

Search a Gurugram sector or locality and see GMDA flood-survey records, rainfall, elevation, an
indicative waterlogging risk assessment, and the rainwater-harvesting potential of your roof.
Every value is labelled with its source and whether it is **official**, from a **public dataset**,
a **Pravah calculation**, an **assumption**, or **user-provided**.

```
pravah/
├── backend/                     Node.js + Express (ESM JavaScript)
│   ├── config/
│   │   ├── index.js             env-driven settings
│   │   ├── assumptions.js       ALL risk weights, thresholds, runoff coefficient, water price
│   │   └── gmdaFields.js        how GMDA fields are matched to roles (no hard-coded names)
│   ├── routes/                  societies.js, data.js, meta.js
│   ├── services/
│   │   ├── gmdaService.js       GMDA OneMap ArcGIS integration + schema discovery
│   │   ├── demo/                DEMO MODE ONLY — synthetic records, always labelled
│   │   ├── geocodeService.js    OpenStreetMap Nominatim (throttled, cached)
│   │   ├── elevationService.js  Open-Elevation (point + surrounding ring)
│   │   ├── rainfallService.js   Open-Meteo recent + 10-year history
│   │   ├── riskService.js       Pravah Indicative Risk Score
│   │   ├── rwhService.js        harvest + value calculation
│   │   └── locationService.js   orchestrates all sources, isolates failures
│   ├── scripts/inspectGmda.js   prints the REAL GMDA schema + field mapping
│   └── server.js
└── frontend/                    Next.js 14 (App Router) + TypeScript + Tailwind + Motion + React Leaflet + Recharts
    ├── app/                     layout, page, globals.css
    ├── components/              Hero, SearchBox, SourceTag, DataSources, dashboard/*
    └── lib/                     api client, types, formatting
```

## Setup

Requires Node 18.17+.

```bash
# 1. Backend
cd backend
cp .env.example .env          # set NOMINATIM_USER_AGENT to include your contact email
npm install
npm run inspect:gmda          # ← do this first, see "Verify the GMDA fields"
npm run dev                   # http://localhost:5000

# 2. Frontend (new terminal)
cd frontend
cp .env.example .env.local
npm install
npm run dev                   # http://localhost:3000
```

## Verify the GMDA fields (do this before the demo)

Pravah does not assume GMDA's field names. On startup the backend reads the layer's own schema
(`flood_survey_2/FeatureServer/0?f=json`) and matches each field's name and alias to a role:
locality, waterlogging, water depth, RWH status, RWH condition, survey date. Coded-value domains
are decoded so the UI shows GMDA's own labels.

`npm run inspect:gmda` prints every real field, the mapping Pravah chose, and five raw sample
records, and saves them to `data/gmda-schema.snapshot.json`. The same mapping is live at
`GET /api/gmda/schema` and is shown in the UI under "Which survey fields Pravah reads".

If a role picked the wrong field, pin it in `.env`:

```env
GMDA_FIELD_WATERLOGGING=<exact field name from inspect:gmda>
GMDA_FIELD_RWHSTATUS=...
```

If no field fits a role, that role stays empty and the UI says "not provided by this layer".

Also check how waterlogging values are interpreted (`WATERLOGGING_NEGATIVE` in
`config/gmdaFields.js`): empty → unknown; "No"/"None"/0 etc. → not reported; anything else →
reported. Adjust the regex once you've seen the real values.

## API

| Endpoint | Returns |
| --- | --- |
| `GET /api/societies/search?q=Sushant` | `{ query, results: [{ id, name, detail, lat, lng, source }], warnings }`. GMDA locality matches first, then Nominatim. |
| `GET /api/societies/:id` | Everything for one location: waterlogging, RWH, elevation, rainfall, risk, survey records, sources. |
| `GET /api/elevation?lat=&lng=` | `{ elevation, unit: "meters", source: "Open-Elevation" }` |
| `GET /api/rainfall?lat=&lng=` | `{ recent, annual }` from Open-Meteo |
| `GET /api/risk/:id` | Pravah Indicative Risk Score with factors, weights and caveats |
| `GET /api/rwh/:id?areaSqft=&annualRainfallMm=&runoffCoefficient=&pricePerKl=` | Harvest estimate with each input's provenance |
| `GET /api/sources` | Source list + every assumption value |
| `GET /api/gmda/schema` | Live GMDA schema and field-role mapping |
| `GET /api/health` | `{ ok, dataMode }` |

Location ids are base64url-encoded `{name, lat, lng, source}`, so the API is stateless.
Coordinates outside the Gurugram area are rejected.

## How the numbers are made

**Location.** If the GMDA layer has a locality field, matching survey points are grouped and their
centre is used (labelled "Centre of N GMDA survey points"). Otherwise coordinates come from
OpenStreetMap Nominatim, labelled as such. No coordinates are typed in by hand.

**Survey records.** All GMDA features within `GMDA_SEARCH_RADIUS_M` (default 1 km). The query uses
an envelope plus a distance filter so it works on any ArcGIS Server version. If GMDA caps the
result (`exceededTransferLimit`), the UI says more records may exist.

**Rainfall.** Open-Meteo daily precipitation: the last 30 completed days, and the mean of the last
10 complete calendar years for the harvest calculator. It's a gridded estimate, not a rain gauge,
and it is never labelled as IMD. IMD's APIs are granted on request with IP whitelisting; to switch,
reimplement `getRecentRainfall` / `getAnnualRainfall` with the same return shape.

**Elevation.** Open-Elevation at the point and at 8 points on a 500 m ring. Pravah uses the
difference ("2.3 m lower than its surroundings"), not the absolute height.

**Pravah Indicative Risk Score** (`riskService.js`, weights in `config/assumptions.js`):

```
waterlogging factor = min(100, reported records nearby / 5 × 100)
rainfall factor     = min(100, max(wettest day in 7 / 115.6 mm, 7-day total / 150 mm) × 100)
elevation factor    = clamp(50 − 8 × (point − surrounding mean in metres), 0, 100)
score               = Σ weight × factor over factors WITH data ÷ Σ their weights
```

A factor without data is dropped (never set to 0). Confidence is High when all factors are present,
Medium at ≥70% of the weight, Low otherwise, and drops a step if the waterlogging factor is missing or
there are no survey records nearby. Below 50% of the weight the result is "Insufficient data".
115.6 mm is IMD's "very heavy" daily threshold; using it to scale a score is Pravah's choice.

**Harvest potential** (`rwhService.js`):

```
litres/year = annual rainfall (mm) × roof area (m²) × runoff coefficient   (1 mm on 1 m² = 1 L)
roof area m² = sq ft × 0.0929
value ₹/year = litres / 1000 × ₹ per kL
```

Roof area is always user-entered. The runoff coefficient (default 0.8) and the water price
(default ₹50/kL, a placeholder) are labelled as assumptions until the user changes them.

## Demo mode

`DEMO_MODE=true` replaces GMDA records with synthetic ones generated around the searched point.
Field names are prefixed `demo_`, every record has `isDemo: true`, responses carry
`dataMode: "demo"`, the map turns demo points coral, and the page shows a hatched
**DEMO DATA — NOT OFFICIAL** banner. Rainfall, elevation and geocoding stay live.
Live mode never falls back to demo data on its own: if GMDA is down, the UI says so.

## Failure handling

Each source is fetched independently. If one fails, its card says what failed and the rest of the
page still loads; the risk score re-weights over what's available. Upstream calls have timeouts and
one retry; results are cached in memory (GMDA 30 min, rainfall 30 min, elevation and history 7 days,
geocoding 24 h). Nominatim is throttled to 1 request/second per its usage policy.

## Known limitations

- The GMDA layer is a point survey. Areas with no survey points are not "safe"; the UI says this.
- The in-memory cache resets on restart and isn't shared across instances. Use Redis or DynamoDB if
  you deploy more than one backend instance.
- The public Open-Elevation endpoint is slow and sometimes down. Self-host it (Docker) and set
  `ELEVATION_API_URL` for a reliable demo.
- There is no rate limiting on the Pravah API itself. Add `express-rate-limit` before going public.

## Deploying on AWS (hackathon-sized)

Backend: App Runner or Elastic Beanstalk from `backend/` (it's a plain Express app on `PORT`).
Frontend: Amplify Hosting from `frontend/` with `NEXT_PUBLIC_API_BASE_URL` set to the backend URL,
and the backend's `CORS_ORIGINS` set to the Amplify domain.

## Added in v0.3 — Recommendation, What-If, Impact, City view

| Feature | Where | Notes |
| --- | --- | --- |
| **Recommended action** | `backend/services/recommendationService.js`, `frontend/src/components/dashboard/RecommendationCard.tsx` | Rule-based (risk level × RWH status from GMDA). Returned as `recommendation` in `GET /api/societies/:id`. The rule that fired is shown in the UI. |
| **What-If simulator** | `frontend/src/components/dashboard/WhatIfSimulator.tsx`, `frontend/src/lib/whatif.ts` | "Roof connected today" vs "after intervention" sliders. Reuses the calculator's roof area, rainfall, runoff coefficient and water value. Also sizes storage for one IMD heavy-rain day (64.5 mm). |
| **Environmental impact** | `frontend/src/components/dashboard/ImpactSummary.tsx` | Water captured, roof runoff kept out of drains, groundwater-recharge potential, ₹ value / tanker loads — all from the What-If scenario. |
| **Gurugram-wide hotspot map** | `backend/services/overviewService.js`, `frontend/src/components/city/*` | `GET /api/overview`: every GMDA point grouped into ~1 km cells, coloured high / medium / low / none, with a "Top hotspots" list. Click a cell → analyse that area. |

GMDA parsing fix: the `flood_survey_2` layer stores the asset kind in **SurveyType** (Waterlogging / Gully Trap /
Rainwater Harvesting / Pumping Station) and its condition in **SurveySubtype** (Functional / Non-Functional /
Low Capacity / Damaged). Pravah now reads both (`surveyType` / `surveySubtype` roles in `config/gmdaFields.js`), so
a "Waterlogging" survey point counts as waterlogging reported and RWH survey points give a real functional /
non-functional status. Previously these points showed as "unrecorded".

New assumptions (all in `config/assumptions.js`): `HOTSPOT_PARAMS` (cell size, high/medium thresholds) and
`IMPACT_DEFAULTS` (tanker size 10,000 L, heavy-rain day 64.5 mm).
