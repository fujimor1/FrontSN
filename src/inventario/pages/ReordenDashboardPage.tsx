import {
  AlertOutlined,
  CheckCircleOutlined,
  DashboardOutlined,
  DollarOutlined,
  InfoCircleOutlined,
  RobotOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Card,
  Col,
  Row,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
} from "antd";
import { useState } from "react";
import type {
  ActualizacionBayesianaDto,
  EstadoStockReorden,
  ParametrosReordenDto,
  ProyeccionTgcDto,
} from "../../api/types";
import { PageHeader } from "../../produccion/components/PageHeader";
import { useMotorMlDashboard, usePlanReorden } from "../hooks/useInventario";

export function ReordenDashboardPage() {
  const [nivelZ, setNivelZ] = useState<number>(1.65); // 95%
  const [diasProyeccionMl, setDiasProyeccionMl] = useState<number>(30);

  const { data: plan, isLoading: cargandoPlan } = usePlanReorden(nivelZ, 60);
  const { data: mlData, isLoading: cargandoMl } = useMotorMlDashboard(diasProyeccionMl);

  const getSemaforoPill = (estado: EstadoStockReorden) => {
    switch (estado) {
      case "Critico":
        return (
          <span
            style={{
              backgroundColor: "#fef2f2",
              color: "#dc2626",
              border: "1px solid #fee2e2",
              borderRadius: 9999,
              padding: "4px 12px",
              fontSize: 12,
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <AlertOutlined style={{ fontSize: 11 }} /> CRÍTICO (≤ SS)
          </span>
        );
      case "Reorden":
        return (
          <span
            style={{
              backgroundColor: "#fffbeb",
              color: "#d97706",
              border: "1px solid #fef3c7",
              borderRadius: 9999,
              padding: "4px 12px",
              fontSize: 12,
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <WarningOutlined style={{ fontSize: 11 }} /> REORDENAR (≤ ROP)
          </span>
        );
      case "Optimo":
        return (
          <span
            style={{
              backgroundColor: "#f0fdf4",
              color: "#16a34a",
              border: "1px solid #dcfce7",
              borderRadius: 9999,
              padding: "4px 12px",
              fontSize: 12,
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <CheckCircleOutlined style={{ fontSize: 11 }} /> ÓPTIMO
          </span>
        );
      case "Sobrestock":
        return (
          <span
            style={{
              backgroundColor: "#eff6ff",
              color: "#2563eb",
              border: "1px solid #dbeafe",
              borderRadius: 9999,
              padding: "4px 12px",
              fontSize: 12,
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            SOBRESTOCK
          </span>
        );
    }
  };

  const columnasPlan = [
    {
      title: "Alimento (Calibre)",
      dataIndex: "nombreAlimento",
      key: "nombreAlimento",
      render: (nombre: string, r: ParametrosReordenDto) => (
        <div>
          <div style={{ fontWeight: 600, color: "#0f172a" }}>{nombre}</div>
          <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
            <Tag color="default" style={{ borderRadius: 6, fontSize: 11, padding: "1px 6px" }}>{r.marca}</Tag>
            <span>{r.calibreMm} mm • {r.etapaSugerida}</span>
          </div>
        </div>
      ),
    },
    {
      title: "Stock Actual",
      dataIndex: "stockActualKg",
      key: "stockActualKg",
      align: "right" as const,
      render: (kg: number, r: ParametrosReordenDto) => (
        <div style={{ textAlign: "right" }}>
          <strong style={{ fontSize: 14, color: "#0f172a" }}>{kg.toLocaleString()} kg</strong>
          <div style={{ fontSize: 11, color: "#64748b" }}>~{r.stockActualSacosAprox} sacos (25kg)</div>
        </div>
      ),
    },
    {
      title: "Demanda Diaria (d)",
      dataIndex: "demandaDiariaPromedioKg",
      key: "demandaDiariaPromedioKg",
      align: "right" as const,
      render: (d: number) => <span style={{ color: "#334155", fontWeight: 500 }}>{d.toFixed(1)} kg/d</span>,
    },
    {
      title: "Stock Seguridad (SS)",
      dataIndex: "stockSeguridadKg",
      key: "stockSeguridadKg",
      align: "right" as const,
      render: (ss: number) => (
        <span style={{ color: "#d97706", fontWeight: 600, backgroundColor: "#fffbeb", padding: "2px 8px", borderRadius: 6 }}>
          {ss.toFixed(1)} kg
        </span>
      ),
    },
    {
      title: "Punto Reorden (ROP)",
      dataIndex: "puntoReordenKg",
      key: "puntoReordenKg",
      align: "right" as const,
      render: (rop: number) => (
        <span style={{ color: "#0f172a", fontWeight: 700, backgroundColor: "#f1f5f9", padding: "2px 8px", borderRadius: 6 }}>
          {rop.toFixed(1)} kg
        </span>
      ),
    },
    {
      title: "Lote Económico (EOQ)",
      dataIndex: "cantidadEconomicaPedidoEoqKg",
      key: "cantidadEconomicaPedidoEoqKg",
      align: "right" as const,
      render: (eoq: number, r: ParametrosReordenDto) => (
        <div style={{ textAlign: "right" }}>
          <span style={{ color: "#2563eb", fontWeight: 600 }}>{eoq.toFixed(0)} kg</span>
          <div style={{ fontSize: 11, color: "#64748b" }}>({r.cantidadEconomicaPedidoEoqSacos} sacos)</div>
        </div>
      ),
    },
    {
      title: "Estado Semáforo",
      dataIndex: "estadoStock",
      key: "estadoStock",
      align: "center" as const,
      render: (e: EstadoStockReorden) => getSemaforoPill(e),
    },
    {
      title: "Días Stock",
      dataIndex: "diasStockRestante",
      key: "diasStockRestante",
      align: "center" as const,
      render: (d: number) => {
        const bg = d <= 5 ? "#fef2f2" : d <= 15 ? "#fffbeb" : "#f0fdf4";
        const color = d <= 5 ? "#dc2626" : d <= 15 ? "#d97706" : "#16a34a";
        return (
          <span style={{ backgroundColor: bg, color: color, fontWeight: 700, padding: "3px 10px", borderRadius: 9999, fontSize: 12 }}>
            {d} días
          </span>
        );
      },
    },
    {
      title: "Sugerencia de Pedido",
      key: "sugerencia",
      render: (_: unknown, r: ParametrosReordenDto) =>
        r.sacosSugeridosPedir > 0 ? (
          <div>
            <span
              style={{
                backgroundColor: "#fff1f2",
                color: "#e11d48",
                border: "1px solid #ffe4e6",
                borderRadius: 8,
                padding: "4px 10px",
                fontSize: 12,
                fontWeight: 600,
                display: "inline-block",
              }}
            >
              Pedir {r.sacosSugeridosPedir} sacos ({r.cantidadSugeridaPedirKg} kg)
            </span>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 3 }}>
              Costo Est.: <strong>S/ {r.costoEstimadoPedido.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
            </div>
          </div>
        ) : (
          <span style={{ color: "#16a34a", fontSize: 12, fontWeight: 500, backgroundColor: "#f0fdf4", padding: "3px 8px", borderRadius: 6 }}>
            ✓ Stock cubierto
          </span>
        ),
    },
  ];

  const columnasMlProyeccion = [
    {
      title: "Lote de Truchas",
      dataIndex: "codigoLote",
      key: "codigoLote",
      render: (c: string) => <strong style={{ color: "#0f172a" }}>{c}</strong>,
    },
    {
      title: "Etapa Actual",
      dataIndex: "etapaActual",
      key: "etapaActual",
      render: (e: string) => (
        <span style={{ backgroundColor: "#eff6ff", color: "#1d4ed8", padding: "2px 8px", borderRadius: 6, fontSize: 12, fontWeight: 500 }}>
          {e}
        </span>
      ),
    },
    {
      title: "Peces Vivos",
      dataIndex: "cantidadTotalPeces",
      key: "cantidadTotalPeces",
      align: "right" as const,
      render: (n: number) => n.toLocaleString(),
    },
    {
      title: "Peso Actual",
      dataIndex: "pesoActual",
      key: "pesoActual",
      align: "right" as const,
      render: (g: number) => `${g.toFixed(1)} g`,
    },
    {
      title: "Temp. Agua",
      dataIndex: "temperaturaPromedioAguaC",
      key: "temperaturaPromedioAguaC",
      align: "center" as const,
      render: (t: number) => (
        <span style={{ backgroundColor: "#ecfeff", color: "#0891b2", padding: "2px 8px", borderRadius: 6, fontWeight: 600, fontSize: 12 }}>
          {t}°C
        </span>
      ),
    },
    {
      title: `Peso en ${diasProyeccionMl}d (TGC)`,
      dataIndex: "pesoProyectadoGramos",
      key: "pesoProyectadoGramos",
      align: "right" as const,
      render: (p: number) => <strong style={{ color: "#2563eb", fontSize: 14 }}>{p.toFixed(1)} g</strong>,
    },
    {
      title: "Biomasa Proyectada",
      dataIndex: "biomasaProyectadaKg",
      key: "biomasaProyectadaKg",
      align: "right" as const,
      render: (b: number) => `${b.toLocaleString()} kg`,
    },
    {
      title: "Ración Prevista (Kg)",
      dataIndex: "racionEstimadaKg",
      key: "racionEstimadaKg",
      align: "right" as const,
      render: (r: number) => (
        <span style={{ color: "#16a34a", fontWeight: 700, backgroundColor: "#f0fdf4", padding: "3px 10px", borderRadius: 6 }}>
          {r.toLocaleString()} kg
        </span>
      ),
    },
    {
      title: "Pellet Sugerido",
      dataIndex: "calibreRecomendadoMm",
      key: "calibreRecomendadoMm",
      render: (c: string) => (
        <span style={{ backgroundColor: "#faf5ff", color: "#7e22ce", padding: "2px 8px", borderRadius: 6, fontSize: 12, fontWeight: 500 }}>
          {c}
        </span>
      ),
    },
  ];

  const columnasBayes = [
    {
      title: "Parámetro Biométrico / Zootécnico",
      dataIndex: "parametro",
      key: "parametro",
      render: (p: string) => <strong style={{ color: "#0f172a" }}>{p}</strong>,
    },
    {
      title: "A Priori (FONDEPES μ₀)",
      dataIndex: "mediaPrior",
      key: "mediaPrior",
      align: "right" as const,
      render: (m: number) => m.toFixed(3),
    },
    {
      title: "Observado Sierra Nevada (x̄)",
      dataIndex: "promedioObservado",
      key: "promedioObservado",
      align: "right" as const,
      render: (obs: number) => `${obs.toFixed(3)}`,
    },
    {
      title: "Muestras (n)",
      dataIndex: "muestras",
      key: "muestras",
      align: "right" as const,
      render: (n: number) => `${n} mediciones`,
    },
    {
      title: "A Posteriori Calibrado (μ_post)",
      dataIndex: "mediaPosterior",
      key: "mediaPosterior",
      align: "right" as const,
      render: (post: number) => (
        <span style={{ color: "#2563eb", fontWeight: 700, fontSize: 14, backgroundColor: "#eff6ff", padding: "3px 10px", borderRadius: 6 }}>
          {post.toFixed(3)}
        </span>
      ),
    },
    {
      title: "Intervalo Confianza 95%",
      key: "ic95",
      align: "center" as const,
      render: (_: unknown, r: ActualizacionBayesianaDto) => (
        <span style={{ backgroundColor: "#f1f5f9", color: "#334155", padding: "2px 8px", borderRadius: 6, fontSize: 12, fontFamily: "monospace" }}>
          [{r.limiteInferior95.toFixed(3)} - {r.limiteSuperior95.toFixed(3)}]
        </span>
      ),
    },
    {
      title: "Modelo Estadístico",
      dataIndex: "interpretacion",
      key: "interpretacion",
      render: (t: string) => <span style={{ fontSize: 12, color: "#64748b" }}>{t}</span>,
    },
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <PageHeader
        title="Planificación de Reorden y Predicción de Demanda (ML)"
        subtitle="Optimización de compras con Punto de Reorden (ROP), Stock de Seguridad (SS), Lote Económico (EOQ) y Coeficiente Térmico (TGC)"
      />

      {/* KPI Metric Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <div className="sn-metric-box" style={{ borderTop: "3px solid #dc2626" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>Alimentos Críticos</span>
              <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", color: "#dc2626" }}>
                <AlertOutlined />
              </div>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#0f172a" }}>
              {plan?.totalCriticos ?? 0} <span style={{ fontSize: 13, fontWeight: 500, color: "#64748b" }}>calibres</span>
            </div>
            <div style={{ fontSize: 12, color: "#dc2626", marginTop: 4 }}>
              Stock ≤ Stock de Seguridad
            </div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div className="sn-metric-box" style={{ borderTop: "3px solid #d97706" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>En Punto de Reorden</span>
              <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: "#fffbeb", display: "flex", alignItems: "center", justifyContent: "center", color: "#d97706" }}>
                <WarningOutlined />
              </div>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#0f172a" }}>
              {plan?.totalEnReorden ?? 0} <span style={{ fontSize: 13, fontWeight: 500, color: "#64748b" }}>calibres</span>
            </div>
            <div style={{ fontSize: 12, color: "#d97706", marginTop: 4 }}>
              Stock ≤ Punto de Reorden (ROP)
            </div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div className="sn-metric-box" style={{ borderTop: "3px solid #16a34a" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>En Nivel Óptimo</span>
              <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", color: "#16a34a" }}>
                <CheckCircleOutlined />
              </div>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#0f172a" }}>
              {plan?.totalOptimos ?? 0} <span style={{ fontSize: 13, fontWeight: 500, color: "#64748b" }}>calibres</span>
            </div>
            <div style={{ fontSize: 12, color: "#16a34a", marginTop: 4 }}>
              Nivel de servicio garantizado
            </div>
          </div>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <div className="sn-metric-box" style={{ borderTop: "3px solid #2563eb" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>Inversión Sugerida</span>
              <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", color: "#2563eb" }}>
                <DollarOutlined />
              </div>
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#0f172a" }}>
              S/ {(plan?.inversionSugeridaTotal ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: 12, color: "#2563eb", marginTop: 4 }}>
              Cálculo óptimo por Wilson (EOQ)
            </div>
          </div>
        </Col>
      </Row>

      <Tabs
        defaultActiveKey="reorden"
        items={[
          {
            key: "reorden",
            label: (
              <span style={{ fontWeight: 600, fontSize: 14 }}>
                <DashboardOutlined /> Matriz de Optimización de Reorden (ROP / SS / EOQ)
              </span>
            ),
            children: (
              <Card
                title="Monitoreo y Alertas de Stock de Alimento Balanceado"
                extra={
                  <Space>
                    <span style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>Nivel de Servicio (Z):</span>
                    <Select
                      value={nivelZ}
                      onChange={(val) => setNivelZ(val)}
                      options={[
                        { value: 1.65, label: "95% de confianza (Z = 1.65)" },
                        { value: 1.96, label: "97.5% de confianza (Z = 1.96)" },
                        { value: 2.33, label: "99% de confianza (Z = 2.33)" },
                      ]}
                      style={{ width: 210 }}
                    />
                  </Space>
                }
              >
                <Alert
                  type="info"
                  showIcon
                  icon={<InfoCircleOutlined style={{ color: "#2563eb" }} />}
                  message="Modelo Matemático y Logístico Aplicado (Objetivo Específico #2 de la Tesis)"
                  description="Punto de Reorden: ROP = (d × L) + SS  |  Stock de Seguridad: SS = Z × σ_d × √L  |  Lote Económico de Compra: EOQ = √(2·D·S / H)"
                  style={{ marginBottom: 20, borderRadius: 10, backgroundColor: "#eff6ff", borderColor: "#bfdbfe" }}
                />

                <Table<ParametrosReordenDto>
                  columns={columnasPlan}
                  dataSource={plan?.items ?? []}
                  rowKey="tipoAlimentoId"
                  loading={cargandoPlan}
                  pagination={false}
                />
              </Card>
            ),
          },
          {
            key: "ml",
            label: (
              <span style={{ fontWeight: 600, fontSize: 14 }}>
                <RobotOutlined /> Motor Adaptativo de Machine Learning (TGC & Bayes)
              </span>
            ),
            children: (
              <Space direction="vertical" size="large" style={{ width: "100%" }}>
                <Card
                  title="Predicción de Crecimiento Térmico y Demanda de Alimento (TGC Grados-Día)"
                  extra={
                    <Space>
                      <span style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>Horizonte:</span>
                      <Select
                        value={diasProyeccionMl}
                        onChange={(val) => setDiasProyeccionMl(val)}
                        options={[
                          { value: 15, label: "15 días futuros" },
                          { value: 30, label: "30 días (1 mes)" },
                          { value: 60, label: "60 días (2 meses)" },
                          { value: 90, label: "90 días (3 meses)" },
                        ]}
                        style={{ width: 170 }}
                      />
                    </Space>
                  }
                >
                  <Alert
                    type="success"
                    showIcon
                    message="Modelo Grados-Día Térmico: W_f^(1/3) = W_i^(1/3) + (TGC × Σ T / 1000)"
                    description="Pronostica la ganancia de peso y ración requerida ajustada por la temperatura diaria del agua en piscigranja andina."
                    style={{ marginBottom: 20, borderRadius: 10, backgroundColor: "#f0fdf4", borderColor: "#bbf7d0" }}
                  />

                  <Table<ProyeccionTgcDto>
                    columns={columnasMlProyeccion}
                    dataSource={mlData?.proyeccionesLotesActivos ?? []}
                    rowKey="loteId"
                    loading={cargandoMl}
                    pagination={false}
                  />
                </Card>

                <Card title="Auto-Calibración Bayesiana de Parámetros Inter-Campaña">
                  <Alert
                    type="info"
                    showIcon
                    message="Actualización Bayesiana Conjugada: Normal-Normal para variables continuas y Beta-Binomial para tasas"
                    description="Permite que el sistema aprenda campaña tras campaña sin sobreajuste con muestras pequeñas, convergiendo progresivamente al comportamiento real de Sierra Nevada."
                    style={{ marginBottom: 20, borderRadius: 10, backgroundColor: "#eff6ff", borderColor: "#bfdbfe" }}
                  />

                  <Table<ActualizacionBayesianaDto>
                    columns={columnasBayes}
                    dataSource={mlData?.parametrosCalibradosBayes ?? []}
                    rowKey="parametro"
                    loading={cargandoMl}
                    pagination={false}
                  />
                </Card>
              </Space>
            ),
          },
        ]}
      />
    </Space>
  );
}
