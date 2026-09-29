import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../api/client";
import { offlineDb } from "../../offline/db";
import type {
  CalibracionLoteResultado,
  EtapaProductiva,
  Lote,
  Muestreo,
  TipoAlimento,
} from "../../api/types";

// --- Lotes ---

export function useLotesActivos() {
  return useQuery({
    queryKey: ["lotes"],
    queryFn: async () => (await apiClient.get<Lote[]>("/api/produccion/lotes")).data,
  });
}

export function useLote(id: number) {
  return useQuery({
    queryKey: ["lotes", id],
    queryFn: async () => (await apiClient.get<Lote>(`/api/produccion/lotes/${id}`)).data,
    enabled: !!id,
  });
}

export function useMuestreosDeLote(id: number) {
  return useQuery({
    queryKey: ["lotes", id, "muestreos"],
    queryFn: async () => (await apiClient.get<Muestreo[]>(`/api/produccion/lotes/${id}/muestreos`)).data,
    enabled: !!id,
  });
}

export function useCalibracionLote(id: number) {
  return useQuery({
    queryKey: ["lotes", id, "calibracion"],
    queryFn: async () => (await apiClient.get<CalibracionLoteResultado>(`/api/produccion/lotes/${id}/calibracion`)).data,
    enabled: !!id,
  });
}

// --- Muestreo (con cola offline — ver docs/arquitectura-tecnica.md sección 5) ---

export interface RegistrarMuestreoInput {
  fecha: string;
  pesoPromedioMuestreadoGr: number;
  tallaPromedioMuestreadaCm: number;
  numeroPecesMuestreados: number;
}

/**
 * Registra un muestreo — si no hay conexión (falla de red real, no un error de validación del
 * servidor), lo guarda en la cola local (Dexie/IndexedDB) en vez de perderlo. useSincronizacionMuestreos
 * se encarga de reenviarlo cuando vuelva la señal.
 */
export function useRegistrarMuestreo(loteId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: RegistrarMuestreoInput) => {
      try {
        return (await apiClient.post<{ id: number }>(`/api/produccion/lotes/${loteId}/muestreos`, input)).data;
      } catch (error: any) {
        if (error?.response) throw error; // error de validación del servidor: no es un problema de conexión, no se encola
        await offlineDb.muestreosPendientes.add({ loteId, ...input, capturadoEn: new Date().toISOString() });
        return { id: -1, guardadoOffline: true };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lotes", loteId] });
      queryClient.invalidateQueries({ queryKey: ["lotes", loteId, "muestreos"] });
      queryClient.invalidateQueries({ queryKey: ["lotes", loteId, "calibracion"] });
    },
  });
}

// --- Alimentación ---

export interface RegistrarAlimentacionInput {
  fecha: string;
  cantidadKgEntregada: number;
  tipoAlimento: TipoAlimento;
}

export function useRegistrarAlimentacion(loteId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: RegistrarAlimentacionInput) =>
      (await apiClient.post<{ id: number }>(`/api/produccion/lotes/${loteId}/alimentacion`, input)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["lotes", loteId, "calibracion"] }),
  });
}

// --- Mortalidad ---

export interface RegistrarMortalidadInput {
  fecha: string;
  cantidad: number;
}

export function useRegistrarMortalidad(loteId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: RegistrarMortalidadInput) =>
      (await apiClient.post<{ id: number }>(`/api/produccion/lotes/${loteId}/mortalidad`, input)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lotes", loteId] });
      queryClient.invalidateQueries({ queryKey: ["lotes", loteId, "calibracion"] });
    },
  });
}

// --- Cambio de etapa ---

export function useCambiarEtapa(loteId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { nuevaEtapa: EtapaProductiva; fecha: string }) =>
      (await apiClient.post(`/api/produccion/lotes/${loteId}/cambio-etapa`, input)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lotes", loteId] });
      queryClient.invalidateQueries({ queryKey: ["lotes", loteId, "calibracion"] });
    },
  });
}

// --- Selección (mover una porción a otra unidad) ---

export interface RealizarSeleccionInput {
  cantidadAMover: number;
  nuevaUnidadProduccionId: number;
  pesoPromedioGr: number;
  tallaPromedioCm: number;
  fecha: string;
}

/**
 * Selección por talla (protocolo FONDEPES): separa una porción del lote — los que van a la
 * cabeza, más grandes — hacia otra jaula. Crea un lote hijo enlazado al padre y a la misma
 * campaña (docs/diseno-modulo-produccion.md sección 5).
 */
export function useRealizarSeleccion(loteId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: RealizarSeleccionInput) =>
      (await apiClient.post<{ id: number }>(`/api/produccion/lotes/${loteId}/seleccion`, input)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lotes"] });
      queryClient.invalidateQueries({ queryKey: ["lotes", loteId] });
    },
  });
}
