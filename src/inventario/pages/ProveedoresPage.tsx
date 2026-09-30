import { PlusOutlined } from "@ant-design/icons";
import { Button, Card, Form, Input, InputNumber, Modal, Space, Table, message } from "antd";
import { useState } from "react";
import { apiClient } from "../../api/client";
import type { ProveedorAlimento } from "../../api/types";
import { PageHeader } from "../../produccion/components/PageHeader";
import { useProveedores } from "../hooks/useInventario";

export function ProveedoresPage() {
  const { data: proveedores, isLoading, refetch } = useProveedores();
  const [modalAbierto, setModalAbierto] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [form] = Form.useForm();

  const handleCrear = async (values: {
    ruc: string;
    razonSocial: string;
    contactoNombre?: string;
    telefono?: string;
    email?: string;
    leadTimeDiasPromedio: number;
    costoOrdenPedido: number;
  }) => {
    try {
      setGuardando(true);
      await apiClient.post("/api/inventario/proveedores", values);
      message.success("Proveedor registrado exitosamente");
      form.resetFields();
      setModalAbierto(false);
      refetch();
    } catch {
      message.error("Error al registrar el proveedor");
    } finally {
      setGuardando(false);
    }
  };

  const columns = [
    {
      title: "RUC",
      dataIndex: "ruc",
      key: "ruc",
    },
    {
      title: "Razón Social",
      dataIndex: "razonSocial",
      key: "razonSocial",
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: "Contacto",
      dataIndex: "contactoNombre",
      key: "contactoNombre",
      render: (c: string | null) => c ?? "-",
    },
    {
      title: "Teléfono",
      dataIndex: "telefono",
      key: "telefono",
      render: (t: string | null) => t ?? "-",
    },
    {
      title: "Lead Time (Días Entrega)",
      dataIndex: "leadTimeDiasPromedio",
      key: "leadTimeDiasPromedio",
      align: "right" as const,
      render: (d: number) => `${d} días`,
    },
    {
      title: "Costo Emisión Orden (S/)",
      dataIndex: "costoOrdenPedido",
      key: "costoOrdenPedido",
      align: "right" as const,
      render: (c: number) => `S/ ${c.toFixed(2)}`,
    },
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <PageHeader
        title="Proveedores de Alimento Balanceado"
        subtitle="Tiempos de entrega (Lead Time) y costos de emisión de órdenes para cálculo EOQ"
        extra={
          <Button size="large" type="primary"
            icon={<PlusOutlined />}
            onClick={() => setModalAbierto(true)}
          >
            Nuevo Proveedor
          </Button>
        }
      />

      <Card>
        <Table<ProveedorAlimento>
          columns={columns}
          dataSource={proveedores ?? []}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title="Registrar Nuevo Proveedor"
        open={modalAbierto}
        onCancel={() => setModalAbierto(false)}
        onOk={() => form.submit()}
        confirmLoading={guardando}
      >
        <Form form={form} layout="vertical" onFinish={handleCrear}>
          <Form.Item name="ruc" label="RUC" rules={[{ required: true }]}>
            <Input size="large" placeholder="Ej. 20100128218" />
          </Form.Item>
          <Form.Item name="razonSocial" label="Razón Social" rules={[{ required: true }]}>
            <Input size="large" placeholder="Ej. Alicorp S.A.A." />
          </Form.Item>
          <Form.Item name="contactoNombre" label="Nombre de Contacto">
            <Input size="large" placeholder="Ej. Juan Pérez" />
          </Form.Item>
          <Space style={{ display: "flex" }}>
            <Form.Item name="telefono" label="Teléfono">
              <Input size="large" placeholder="987654321" />
            </Form.Item>
            <Form.Item name="email" label="Email">
              <Input size="large" placeholder="ventas@proveedor.com" />
            </Form.Item>
          </Space>
          <Space style={{ display: "flex" }}>
            <Form.Item
              name="leadTimeDiasPromedio"
              label="Lead Time Promedio (días)"
              initialValue={5}
              rules={[{ required: true }]}
            >
              <InputNumber size="large" min={1} style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
              name="costoOrdenPedido"
              label="Costo de Pedido S/ (S)"
              initialValue={50}
              rules={[{ required: true }]}
            >
              <InputNumber size="large" min={1} step={5} style={{ width: "100%" }} />
            </Form.Item>
          </Space>
        </Form>
      </Modal>
    </Space>
  );
}
