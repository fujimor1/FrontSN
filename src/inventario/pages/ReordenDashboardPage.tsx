import {
  AlertOutlined,
  CheckCircleOutlined,
  DashboardOutlined,
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
  Statistic,
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

  const getSemaforoTag = (estado: EstadoStockReorden) => {
    switch (estado) {
      case "Critico":
        return (
          <Tag color="error" icon={<AlertOutlined />}>
            CRÍTICO (≤ SS)
          </Tag>
        );
      case "Reorden":
        return (
          <Tag color="warning" icon={<WarningOutlined />}>
            PEDIR (≤ ROP)
          </Tag>
        );
      case "Optimo":
        return (
          <Tag color="success" icon={<CheckCircleOutlined />}>
            ÓPTIMO
          </Tag>
        );
      case "Sobrestock":
        return <Tag color="blue">SOBRESTOCK</Tag>;
    }
  };

  const columnasPlan = [
    {
      title: "Alimento (Calibre)",
      dataIndex: "nombreAlimento",
      key: "nombreAlimento",
      render: (nombre: string, r: ParametrosReordenDto) => (
        <div>
          <strong>{nombre}</strong>
          <div style={{ fontSize: 12, color: "#888" }}>
            {r.marca} • {r.calibreMm} mm • {r.etapaSugerida}
          </div>
        </div>
      ),
    },
    {
      title: "Stock Actual (Kg)",
      dataIndex: "stockActualKg",
      key: "stockActualKg",
      render: (kg: number, r: ParametrosReordenDto) => (
        <div>
          <strong>{kg.toLocaleString()} kg</strong>
          <div style={{ fontSize: 12, color: "#888" }}>({r.stockActualSacosAprox} sacos)</div>
        </div>
      ),
    },
    {
      title: "Demanda Diaria (d)",
      dataIndex: "demandaDiariaPromedioKg",
      key: "demandaDiariaPromedioKg",
      render: (d: number) => `${d.toFixed(1)} kg/día`,
    },
    {
      title: "Stock Seguridad (SS)",
      dataIndex: "stockSeguridadKg",
      key: "stockSeguridadKg",
      render: (ss: number) => <Tag color="orange">{ss.toFixed(1)} kg</Tag>,
    },
    {
      title: "Punto Reorden (ROP)",
      dataIndex: "puntoReordenKg",
      key: "puntoReordenKg",
      render: (rop: number) => <strong>{rop.toFixed(1)} kg</strong>,
    },
    {
      title: "Lote Económico (EOQ)",
      dataIndex: "cantidadEconomicaPedidoEoqKg",
      key: "cantidadEconomicaPedidoEoqKg",
      render: (eoq: number, r: ParametrosReordenDto) => (
        <div>
          <span>{eoq.toFixed(0)} kg</span>
          <div style={{ fontSize: 11, color: "#1677ff" }}>({r.cantidadEconomicaPedidoEoqSacos} sacos)</div>
        </div>
      ),
    },
    {
      title: "Estado Semáforo",
      dataIndex: "estadoStock",
      key: "estadoStock",
      render: (e: EstadoStockReorden) => getSemaforoTag(e),
    },
    {
      title: "Días Stock",
      dataIndex: "diasStockRestante",
      key: "diasStockRestante",
      render: (d: number) => (
        <span style={{ color: d <= 5 ? "#cf1322" : d <= 15 ? "#fa8c16" : "#3f8600", fontWeight: 600 }}>
          {d} días
        </span>
      ),
    },
    {
      title: "Sugerencia de Compra",
      key: "sugerencia",
      render: (_: unknown, r: ParametrosReordenDto) =>
        r.sacosSugeridosPedir > 0 ? (
          <div>
            <Tag color="volcano" style={{ fontWeight: 600 }}>
              Pedir {r.sacosSugeridosPedir} sacos ({r.cantidadSugeridaPedirKg} kg)
            </Tag>
            <div style={{ fontSize: 12, color: "#cf1322" }}>
              Est. S/ {r.costoEstimadoPedido.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>
        ) : (
          <Tag color="green">Sin pedido urgente</Tag>
        ),
    },
  ];

  const columnasMlProyeccion = [
    {
      title: "Lote",
      dataIndex: "codigoLote",
      key: "codigoLote",
      render: (c: string) => <strong>{c}</strong>,
    },
    {
      title: "Etapa Actual",
      dataIndex: "etapaActual",
      key: "etapaActual",
      render: (e: string) => <Tag color="blue">{e}</Tag>,
    },
    {
      title: "Peces Vivos",
      dataIndex: "cantidadTotalPeces",
      key: "cantidadTotalPeces",
      render: (n: number) => n.toLocaleString(),
    },
    {
      title: "Peso Actual (g)",
      dataIndex: "pesoActual",
      key: "pesoActual",
      render: (g: number) => `${g.toFixed(1)} g`,
    },
    {
      title: "Temp. Agua Promedio",
      dataIndex: "temperaturaPromedioAguaC",
      key: "temperaturaPromedioAguaC",
      render: (t: number) => <Tag color="cyan">{t}°C</Tag>,
    },
    {
      title: "TGC Aplicado",
      dataIndex: "tgcAplicado",
      key: "tgcAplicado",
      render: (tgc: number) => tgc.toFixed(2),
    },
    {
      title: `Peso en ${diasProyeccionMl}d (ML)`,
      dataIndex: "pesoProyectadoGramos",
      key: "pesoProyectadoGramos",
      render: (p: number) => <strong style={{ color: "#1677ff" }}>{p.toFixed(1)} g</strong>,
    },
    {
      title: "Biomasa Proyectada",
      dataIndex: "biomasaProyectadaKg",
      key: "biomasaProyectadaKg",
      render: (b: number) => `${b.toLocaleString()} kg`,
    },
    {
      title: "Ración Requerida (Kg)",
      dataIndex: "racionEstimadaKg",
      key: "racionEstimadaKg",
      render: (r: number) => <strong style={{ color: "#3f8600" }}>{r.toLocaleString()} kg</strong>,
    },
    {
      title: "Calibre Pellet Sugerido",
      dataIndex: "calibreRecomendadoMm",
      key: "calibreRecomendadoMm",
      render: (c: string) => <Tag color="purple">{c}</Tag>,
    },
  ];

  const columnasBayes = [
    {
      title: "Parámetro Biométrico / Zootécnico",
      dataIndex: "parametro",
      key: "parametro",
      render: (p: string) => <strong>{p}</strong>,
    },
    {
      title: "Media A Priori (μ₀ / α₀)",
      dataIndex: "mediaPrior",
      key: "mediaPrior",
      render: (m: number) => m.toFixed(3),
    },
    {
      title: "Promedio Observado (x̄)",
      dataIndex: "promedioObservado",
      key: "promedioObservado",
      render: (obs: number) => `${obs.toFixed(3)}`,
    },
    {
      title: "N° Muestras (n)",
      dataIndex: "muestras",
      key: "muestras",
      render: (n: number) => `${n} mediciones`,
    },
    {
      title: "Media Calibrada A Posteriori (μ_post)",
      dataIndex: "mediaPosterior",
      key: "mediaPosterior",
      render: (post: number) => (
        <strong style={{ color: "#1677ff", fontSize: 15 }}>{post.toFixed(3)}</strong>
      ),
    },
    {
      title: "Intervalo de Confianza 95%",
      key: "ic95",
      render: (_: unknown, r: ActualizacionBayesianaDto) => (
        <Tag color="geekblue">
          [{r.limiteInferior95.toFixed(3)} - {r.limiteSuperior95.toFixed(3)}]
        </Tag>
      ),
    },
    {
      title: "Modelo Estadístico y Justificación",
      dataIndex: "interpretacion",
      key: "interpretacion",
      render: (t: string) => <span style={{ fontSize: 13, color: "#555" }}>{t}</span>,
    },
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <PageHeader
        title="Planificación de Reorden y Predicción de Demanda (ML)"
        subtitle="Optimización de inventario con Punto de Reorden (ROP), Stock de Seguridad (SS), Lote Económico (EOQ) y Coeficiente Térmico (TGC)"
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Alimentos en Estado Crítico"
              value={plan?.totalCriticos ?? 0}
              valueStyle={{ color: "#cf1322" }}
              prefix={<AlertOutlined />}
              suffix="calibres"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Alimentos en Punto de Reorden"
              value={plan?.totalEnReorden ?? 0}
              valueStyle={{ color: "#fa8c16" }}
              prefix={<WarningOutlined />}
              suffix="calibres"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Alimentos en Nivel Óptimo"
              value={plan?.totalOptimos ?? 0}
              valueStyle={{ color: "#3f8600" }}
              prefix={<CheckCircleOutlined />}
              suffix="calibres"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Inversión Sugerida de Compra"
              value={plan?.inversionSugeridaTotal ?? 0}
              precision={2}
              valueStyle={{ color: "#1677ff" }}
              prefix="S/"
            />
          </Card>
        </Col>
      </Row>

      <Tabs
        defaultActiveKey="reorden"
        items={[
          {
            key: "reorden",
            label: (
              <span>
                <DashboardOutlined />
                Matriz de Optimización de Reorden (ROP / SS / EOQ)
              </span>
            ),
            children: (
              <Card
                title="Monitoreo de Parámetros de Inventario por Tipo de Alimento"
                extra={
                  <Space>
                    <span>Nivel de Servicio (Z):</span>
                    <Select
                      value={nivelZ}
                      onChange={(val) => setNivelZ(val)}
                      options={[
                        { value: 1.65, label: "95% (Z = 1.65)" },
                        { value: 1.96, label: "97.5% (Z = 1.96)" },
                        { value: 2.33, label: "99% (Z = 2.33)" },
                      ]}
                      style={{ width: 150 }}
                    />
                  </Space>
                }
              >
                <Alert
                  type="info"
                  showIcon
                  message="Fórmulas zootécnicas y logísticas aplicadas"
                  description="Punto de Reorden: ROP = (d × L) + SS | Stock de Seguridad: SS = Z × σ_d × √L | Cantidad Económica: EOQ = √(2·D·S / H)"
                  style={{ marginBottom: 16 }}
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
              <span>
                <RobotOutlined />
                Motor Adaptativo de Machine Learning (TGC & Bayes)
              </span>
            ),
            children: (
              <Space direction="vertical" size="large" style={{ width: "100%" }}>
                <Card
                  title="Predicción de Crecimiento Térmico y Demanda de Alimento (TGC Grados-Día)"
                  extra={
                    <Space>
                      <span>Horizonte de Predicción:</span>
                      <Select
                        value={diasProyeccionMl}
                        onChange={(val) => setDiasProyeccionMl(val)}
                        options={[
                          { value: 15, label: "15 días" },
                          { value: 30, label: "30 días (1 mes)" },
                          { value: 60, label: "60 días (2 meses)" },
                          { value: 90, label: "90 días (3 meses)" },
                        ]}
                        style={{ width: 160 }}
                      />
                    </Space>
                  }
                >
                  <Alert
                    type="success"
                    showIcon
                    message="Modelo Grados-Día (TGC): W_f^(1/3) = W_i^(1/3) + (TGC × Σ T / 1000)"
                    description="Calcula el crecimiento exponencial dependiente de la temperatura real del agua y pronostica el volumen exacto de pellet a requerir."
                    style={{ marginBottom: 16 }}
                  />

                  <Table<ProyeccionTgcDto>
                    columns={columnasMlProyeccion}
                    dataSource={mlData?.proyeccionesLotesActivos ?? []}
                    rowKey="loteId"
                    loading={cargandoMl}
                    pagination={false}
                  />
                </Card>

                <Card title="Auto-Calibración Bayesiana de Parámetros entre Campañas">
                  <Alert
                    type="info"
                    showIcon
                    message="Actualización Bayesiana Conjugada: Normal-Normal para variables continuas y Beta-Binomial para tasas"
                    description="El sistema combina el conocimiento estándar previo (FONDEPES) con los datos reales observados de Sierra Nevada, evitando sobreajuste con muestras pequeñas."
                    style={{ marginBottom: 16 }}
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
