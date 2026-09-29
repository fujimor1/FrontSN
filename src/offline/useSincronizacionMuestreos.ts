import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { apiClient } from "../api/client";
import { offlineDb } from "./db";

/**
 * Al recuperar conexión (o al montar la app), reenvía los muestreos que quedaron en la cola
 * local. Se detiene en el primer fallo real de red (sigue sin señal) — un error de validación
 * del servidor sí se descarta de la cola, porque reintentarlo indefinidamente no lo arregla.
 */
export function useSincronizacionMuestreos() {
  const queryClient = useQueryClient();
  const [sincronizando, setSincronizando] = useState(false);
  const [pendientes, setPendientes] = useState(0);

  useEffect(() => {
    const actualizarContador = () => offlineDb.muestreosPendientes.count().then(setPendientes);
    actualizarContador();

    const sincronizar = async () => {
      setSincronizando(true);
      try {
        const cola = await offlineDb.muestreosPendientes.orderBy("id").toArray();
        for (const item of cola) {
          try {
            await apiClient.post(`/api/produccion/lotes/${item.loteId}/muestreos`, {
              fecha: item.fecha,
              pesoPromedioMuestreadoGr: item.pesoPromedioMuestreadoGr,
              tallaPromedioMuestreadaCm: item.tallaPromedioMuestreadaCm,
              numeroPecesMuestreados: item.numeroPecesMuestreados,
            });
            await offlineDb.muestreosPendientes.delete(item.id!);
            queryClient.invalidateQueries({ queryKey: ["lotes", item.loteId] });
          } catch (error: any) {
            if (!error?.response) break; // sin conexión todavía — reintenta en el próximo evento "online"
            await offlineDb.muestreosPendientes.delete(item.id!); // error de validación del servidor: no se puede arreglar reintentando
          }
        }
      } finally {
        await actualizarContador();
        setSincronizando(false);
      }
    };

    sincronizar();
    window.addEventListener("online", sincronizar);
    return () => window.removeEventListener("online", sincronizar);
  }, [queryClient]);

  return { sincronizando, pendientes };
}
