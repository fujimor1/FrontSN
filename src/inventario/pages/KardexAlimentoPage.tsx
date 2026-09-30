import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  FilterOutlined,
  MinusCircleOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
  Table,
  Tag,
  message,
} from "antd";
import dayjs from "dayjs";
import { useState } from "react";
import type { KardexMovimiento, TipoMovimientoKardex } from "../../api/types";
import { PageHeader } from "../../produccion/components/PageHeader";
import {
  useKardexMovimientos,
  useLotesAlimento,
  useRegistrarEgresoAlimento,
  useTiposAlimento,
} from "../hooks/useInventario";

export function KardexAlimentoPage() {
  const [tipoSeleccionado, setTipoSeleccionado] = useState<number | undefined>();
  const [rangoFechas, setRangoFechas] = useState<[string, string] | undefined>();

  const { data: tipos } = useTiposAlimento();
  const { data: lotesConStock } = useLotesAlimento(true);
  const {
    data: movimientos,
    isLoading,
    refetch,
  } = useKardexMovimientos({
    tipoAlimentoId: tipoSeleccionado,
    desde: rangoFechas?.[0],
    hasta: rangoFechas?.[1],
  });

  const registrarEgreso = useRegistrarEgresoAlimento();
  const [modalEgresoAbierto, setModalEgresoAbierto] = useState(false);
  const [formEgreso] = Form.useForm();

  const handleEgreso = async (values: {
    loteAlimentoId: number;
    tipoMovimiento: string;
    cantidadKg: number;
    observaciones?: string;
  }) => {
    try {
      await registrarEgreso.mutateAsync({
        loteAlimentoId: values.loteAlimentoId,
        tipoMovimiento: values.tipoMovimiento,
        cantidadKg: values.cantidadKg,
        observaciones: values.observaciones,
      });
      message.success("Egreso registrado y Kardex actualizado exitosamente.");
      formEgreso.resetFields();
      setModalEgresoAbierto(false);
      refetch();
    } catch {
      message.error("Error al registrar el egreso de alimento.");
    }
  };

  const getTipoTag = (tipo: TipoMovimientoKardex) => {
    switch (tipo) {
      case "IngresoCompra":
        return (
          <Tag color="green" icon={<ArrowDownOutlined />}>
            INGRESO COMPRA
          </Tag>
        );
      case "EgresoAlimentacion":
        return (
          <Tag color="blue" icon={<ArrowUpOutlined />}>
            ALIMENTACIÓN PEZ
          </Tag>
        );
      case "AjusteMerma":
        return (
          <Tag color="volcano" icon={<MinusCircleOutlined />}>
            MERMA / AJUSTE
          </Tag>
        );
      default:
        return <Tag color="default">{tipo}</Tag>;
    }
  };

  const columns = [
    {
      title: "Fecha",
      dataIndex: "fechaMovimiento",
      key: "fechaMovimiento",
      render: (f: string) => dayjs(f).format("YYYY-MM-DD HH:mm"),
    },
    {
      title: "Tipo Movimiento",
      dataIndex: "tipoMovimiento",
      key: "tipoMovimiento",
      render: (t: TipoMovimientoKardex) => getTipoTag(t),
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
      title: "Cantidad (Kg)",
      dataIndex: "cantidadKg",
      key: "cantidadKg",
      render: (kg: number) => (
        <span style={{ color: kg > 0 ? "#3f8600" : "#cf1322", fontWeight: 600 }}>
          {kg > 0 ? `+${kg.toLocaleString()} kg` : `${kg.toLocaleString()} kg`}
        </span>
      ),
    },
    {
      title: "Costo Unit. (S/)",
      dataIndex: "costoUnitarioKg",
      key: "costoUnitarioKg",
      render: (c: number) => `S/ ${c.toFixed(2)}`,
    },
    {
      title: "Costo Total (S/)",
      dataIndex: "costoTotal",
      key: "costoTotal",
      render: (c: number) => `S/ ${c.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
    },
    {
      title: "Saldo Stock (Kg)",
      dataIndex: "saldoStockKg",
      key: "saldoStockKg",
      render: (s: number) => <strong>{s.toLocaleString()} kg</strong>,
    },
    {
      title: "Saldo Valorizado (S/)",
      dataIndex: "saldoValorizado",
      key: "saldoValorizado",
      render: (v: number) => <strong>S/ {v.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>,
    },
    {
      title: "Observaciones",
      dataIndex: "observaciones",
      key: "observaciones",
      render: (obs: string | null) => obs ?? "-",
    },
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <PageHeader
        title="Kardex de Alimento Balanceado"
        subtitle="Movimientos de entradas, salidas por alimentación, mermas y saldos valorizados en tiempo real"
        extra={
          <Button
            type="primary"
            danger
            icon={<MinusCircleOutlined />}
            onClick={() => setModalEgresoAbierto(true)}
          >
            Registrar Salida / Merma
          </Button>
        }
      />

      <Card>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={8}>
            <Space style={{ width: "100%" }}>
              <FilterOutlined />
              <Select
                placeholder="Filtrar por tipo de alimento"
                allowClear
                style={{ width: 260 }}
                value={tipoSeleccionado}
                onChange={(val) => setTipoSeleccionado(val)}
                options={tipos?.map((t) => ({
                  value: t.id,
                  label: `${t.nombre} (${t.calibreMm} mm)`,
                }))}
              />
            </Space>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <DatePicker.RangePicker
              onChange={(dates) => {
                if (dates && dates[0] && dates[1]) {
                  setRangoFechas([
                    dates[0].format("YYYY-MM-DD"),
                    dates[1].format("YYYY-MM-DD"),
                  ]);
                } else {
                  setRangoFechas(undefined);
                }
              }}
            />
          </Col>
        </Row>

        <Table<KardexMovimiento>
          columns={columns}
          dataSource={movimientos ?? []}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 12 }}
        />
      </Card>

      <Modal
        title="Registrar Salida / Egreso de Alimento de Almacén"
        open={modalEgresoAbierto}
        onCancel={() => setModalEgresoAbierto(false)}
        onOk={() => formEgreso.submit()}
        confirmLoading={registrarEgreso.isPending}
      >
        <Form form={formEgreso} layout="vertical" onFinish={handleEgreso}>
          <Form.Item
            name="loteAlimentoId"
            label="Lote de Alimento en Almacén"
            rules={[{ required: true }]}
          >
            <Select
              placeholder="Seleccionar lote de almacén disponible"
              options={lotesConStock?.map((l) => {
                const tipo = tipos?.find((t) => t.id === l.tipoAlimentoId);
                return {
                  value: l.id,
                  label: `${tipo?.nombre ?? "Alimento"} | Lote Fab: ${l.codigoLoteFabrica} (Disp: ${l.stockKgActual} kg | Vence: ${l.fechaVencimiento})`,
                };
              })}
            />
          </Form.Item>

          <Form.Item
            name="tipoMovimiento"
            label="Motivo de Salida"
            initialValue="EgresoAlimentacion"
            rules={[{ required: true }]}
          >
            <Select
              options={[
                { value: "EgresoAlimentacion", label: "Alimentación de Estanque / Jaula" },
                { value: "AjusteMerma", label: "Merma / Daño por Humedad / Rotura" },
                { value: "Devolucion", label: "Devolución al Proveedor" },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="cantidadKg"
            label="Cantidad a Egresar (Kg)"
            rules={[{ required: true }]}
          >
            <InputNumber min={0.5} step={0.5} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="observaciones" label="Observaciones">
            <Input.TextArea rows={2} placeholder="Indica el estanque de destino o motivo" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
