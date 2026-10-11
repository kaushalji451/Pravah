export default function MapLegend({ radiusM, demo }: { radiusM: number; demo: boolean }) {
  return (
    <div className="pointer-events-auto rounded-lg border border-white/10 bg-[#050B14]/95 px-3 py-2.5 text-xs text-[#E8F3F6] backdrop-blur">
      <ul className="space-y-1.5">
        <li className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: demo ? '#FB7185' : '#F5B454' }} />
          Waterlogging survey: reported
        </li>
        <li className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#64798A]" />
          Survey point: not reported or unrecorded
        </li>
        <li className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full border-2 border-teal" />
          Rainwater harvesting recorded
        </li>
        <li className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full border-2 border-sky bg-teal-foam" />
          Selected location
        </li>
        <li className="flex items-center gap-2 text-mist">
          <span className="h-0 w-3 border-t border-dashed border-sky" />
          {radiusM / 1000} km search area
        </li>
      </ul>
      <p className="mt-2 max-w-[220px] text-[11px] leading-snug text-mist">
        Points are survey locations, not confirmed flood events.
      </p>
    </div>
  );
}
