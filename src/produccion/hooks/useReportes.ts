import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../api/client";
import type { ReporteProduccionGlobalResultado } from "../../api/types";

export function useReporteProduccionGlobal() {
  return useQuery({
    queryKey: ["reporte-produccion-global"],
    queryFn: async () => (await apiClient.get<ReporteProduccionGlobalResultado>("/api/produccion/reportes/global")).data,
  });
}
