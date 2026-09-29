// Agrupación "macro" por la que navega el operario (dashboard → unidades de esa etapa → lote),
// igual al patrón que ya funcionaba en el sistema Django anterior (4 tarjetas: Ovas/Alevines/
// Juveniles/Engorde) — no las 8 EtapaProductiva granulares del dominio, esas se ven dentro del lote.
export type MacroEtapa = "ovas" | "alevines" | "juveniles" | "engorde";

export const MACRO_ETAPAS: { clave: MacroEtapa; titulo: string; descripcion: string }[] = [
  { clave: "ovas", titulo: "Ovas", descripcion: "Bastidores de incubación" },
  { clave: "alevines", titulo: "Alevines", descripcion: "Artesas de alevinaje" },
  { clave: "juveniles", titulo: "Juveniles", descripcion: "Jaulas de juveniles" },
  { clave: "engorde", titulo: "Engorde", descripcion: "Jaulas de engorde" },
];

export function tituloDe(clave: MacroEtapa): string {
  return MACRO_ETAPAS.find((e) => e.clave === clave)?.titulo ?? clave;
}
