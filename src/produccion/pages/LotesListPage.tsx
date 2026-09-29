import { Card, Table, Tag } from "antd";
import { useNavigate } from "react-router-dom";
import type { Lote } from "../../api/types";
import { PageHeader } from "../components/PageHeader";
import { useLotesActivos } from "../hooks/useLotes";

const COLOR_ETAPA: Record<string, string> = {
  Ovas: "default",
  AlevinajeI: "blue",
  AlevinajeII: "blue",
  AlevinajeIII: "blue",
  JuvenilesI: "gold",
  JuvenilesII: "gold",
  EngordeI: "green",
  EngordeII: "green",
};

export function LotesListPage() {
  const { data: lotes, isLoading } = useLotesActivos();
  const navigate = useNavigate();

  return (
    <>
      <PageHeader title="Lotes activos" subtitle="Todos los lotes vivos, sin importar en qué etapa o unidad estén." backTo="/" />
      <Card style={{ border: "1px solid #e7e9ee" }} styles={{ body: { padding: 0 } }}>
        <Table<Lote>
          rowKey="id"
          loading={isLoading}
          dataSource={lotes}
          onRow={(lote) => ({ onClick: () => navigate(`/lotes/${lote.id}`), style: { cursor: "pointer" } })}
          columns={[
            { title: "Código", dataIndex: "codigoLote" },
            {
              title: "Etapa",
              dataIndex: "etapaActual",
              render: (etapa: string) => <Tag color={COLOR_ETAPA[etapa]}>{etapa}</Tag>,
            },
            { title: "Peces vivos", dataIndex: "cantidadTotalPeces", render: (v: number) => v.toLocaleString("es-PE") },
            {
              title: "Peso promedio",
              dataIndex: "pesoPromedioActualGr",
              render: (v: number | null) => (v != null ? `${v.toFixed(2)} g` : "—"),
            },
            {
              title: "Talla promedio",
              dataIndex: "tallaPromedioActualCm",
              render: (v: number | null) => (v != null ? `${v.toFixed(1)} cm` : "—"),
            },
            { title: "Biomasa actual", dataIndex: "biomasaActualKg", render: (v: number) => `${v.toFixed(2)} kg` },
            { title: "Fecha ingreso etapa", dataIndex: "fechaIngresoEtapa" },
          ]}
        />
      </Card>
    </>
  );
}
