import { PlusOutlined } from "@ant-design/icons";
import { Button, Card, Form, Input, InputNumber, Modal, Space, Table, Tag, message } from "antd";
import { useState } from "react";
import { apiClient } from "../../api/client";
import type { TipoAlimentoCatalogo } from "../../api/types";
import { PageHeader } from "../../produccion/components/PageHeader";
import { useTiposAlimento } from "../hooks/useInventario";

export function CatalogoAlimentosPage() {
  const { data: tipos, isLoading, refetch } = useTiposAlimento();
  const [modalAbierto, setModalAbierto] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [form] = Form.useForm();

  const handleCrear = async (values: {
    nombre: string;
    marca: string;
    calibreMm: number;
    porcentajeProteina: number;
    porcentajeGrasa: number;
    etapaSugerida: string;
    costoUnitarioPromedioKg: number;
  }) => {
    try {
      setGuardando(true);
      await apiClient.post("/api/inventario/tipos", values);
      message.success("Tipo de alimento registrado exitosamente");
      form.resetFields();
      setModalAbierto(false);
      refetch();
    } catch {
      message.error("Error al registrar el tipo de alimento");
    } finally {
      setGuardando(false);
    }
  };

  const columns = [
    {
      title: "Nombre Comercial",
      dataIndex: "nombre",
      key: "nombre",
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: "Marca",
      dataIndex: "marca",
      key: "marca",
      render: (marca: string) => <Tag color="blue">{marca}</Tag>,
    },
    {
      title: "Calibre (mm)",
      dataIndex: "calibreMm",
      key: "calibreMm",
      render: (cal: number) => `${cal.toFixed(1)} mm`,
    },
    {
      title: "% Proteína",
      dataIndex: "porcentajeProteina",
      key: "porcentajeProteina",
      render: (p: number) => `${p}%`,
    },
    {
      title: "% Grasa",
      dataIndex: "porcentajeGrasa",
      key: "porcentajeGrasa",
      render: (g: number) => `${g}%`,
    },
    {
      title: "Etapa Sugerida",
      dataIndex: "etapaSugerida",
      key: "etapaSugerida",
      render: (e: string) => <Tag color="cyan">{e}</Tag>,
    },
    {
      title: "Costo Ref. / Kg",
      dataIndex: "costoUnitarioPromedioKg",
      key: "costoUnitarioPromedioKg",
      render: (c: number) => `S/ ${c.toFixed(2)}`,
    },
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <PageHeader
        title="Catálogo de Alimentos Balanceados"
        subtitle="Registro y especificaciones nutricionales de pellets de trucha"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setModalAbierto(true)}
          >
            Nuevo Tipo de Alimento
          </Button>
        }
      />

      <Card>
        <Table<TipoAlimentoCatalogo>
          columns={columns}
          dataSource={tipos ?? []}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title="Registrar Nuevo Tipo de Alimento"
        open={modalAbierto}
        onCancel={() => setModalAbierto(false)}
        onOk={() => form.submit()}
        confirmLoading={guardando}
      >
        <Form form={form} layout="vertical" onFinish={handleCrear}>
          <Form.Item name="nombre" label="Nombre Comercial" rules={[{ required: true }]}>
            <Input placeholder="Ej. Inicio 2 (1.2mm)" />
          </Form.Item>
          <Form.Item name="marca" label="Marca" rules={[{ required: true }]}>
            <Input placeholder="Ej. Nicovita / Aquatec" />
          </Form.Item>
          <Space style={{ display: "flex" }}>
            <Form.Item name="calibreMm" label="Calibre (mm)" rules={[{ required: true }]}>
              <InputNumber min={0.1} step={0.1} style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item name="porcentajeProteina" label="% Proteína" rules={[{ required: true }]}>
              <InputNumber min={1} max={100} style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item name="porcentajeGrasa" label="% Grasa" rules={[{ required: true }]}>
              <InputNumber min={1} max={100} style={{ width: "100%" }} />
            </Form.Item>
          </Space>
          <Form.Item name="etapaSugerida" label="Etapa Sugerida" rules={[{ required: true }]}>
            <Input placeholder="Ej. ALEVINAJE / JUVENIL / ENGORDE" />
          </Form.Item>
          <Form.Item name="costoUnitarioPromedioKg" label="Costo Estimado S/ por Kg" rules={[{ required: true }]}>
            <InputNumber min={0.1} step={0.1} style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
