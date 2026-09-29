import { Badge, Card, Collapse, Descriptions, Empty, Tag, Typography } from "antd";
import type { CollapseProps } from "antd";
import { Link, useParams } from "react-router-dom";
import type { Bastidor, Lote, UnidadProduccion } from "../../api/types";
import { PageHeader } from "../components/PageHeader";
import { RegistrarMortalidadRapida } from "../components/RegistrarMortalidadRapida";
import { BORDE, SOMBRA } from "../components/Stat";
import { useBastidores, useUnidades } from "../hooks/useUnidades";
import { useLotesActivos } from "../hooks/useLotes";
import { MACRO_ETAPAS, type MacroEtapa } from "../macroEtapas";

function unidadPerteneceA(clave: MacroEtapa, unidad: UnidadProduccion): boolean {
  if (clave === "alevines") return unidad.tipo === "Artesa";
  if (clave === "juveniles") return unidad.tipo === "Jaula" && unidad.subTipoJaula === "Juvenil";
  if (clave === "engorde") return unidad.tipo === "Jaula" && unidad.subTipoJaula === "Engorde";
  return false;
}

function EncabezadoItem({ codigo, ocupado, meta }: { codigo: string; ocupado: boolean; meta: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
      <Typography.Text strong>{codigo}</Typography.Text>
      <Badge status={ocupado ? "success" : "default"} text={ocupado ? "Ocupada" : "Disponible"} />
      <Typography.Text type="secondary" style={{ fontSize: 13 }}>
        {meta}
      </Typography.Text>
    </div>
  );
}

function LoteRow({ lote }: { lote: Lote }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 0",
        borderBottom: BORDE,
      }}
    >
      <div>
        <Link to={`/lotes/${lote.id}`}>
          <Typography.Text strong>{lote.codigoLote}</Typography.Text>
        </Link>{" "}
        <Tag>{lote.etapaActual}</Tag>
        <div>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {lote.cantidadTotalPeces.toLocaleString("es-PE")} peces
            {lote.pesoPromedioActualGr != null && ` · ${lote.pesoPromedioActualGr.toFixed(1)} g`}
            {lote.tallaPromedioActualCm != null && ` · ${lote.tallaPromedioActualCm.toFixed(1)} cm`}
            {` · ${lote.biomasaActualKg.toFixed(1)} kg`}
          </Typography.Text>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <RegistrarMortalidadRapida loteId={lote.id} />
        <Link to={`/lotes/${lote.id}`} style={{ fontSize: 13 }}>
          Ver detalle →
        </Link>
      </div>
    </div>
  );
}

function listaLotes(lotes: Lote[]) {
  return lotes.length === 0 ? (
    <Empty description="Sin lotes" image={Empty.PRESENTED_IMAGE_SIMPLE} />
  ) : (
    lotes.map((l) => <LoteRow key={l.id} lote={l} />)
  );
}

function itemDeBastidor(bastidor: Bastidor, lotes: Lote[]): NonNullable<CollapseProps["items"]>[number] {
  return {
    key: String(bastidor.id),
    label: (
      <EncabezadoItem
        codigo={bastidor.codigo}
        ocupado={!bastidor.estaDisponible}
        meta={`Capacidad: ${bastidor.capacidadMaximaUnidades.toLocaleString("es-PE")} ovas`}
      />
    ),
    children: listaLotes(lotes),
  };
}

function itemDeUnidad(unidad: UnidadProduccion, lotes: Lote[]): NonNullable<CollapseProps["items"]>[number] {
  return {
    key: String(unidad.id),
    label: (
      <EncabezadoItem
        codigo={unidad.codigo}
        ocupado={lotes.length > 0}
        meta={`Biomasa: ${lotes.reduce((a, l) => a + l.biomasaActualKg, 0).toFixed(1)} / ${unidad.capacidadMaximaKg.toFixed(1)} kg`}
      />
    ),
    children: (
      <>
        <Descriptions size="small" column={3} style={{ marginBottom: 12 }}>
          <Descriptions.Item label="Forma">{unidad.forma}</Descriptions.Item>
          <Descriptions.Item label="Volumen">{unidad.volumenM3.toFixed(1)} m³</Descriptions.Item>
          <Descriptions.Item label="Densidad objetivo">{unidad.densidadSiembraKgM3} kg/m³</Descriptions.Item>
        </Descriptions>
        {listaLotes(lotes)}
      </>
    ),
  };
}

export function EtapaUnidadesPage() {
  const { clave } = useParams<{ clave: MacroEtapa }>();
  const etapa = MACRO_ETAPAS.find((e) => e.clave === clave);

  const { data: unidades, isLoading: cargandoUnidades } = useUnidades();
  const { data: bastidores, isLoading: cargandoBastidores } = useBastidores();
  const { data: lotes, isLoading: cargandoLotes } = useLotesActivos();

  if (!etapa) return null;

  const cargando = cargandoUnidades || cargandoBastidores || cargandoLotes;

  const items: CollapseProps["items"] =
    etapa.clave === "ovas"
      ? (bastidores ?? []).map((b) => itemDeBastidor(b, (lotes ?? []).filter((l) => l.bastidorId === b.id)))
      : (unidades ?? [])
          .filter((u) => unidadPerteneceA(etapa.clave, u))
          .map((u) => itemDeUnidad(u, (lotes ?? []).filter((l) => l.unidadProduccionId === u.id)));

  return (
    <>
      <PageHeader title={etapa.titulo} subtitle={etapa.descripcion} backTo="/" />

      {!cargando &&
        (items.length === 0 ? (
          <Empty description={`No hay unidades registradas en ${etapa.titulo.toLowerCase()}.`} />
        ) : (
          <Card style={{ border: BORDE, boxShadow: SOMBRA }} styles={{ body: { padding: 0 } }}>
            <Collapse
              ghost
              expandIconPosition="end"
              items={items}
              style={{ background: "transparent" }}
              className="sn-collapse-unidades"
            />
          </Card>
        ))}
    </>
  );
}
