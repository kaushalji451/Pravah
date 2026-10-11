import 'dotenv/config';

const bool = (v, d = false) =>
  v === undefined || v === '' ? d : ['1', 'true', 'yes', 'on'].includes(String(v).toLowerCase());
const num = (v, d) => (v === undefined || v === '' || Number.isNaN(Number(v)) ? d : Number(v));

export const config = {
  port: num(process.env.PORT, 5000),
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:3000')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  demoMode: bool(process.env.DEMO_MODE, false),

  gmda: {
    layerUrl:
      process.env.GMDA_LAYER_URL ||
      'https://onemapdepts.gmda.gov.in/server/rest/services/flood_survey_2/FeatureServer/0',
    searchRadiusM: num(process.env.GMDA_SEARCH_RADIUS_M, 1000),
    timeoutMs: num(process.env.GMDA_TIMEOUT_MS, 15000),
  },

  elevation: {
    url: process.env.ELEVATION_API_URL || 'https://api.open-elevation.com/api/v1/lookup',
    timeoutMs: 12000,
    ringRadiusM: num(process.env.ELEVATION_RING_RADIUS_M, 500),
  },

  rainfall: {
    forecastUrl: 'https://api.open-meteo.com/v1/forecast',
    archiveUrl: 'https://archive-api.open-meteo.com/v1/archive',
    timeoutMs: 15000,
    timezone: 'Asia/Kolkata',
    climatologyYears: 10,
    apiKey: process.env.RAINFALL_API_KEY || '',
  },

  geocoder: {
    url: 'https://nominatim.openstreetmap.org/search',
    userAgent: process.env.NOMINATIM_USER_AGENT || 'Pravah/0.2 (hackathon prototype)',
    // left,top,right,bottom — a box around Gurugram district
    viewbox: '76.80,28.62,77.25,28.30',
  },

  // Coordinates outside this box are rejected (Pravah is Gurugram-only for now).
  bounds: { minLat: 28.2, maxLat: 28.75, minLng: 76.6, maxLng: 77.4 },
};
