import { ArrowRightOutlined, BarChartOutlined, ExperimentOutlined, RiseOutlined, ThunderboltOutlined, TrophyOutlined } from "@ant-design/icons";
import { Button, Card, Col, Row, Typography } from "antd";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import type { UnidadProduccion } from "../../api/types";
import { BORDE, IconoBadge, MiniStat, SOMBRA } from "../components/Stat";
import { useBastidores, useUnidades } from "../hooks/useUnidades";
import { useLotesActivos } from "../hooks/useLotes";
import { MACRO_ETAPAS, type MacroEtapa } from "../macroEtapas";

function unidadPerteneceA(clave: MacroEtapa, unidad: UnidadProduccion): boolean {
  if (clave === "alevines") return unidad.tipo === "Artesa";
  if (clave === "juveniles") return unidad.tipo === "Jaula" && unidad.subTipoJaula === "Juvenil";
  if (clave === "engorde") return unidad.tipo === "Jaula" && unidad.subTipoJaula === "Engorde";
  return false;
}

// Paleta categórica validada del proyecto (dataviz skill) — un color fijo por etapa, usado como
// tinte suave en el badge del ícono, no como fondo completo de la tarjeta.
const ESTILO_ETAPA: Record<MacroEtapa, { color: string; icono: ReactNode }> = {
  ovas: { color: "#2a78d6", icono: <ExperimentOutlined /> },
  alevines: { color: "#eb6834", icono: <RiseOutlined /> },
  juveniles: { color: "#1baf7a", icono: <ThunderboltOutlined /> },
  engorde: { color: "#eda100", icono: <TrophyOutlined /> },
};

function ResumenGlobalCard({ label, value, suffix, color, icono }: { label: string; value: string | number; suffix?: string; color: string; icono: ReactNode }) {
  return (
    <Card style={{ border: BORDE, boxShadow: SOMBRA }} styles={{ body: { padding: 18 } }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <IconoBadge color={color} icono={icono} />
        <div>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {label}
          </Typography.Text>
          <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.3 }}>
            {value}
            {suffix && (
              <Typography.Text type="secondary" style={{ fontSize: 13, fontWeight: 400, marginLeft: 4 }}>
                {suffix}
              </Typography.Text>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

export function DashboardPage() {
  const navigate = useNavigate();
  const { data: unidades } = useUnidades();
  const { data: bastidores } = useBastidores();
  const { data: lotes } = useLotesActivos();

  const resumenPara = (clave: MacroEtapa) => {
    if (clave === "ovas") {
      const idsBastidor = new Set((bastidores ?? []).map((b) => b.id));
      const lotesEtapa = (lotes ?? []).filter((l) => l.bastidorId != null && idsBastidor.has(l.bastidorId));
      return { numUnidades: bastidores?.length ?? 0, numLotes: lotesEtapa.length, biomasa: null as number | null };
    }

    const unidadesEtapa = (unidades ?? []).filter((u) => unidadPerteneceA(clave, u));
    const idsUnidad = new Set(unidadesEtapa.map((u) => u.id));
    const lotesEtapa = (lotes ?? []).filter((l) => l.unidadProduccionId != null && idsUnidad.has(l.unidadProduccionId));
    const biomasa = lotesEtapa.reduce((acc, l) => acc + l.biomasaActualKg, 0);
    return { numUnidades: unidadesEtapa.length, numLotes: lotesEtapa.length, biomasa };
  };

  const resumenes = MACRO_ETAPAS.map((etapa) => ({ etapa, ...resumenPara(etapa.clave) }));
  const totalUnidades = (unidades?.length ?? 0) + (bastidores?.length ?? 0);
  const totalLotes = lotes?.length ?? 0;
  const totalBiomasa = resumenes.reduce((acc, r) => acc + (r.biomasa ?? 0), 0);

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <Typography.Title level={3} style={{ marginBottom: 4 }}>
            Producción
          </Typography.Title>
          <Typography.Text type="secondary">Resumen general de la piscigranja, por etapa productiva.</Typography.Text>
        </div>
        <Button icon={<BarChartOutlined />} onClick={() => navigate("/reporte-produccion")}>
          Evolución de la producción
        </Button>
      </div>

      <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
        <Col xs={24} sm={8}>
          <ResumenGlobalCard label="Unidades totales" value={totalUnidades} color="#2a78d6" icono={<ExperimentOutlined />} />
        </Col>
        <Col xs={24} sm={8}>
          <ResumenGlobalCard label="Lotes activos" value={totalLotes} color="#1baf7a" icono={<ThunderboltOutlined />} />
        </Col>
        <Col xs={24} sm={8}>
          <ResumenGlobalCard label="Biomasa total" value={totalBiomasa.toFixed(1)} suffix="kg" color="#eda100" icono={<TrophyOutlined />} />
        </Col>
      </Row>

      <Typography.Title level={5} style={{ margin: "28px 0 12px" }}>
        Por etapa
      </Typography.Title>
      <Row gutter={[16, 16]}>
        {resumenes.map(({ etapa, numUnidades, numLotes, biomasa }) => {
          const estilo = ESTILO_ETAPA[etapa.clave];
          return (
            <Col xs={24} sm={12} lg={6} key={etapa.clave}>
              <Card
                hoverable
                onClick={() => navigate(`/etapas/${etapa.clave}`)}
                style={{ border: BORDE, boxShadow: SOMBRA, height: "100%" }}
                styles={{ body: { padding: 18, display: "flex", flexDirection: "column", height: "100%" } }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <IconoBadge color={estilo.color} icono={estilo.icono} />
                  <div style={{ flex: 1 }}>
                    <Typography.Text strong style={{ fontSize: 15 }}>
                      {etapa.titulo}
                    </Typography.Text>
                    <div>
                      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                        {etapa.descripcion}
                      </Typography.Text>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 20, marginTop: 18 }}>
                  <MiniStat label="Unidades" value={numUnidades} />
                  <MiniStat label="Lotes activos" value={numLotes} />
                </div>
                {biomasa != null && (
                  <div style={{ marginTop: 12 }}>
                    <MiniStat label="Biomasa total" value={biomasa.toFixed(1)} suffix="kg" />
                  </div>
                )}

                <div style={{ flex: 1 }} />
                <div
                  style={{
                    marginTop: 16,
                    paddingTop: 12,
                    borderTop: BORDE,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    color: estilo.color,
                    fontSize: 13,
                    fontWeight: 500,
                  }}
                >
                  Ver detalle
                  <ArrowRightOutlined />
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>
    </>
  );
}
