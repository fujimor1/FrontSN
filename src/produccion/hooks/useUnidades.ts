import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../api/client";
import type { Bastidor, FormaUnidad, TipoJaula, TipoUnidadProduccion, UnidadProduccion } from "../../api/types";

// --- Unidades de producción (Jaula/Artesa) ---

export function useUnidades() {
  return useQuery({
    queryKey: ["unidades"],
    queryFn: async () => (await apiClient.get<UnidadProduccion[]>("/api/produccion/unidades")).data,
  });
}

export interface CrearUnidadInput {
  codigo: string;
  tipo: TipoUnidadProduccion;
  subTipoJaula: TipoJaula | null;
  forma: FormaUnidad;
  largoM: number | null;
  anchoM: number | null;
  diametroM: number | null;
  altoM: number;
  densidadSiembraKgM3: number;
}

export function useCrearUnidad() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CrearUnidadInput) =>
      (await apiClient.post<{ id: number }>("/api/produccion/unidades", input)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["unidades"] }),
  });
}

export interface ActualizarUnidadInput {
  codigo: string;
  subTipoJaula: TipoJaula | null;
  forma: FormaUnidad;
  largoM: number | null;
  anchoM: number | null;
  diametroM: number | null;
  altoM: number;
  densidadSiembraKgM3: number;
}

export function useActualizarUnidad() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: number; input: ActualizarUnidadInput }) =>
      apiClient.put(`/api/produccion/unidades/${id}`, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["unidades"] }),
  });
}

// --- Bastidores (Ovas) ---

export function useBastidores() {
  return useQuery({
    queryKey: ["bastidores"],
    queryFn: async () => (await apiClient.get<Bastidor[]>("/api/produccion/bastidores")).data,
  });
}

export interface CrearBastidorInput {
  codigo: string;
  capacidadMaximaUnidades: number;
}

export function useCrearBastidor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CrearBastidorInput) =>
      (await apiClient.post<{ id: number }>("/api/produccion/bastidores", input)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["bastidores"] }),
  });
}

export function useActualizarBastidor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: number; input: CrearBastidorInput }) =>
      apiClient.put(`/api/produccion/bastidores/${id}`, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["bastidores"] }),
  });
}
