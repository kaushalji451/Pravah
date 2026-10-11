export default function DemoBanner() {
  return (
    <div role="alert" className="pravah-hatch rounded-xl border border-coral/60 px-4 py-3 text-sm text-ink">
      <strong className="font-semibold text-coral">DEMO DATA — NOT OFFICIAL.</strong> The server is running in demo mode. Survey
      records on this page are synthetic and are not GMDA data. Rainfall and elevation are still fetched live.
    </div>
  );
}
