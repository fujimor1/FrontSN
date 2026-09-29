import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../api/client";
import type { Campaña, CrearCampañaResultado } from "../../api/types";

export function useCampañas() {
  return useQuery({
    queryKey: ["campanias"],
    queryFn: async () => (await apiClient.get<Campaña[]>("/api/produccion/campanias")).data,
  });
}

export interface DistribucionInicialInput {
  unidadProduccionId: number;
  cantidadPeces: number;
}

export interface CrearCampañaInput {
  codigoCampaña: string;
  fechaSiembra: string;
  pesoPromedioInicialGr: number;
  tallaPromedioInicialCm: number;
  proveedor: string | null;
  observaciones: string | null;
  distribuciones: DistribucionInicialInput[];
}

export function useCrearCampaña() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CrearCampañaInput) =>
      (await apiClient.post<CrearCampañaResultado>("/api/produccion/campanias", input)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campanias"] });
      queryClient.invalidateQueries({ queryKey: ["lotes"] });
    },
  });
}
