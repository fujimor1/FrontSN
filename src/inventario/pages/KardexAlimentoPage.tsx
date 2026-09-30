import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  FilterOutlined,
  MinusCircleOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
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

  const getTipoPill = (tipo: TipoMovimientoKardex) => {
    switch (tipo) {
      case "IngresoCompra":
        return (
          <span
            style={{
              backgroundColor: "#f0fdf4",
              color: "#16a34a",
              border: "1px solid #dcfce7",
              borderRadius: 9999,
              padding: "3px 10px",
              fontSize: 14,
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <ArrowDownOutlined style={{ fontSize: 10 }} /> INGRESO COMPRA
          </span>
        );
      case "EgresoAlimentacion":
        return (
          <span
            style={{
              backgroundColor: "#eff6ff",
              color: "#2563eb",
              border: "1px solid #dbeafe",
              borderRadius: 9999,
              padding: "3px 10px",
              fontSize: 14,
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <ArrowUpOutlined style={{ fontSize: 10 }} /> ALIMENTACIÓN PEZ
          </span>
        );
      case "AjusteMerma":
        return (
          <span
            style={{
              backgroundColor: "#fef2f2",
              color: "#dc2626",
              border: "1px solid #fee2e2",
              borderRadius: 9999,
              padding: "3px 10px",
              fontSize: 14,
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <MinusCircleOutlined style={{ fontSize: 10 }} /> MERMA / AJUSTE
          </span>
        );
      default:
        return <Tag color="default">{tipo}</Tag>;
    }
  };

  const columns = [
    {
      title: "Fecha & Hora",
      dataIndex: "fechaMovimiento",
      key: "fechaMovimiento",
      align: "center" as const,
      render: (f: string) => (
        <div>
          <div style={{ fontWeight: 600, color: "#0f172a" }}>{dayjs(f).format("YYYY-MM-DD")}</div>
          <div style={{ fontSize: 14, color: "#334155" }}>{dayjs(f).format("HH:mm:ss")}</div>
        </div>
      ),
    },
    {
      title: "Tipo Movimiento",
      dataIndex: "tipoMovimiento",
      key: "tipoMovimiento",
      render: (t: TipoMovimientoKardex) => getTipoPill(t),
    },
    {
      title: "Alimento",
      dataIndex: "tipoAlimentoId",
      key: "tipoAlimentoId",
      render: (id: number) => {
        const t = tipos?.find((x) => x.id === id);
        return t ? (
          <div>
            <span style={{ fontWeight: 600, color: "#0f172a" }}>{t.nombre}</span>
            <span style={{ fontSize: 14, color: "#334155", marginLeft: 6 }}>({t.marca})</span>
          </div>
        ) : (
          `ID ${id}`
        );
      },
    },
    {
      title: "Cantidad (Kg)",
      dataIndex: "cantidadKg",
      key: "cantidadKg",
      align: "right" as const,
      render: (kg: number) => (
        <span
          style={{
            color: kg > 0 ? "#16a34a" : "#dc2626",
            fontWeight: 700,
            fontSize: 14,
            backgroundColor: kg > 0 ? "#f0fdf4" : "#fef2f2",
            padding: "2px 8px",
            borderRadius: 6,
          }}
        >
          {kg > 0 ? `+${kg.toLocaleString()} kg` : `${kg.toLocaleString()} kg`}
        </span>
      ),
    },
    {
      title: "Costo Unit.",
      dataIndex: "costoUnitarioKg",
      key: "costoUnitarioKg",
      align: "right" as const,
      render: (c: number) => `S/ ${c.toFixed(2)}`,
    },
    {
      title: "Costo Total",
      dataIndex: "costoTotal",
      key: "costoTotal",
      align: "right" as const,
      render: (c: number) => `S/ ${c.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
    },
    {
      title: "Saldo Stock",
      dataIndex: "saldoStockKg",
      key: "saldoStockKg",
      align: "right" as const,
      render: (s: number) => <strong style={{ color: "#0f172a", fontSize: 14 }}>{s.toLocaleString()} kg</strong>,
    },
    {
      title: "Saldo Valorizado",
      dataIndex: "saldoValorizado",
      key: "saldoValorizado",
      align: "right" as const,
      render: (v: number) => (
        <strong style={{ color: "#2563eb", fontSize: 14 }}>
          S/ {v.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </strong>
      ),
    },
    {
      title: "Observaciones",
      dataIndex: "observaciones",
      key: "observaciones",
      render: (obs: string | null) => obs ? <span style={{ color: "#475569", fontSize: 14 }}>{obs}</span> : <span style={{ color: "#94a3b8" }}>—</span>,
    },
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <PageHeader
        title="Kardex de Alimento Balanceado"
        subtitle="Movimientos de entradas, salidas por alimentación, mermas y saldos valorizados en tiempo real"
        extra={
          <Button size="large" type="primary"
            danger
            icon={<MinusCircleOutlined />}
            onClick={() => setModalEgresoAbierto(true)}
            style={{ borderRadius: 8 }}
          >
            Registrar Salida / Merma
          </Button>
        }
      />

      <Card>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,
            marginBottom: 20,
            padding: "12px 16px",
            backgroundColor: "#f8fafc",
            borderRadius: 10,
            border: "1px solid #e2e8f0",
          }}
        >
          <Space size="middle" wrap>
            <span style={{ fontSize: 14, color: "#475569", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
              <FilterOutlined style={{ color: "#2563eb" }} /> Filtros:
            </span>
            <Select size="large" placeholder="Filtrar por tipo de alimento"
              allowClear
              style={{ width: 280 }}
              value={tipoSeleccionado}
              onChange={(val) => setTipoSeleccionado(val)}
              options={tipos?.map((t) => ({
                value: t.id,
                label: `${t.nombre} (${t.marca} - ${t.calibreMm} mm)`,
              }))}
            />
            <DatePicker.RangePicker size="large" placeholder={["Desde fecha", "Hasta fecha"]}
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
          </Space>

          <span style={{ fontSize: 14, color: "#334155" }}>
            Total registros: <strong>{movimientos?.length ?? 0}</strong>
          </span>
        </div>

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
        width={520}
      >
        <Form form={formEgreso} layout="vertical" onFinish={handleEgreso}>
          <Form.Item
            name="loteAlimentoId"
            label="Lote de Alimento en Almacén"
            rules={[{ required: true, message: "Selecciona el lote disponible" }]}
          >
            <Select size="large" placeholder="Seleccionar lote de almacén disponible"
              options={lotesConStock?.map((l) => {
                const tipo = tipos?.find((t) => t.id === l.tipoAlimentoId);
                return {
                  value: l.id,
                  label: `${tipo?.nombre ?? "Alimento"} | Lote: ${l.codigoLoteFabrica} (Disp: ${l.stockKgActual} kg | Vence: ${l.fechaVencimiento})`,
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
            <Select size="large" options={[
                { value: "EgresoAlimentacion", label: "Alimentación de Estanque / Jaula" },
                { value: "AjusteMerma", label: "Merma / Daño por Humedad / Rotura" },
                { value: "Devolucion", label: "Devolución al Proveedor" },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="cantidadKg"
            label="Cantidad a Egresar (Kg)"
            rules={[{ required: true, message: "Ingresa los kilos a egresar" }]}
          >
            <InputNumber size="large" min={0.5} step={0.5} style={{ width: "100%" }} placeholder="Ej. 50.0" />
          </Form.Item>

          <Form.Item name="observaciones" label="Observaciones">
            <Input.TextArea rows={2} placeholder="Indica el estanque de destino o motivo del ajuste" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
