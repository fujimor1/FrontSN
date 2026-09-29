import { HeartOutlined, RiseOutlined, SkinOutlined, TrophyOutlined } from "@ant-design/icons";
import { Card, Col, Row, Typography } from "antd";
import { PageHeader } from "../components/PageHeader";
import { ResumenEtapasEvolucion, type FilaResumenEtapa } from "../components/ResumenEtapasEvolucion";
import { BORDE, IconoBadge, SOMBRA } from "../components/Stat";
import { useReporteProduccionGlobal } from "../hooks/useReportes";

function TarjetaTotal({ label, value, suffix, color, icono }: { label: string; value: string; suffix?: string; color: string; icono: React.ReactNode }) {
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

export function ReporteProduccionPage() {
  const { data: reporte, isLoading } = useReporteProduccionGlobal();

  return (
    <>
      <PageHeader
        title="Evolución de la producción"
        subtitle="Detalle consolidado de todos los lotes activos: alimento, mortalidad y tiempo de crecimiento por etapa."
        backTo="/"
      />

      {reporte && (
        <>
          <Row gutter={[16, 16]} style={{ marginBottom: 28 }}>
            <Col xs={12} sm={8} lg={4}>
              <TarjetaTotal label="Peces sembrados" value={reporte.totalPecesSembrados.toLocaleString("es-PE")} color="#2a78d6" icono={<RiseOutlined />} />
            </Col>
            <Col xs={12} sm={8} lg={4}>
              <TarjetaTotal label="Peces vivos hoy" value={reporte.totalPecesVivos.toLocaleString("es-PE")} color="#1baf7a" icono={<HeartOutlined />} />
            </Col>
            <Col xs={12} sm={8} lg={4}>
              <TarjetaTotal label="Mortalidad total" value={reporte.totalMortalidad.toLocaleString("es-PE")} color="#d03b3b" icono={<HeartOutlined />} />
            </Col>
            <Col xs={12} sm={8} lg={4}>
              <TarjetaTotal
                label="Supervivencia"
                value={(reporte.porcentajeSupervivencia * 100).toFixed(1)}
                suffix="%"
                color="#1baf7a"
                icono={<HeartOutlined />}
              />
            </Col>
            <Col xs={12} sm={8} lg={4}>
              <TarjetaTotal label="Biomasa total" value={reporte.biomasaTotalActualKg.toFixed(1)} suffix="kg" color="#eda100" icono={<TrophyOutlined />} />
            </Col>
            <Col xs={12} sm={8} lg={4}>
              <TarjetaTotal
                label="Alimento total"
                value={(
                  reporte.porEtapaFondepes.reduce((a, e) => a + e.alimentoTotalKg, 0)
                ).toFixed(1)}
                suffix="kg"
                color="#8b5cf6"
                icono={<SkinOutlined />}
              />
            </Col>
          </Row>

          <ResumenEtapasEvolucion
            titulo="Por etapa — marco FONDEPES"
            descripcion='Alimento total por etapa (arriba) y, por cada etapa, cuántos lotes pasaron, cuántas bajas hubo y cómo se comparan los días reales contra el rango esperado del protocolo. Los días solo cuentan los tramos ya terminados.'
            colorMarco="#2a78d6"
            isLoading={isLoading}
            filas={reporte.porEtapaFondepes.map(
              (r): FilaResumenEtapa => ({
                nombre: r.etapa,
                lotes: r.cantidadLotesQuePasaron,
                alimentoKg: r.alimentoTotalKg,
                mortalidad: r.mortalidadTotal,
                diasPromedio: r.diasPromedio,
                diasMin: r.diasMin,
                diasMax: r.diasMax,
                esperadoMin: r.diasEsperadosMinFondepes,
                esperadoMax: r.diasEsperadosMaxFondepes,
              }),
            )}
          />

          <ResumenEtapasEvolucion
            titulo="Por tramo de dieta — marco Sierra Nevada"
            descripcion='Mismo desglose, usando los tramos de dieta de Sierra Nevada (definidos por talla, no por una acción explícita de "cambiar de tramo" en el sistema).'
            colorMarco="#eb6834"
            isLoading={isLoading}
            filas={reporte.porTramoSierraNevada.map(
              (r): FilaResumenEtapa => ({
                nombre: r.tramo,
                lotes: r.cantidadLotesQuePasaron,
                alimentoKg: r.alimentoTotalKg,
                mortalidad: r.mortalidadTotal,
                diasPromedio: r.diasPromedio,
                diasMin: r.diasMin,
                diasMax: r.diasMax,
                esperadoMin: r.diasEsperados != null ? r.diasEsperados * 0.8 : null,
                esperadoMax: r.diasEsperados != null ? r.diasEsperados * 1.2 : null,
              }),
            )}
          />
        </>
      )}

      {!reporte && !isLoading && (
        <Typography.Text type="secondary">Todavía no hay lotes activos para reportar.</Typography.Text>
      )}
    </>
  );
}
