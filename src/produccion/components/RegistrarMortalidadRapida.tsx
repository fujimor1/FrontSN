import { WarningOutlined } from "@ant-design/icons";
import { Button, Form, InputNumber, Popover, message } from "antd";
import dayjs from "dayjs";
import { useState } from "react";
import { useRegistrarMortalidad } from "../hooks/useLotes";

/**
 * Acción rápida de un toque para lo que se registra a diario — igual al patrón del sistema
 * anterior (input inline, sin modal aparte). El resto de acciones (muestreo, alimentación,
 * cambio de etapa) sí necesitan un formulario completo y viven en el detalle del lote.
 */
export function RegistrarMortalidadRapida({ loteId }: { loteId: number }) {
  const [abierto, setAbierto] = useState(false);
  const registrarMortalidad = useRegistrarMortalidad(loteId);
  const [form] = Form.useForm<{ cantidad: number }>();

  const onFinish = async (values: { cantidad: number }) => {
    try {
      await registrarMortalidad.mutateAsync({ fecha: dayjs().format("YYYY-MM-DD"), cantidad: values.cantidad });
      message.success(`${values.cantidad} bajas registradas.`);
      form.resetFields();
      setAbierto(false);
    } catch {
      message.error("No se pudo registrar.");
    }
  };

  return (
    <Popover
      trigger="click"
      open={abierto}
      onOpenChange={setAbierto}
      title="Registrar bajas de hoy"
      content={
        <Form form={form} layout="inline" onFinish={onFinish}>
          <Form.Item name="cantidad" rules={[{ required: true, message: "Cantidad" }]}>
            <InputNumber placeholder="Cantidad" min={1} autoFocus style={{ width: 110 }} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" danger htmlType="submit" loading={registrarMortalidad.isPending}>
              Registrar
            </Button>
          </Form.Item>
        </Form>
      }
    >
      <Button size="small" danger icon={<WarningOutlined />}>
        Mortalidad
      </Button>
    </Popover>
  );
}
