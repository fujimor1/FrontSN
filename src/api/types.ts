// Tipos que reflejan los DTOs/entidades que la API serializa (System.Text.Json, camelCase,
// enums como texto — ver backend/src/SierraNevada.Api/Program.cs JsonStringEnumConverter).

export type RolUsuario = "Administrador" | "Operario" | "Ventas" | "Logistica" | "Terceros";

export type EtapaProductiva =
  | "Ovas"
  | "AlevinajeI"
  | "AlevinajeII"
  | "AlevinajeIII"
  | "JuvenilesI"
  | "JuvenilesII"
  | "EngordeI"
  | "EngordeII";

export type TipoUnidadProduccion = "Jaula" | "Artesa";
export type TipoJaula = "Juvenil" | "Engorde";
export type FormaUnidad = "Rectangular" | "Circular" | "Hexagonal" | "Decagonal";

export type TipoAlimento =
  | "PreInicio"
  | "Inicio"
  | "CrecimientoI"
  | "CrecimientoII"
  | "AcabadoSimple"
  | "AcabadoPigmento"
  | "Reproductores";

export type TipoTablaReferencia = "Racion" | "Fca" | "Mortalidad" | "Densidad";

export interface ResultadoLogin {
  token: string;
  nombreUsuario: string;
  nombreCompleto: string;
  rol: RolUsuario;
}

export interface UnidadProduccion {
  id: number;
  codigo: string;
  tipo: TipoUnidadProduccion;
  subTipoJaula: TipoJaula | null;
  forma: FormaUnidad;
  largoM: number | null;
  anchoM: number | null;
  diametroM: number | null;
  ladoM: number | null;
  altoM: number;
  densidadSiembraKgM3: number;
  volumenM3: number;
  capacidadMaximaKg: number;
}

export interface Bastidor {
  id: number;
  codigo: string;
  capacidadMaximaUnidades: number;
  estaDisponible: boolean;
}

export interface Campaña {
  id: number;
  codigo: string;
  fechaSiembra: string;
  cantidadAlevinesSembrados: number;
  pesoPromedioInicialGr: number;
  tallaPromedioInicialCm: number;
  proveedor: string | null;
  observaciones: string | null;
}

export interface CrearCampañaResultado {
  campañaId: number;
  loteIds: number[];
}

export interface Lote {
  id: number;
  codigoLote: string;
  campañaId: number;
  lotePadreId: number | null;
  unidadProduccionId: number | null;
  bastidorId: number | null;
  etapaActual: EtapaProductiva;
  cantidadInicial: number;
  pesoPromedioInicialGr: number;
  cantidadTotalPeces: number;
  tallaPromedioActualCm: number | null;
  pesoPromedioActualGr: number | null;
  fechaIngresoEtapa: string;
  fechaFin: string | null;
  activo: boolean;
  biomasaActualKg: number;
}

export interface Muestreo {
  id: number;
  loteId: number;
  fecha: string;
  pesoPromedioMuestreadoGr: number;
  tallaPromedioMuestreadaCm: number;
  numeroPecesMuestreados: number;
  cantidadPecesVivosAlMomento: number;
  registradoPor: string;
  biomasaEstimadaKg: number;
  factorCondicionK: number;
}

export interface PuntoFactorCondicion {
  fecha: string;
  tallaCm: number;
  pesoGr: number;
  factorK: number;
}

export interface DuracionEtapaReal {
  etapa: EtapaProductiva;
  fechaInicio: string;
  fechaFin: string | null;
  diasReales: number | null;
  diasEsperadosMinFondepes: number | null;
  diasEsperadosMaxFondepes: number | null;
}

export interface DuracionBandaSierraNevada {
  tramo: string;
  fechaInicio: string;
  fechaFin: string | null;
  diasReales: number | null;
  diasEsperados: number | null;
}

export interface FcaRealPeriodo {
  desde: string;
  hasta: string;
  alimentoAcumuladoKg: number;
  gananciaBiomasaKg: number;
  fcaReal: number | null;
}

export interface RacionRealPeriodo {
  desde: string;
  hasta: string;
  tallaInicioCm: number;
  pesoInicioGr: number;
  alimentoAcumuladoKg: number;
  alimentoPromedioDiaKg: number;
  biomasaInicioKg: number;
  porcentajeRealPorDia: number;
  porcentajeRecomendadoFondepes: number | null;
  porcentajeRecomendadoSierraNevada: number | null;
}

export interface RacionRecomendadaHoy {
  fechaUltimoMuestreo: string;
  tallaUltimoMuestreoCm: number;
  pesoUltimoMuestreoGr: number;
  pecesVivosHoy: number;
  biomasaHoyKg: number;
  porcentajeRecomendadoFondepes: number | null;
  alimentoRecomendadoHoyKgFondepes: number | null;
  porcentajeRecomendadoSierraNevada: number | null;
  alimentoRecomendadoHoyKgSierraNevada: number | null;
}

export interface PuntoCurvaCrecimiento {
  dia: number;
  tallaCm: number;
  pesoGr: number;
}

export interface CurvaCrecimientoResultado {
  esperadoFondepes: PuntoCurvaCrecimiento[];
  esperadoSierraNevada: PuntoCurvaCrecimiento[];
  real: PuntoCurvaCrecimiento[];
}

export interface MortalidadRealResumen {
  totalBajas: number;
  cantidadInicial: number;
  porcentajeAcumulado: number;
}

export interface DensidadActual {
  biomasaActualKg: number;
  volumenM3: number | null;
  densidadKgM3: number | null;
  densidadReferenciaMaxKgM3: number | null;
  superaReferencia: boolean | null;
}

export interface CalibracionLoteResultado {
  loteId: number;
  codigoLote: string;
  serieFactorCondicion: PuntoFactorCondicion[];
  duracionesPorEtapa: DuracionEtapaReal[];
  duracionesSierraNevada: DuracionBandaSierraNevada[];
  fcaPorPeriodo: FcaRealPeriodo[];
  racionPorPeriodo: RacionRealPeriodo[];
  racionHoy: RacionRecomendadaHoy | null;
  curvaCrecimiento: CurvaCrecimientoResultado;
  mortalidad: MortalidadRealResumen;
  densidad: DensidadActual;
}

export interface ResumenEtapaGlobal {
  etapa: EtapaProductiva;
  cantidadLotesQuePasaron: number;
  alimentoTotalKg: number;
  mortalidadTotal: number;
  diasPromedio: number | null;
  diasMin: number | null;
  diasMax: number | null;
  diasEsperadosMinFondepes: number | null;
  diasEsperadosMaxFondepes: number | null;
}

export interface ResumenTramoGlobalSierraNevada {
  tramo: string;
  cantidadLotesQuePasaron: number;
  alimentoTotalKg: number;
  mortalidadTotal: number;
  diasPromedio: number | null;
  diasMin: number | null;
  diasMax: number | null;
  diasEsperados: number | null;
}

export interface ReporteProduccionGlobalResultado {
  totalPecesSembrados: number;
  totalPecesVivos: number;
  totalMortalidad: number;
  porcentajeSupervivencia: number;
  biomasaTotalActualKg: number;
  porEtapaFondepes: ResumenEtapaGlobal[];
  porTramoSierraNevada: ResumenTramoGlobalSierraNevada[];
}
