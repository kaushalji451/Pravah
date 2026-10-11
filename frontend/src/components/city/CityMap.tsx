import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip } from 'react-leaflet';
import type { OverviewCell } from '@/lib/types';

export const LEVEL_STYLE: Record<OverviewCell['level'], { color: string; label: string }> = {
  high: { color: '#FB7185', label: 'High: 4+ waterlogging points' },
  medium: { color: '#F5B454', label: 'Medium: 2–3 waterlogging points' },
  low: { color: '#FACC15', label: 'Low: 1 waterlogging point' },
  none: { color: '#2DD4BF', label: 'Surveyed, no waterlogging point' },
};

const GURUGRAM: [number, number] = [28.4505, 77.045];

export default function CityMap({
  cells,
  onAnalyse,
  selected,
}: {
  cells: OverviewCell[];
  onAnalyse: (c: OverviewCell) => void;
  selected?: { lat: number; lng: number } | null;
}) {
  // Draw quiet cells first so hotspots sit on top.
  const order = { none: 0, low: 1, medium: 2, high: 3 } as const;
  const sorted = [...cells].sort((a, b) => order[a.level] - order[b.level]);

  return (
    <MapContainer center={GURUGRAM} zoom={12} scrollWheelZoom={false} className="h-full w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png?key=cb1_4dzh_1_d187241e6c6cdb0284560844"
      />
      {sorted.map((c) => {
        const s = LEVEL_STYLE[c.level];
        const r = c.level === 'none' ? 4 : 6 + Math.min(10, Math.sqrt(c.reported) * 3);
        return (
          <CircleMarker
            key={c.key}
            center={[c.lat, c.lng]}
            radius={r}
            pathOptions={{ color: s.color, weight: c.level === 'none' ? 1 : 1.5, fillColor: s.color, fillOpacity: c.level === 'none' ? 0.25 : 0.6 }}
          >
            <Tooltip direction="top" offset={[0, -4]}>
              {c.name}: {c.reported} waterlogging point{c.reported === 1 ? '' : 's'}
            </Tooltip>
            <Popup>
              <div className="min-w-[200px]">
                <p className="font-semibold">{c.name}</p>
                <p className="mt-0.5 text-xs" style={{ color: s.color }}>
                  {s.label}
                </p>
                <dl className="mt-2 grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 text-xs">
                  <dt className="text-[#8FA7B3]">Survey points in cell</dt>
                  <dd className="tnum">{c.points}</dd>
                  <dt className="text-[#8FA7B3]">Waterlogging points</dt>
                  <dd className="tnum">{c.reported}</dd>
                  <dt className="text-[#8FA7B3]">RWH functional</dt>
                  <dd className="tnum">{c.rwh.functional}</dd>
                  <dt className="text-[#8FA7B3]">RWH needs repair</dt>
                  <dd className="tnum">{c.rwh.needsWork}</dd>
                </dl>
                <button
                  type="button"
                  onClick={() => onAnalyse(c)}
                  className="mt-3 w-full rounded-md bg-[#2DD4BF] px-3 py-1.5 text-xs font-semibold text-[#050B14] hover:bg-[#5EEAD4]"
                >
                  Analyse this area
                </button>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
      {selected ? (
        <CircleMarker
          center={[selected.lat, selected.lng]}
          radius={9}
          pathOptions={{ color: '#7CC4FF', weight: 3, fillColor: '#E8FFFB', fillOpacity: 1 }}
        >
          <Tooltip>Currently analysing</Tooltip>
        </CircleMarker>
      ) : null}
    </MapContainer>
  );
}
