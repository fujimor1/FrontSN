import { EditOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Card, Empty, Form, InputNumber, Modal, Select, Table, Tag, Input, Typography, message } from "antd";
import { useState } from "react";
import { Link } from "react-router-dom";
import type { Bastidor, FormaUnidad, Lote, TipoJaula, TipoUnidadProduccion, UnidadProduccion } from "../../api/types";
import { PageHeader } from "../components/PageHeader";
import { BarraOcupacion, BORDE } from "../components/Stat";
import { useLotesActivos } from "../hooks/useLotes";
import {
  useActualizarBastidor,
  useActualizarUnidad,
  useBastidores,
  useCrearBastidor,
  useCrearUnidad,
  useUnidades,
  type CrearUnidadInput,
} from "../hooks/useUnidades";

type TipoCreacion = TipoUnidadProduccion | "Bastidor";
type Editando = { tipo: "unidad"; unidad: UnidadProduccion } | { tipo: "bastidor"; bastidor: Bastidor } | null;

interface FilaUnidad {
  key: string;
  codigo: string;
  tipo: string;
  subtipo: string;
  capacidad: string;
  ocupado: number;
  max: number;
  unidadMedida: string;
  lotes: Lote[];
  onEditar: () => void;
}

function TagOcupacion({ ocupado, max }: { ocupado: number; max: number }) {
  if (max <= 0) return <Tag>—</Tag>;
  const pct = (ocupado / max) * 100;
  const color = pct > 100 ? "red" : pct >= 80 ? "gold" : "green";
  return <Tag color={color}>{pct.toFixed(0)}%</Tag>;
}

function DetalleUnidad({ fila }: { fila: FilaUnidad }) {
  return (
    <div style={{ padding: "4px 24px 16px" }}>
      <div style={{ maxWidth: 420, marginBottom: 16 }}>
        <BarraOcupacion actual={fila.ocupado} max={fila.max} unidad={fila.unidadMedida} label="Ocupación actual" />
      </div>
      {fila.lotes.length === 0 ? (
        <Empty description="Sin lotes en esta unidad" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        fila.lotes.map((l) => (
          <div
            key={l.id}
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: BORDE }}
          >
            <div>
              <Link to={`/lotes/${l.id}`}>
                <Typography.Text strong>{l.codigoLote}</Typography.Text>
              </Link>{" "}
              <Tag>{l.etapaActual}</Tag>
              <Typography.Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
                {l.cantidadTotalPeces.toLocaleString("es-PE")} peces · {l.biomasaActualKg.toFixed(2)} kg
              </Typography.Text>
            </div>
            <Link to={`/lotes/${l.id}`} style={{ fontSize: 13 }}>
              Ver detalle →
            </Link>
          </div>
        ))
      )}
    </div>
  );
}

