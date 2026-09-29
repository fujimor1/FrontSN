import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Card, DatePicker, Form, Input, InputNumber, Modal, Select, Space, Table, Typography, message } from "antd";
import dayjs from "dayjs";
import { useState } from "react";
import type { Campaña } from "../../api/types";
import { PageHeader } from "../components/PageHeader";
import { useCampañas, useCrearCampaña, type CrearCampañaInput } from "../hooks/useCampanias";
import { useUnidades } from "../hooks/useUnidades";

export function CampañasListPage() {
  const { data: campañas, isLoading } = useCampañas();
  const { data: unidades } = useUnidades();
  const crearCampaña = useCrearCampaña();
  const [modalAbierto, setModalAbierto] = useState(false);
  const [form] = Form.useForm();

  const onCrear = async (values: any) => {
    const input: CrearCampañaInput = {
      codigoCampaña: values.codigoCampaña,
      fechaSiembra: values.fechaSiembra.format("YYYY-MM-DD"),
      pesoPromedioInicialGr: values.pesoPromedioInicialGr,
      tallaPromedioInicialCm: values.tallaPromedioInicialCm,
      proveedor: values.proveedor ?? null,
      observaciones: values.observaciones ?? null,
      distribuciones: values.distribuciones,
    };
    try {
      await crearCampaña.mutateAsync(input);
      message.success("Campaña y lote(s) creados.");
      setModalAbierto(false);
      form.resetFields();
    } catch {
      message.error("No se pudo crear la campaña — revisa los datos.");
    }
  };

  return (
    <>
      <PageHeader
        title="Campañas (siembras)"
        subtitle="Cada siembra puede repartirse en varios lotes desde el inicio."
        backTo="/"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalAbierto(true)}>
            Nueva siembra
          </Button>
        }
      />

      <Card style={{ border: "1px solid #e7e9ee" }} styles={{ body: { padding: 0 } }}>
        <Table<Campaña>
          rowKey="id"
          loading={isLoading}
          dataSource={campañas}
          columns={[
            { title: "Código", dataIndex: "codigo" },
            { title: "Fecha de siembra", dataIndex: "fechaSiembra" },
            { title: "Alevines sembrados", dataIndex: "cantidadAlevinesSembrados", render: (v: number) => v.toLocaleString("es-PE") },
            { title: "Peso inicial", dataIndex: "pesoPromedioInicialGr", render: (v: number) => `${v} g` },
            { title: "Talla inicial", dataIndex: "tallaPromedioInicialCm", render: (v: number) => `${v} cm` },
            { title: "Proveedor", dataIndex: "proveedor", render: (v: string | null) => v ?? "—" },
          ]}
        />
      </Card>

      <Modal
        title="Nueva siembra (Campaña)"
        open={modalAbierto}
        onCancel={() => setModalAbierto(false)}
        onOk={() => form.submit()}
        confirmLoading={crearCampaña.isPending}
        width={640}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={onCrear} initialValues={{ distribuciones: [{}] }}>
          <Form.Item name="codigoCampaña" label="Código de campaña" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="fechaSiembra" label="Fecha de siembra" rules={[{ required: true }]} initialValue={dayjs()}>
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="pesoPromedioInicialGr" label="Peso promedio inicial (g)" rules={[{ required: true }]}>
            <InputNumber style={{ width: "100%" }} min={0} step={0.1} />
          </Form.Item>
          <Form.Item name="tallaPromedioInicialCm" label="Talla promedio inicial (cm)" rules={[{ required: true }]}>
            <InputNumber style={{ width: "100%" }} min={0} step={0.1} />
          </Form.Item>
          <Form.Item name="proveedor" label="Proveedor (opcional)">
            <Input />
          </Form.Item>

          <Typography.Text strong>
            Reparto entre unidades de producción
          </Typography.Text>
          <Typography.Paragraph type="secondary" style={{ marginBottom: 8 }}>
            Una misma siembra puede repartirse en varias jaulas/artesas desde el inicio — cada una queda como un lote
            propio, todos enlazados a esta campaña. El código de cada lote se genera solo (ej. L2609-01).
          </Typography.Paragraph>

          <Form.List name="distribuciones">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} align="baseline" style={{ display: "flex", marginBottom: 8 }}>
                    <Form.Item {...restField} name={[name, "unidadProduccionId"]} rules={[{ required: true, message: "Unidad" }]}>
                      <Select
                        placeholder="Unidad"
                        style={{ width: 160 }}
                        options={unidades?.map((u) => ({ value: u.id, label: u.codigo }))}
                      />
                    </Form.Item>
                    <Form.Item {...restField} name={[name, "cantidadPeces"]} rules={[{ required: true, message: "Cantidad" }]}>
                      <InputNumber placeholder="Cantidad de peces" style={{ width: 160 }} min={1} />
                    </Form.Item>
                    {fields.length > 1 && <MinusCircleOutlined onClick={() => remove(name)} />}
                  </Space>
                ))}
                <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />}>
                  Agregar otra unidad
                </Button>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>
    </>
  );
}
