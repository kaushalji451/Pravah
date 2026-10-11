import { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Circle, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { GmdaRecord } from '@/lib/types';

const GURUGRAM: [number, number] = [28.4595, 77.0266];

const COLORS = {
  waterlogging: '#F5B454',
  noWaterlogging: '#64798A',
  rwh: '#2DD4BF',
  demo: '#FB7185',
};

const selectedIcon = L.divIcon({
  className: '',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
  html: `<span style="position:relative;display:block;width:22px;height:22px">
    <span class="pravah-pulse-ring" style="position:absolute;inset:0;border-radius:999px;border:2px solid #7CC4FF;animation:pravah-pulse 2s ease-out infinite"></span>
    <span style="position:absolute;inset:5px;border-radius:999px;background:#E8FFFB;border:3px solid #7CC4FF;box-shadow:0 0 18px rgba(124,196,255,.8)"></span>
  </span>`,
});

function FlyTo({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) map.setView([lat, lng], 15);
    else map.flyTo([lat, lng], 15, { duration: 1.2 });
  }, [lat, lng, map]);
  return null;
}

function RecordPopup({ r }: { r: GmdaRecord }) {
  return (
    <div className="min-w-[200px] max-w-[260px]">
      <p className="mb-1 font-semibold">{r.isDemo ? 'Demo record (not official)' : 'GMDA survey record'}</p>
      <p className="mb-2 text-xs text-mist">{r.distanceM} m from the selected point</p>
      <dl className="space-y-1 text-xs">
        {r.attributes.slice(0, 8).map((a) => (
          <div key={a.field} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-2">
            <dt className="text-mist">{a.label}</dt>
            <dd className="break-words">{String(a.value)}</dd>
          </div>
        ))}
      </dl>
      {r.attributes.length > 8 ? <p className="mt-2 text-xs text-mist">More fields in the survey table below.</p> : null}
    </div>
  );
}

export default function MapView({
  lat,
  lng,
  name,
  records,
  radiusM,
}: {
  lat: number;
  lng: number;
  name: string;
  records: GmdaRecord[];
  radiusM: number;
}) {
  return (
    <MapContainer center={GURUGRAM} zoom={12} scrollWheelZoom={false} className="h-full w-full" attributionControl>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png?key=cb1_4dzh_1_d187241e6c6cdb0284560844"
      />
      <FlyTo lat={lat} lng={lng} />
      <Circle
        center={[lat, lng]}
        radius={radiusM}
        pathOptions={{ color: '#7CC4FF', weight: 1, dashArray: '4 6', fillColor: '#7CC4FF', fillOpacity: 0.04 }}
      />

      {records.map((r, i) => {
        const wl = r.waterlogging.interpretation === 'reported';
        const hasRwh = ['functional', 'non-functional', 'present'].includes(r.rwh.classification);
        const fill = r.isDemo ? COLORS.demo : wl ? COLORS.waterlogging : COLORS.noWaterlogging;
        return (
          <CircleMarker
            key={`${r.objectId ?? 'r'}-${i}`}
            center={[r.lat, r.lng]}
            radius={wl ? 7 : 5}
            pathOptions={{
              color: hasRwh ? COLORS.rwh : fill,
              weight: hasRwh ? 2.5 : 1,
              fillColor: fill,
              fillOpacity: wl ? 0.85 : 0.55,
            }}
          >
            <Popup>
              <RecordPopup r={r} />
            </Popup>
          </CircleMarker>
        );
      })}

      <Marker position={[lat, lng]} icon={selectedIcon} keyboard>
        <Popup>
          <p className="font-semibold">{name}</p>
          <p className="text-xs text-mist">
            {lat.toFixed(5)}, {lng.toFixed(5)}
          </p>
        </Popup>
      </Marker>
    </MapContainer>
  );
}
