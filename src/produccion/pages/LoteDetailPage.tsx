import {
  CoffeeOutlined,
  LineChartOutlined,
  ScissorOutlined,
  SwapOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Card,
  Col,
  DatePicker,
  Form,
  InputNumber,
  Modal,
  Row,
  Select,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import dayjs from "dayjs";
import type { ReactNode } from "react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { EtapaProductiva, TipoAlimento } from "../../api/types";
import { FactorCondicionChart } from "../components/FactorCondicionChart";
import { PageHeader } from "../components/PageHeader";
import { BORDE, EstadoDuracion, EtiquetaSeccion, IconoBadge, MiniStat, SOMBRA } from "../components/Stat";
import { CurvaCrecimientoChart } from "../components/CurvaCrecimientoChart";
import {
  useCalibracionLote,
  useCambiarEtapa,
  useLote,
  useRealizarSeleccion,
  useRegistrarAlimentacion,
  useRegistrarMortalidad,
  useRegistrarMuestreo,
} from "../hooks/useLotes";
import { useBastidores, useUnidades } from "../hooks/useUnidades";

const ETAPAS: EtapaProductiva[] = [
  "Ovas",
  "AlevinajeI",
  "AlevinajeII",
  "AlevinajeIII",
  "JuvenilesI",
  "JuvenilesII",
  "EngordeI",
  "EngordeII",
];

const TIPOS_ALIMENTO: TipoAlimento[] = [
  "PreInicio",
  "Inicio",
  "CrecimientoI",
  "CrecimientoII",
  "AcabadoSimple",
  "AcabadoPigmento",
  "Reproductores",
];

type ModalActivo = "muestreo" | "alimentacion" | "mortalidad" | "etapa" | "seleccion" | null;

function EstadoRacion({ etiqueta, real, recomendado }: { etiqueta: string; real: number; recomendado: number | null }) {
  if (recomendado == null) {
    return (
      <Typography.Text type="secondary" style={{ fontSize: 11 }}>
        {etiqueta}: sin referencia
      </Typography.Text>
    );
  }
  const diferencia = real - recomendado;
  const color = Math.abs(diferencia) <= 0.3 ? "green" : diferencia < 0 ? "orange" : "red";
  const texto = Math.abs(diferencia) <= 0.3 ? "En línea" : diferencia < 0 ? "Bajo" : "Alto";
  return (
    <Tag color={color} style={{ fontSize: 11, margin: 0 }}>
      {etiqueta}: {texto}
    </Tag>
  );
}

function AccionRow({
  icono,
  color,
  label,
  onClick,
  ultimo,
}: {
  icono: ReactNode;
  color: string;
  label: string;
  onClick: () => void;
  ultimo?: boolean;
}) {
  return (
    <div
      onClick={onClick}
      className="sn-accion-row"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 16px",
        cursor: "pointer",
        borderBottom: ultimo ? "none" : BORDE,
      }}
    >
      <IconoBadge color={color} icono={icono} size={32} />
      <Typography.Text strong style={{ fontSize: 14 }}>
        {label}
      </Typography.Text>
    </div>
  );
}

