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
  Tag,
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
  const [calculoTotalKg, setCalculoTotalKg] = useState(0);
  const [calculoCostoTotal, setCalculoCostoTotal] = useState(0);

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
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: "Alimento",
      dataIndex: "tipoAlimentoId",
      key: "tipoAlimentoId",
      render: (id: number) => {
        const t = tipos?.find((x) => x.id === id);
        return t ? `${t.nombre} (${t.marca})` : `ID ${id}`;
      },
    },
    {
      title: "Proveedor",
      dataIndex: "proveedorId",
      key: "proveedorId",
      render: (id: number) => {
        const p = proveedores?.find((x) => x.id === id);
        return p?.razonSocial ?? `ID ${id}`;
      },
    },
    {
      title: "Vencimiento",
      dataIndex: "fechaVencimiento",
      key: "fechaVencimiento",
      render: (f: string) => {
        const venc = dayjs(f);
        const dias = venc.diff(dayjs(), "day");
        const color = dias < 30 ? "red" : dias < 60 ? "orange" : "green";
        return (
          <Space>
            <span>{f}</span>
            <Tag color={color}>{dias} días</Tag>
          </Space>
        );
      },
    },
    {
      title: "Sacos Actuales",
      dataIndex: "cantidadSacosActuales",
      key: "cantidadSacosActuales",
      render: (s: number, r: LoteAlimento) => `${s} / ${r.cantidadSacosIngresados} sacos`,
    },
    {
      title: "Stock Actual (Kg)",
      dataIndex: "stockKgActual",
      key: "stockKgActual",
      render: (kg: number) => <strong>{kg.toLocaleString()} kg</strong>,
    },
    {
      title: "Precio / Kg",
      dataIndex: "precioUnitarioKg",
      key: "precioUnitarioKg",
      render: (p: number) => `S/ ${p.toFixed(2)}`,
    },
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <PageHeader
        title="Recepción de Alimento en Almacén"
        subtitle="Ingreso de compras, registro de lotes de fábrica, fecha de caducidad y actualización de Kardex"
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={10}>
          <Card title={<Space><InboxOutlined /><span>Formulario de Ingreso de Compra</span></Space>}>
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
              <Form.Item name="tipoAlimentoId" label="Tipo de Alimento" rules={[{ required: true }]}>
                <Select
                  placeholder="Selecciona el tipo de alimento"
                  options={tipos?.map((t) => ({
                    value: t.id,
                    label: `${t.nombre} - ${t.marca} (${t.calibreMm} mm)`,
                  }))}
                />
              </Form.Item>

              <Form.Item name="proveedorId" label="Proveedor" rules={[{ required: true }]}>
                <Select
                  placeholder="Selecciona el proveedor"
                  options={proveedores?.map((p) => ({
                    value: p.id,
                    label: `${p.razonSocial} (RUC: ${p.ruc})`,
                  }))}
                />
              </Form.Item>

              <Form.Item
                name="codigoLoteFabrica"
                label="Código / Número de Lote del Fabricante"
                rules={[{ required: true }]}
              >
                <Input placeholder="Ej. LOT-NICO-2026-09A" />
              </Form.Item>

              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item name="fechaFabricacion" label="Fecha Fabricación">
                    <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="fechaVencimiento"
                    label="Fecha Caducidad"
                    rules={[{ required: true }]}
                  >
                    <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={12}>
                <Col span={8}>
                  <Form.Item name="pesoPorSacoKg" label="Peso/Saco (Kg)" rules={[{ required: true }]}>
                    <InputNumber min={1} style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="cantidadSacos" label="N° Sacos" rules={[{ required: true }]}>
                    <InputNumber min={1} style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="precioUnitarioKg" label="Precio S/ por Kg" rules={[{ required: true }]}>
                    <InputNumber min={0.1} step={0.1} style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
              </Row>

              <Card size="small" style={{ marginBottom: 16, backgroundColor: "#f6ffed", borderColor: "#b7eb8f" }}>
                <Row justify="space-between">
                  <Col><strong>Total Peso Ingresado:</strong> {calculoTotalKg.toLocaleString()} kg</Col>
                  <Col><strong>Total Valorizado:</strong> S/ {calculoCostoTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Col>
                </Row>
              </Card>

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
