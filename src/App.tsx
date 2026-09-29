import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import { LoginPage } from "./auth/LoginPage";
import { CampañasListPage } from "./produccion/pages/CampañasListPage";
import { DashboardPage } from "./produccion/pages/DashboardPage";
import { EtapaUnidadesPage } from "./produccion/pages/EtapaUnidadesPage";
import { LoteDetailPage } from "./produccion/pages/LoteDetailPage";
import { LotesListPage } from "./produccion/pages/LotesListPage";
import { ReporteProduccionPage } from "./produccion/pages/ReporteProduccionPage";
import { UnidadesListPage } from "./produccion/pages/UnidadesListPage";
import { AppLayout } from "./layout/AppLayout";
import { ProtectedRoute } from "./layout/ProtectedRoute";

function LoginRoute() {
  const { usuario } = useAuth();
  if (usuario) return <Navigate to="/" replace />;
  return <LoginPage />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginRoute />} />
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="/etapas/:clave" element={<EtapaUnidadesPage />} />
        <Route path="/lotes" element={<LotesListPage />} />
        <Route path="/lotes/:id" element={<LoteDetailPage />} />
        <Route path="/campanias" element={<CampañasListPage />} />
        <Route path="/unidades" element={<UnidadesListPage />} />
        <Route path="/reporte-produccion" element={<ReporteProduccionPage />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
