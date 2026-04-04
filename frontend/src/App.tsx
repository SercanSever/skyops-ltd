import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { DashboardPage } from '@/pages/DashboardPage';
import { DronesPage } from '@/pages/DronesPage';
import { DroneDetailPage } from '@/pages/DroneDetailPage';
import { MissionsPage } from '@/pages/MissionsPage';
import { MaintenancePage } from '@/pages/MaintenancePage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/drones" element={<DronesPage />} />
            <Route path="/drones/:id" element={<DroneDetailPage />} />
            <Route path="/missions" element={<MissionsPage />} />
            <Route path="/maintenance" element={<MaintenancePage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
