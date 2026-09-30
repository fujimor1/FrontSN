import { InboxOutlined, SaveOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Table,
  message,
} from "antd";
import dayjs from "dayjs";
import { useState } from "react";
import type { LoteAlimento } from "../../api/types";
import { PageHeader } from "../../produccion/components/PageHeader";
import {
  useLotesAlimento,
  useProveedores,
  useRegistrarIngresoAlimento,
  useTiposAlimento,
} from "../hooks/useInventario";

export function RecepcionAlimentoPage() {
  const { data: tipos } = useTiposAlimento();
  const { data: proveedores } = useProveedores();
  const { data: lotes, isLoading: cargandoLotes } = useLotesAlimento();
  const registrarIngreso = useRegistrarIngresoAlimento();
  const [form] = Form.useForm();
  const [calculoTotalKg, setCalculoTotalKg] = useState(1000);
  const [calculoCostoTotal, setCalculoCostoTotal] = useState(6500);

  const actualizarTotales = () => {
    const sacos = form.getFieldValue("cantidadSacos") || 0;
    const pesoSaco = form.getFieldValue("pesoPorSacoKg") || 25;
    const precioKg = form.getFieldValue("precioUnitarioKg") || 0;

    const totalKg = sacos * pesoSaco;
    setCalculoTotalKg(totalKg);
    setCalculoCostoTotal(totalKg * precioKg);
  };

  const handleFinish = async (values: {
    tipoAlimentoId: number;
    proveedorId: number;
    codigoLoteFabrica: string;
    fechaFabricacion?: dayjs.Dayjs;
    fechaVencimiento: dayjs.Dayjs;
    pesoPorSacoKg: number;
    cantidadSacos: number;
    precioUnitarioKg: number;
    observaciones?: string;
  }) => {
    try {
      await registrarIngreso.mutateAsync({
        tipoAlimentoId: values.tipoAlimentoId,
        proveedorId: values.proveedorId,
        codigoLoteFabrica: values.codigoLoteFabrica,
        fechaFabricacion: values.fechaFabricacion?.format("YYYY-MM-DD"),
        fechaVencimiento: values.fechaVencimiento.format("YYYY-MM-DD"),
        pesoPorSacoKg: values.pesoPorSacoKg,
        cantidadSacos: values.cantidadSacos,
        precioUnitarioKg: values.precioUnitarioKg,
        observaciones: values.observaciones,
      });

      message.success("Recepción de alimento registrada en almacén y Kardex actualizado exitosamente.");
      form.resetFields();
      setCalculoTotalKg(0);
      setCalculoCostoTotal(0);
    } catch {
      message.error("Error al registrar el ingreso de alimento.");
    }
  };

  const columns = [
    {
      title: "Lote Fábrica",
      dataIndex: "codigoLoteFabrica",
      key: "codigoLoteFabrica",
      render: (text: string) => <strong style={{ color: "#0f172a" }}>{text}</strong>,
    },
    {
      title: "Alimento",
      dataIndex: "tipoAlimentoId",
      key: "tipoAlimentoId",
      render: (id: number) => {
        const t = tipos?.find((x) => x.id === id);
        return t ? (
          <div>
            <div style={{ fontWeight: 600, color: "#0f172a" }}>{t.nombre}</div>
            <div style={{ fontSize: 14, color: "#334155" }}>{t.marca} • {t.calibreMm} mm</div>
          </div>
        ) : (
          `ID ${id}`
        );
      },
    },
    {
      title: "Proveedor",
      dataIndex: "proveedorId",
      key: "proveedorId",
      render: (id: number) => {
        const p = proveedores?.find((x) => x.id === id);
        return <span style={{ color: "#334155" }}>{p?.razonSocial ?? `ID ${id}`}</span>;
      },
    },
    {
      title: "Vencimiento",
      dataIndex: "fechaVencimiento",
      key: "fechaVencimiento",
      align: "center" as const,
      render: (f: string) => {
        const venc = dayjs(f);
        const dias = venc.diff(dayjs(), "day");
        const bg = dias < 30 ? "#fef2f2" : dias < 60 ? "#fffbeb" : "#f0fdf4";
        const color = dias < 30 ? "#dc2626" : dias < 60 ? "#d97706" : "#16a34a";
        return (
          <Space size="small">
            <span style={{ fontSize: 14, color: "#0f172a" }}>{f}</span>
            <span style={{ backgroundColor: bg, color: color, fontSize: 14, fontWeight: 600, padding: "2px 8px", borderRadius: 9999 }}>
              {dias}d
            </span>
          </Space>
        );
      },
    },
    {
      title: "Sacos",
      dataIndex: "cantidadSacosActuales",
      key: "cantidadSacosActuales",
      align: "right" as const,
      render: (s: number, r: LoteAlimento) => (
        <span style={{ color: "#334155", fontWeight: 500 }}>
          {s} / {r.cantidadSacosIngresados} sacos
        </span>
      ),
    },
    {
      title: "Stock Actual",
      dataIndex: "stockKgActual",
      key: "stockKgActual",
      align: "right" as const,
      render: (kg: number) => <strong style={{ color: "#0f172a", fontSize: 14 }}>{kg.toLocaleString()} kg</strong>,
    },
    {
      title: "Precio / Kg",
      dataIndex: "precioUnitarioKg",
      key: "precioUnitarioKg",
      align: "right" as const,
      render: (p: number) => <span style={{ color: "#2563eb", fontWeight: 600 }}>S/ {p.toFixed(2)}</span>,
    },
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <PageHeader
        title="Recepción de Alimento en Almacén"
        subtitle="Ingreso de compras, registro de lotes de fábrica, fecha de caducidad y actualización de Kardex"
      />

      <Row gutter={[20, 20]}>
        <Col xs={24} lg={10}>
          <Card
            title={
              <Space>
                <div style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", color: "#2563eb" }}>
                  <InboxOutlined />
                </div>
                <span>Registrar Entrada de Compra</span>
              </Space>
            }
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleFinish}
              onValuesChange={actualizarTotales}
              initialValues={{
                pesoPorSacoKg: 25,
                cantidadSacos: 40,
                precioUnitarioKg: 6.5,
              }}
            >
              <Form.Item name="tipoAlimentoId" label="Tipo de Alimento" rules={[{ required: true, message: "Selecciona el alimento" }]}>
                <Select size="large" placeholder="Selecciona el tipo de alimento"
                  options={tipos?.map((t) => ({
                    value: t.id,
                    label: `${t.nombre} - ${t.marca} (${t.calibreMm} mm)`,
                  }))}
                />
              </Form.Item>

              <Form.Item name="proveedorId" label="Proveedor" rules={[{ required: true, message: "Selecciona el proveedor" }]}>
                <Select size="large" placeholder="Selecciona el proveedor"
                  options={proveedores?.map((p) => ({
                    value: p.id,
                    label: `${p.razonSocial} (RUC: ${p.ruc})`,
                  }))}
                />
              </Form.Item>

              <Form.Item
                name="codigoLoteFabrica"
                label="Código / Lote del Fabricante"
                rules={[{ required: true, message: "Ingresa el lote del saco" }]}
              >
                <Input size="large" placeholder="Ej. LOT-NICO-2026-09A" />
              </Form.Item>

              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item name="fechaFabricacion" label="Fecha Fabricación">
                    <DatePicker size="large" style={{ width: "100%" }} format="YYYY-MM-DD" placeholder="Seleccionar" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="fechaVencimiento"
                    label="Fecha Caducidad"
                    rules={[{ required: true, message: "Selecciona la fecha de vencimiento" }]}
                  >
                    <DatePicker size="large" style={{ width: "100%" }} format="YYYY-MM-DD" placeholder="Seleccionar" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={12}>
                <Col span={8}>
                  <Form.Item name="pesoPorSacoKg" label="Peso/Saco (Kg)" rules={[{ required: true }]}>
                    <InputNumber size="large" min={1} style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="cantidadSacos" label="N° Sacos" rules={[{ required: true }]}>
                    <InputNumber size="large" min={1} style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="precioUnitarioKg" label="Precio S/ por Kg" rules={[{ required: true }]}>
                    <InputNumber size="large" min={0.1} step={0.1} style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
              </Row>

              <div
                style={{
                  marginBottom: 20,
                  padding: "14px 16px",
                  backgroundColor: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  borderRadius: 10,
                }}
              >
                <Row justify="space-between" align="middle">
                  <Col>
                    <div style={{ fontSize: 14, color: "#15803d", fontWeight: 600, textTransform: "uppercase" }}>Total Ingreso</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#166534" }}>{calculoTotalKg.toLocaleString()} kg</div>
                  </Col>
                  <Col style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 14, color: "#15803d", fontWeight: 600, textTransform: "uppercase" }}>Valorizado</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#166534" }}>
                      S/ {calculoCostoTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                  </Col>
                </Row>
              </div>

              <Form.Item name="observaciones" label="Observaciones / N° Guía / Factura">
                <Input.TextArea rows={2} placeholder="N° de Guía de Remisión o Factura" />
              </Form.Item>

              <Button
                type="primary"
                icon={<SaveOutlined />}
                htmlType="submit"
                loading={registrarIngreso.isPending}
                block
                size="large"
                style={{ height: 44, borderRadius: 10, fontWeight: 600 }}
              >
                Registrar Ingreso en Kardex
              </Button>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={14}>
          <Card title="Lotes de Alimento Disponibles en Almacén">
            <Table<LoteAlimento>
              columns={columns}
              dataSource={lotes ?? []}
              rowKey="id"
              loading={cargandoLotes}
              pagination={{ pageSize: 8 }}
            />
          </Card>
        </Col>
      </Row>
    </Space>
  );
}
