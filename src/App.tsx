import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import { LoginPage } from "./auth/LoginPage";
import { CatalogoAlimentosPage } from "./inventario/pages/CatalogoAlimentosPage";
import { KardexAlimentoPage } from "./inventario/pages/KardexAlimentoPage";
import { ProveedoresPage } from "./inventario/pages/ProveedoresPage";
import { RecepcionAlimentoPage } from "./inventario/pages/RecepcionAlimentoPage";
import { ReordenDashboardPage } from "./inventario/pages/ReordenDashboardPage";
import { AppLayout } from "./layout/AppLayout";
import { ProtectedRoute } from "./layout/ProtectedRoute";
import { CampañasListPage } from "./produccion/pages/CampañasListPage";
import { DashboardPage } from "./produccion/pages/DashboardPage";
import { EtapaUnidadesPage } from "./produccion/pages/EtapaUnidadesPage";
import { LoteDetailPage } from "./produccion/pages/LoteDetailPage";
import { LotesListPage } from "./produccion/pages/LotesListPage";
import { ReporteProduccionPage } from "./produccion/pages/ReporteProduccionPage";
import { UnidadesListPage } from "./produccion/pages/UnidadesListPage";

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

        {/* Rutas de Inventario y Reorden */}
        <Route path="/inventario/reorden" element={<ReordenDashboardPage />} />
        <Route path="/inventario/kardex" element={<KardexAlimentoPage />} />
        <Route path="/inventario/recepcion" element={<RecepcionAlimentoPage />} />
        <Route path="/inventario/catalogo" element={<CatalogoAlimentosPage />} />
        <Route path="/inventario/proveedores" element={<ProveedoresPage />} />
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
