import { Outlet } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import './global.css';

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#050B14] font-sans text-[#E8F3F6] antialiased">
      {children || <Outlet />}
    </div>
  );
}