export function UnidadesListPage() {
  const { data: unidades, isLoading: cargandoUnidades } = useUnidades();
  const { data: bastidores, isLoading: cargandoBastidores } = useBastidores();
  const { data: lotes, isLoading: cargandoLotes } = useLotesActivos();
  const crearUnidad = useCrearUnidad();
  const crearBastidor = useCrearBastidor();
  const actualizarUnidad = useActualizarUnidad();
  const actualizarBastidor = useActualizarBastidor();
  const [modalAbierto, setModalAbierto] = useState(false);
  const [tipoCreacion, setTipoCreacion] = useState<TipoCreacion>("Jaula");
  const [editando, setEditando] = useState<Editando>(null);
  const [form] = Form.useForm();

  const abrirCrear = () => {
    setEditando(null);
    setTipoCreacion("Jaula");
    form.resetFields();
    setModalAbierto(true);
  };

  const abrirEditarUnidad = (unidad: UnidadProduccion) => {
    setEditando({ tipo: "unidad", unidad });
    setTipoCreacion(unidad.tipo);
    form.setFieldsValue({
      codigo: unidad.codigo,
      subTipoJaula: unidad.subTipoJaula,
      forma: unidad.forma,
      largoM: unidad.largoM,
      anchoM: unidad.anchoM,
      diametroM: unidad.diametroM,
      altoM: unidad.altoM,
      densidadSiembraKgM3: unidad.densidadSiembraKgM3,
    });
    setModalAbierto(true);
  };

  const abrirEditarBastidor = (bastidor: Bastidor) => {
    setEditando({ tipo: "bastidor", bastidor });
    setTipoCreacion("Bastidor");
    form.setFieldsValue({ codigo: bastidor.codigo, capacidadMaximaUnidades: bastidor.capacidadMaximaUnidades });
    setModalAbierto(true);
  };

  const filas: FilaUnidad[] = [
    ...(unidades ?? []).map((u) => {
      const lotesUnidad = (lotes ?? []).filter((l) => l.unidadProduccionId === u.id);
      return {
        key: `u-${u.id}`,
        codigo: u.codigo,
        tipo: u.tipo,
        subtipo: u.subTipoJaula ?? "—",
        capacidad: `${u.capacidadMaximaKg.toFixed(2)} kg`,
        ocupado: lotesUnidad.reduce((a, l) => a + l.biomasaActualKg, 0),
        max: u.capacidadMaximaKg,
        unidadMedida: "kg",
        lotes: lotesUnidad,
        onEditar: () => abrirEditarUnidad(u),
      };
    }),
    ...(bastidores ?? []).map((b) => {
      const lotesBastidor = (lotes ?? []).filter((l) => l.bastidorId === b.id);
      return {
        key: `b-${b.id}`,
        codigo: b.codigo,
        tipo: "Bastidor",
        subtipo: "—",
        capacidad: `${b.capacidadMaximaUnidades.toLocaleString("es-PE")} ovas`,
        ocupado: lotesBastidor.reduce((a, l) => a + l.cantidadTotalPeces, 0),
        max: b.capacidadMaximaUnidades,
        unidadMedida: "peces",
        lotes: lotesBastidor,
        onEditar: () => abrirEditarBastidor(b),
      };
    }),
  ];

  const onSubmit = async (values: any) => {
    try {
      if (editando?.tipo === "bastidor") {
        await actualizarBastidor.mutateAsync({
          id: editando.bastidor.id,
          input: { codigo: values.codigo, capacidadMaximaUnidades: values.capacidadMaximaUnidades },
        });
        message.success("Bastidor actualizado.");
      } else if (editando?.tipo === "unidad") {
        await actualizarUnidad.mutateAsync({ id: editando.unidad.id, input: values });
        message.success("Unidad actualizada.");
      } else if (tipoCreacion === "Bastidor") {
        await crearBastidor.mutateAsync({ codigo: values.codigo, capacidadMaximaUnidades: values.capacidadMaximaUnidades });
        message.success("Unidad creada.");
      } else {
        await crearUnidad.mutateAsync({ ...values, tipo: tipoCreacion } as CrearUnidadInput);
        message.success("Unidad creada.");
      }
      setModalAbierto(false);
      form.resetFields();
    } catch {
      message.error(editando ? "No se pudo actualizar la unidad." : "No se pudo crear la unidad.");
    }
  };

  return (
    <>
      <PageHeader
        title="Unidades de Producción"
        subtitle="Bastidores, artesas y jaulas físicas de la piscigranja."
        backTo="/"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={abrirCrear}>
            Nueva unidad
          </Button>
        }
      />

      <Card style={{ border: "1px solid #e7e9ee" }} styles={{ body: { padding: 0 } }}>
        <Table<FilaUnidad>
          rowKey="key"
          loading={cargandoUnidades || cargandoBastidores || cargandoLotes}
          dataSource={filas}
          expandable={{ expandedRowRender: (fila) => <DetalleUnidad fila={fila} /> }}
          columns={[
            { title: "Código", dataIndex: "codigo" },
            { title: "Tipo", dataIndex: "tipo" },
            { title: "Sub-tipo", dataIndex: "subtipo" },
            { title: "Capacidad", dataIndex: "capacidad" },
            {
              title: "Ocupación",
              key: "ocupacion",
              render: (_, fila) => <TagOcupacion ocupado={fila.ocupado} max={fila.max} />,
            },
            {
              title: "",
              key: "editar",
              width: 40,
              render: (_, fila) => (
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    fila.onEditar();
                  }}
                />
              ),
            },
          ]}
        />
      </Card>

      <Modal
        title={editando ? `Editar ${editando.tipo === "bastidor" ? editando.bastidor.codigo : editando.unidad.codigo}` : "Nueva unidad"}
        open={modalAbierto}
        onCancel={() => setModalAbierto(false)}
        onOk={() => form.submit()}
        confirmLoading={crearUnidad.isPending || crearBastidor.isPending || actualizarUnidad.isPending || actualizarBastidor.isPending}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={onSubmit} initialValues={{ forma: "Rectangular" as FormaUnidad }}>
          <Form.Item label="Tipo">
            <Select<TipoCreacion>
              value={tipoCreacion}
              onChange={setTipoCreacion}
              disabled={editando != null}
              options={[{ value: "Bastidor" }, { value: "Artesa" }, { value: "Jaula" }]}
            />
          </Form.Item>

          <Form.Item name="codigo" label="Código" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          {tipoCreacion === "Bastidor" ? (
            <Form.Item name="capacidadMaximaUnidades" label="Capacidad máxima (ovas)" rules={[{ required: true }]}>
              <InputNumber style={{ width: "100%" }} min={1} />
            </Form.Item>
          ) : (
            <>
              {tipoCreacion === "Jaula" && (
                <Form.Item name="subTipoJaula" label="Sub-tipo" rules={[{ required: true }]}>
                  <Select<TipoJaula> options={[{ value: "Juvenil" }, { value: "Engorde" }]} />
                </Form.Item>
              )}
              <Form.Item name="forma" label="Forma" rules={[{ required: true }]}>
                <Select<FormaUnidad>
                  options={[{ value: "Rectangular" }, { value: "Circular" }, { value: "Hexagonal" }, { value: "Decagonal" }]}
                />
              </Form.Item>
              <Form.Item name="largoM" label="Largo (m)">
                <InputNumber style={{ width: "100%" }} min={0} />
              </Form.Item>
              <Form.Item name="anchoM" label="Ancho (m)">
                <InputNumber style={{ width: "100%" }} min={0} />
              </Form.Item>
              <Form.Item name="diametroM" label="Diámetro (m, circular/poligonal)">
                <InputNumber style={{ width: "100%" }} min={0} />
              </Form.Item>
              <Form.Item name="altoM" label="Alto / profundidad (m)" rules={[{ required: true }]}>
                <InputNumber style={{ width: "100%" }} min={0} />
              </Form.Item>
              <Form.Item name="densidadSiembraKgM3" label="Densidad de siembra objetivo (kg/m³)" rules={[{ required: true }]}>
                <InputNumber style={{ width: "100%" }} min={0} />
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>
    </>
  );
}
