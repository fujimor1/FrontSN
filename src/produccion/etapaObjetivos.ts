/**
 * Dos marcos de referencia, en paralelo, no uno reemplazando al otro (docs/investigacion-parametros-produccion.md
 * secciones 3.2 y 4.2):
 * - FONDEPES: el objetivo/estándar de buena gestión (protocolo oficial, 7 bandas — Alevinaje I/II/III,
 *   Juveniles I/II, Engorde I/II). Las mismas bandas de talla que usa EtapaProductivaCalculadora en el backend.
 * - Sierra Nevada: cómo opera REALMENTE hoy la empresa, según su propio Excel (columna M, tipo de
 *   dieta) — solo 6 bandas, 2 por cada etapa macro (Alevines/Juveniles/Engorde), sin ese tercer
 *   tramo de Alevinaje que sí tiene FONDEPES.
 *
 * Cada banda se busca por la TALLA actual del lote, independiente de en qué EtapaProductiva (enum)
 * esté clasificado — así un lote puede estar, por ejemplo, en "AlevinajeIII" según nuestro sistema
 * (FONDEPES) y ya en "Crecimiento I" (Juveniles) según cómo Sierra Nevada trata esa misma talla en
 * la práctica. Ese desfase es justamente lo que este contraste busca mostrar.
 */
export interface BandaMarco {
  nombre: string;
  tallaMinCm: number;
  tallaMaxCm: number;
  pesoMinGr: number;
  pesoMaxGr: number;
}

// Peso derivado con la fórmula del Excel real (peso = 0.01123 × talla³, el mismo K=1.123 fijo que
// ya usa el resto del sistema) — ver advertencia en docs sección 5.4: ese K podría estar
// desactualizado, conviene recalcularlo con muestreos reales cuando haya suficientes.
export const BANDAS_FONDEPES: BandaMarco[] = [
  { nombre: "Alevinaje I", tallaMinCm: 3.5, tallaMaxCm: 5, pesoMinGr: 0.48, pesoMaxGr: 1.4 },
  { nombre: "Alevinaje II", tallaMinCm: 5, tallaMaxCm: 8, pesoMinGr: 1.4, pesoMaxGr: 5.75 },
  { nombre: "Alevinaje III", tallaMinCm: 8, tallaMaxCm: 12, pesoMinGr: 5.75, pesoMaxGr: 19.41 },
  { nombre: "Juveniles I", tallaMinCm: 12, tallaMaxCm: 14, pesoMinGr: 19.41, pesoMaxGr: 30.82 },
  { nombre: "Juveniles II", tallaMinCm: 14, tallaMaxCm: 17, pesoMinGr: 30.82, pesoMaxGr: 55.17 },
  { nombre: "Engorde I", tallaMinCm: 17, tallaMaxCm: 20, pesoMinGr: 55.17, pesoMaxGr: 89.84 },
  { nombre: "Engorde II", tallaMinCm: 20, tallaMaxCm: 26, pesoMinGr: 89.84, pesoMaxGr: 197.38 },
];

export const BANDAS_SIERRA_NEVADA: BandaMarco[] = [
  { nombre: "Pre inicio", tallaMinCm: 0, tallaMaxCm: 4, pesoMinGr: 0, pesoMaxGr: 0.72 },
  { nombre: "Inicio", tallaMinCm: 4, tallaMaxCm: 7.07, pesoMinGr: 0.72, pesoMaxGr: 3.97 },
  { nombre: "Crecimiento I", tallaMinCm: 7.07, tallaMaxCm: 11.82, pesoMinGr: 3.97, pesoMaxGr: 18.55 },
  { nombre: "Crecimiento II", tallaMinCm: 11.82, tallaMaxCm: 18.9, pesoMinGr: 18.55, pesoMaxGr: 75.82 },
  { nombre: "Acabado simple", tallaMinCm: 18.9, tallaMaxCm: 23.63, pesoMinGr: 75.82, pesoMaxGr: 148.17 },
  { nombre: "Acabado pigmento", tallaMinCm: 23.63, tallaMaxCm: 30, pesoMinGr: 148.17, pesoMaxGr: 303.21 },
];

export function bandaPara(bandas: BandaMarco[], tallaCm: number): BandaMarco | undefined {
  return bandas.find((b) => tallaCm >= b.tallaMinCm && tallaCm < b.tallaMaxCm);
}
