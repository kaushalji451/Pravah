import express from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import { societiesRouter } from './routes/societies.js';
import { dataRouter } from './routes/data.js';
import { metaRouter } from './routes/meta.js';
import { getLayerSchema } from './services/gmdaService.js';
import { UpstreamError, BadRequestError } from './utils/http.js';

const app = express();
app.disable('x-powered-by');
app.use(cors({ origin: config.corsOrigins }));
app.use(express.json({ limit: '50kb' }));

app.use('/api', metaRouter);
app.use('/api/societies', societiesRouter);
app.use('/api', dataRouter);

app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  if (err instanceof BadRequestError) return res.status(400).json({ error: err.message });
  if (err instanceof UpstreamError) return res.status(502).json({ error: err.message, service: err.service });
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on the Pravah server.' });
});

app.listen(config.port, () => {
  console.log(`Pravah API on http://localhost:${config.port}`);
  if (config.demoMode) {
    console.warn('DEMO_MODE=true — GMDA records are SYNTHETIC and labelled "DEMO DATA — NOT OFFICIAL".');
    return;
  }
  // Warm the schema cache and show which real GMDA fields were matched.
  getLayerSchema()
    .then((s) => {
      console.log(`GMDA layer "${s.layerName}" — ${s.fields.length} fields. Role mapping:`);
      for (const [role, r] of Object.entries(s.roles)) console.log(`  ${role.padEnd(18)} → ${r.field ?? '(none)'}  [${r.matchedBy}]`);
    })
    .catch((e) => console.warn(`GMDA schema not loaded yet: ${e.message}. Requests will retry.`));
});
