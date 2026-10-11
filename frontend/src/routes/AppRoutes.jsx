import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import LandingPage from '../pages/LandingPage';

const AnalyzeSocietyPage = lazy(() => import('../pages/AnalyzeSocietyPage'));

function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050B14]">
      <div className="flex items-center gap-3 text-sm font-medium text-teal-200">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-teal-300/30 border-t-teal-300" />
        Loading Pravah Society Intelligence...
      </div>
    </div>
  );
}

const APPRoute = () => {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/analyse-society"
          element={
            <Suspense fallback={<PageLoader />}>
              <AnalyzeSocietyPage />
            </Suspense>
          }
        />
        <Route
          path="/analyze-society"
          element={
            <Suspense fallback={<PageLoader />}>
              <AnalyzeSocietyPage />
            </Suspense>
          }
        />
        <Route
          path="/analysis"
          element={
            <Suspense fallback={<PageLoader />}>
              <AnalyzeSocietyPage />
            </Suspense>
          }
        />
        <Route
          path="/dashboard"
          element={
            <Suspense fallback={<PageLoader />}>
              <AnalyzeSocietyPage />
            </Suspense>
          }
        />
      </Route>
    </Routes>
  );
};

export default APPRoute;