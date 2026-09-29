import Dexie, { type Table } from "dexie";

/**
 * Cola de sincronización local (IndexedDB vía Dexie) — la pieza que hace posible capturar un
 * muestreo sin señal en la jaula y que se sincronice solo al volver la conexión, sin perder el
 * dato ni bloquear al operario. Ver docs/arquitectura-tecnica.md sección 5 (PWA, offline-first).
 */
export interface MuestreoPendiente {
  id?: number;
  loteId: number;
  fecha: string;
  pesoPromedioMuestreadoGr: number;
  tallaPromedioMuestreadaCm: number;
  numeroPecesMuestreados: number;
  capturadoEn: string; // timestamp real de captura en el dispositivo, no de sincronización
}

class OfflineDb extends Dexie {
  muestreosPendientes!: Table<MuestreoPendiente, number>;

  constructor() {
    super("sierranevada-offline");
    this.version(1).stores({
      muestreosPendientes: "++id, loteId",
    });
  }
}

export const offlineDb = new OfflineDb();
