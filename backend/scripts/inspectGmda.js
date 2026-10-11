/**
 * Prints the REAL GMDA layer schema, the field-role mapping Pravah derived from
 * it, and a few sample records. Run this first:  npm run inspect:gmda
 * A snapshot is written to data/gmda-schema.snapshot.json for reference.
 */
import { writeFile } from 'node:fs/promises';
import { getLayerSchema, sampleFeatures } from '../services/gmdaService.js';
import { config } from '../config/index.js';

if (config.demoMode) {
  console.error('DEMO_MODE is on — set DEMO_MODE=false to inspect the real GMDA layer.');
  process.exit(1);
}

try {
  const schema = await getLayerSchema();
  console.log(`\nLayer: ${schema.layerName}  (${schema.geometryType}, maxRecordCount=${schema.maxRecordCount})`);
  console.log(`Capabilities: ${schema.capabilities}\n`);
  console.table(schema.fields.map((f) => ({ name: f.name, alias: f.alias, type: f.type.replace('esriFieldType', ''), codedValues: f.domain ? Object.values(f.domain).join(' | ') : '' })));
  console.log('\nRole mapping (override with GMDA_FIELD_<ROLE> in .env):');
  console.table(Object.fromEntries(Object.entries(schema.roles).map(([k, v]) => [k, { field: v.field, matchedBy: v.matchedBy }])));

  const sample = await sampleFeatures(5);
  console.log('\nSample records:');
  for (const f of sample.features || []) console.log(JSON.stringify({ attributes: f.attributes, geometry: f.geometry }));

  await writeFile(new URL('../data/gmda-schema.snapshot.json', import.meta.url), JSON.stringify({ fetchedAt: new Date().toISOString(), schema, sample: sample.features?.slice(0, 5) }, null, 2));
  console.log('\nSaved data/gmda-schema.snapshot.json');
} catch (e) {
  console.error(`Could not reach the GMDA layer: ${e.message}`);
  process.exit(1);
}
