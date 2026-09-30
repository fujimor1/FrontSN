import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../api/client";
import type {
  KardexMovimiento,
  LoteAlimento,
  MotorMlDashboardResponse,
  PlanReordenGlobalResponse,
  ProveedorAlimento,
  TipoAlimentoCatalogo,
} from "../../api/types";

export function useTiposAlimento() {
  return useQuery({
    queryKey: ["inventario", "tipos"],
    queryFn: async () => {
      const res = await apiClient.get<TipoAlimentoCatalogo[]>("/api/inventario/tipos");
      return res.data;
    },
  });
}

export function useProveedores() {
  return useQuery({
    queryKey: ["inventario", "proveedores"],
    queryFn: async () => {
      const res = await apiClient.get<ProveedorAlimento[]>("/api/inventario/proveedores");
      return res.data;
    },
  });
}

export function useLotesAlimento(soloConStock = false) {
  return useQuery({
    queryKey: ["inventario", "lotes", soloConStock],
    queryFn: async () => {
      const res = await apiClient.get<LoteAlimento[]>("/api/inventario/lotes", {
        params: { soloConStock },
      });
      return res.data;
    },
  });
}

export function useKardexMovimientos(filtros?: {
  tipoAlimentoId?: number;
  loteAlimentoId?: number;
  desde?: string;
  hasta?: string;
}) {
  return useQuery({
    queryKey: ["inventario", "kardex", filtros],
    queryFn: async () => {
      const res = await apiClient.get<KardexMovimiento[]>("/api/inventario/kardex", {
        params: filtros,
      });
      return res.data;
    },
  });
}

export function usePlanReorden(nivelServicioZ = 1.65, diasHistoricoDemanda = 60) {
  return useQuery({
    queryKey: ["inventario", "reorden", nivelServicioZ, diasHistoricoDemanda],
    queryFn: async () => {
      const res = await apiClient.get<PlanReordenGlobalResponse>("/api/inventario/reorden/plan", {
        params: { nivelServicioZ, diasHistoricoDemanda },
      });
      return res.data;
    },
  });
}

export function useMotorMlDashboard(diasProyeccion = 30) {
  return useQuery({
    queryKey: ["ml", "dashboard", diasProyeccion],
    queryFn: async () => {
      const res = await apiClient.get<MotorMlDashboardResponse>("/api/ml/dashboard", {
        params: { diasProyeccion },
      });
      return res.data;
    },
  });
}

export function useRegistrarIngresoAlimento() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      tipoAlimentoId: number;
      proveedorId: number;
      codigoLoteFabrica: string;
      fechaFabricacion?: string;
      fechaVencimiento: string;
      pesoPorSacoKg: number;
      cantidadSacos: number;
      precioUnitarioKg: number;
      observaciones?: string;
    }) => {
      const res = await apiClient.post("/api/inventario/ingreso", payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventario"] });
    },
  });
}

export function useRegistrarEgresoAlimento() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      loteAlimentoId: number;
      tipoMovimiento: string;
      cantidadKg: number;
      loteProduccionId?: number;
      observaciones?: string;
    }) => {
      const res = await apiClient.post("/api/inventario/egreso", payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventario"] });
    },
  });
}