export function LoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const loteId = Number(id);

  const { data: lote } = useLote(loteId);
  const { data: calibracion, isLoading: cargandoCalibracion } = useCalibracionLote(loteId);
  const { data: unidades } = useUnidades();
  const { data: bastidores } = useBastidores();
  const registrarMuestreo = useRegistrarMuestreo(loteId);
  const registrarAlimentacion = useRegistrarAlimentacion(loteId);
  const registrarMortalidad = useRegistrarMortalidad(loteId);
  const cambiarEtapa = useCambiarEtapa(loteId);
  const realizarSeleccion = useRealizarSeleccion(loteId);
  const [ultimoLoteHijo, setUltimoLoteHijo] = useState<number | null>(null);

  const [modalActivo, setModalActivo] = useState<ModalActivo>(null);
  const [form] = Form.useForm();

  const cerrarModal = () => {
    setModalActivo(null);
    form.resetFields();
  };

  const onSubmit = async (values: any) => {
    try {
      if (modalActivo === "muestreo") {
        await registrarMuestreo.mutateAsync({
          fecha: values.fecha.format("YYYY-MM-DD"),
          pesoPromedioMuestreadoGr: values.pesoPromedioMuestreadoGr,
          tallaPromedioMuestreadaCm: values.tallaPromedioMuestreadaCm,
          numeroPecesMuestreados: values.numeroPecesMuestreados,
        });
      } else if (modalActivo === "alimentacion") {
        await registrarAlimentacion.mutateAsync({
          fecha: values.fecha.format("YYYY-MM-DD"),
          cantidadKgEntregada: values.cantidadKgEntregada,
          tipoAlimento: values.tipoAlimento,
        });
      } else if (modalActivo === "mortalidad") {
        await registrarMortalidad.mutateAsync({
          fecha: values.fecha.format("YYYY-MM-DD"),
          cantidad: values.cantidad,
        });
      } else if (modalActivo === "etapa") {
        await cambiarEtapa.mutateAsync({
          fecha: values.fecha.format("YYYY-MM-DD"),
          nuevaEtapa: values.nuevaEtapa,
        });
      } else if (modalActivo === "seleccion") {
        const resultado = await realizarSeleccion.mutateAsync({
          fecha: values.fecha.format("YYYY-MM-DD"),
          cantidadAMover: values.cantidadAMover,
          nuevaUnidadProduccionId: values.nuevaUnidadProduccionId,
          pesoPromedioGr: values.pesoPromedioGr,
          tallaPromedioCm: values.tallaPromedioCm,
        });
        setUltimoLoteHijo(resultado.id);
      }
      message.success("Registrado correctamente.");
      cerrarModal();
    } catch {
      message.error("No se pudo registrar — revisa los datos.");
    }
  };

  if (!lote) return null;

  const unidadDelLote = lote.unidadProduccionId != null ? unidades?.find((u) => u.id === lote.unidadProduccionId) : undefined;
  const bastidorDelLote = lote.bastidorId != null ? bastidores?.find((b) => b.id === lote.bastidorId) : undefined;

  return (
    <>
      <PageHeader
        title={
          <>
            Lote {lote.codigoLote} <Tag color="blue">{lote.etapaActual}</Tag>
          </>
        }
        backTo="/lotes"
      />

      {ultimoLoteHijo != null && (
        <Alert
          style={{ marginBottom: 20 }}
          type="success"
          showIcon
          message={
            <>
              Lote nuevo creado por selección — <Link to={`/lotes/${ultimoLoteHijo}`}>ver lote →</Link>
            </>
          }
        />
      )}

      <EtiquetaSeccion>Resumen</EtiquetaSeccion>
      <Card style={{ border: BORDE, boxShadow: SOMBRA, marginTop: 8, marginBottom: 24 }} styles={{ body: { padding: 20 } }}>
        <Row gutter={[24, 16]}>
          <Col xs={12} sm={8} md={4}>
            <MiniStat
              label="Peces vivos"
              value={
                bastidorDelLote
                  ? `${lote.cantidadTotalPeces.toLocaleString("es-PE")} / ${bastidorDelLote.capacidadMaximaUnidades.toLocaleString("es-PE")}`
                  : lote.cantidadTotalPeces.toLocaleString("es-PE")
              }
            />
          </Col>
          <Col xs={12} sm={8} md={4}>
            <MiniStat label="Cantidad inicial" value={lote.cantidadInicial.toLocaleString("es-PE")} />
          </Col>
          <Col xs={12} sm={8} md={4}>
            <MiniStat label="Peso promedio" value={lote.pesoPromedioActualGr != null ? lote.pesoPromedioActualGr.toFixed(2) : "—"} suffix="g" />
          </Col>
          <Col xs={12} sm={8} md={4}>
            <MiniStat label="Talla promedio" value={lote.tallaPromedioActualCm != null ? lote.tallaPromedioActualCm.toFixed(1) : "—"} suffix="cm" />
          </Col>
          <Col xs={12} sm={8} md={4}>
            <MiniStat
              label="Biomasa actual"
              value={
                unidadDelLote
                  ? `${lote.biomasaActualKg.toFixed(2)} / ${unidadDelLote.capacidadMaximaKg.toFixed(2)}`
                  : lote.biomasaActualKg.toFixed(2)
              }
              suffix="kg"
            />
          </Col>
          <Col xs={12} sm={8} md={4}>
            <MiniStat label="En esta etapa desde" value={lote.fechaIngresoEtapa} />
          </Col>
        </Row>
      </Card>

      {calibracion && calibracion.curvaCrecimiento.real.length > 0 && (
        <>
          <EtiquetaSeccion>Progreso en la etapa — curva de crecimiento</EtiquetaSeccion>
          <Card style={{ border: BORDE, boxShadow: SOMBRA, marginTop: 8, marginBottom: 8 }} styles={{ body: { padding: 20 } }}>
            <Row gutter={[24, 16]}>
              <Col xs={24} lg={12}>
                <CurvaCrecimientoChart
                  real={calibracion.curvaCrecimiento.real}
                  esperadoFondepes={calibracion.curvaCrecimiento.esperadoFondepes}
                  esperadoSierraNevada={calibracion.curvaCrecimiento.esperadoSierraNevada}
                  metrica="tallaCm"
                  titulo="Talla vs. días"
                  unidad="cm"
                />
              </Col>
              <Col xs={24} lg={12}>
                <CurvaCrecimientoChart
                  real={calibracion.curvaCrecimiento.real}
                  esperadoFondepes={calibracion.curvaCrecimiento.esperadoFondepes}
                  esperadoSierraNevada={calibracion.curvaCrecimiento.esperadoSierraNevada}
                  metrica="pesoGr"
                  titulo="Peso vs. días"
                  unidad="g"
                />
              </Col>
            </Row>
          </Card>
          <Typography.Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 24 }}>
            Día 0 = talla del primer muestreo de este lote (no siempre 3.5cm — los lotes nacidos por selección
            arrancan de un tamaño mayor). Cada marco usa su propia herramienta: FONDEPES solo da rangos de talla
            por subetapa (Tabla 5), así que se interpola en línea recta y se muestrea por semana; Sierra Nevada sí
            tiene una fórmula día a día (ración, FCA objetivo, ganancia — columnas D-M del Excel real), así que se
            simula literalmente día por día. No tienen por qué coincidir entre sí — lo que importa es cuánto se
            aleja la curva Real de cada una.
          </Typography.Text>
        </>
      )}

      <EtiquetaSeccion>Acciones</EtiquetaSeccion>
      <Row gutter={[16, 16]} style={{ marginTop: 8, marginBottom: 24 }}>
        <Col xs={24} md={12}>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            Registro diario
          </Typography.Text>
          <Card style={{ border: BORDE, boxShadow: SOMBRA, marginTop: 8 }} styles={{ body: { padding: 0 } }}>
            <AccionRow icono={<LineChartOutlined />} color="#2a78d6" label="Registrar muestreo" onClick={() => setModalActivo("muestreo")} />
            <AccionRow icono={<CoffeeOutlined />} color="#2a78d6" label="Registrar alimentación" onClick={() => setModalActivo("alimentacion")} />
            <AccionRow icono={<WarningOutlined />} color="#2a78d6" label="Registrar mortalidad" onClick={() => setModalActivo("mortalidad")} ultimo />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            Movimientos
          </Typography.Text>
          <Card style={{ border: BORDE, boxShadow: SOMBRA, marginTop: 8 }} styles={{ body: { padding: 0 } }}>
            <AccionRow icono={<SwapOutlined />} color="#1baf7a" label="Cambiar de etapa" onClick={() => setModalActivo("etapa")} />
            <AccionRow
              icono={<ScissorOutlined />}
              color="#1baf7a"
              label="Selección (mover a otra jaula)"
              onClick={() => setModalActivo("seleccion")}
              ultimo
            />
          </Card>
        </Col>
      </Row>

      <EtiquetaSeccion>Calibración y análisis</EtiquetaSeccion>
      <div style={{ marginTop: 8 }}>
        {cargandoCalibracion ? null : !calibracion || calibracion.serieFactorCondicion.length === 0 ? (
          <Card style={{ border: BORDE, boxShadow: SOMBRA }}>
            <Typography.Text type="secondary">
              Aún no hay muestreos registrados para este lote — registra al menos uno para ver el análisis de calibración
              (Factor de Condición, FCA real, densidad, duración por etapa).
            </Typography.Text>
          </Card>
        ) : (
          <>
            {calibracion.racionHoy && (
              <Card style={{ border: BORDE, boxShadow: SOMBRA, marginBottom: 16 }} styles={{ body: { padding: 20 } }}>
                <Typography.Text strong style={{ fontSize: 14 }}>
                  Ración recomendada para hoy
                </Typography.Text>
                <div>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    Muestreo del {calibracion.racionHoy.fechaUltimoMuestreo} ({calibracion.racionHoy.tallaUltimoMuestreoCm.toFixed(1)}cm
                    / {calibracion.racionHoy.pesoUltimoMuestreoGr.toFixed(2)}g) × {calibracion.racionHoy.pecesVivosHoy.toLocaleString("es-PE")} peces
                    vivos hoy = {calibracion.racionHoy.biomasaHoyKg.toFixed(2)}kg de biomasa
                  </Typography.Text>
                </div>
                <Row gutter={[24, 16]} style={{ marginTop: 12 }}>
                  <Col xs={12} md={6}>
                    <MiniStat
                      label="Marco FONDEPES"
                      value={
                        calibracion.racionHoy.alimentoRecomendadoHoyKgFondepes != null
                          ? calibracion.racionHoy.alimentoRecomendadoHoyKgFondepes.toFixed(3)
                          : "—"
                      }
                      suffix="kg hoy"
                      nota={
                        calibracion.racionHoy.porcentajeRecomendadoFondepes != null
                          ? `${calibracion.racionHoy.porcentajeRecomendadoFondepes.toFixed(2)}% de la biomasa`
                          : "Talla fuera de rango"
                      }
                    />
                  </Col>
                  <Col xs={12} md={6}>
                    <MiniStat
                      label="Marco Sierra Nevada"
                      value={
                        calibracion.racionHoy.alimentoRecomendadoHoyKgSierraNevada != null
                          ? calibracion.racionHoy.alimentoRecomendadoHoyKgSierraNevada.toFixed(3)
                          : "—"
                      }
                      suffix="kg hoy"
                      nota={
                        calibracion.racionHoy.porcentajeRecomendadoSierraNevada != null
                          ? `${calibracion.racionHoy.porcentajeRecomendadoSierraNevada.toFixed(2)}% de la biomasa`
                          : "Talla fuera de rango"
                      }
                    />
                  </Col>
                </Row>
                <Typography.Text type="secondary" style={{ fontSize: 12, display: "block", marginTop: 12 }}>
                  Se recalcula solo cada vez que registras una mortalidad — usa el peso/talla del último muestreo
                  (quincenal) pero la cantidad de peces vivos de HOY, no el promedio de la última semana.
                </Typography.Text>
              </Card>
            )}

            <Card style={{ border: BORDE, boxShadow: SOMBRA, marginBottom: 16 }} styles={{ body: { padding: 20 } }}>
              <Row gutter={[24, 16]}>
                <Col xs={12} md={6}>
                  <MiniStat
                    label="Mortalidad acumulada"
                    value={calibracion.mortalidad.porcentajeAcumulado.toFixed(1)}
                    suffix="%"
                    nota={`${calibracion.mortalidad.totalBajas} de ${calibracion.mortalidad.cantidadInicial}`}
                  />
                </Col>
                <Col xs={12} md={6}>
                  <MiniStat
                    label="Densidad actual"
                    value={calibracion.densidad.densidadKgM3?.toFixed(2) ?? "—"}
                    suffix="kg/m³"
                    valueColor={calibracion.densidad.superaReferencia ? "#d03b3b" : undefined}
                    nota={
                      calibracion.densidad.densidadReferenciaMaxKgM3 != null
                        ? `Referencia: máx. ${calibracion.densidad.densidadReferenciaMaxKgM3} kg/m³`
                        : undefined
                    }
                  />
                </Col>
                <Col xs={12} md={6}>
                  <MiniStat
                    label="FCA real (último período)"
                    value={calibracion.fcaPorPeriodo.at(-1)?.fcaReal?.toFixed(3) ?? "—"}
                  />
                </Col>
                <Col xs={12} md={6}>
                  <MiniStat label="Muestreos registrados" value={calibracion.serieFactorCondicion.length} />
                </Col>
              </Row>
            </Card>

            <Card
              title="Factor de Condición (K) real por muestreo"
              style={{ border: BORDE, boxShadow: SOMBRA, marginBottom: 16 }}
            >
              <FactorCondicionChart datos={calibracion.serieFactorCondicion} />
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                Banda sombreada: rango 1.0–2.0 considerado "sano" en literatura de salmónidos.
              </Typography.Text>
            </Card>

            <Row gutter={16}>
              <Col span={12}>
                <Card title="Duración real por etapa — marco FONDEPES" size="small" style={{ border: BORDE, boxShadow: SOMBRA }}>
                  <Table
                    size="small"
                    rowKey="etapa"
                    pagination={false}
                    dataSource={calibracion.duracionesPorEtapa}
                    columns={[
                      { title: "Etapa", dataIndex: "etapa" },
                      { title: "Inicio", dataIndex: "fechaInicio" },
                      { title: "Fin", dataIndex: "fechaFin", render: (v: string | null) => v ?? "En curso" },
                      { title: "Días", dataIndex: "diasReales", render: (v: number | null) => v ?? "—" },
                      {
                        title: "Esperado",
                        key: "esperado",
                        render: (_: unknown, r: (typeof calibracion.duracionesPorEtapa)[number]) =>
                          r.diasEsperadosMinFondepes != null
                            ? r.diasEsperadosMinFondepes === r.diasEsperadosMaxFondepes
                              ? `${r.diasEsperadosMinFondepes}`
                              : `${r.diasEsperadosMinFondepes}-${r.diasEsperadosMaxFondepes}`
                            : "—",
                      },
                      {
                        title: "Estado",
                        key: "estado",
                        render: (_: unknown, r: (typeof calibracion.duracionesPorEtapa)[number]) => (
                          <EstadoDuracion dias={r.diasReales} min={r.diasEsperadosMinFondepes} max={r.diasEsperadosMaxFondepes} />
                        ),
                      },
                    ]}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card title="FCA real por período" size="small" style={{ border: BORDE, boxShadow: SOMBRA }}>
                  <Table
                    size="small"
                    rowKey="desde"
                    pagination={false}
                    dataSource={calibracion.fcaPorPeriodo}
                    columns={[
                      { title: "Desde", dataIndex: "desde" },
                      { title: "Hasta", dataIndex: "hasta" },
                      { title: "Alimento (kg)", dataIndex: "alimentoAcumuladoKg", render: (v: number) => v.toFixed(2) },
                      { title: "Ganancia (kg)", dataIndex: "gananciaBiomasaKg", render: (v: number) => v.toFixed(2) },
                      { title: "FCA", dataIndex: "fcaReal", render: (v: number | null) => (v != null ? v.toFixed(3) : "—") },
                    ]}
                  />
                </Card>
              </Col>
            </Row>

            <Card
              title="Duración real por tramo — marco Sierra Nevada"
              size="small"
              style={{ border: BORDE, boxShadow: SOMBRA, marginTop: 16 }}
            >
              <Table
                size="small"
                rowKey="tramo"
                pagination={false}
                dataSource={calibracion.duracionesSierraNevada}
                columns={[
                  { title: "Tramo", dataIndex: "tramo" },
                  { title: "Inicio", dataIndex: "fechaInicio" },
                  { title: "Fin", dataIndex: "fechaFin", render: (v: string | null) => v ?? "En curso" },
                  { title: "Días", dataIndex: "diasReales", render: (v: number | null) => v ?? "—" },
                  { title: "Esperado", dataIndex: "diasEsperados", render: (v: number | null) => v ?? "—" },
                  {
                    title: "Estado",
                    key: "estado",
                    render: (_: unknown, r: (typeof calibracion.duracionesSierraNevada)[number]) => (
                      <EstadoDuracion dias={r.diasReales} min={r.diasEsperados} max={r.diasEsperados} tolerancia={0.2} />
                    ),
                  },
                ]}
              />
              <Typography.Text type="secondary" style={{ fontSize: 12, display: "block", marginTop: 8 }}>
                "Esperado" no es un dato que el Excel declare — sale de simular su propio modelo día a día (ración,
                FCA objetivo y ganancia real de las fórmulas de la empresa) desde 3.5cm. Los tramos se detectan por la
                talla de cada muestreo, no por una acción explícita (Sierra Nevada no tiene "cambiar de tramo" como
                concepto).
              </Typography.Text>
            </Card>

            <Card title="Ración real vs. recomendada por período" size="small" style={{ border: BORDE, boxShadow: SOMBRA, marginTop: 16 }}>
              <Table
                size="small"
                rowKey="desde"
                pagination={false}
                dataSource={calibracion.racionPorPeriodo}
                columns={[
                  { title: "Desde", dataIndex: "desde" },
                  { title: "Hasta", dataIndex: "hasta" },
                  {
                    title: "Talla / peso al inicio",
                    key: "tallaPeso",
                    render: (_: unknown, r: (typeof calibracion.racionPorPeriodo)[number]) =>
                      `${r.tallaInicioCm.toFixed(1)} cm / ${r.pesoInicioGr.toFixed(2)} g`,
                  },
                  {
                    title: "Alimento total del período (kg)",
                    dataIndex: "alimentoAcumuladoKg",
                    render: (v: number) => v.toFixed(2),
                  },
                  {
                    title: "Alimento/día (kg)",
                    dataIndex: "alimentoPromedioDiaKg",
                    render: (v: number) => v.toFixed(3),
                  },
                  { title: "Real (%biomasa/día)", dataIndex: "porcentajeRealPorDia", render: (v: number) => `${v.toFixed(2)}%` },
                  {
                    title: "Rec. FONDEPES",
                    dataIndex: "porcentajeRecomendadoFondepes",
                    render: (v: number | null) => (v != null ? `${v.toFixed(2)}%` : "—"),
                  },
                  {
                    title: "Rec. Sierra Nevada",
                    dataIndex: "porcentajeRecomendadoSierraNevada",
                    render: (v: number | null) => (v != null ? `${v.toFixed(2)}%` : "—"),
                  },
                  {
                    title: "Estado",
                    key: "estado",
                    render: (_: unknown, r: (typeof calibracion.racionPorPeriodo)[number]) => (
                      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <EstadoRacion etiqueta="FONDEPES" real={r.porcentajeRealPorDia} recomendado={r.porcentajeRecomendadoFondepes} />
                        <EstadoRacion etiqueta="Sierra Nevada" real={r.porcentajeRealPorDia} recomendado={r.porcentajeRecomendadoSierraNevada} />
                      </div>
                    ),
                  },
                ]}
              />
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                "Alimento total del período" suma todo lo entregado entre un muestreo y el siguiente (puede ser varios
                días) — "Alimento/día" es el que se compara contra el Excel de la empresa, que reporta consumo día a
                día, no acumulado. El % es lo comparable entre lotes de cualquier tamaño; el kg depende de cuántos
                peces/biomasa tenga el lote. Dos marcos de referencia en paralelo: FONDEPES (objetivo/protocolo
                oficial) y Sierra Nevada (cómo se alimenta realmente hoy, según el Excel real — incluye sus huecos
                reales, sin rellenar). "En línea" = dentro de ±0.3 puntos porcentuales.
              </Typography.Text>
            </Card>
          </>
        )}
      </div>

      <Modal
        title={
          {
            muestreo: "Registrar muestreo",
            alimentacion: "Registrar alimentación",
            mortalidad: "Registrar mortalidad",
            etapa: "Cambiar de etapa",
            seleccion: "Selección — mover una porción a otra jaula",
          }[modalActivo ?? "muestreo"]
        }
        open={modalActivo !== null}
        onCancel={cerrarModal}
        onOk={() => form.submit()}
        confirmLoading={
          registrarMuestreo.isPending ||
          registrarAlimentacion.isPending ||
          registrarMortalidad.isPending ||
          cambiarEtapa.isPending ||
          realizarSeleccion.isPending
        }
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={onSubmit} initialValues={{ fecha: dayjs() }}>
          <Form.Item name="fecha" label="Fecha del evento" rules={[{ required: true }]}>
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          {modalActivo === "muestreo" && (
            <>
              <Typography.Paragraph type="secondary" style={{ marginTop: -8 }}>
                Solo los datos de la muestra que se pesó/midió — la cantidad de peces vivos del lote se sigue
                calculando sola a partir de las mortalidades registradas, no se vuelve a contar aquí.
              </Typography.Paragraph>
              <Form.Item name="pesoPromedioMuestreadoGr" label="Peso promedio muestreado (g)" rules={[{ required: true }]}>
                <InputNumber style={{ width: "100%" }} min={0} step={0.01} />
              </Form.Item>
              <Form.Item name="tallaPromedioMuestreadaCm" label="Talla promedio muestreada (cm)" rules={[{ required: true }]}>
                <InputNumber style={{ width: "100%" }} min={0} step={0.1} />
              </Form.Item>
              <Form.Item name="numeroPecesMuestreados" label="Número de peces muestreados" rules={[{ required: true }]}>
                <InputNumber style={{ width: "100%" }} min={1} />
              </Form.Item>
            </>
          )}

          {modalActivo === "alimentacion" && (
            <>
              <Form.Item name="cantidadKgEntregada" label="Cantidad entregada (kg)" rules={[{ required: true }]}>
                <InputNumber style={{ width: "100%" }} min={0} step={0.1} />
              </Form.Item>
              <Form.Item name="tipoAlimento" label="Tipo de alimento" rules={[{ required: true }]}>
                <Select<TipoAlimento> options={TIPOS_ALIMENTO.map((t) => ({ value: t }))} />
              </Form.Item>
            </>
          )}

          {modalActivo === "mortalidad" && (
            <Form.Item name="cantidad" label="Cantidad de bajas" rules={[{ required: true }]}>
              <InputNumber style={{ width: "100%" }} min={1} />
            </Form.Item>
          )}

          {modalActivo === "etapa" && (
            <Form.Item name="nuevaEtapa" label="Nueva etapa" rules={[{ required: true }]}>
              <Select<EtapaProductiva> options={ETAPAS.map((e) => ({ value: e }))} />
            </Form.Item>
          )}

          {modalActivo === "seleccion" && (
            <>
              <Typography.Paragraph type="secondary" style={{ marginTop: -8 }}>
                Separa los peces más grandes (los que van a la cabeza) hacia otra jaula — crea un lote nuevo
                (código generado solo) enlazado a este.
              </Typography.Paragraph>
              <Form.Item name="cantidadAMover" label="Cantidad de peces a mover" rules={[{ required: true }]}>
                <InputNumber style={{ width: "100%" }} min={1} max={lote ? lote.cantidadTotalPeces - 1 : undefined} />
              </Form.Item>
              <Form.Item name="nuevaUnidadProduccionId" label="Jaula/artesa de destino" rules={[{ required: true }]}>
                <Select
                  options={unidades
                    ?.filter((u) => u.id !== lote?.unidadProduccionId)
                    .map((u) => ({ value: u.id, label: `${u.codigo} (${u.tipo})` }))}
                />
              </Form.Item>
              <Form.Item name="pesoPromedioGr" label="Peso promedio del grupo movido (g)" rules={[{ required: true }]}>
                <InputNumber style={{ width: "100%" }} min={0} step={0.01} />
              </Form.Item>
              <Form.Item name="tallaPromedioCm" label="Talla promedio del grupo movido (cm)" rules={[{ required: true }]}>
                <InputNumber style={{ width: "100%" }} min={0} step={0.1} />
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>
    </>
  );
}
