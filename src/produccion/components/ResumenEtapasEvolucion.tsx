import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, Tag, Typography } from "antd";
import { BarraRango, BORDE, EstadoDuracion, SOMBRA } from "./Stat";

// Misma paleta validada del proyecto (dataviz skill): una sola serie de magnitud (alimento) ->
// un solo hue, sin degradado ni arcoíris por categoría.
const COLOR_ALIMENTO = "#8b5cf6";
const COLOR_GRID = "#e1e0d9";
const COLOR_EJE = "#c3c2b7";
const COLOR_TEXTO_MUTED = "#898781";

export interface FilaResumenEtapa {
  nombre: string;
  lotes: number;
  alimentoKg: number;
  mortalidad: number;
  diasPromedio: number | null;
  diasMin: number | null;
  diasMax: number | null;
  esperadoMin: number | null;
  esperadoMax: number | null;
}

function AlimentoPorEtapaChart({ filas }: { filas: FilaResumenEtapa[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={filas} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
        <CartesianGrid stroke={COLOR_GRID} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="nombre" tick={{ fontSize: 11, fill: COLOR_TEXTO_MUTED }} stroke={COLOR_EJE} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: COLOR_TEXTO_MUTED }} stroke={COLOR_EJE} tickLine={false} width={40} unit="kg" />
        <Tooltip
          formatter={(value: unknown) => [typeof value === "number" ? `${value.toFixed(2)} kg` : String(value), "Alimento total"]}
          contentStyle={{ fontSize: 12, borderRadius: 6, borderColor: COLOR_GRID }}
        />
        <Bar dataKey="alimentoKg" fill={COLOR_ALIMENTO} radius={[4, 4, 0, 0]} maxBarSize={48} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function FilaEtapaCard({ fila, colorMarco }: { fila: FilaResumenEtapa; colorMarco: string }) {
  const tieneRango = fila.diasPromedio != null && fila.esperadoMin != null && fila.esperadoMax != null;
  return (
    <div style={{ padding: "14px 20px", borderBottom: BORDE, display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
      <div style={{ minWidth: 170 }}>
        <Typography.Text strong style={{ fontSize: 13 }}>
          {fila.nombre}
        </Typography.Text>
        <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
          <Tag>{fila.lotes} lote{fila.lotes === 1 ? "" : "s"}</Tag>
          <Tag color={fila.mortalidad > 0 ? "red" : "default"}>{fila.mortalidad} baja{fila.mortalidad === 1 ? "" : "s"}</Tag>
        </div>
      </div>

      <div style={{ minWidth: 140 }}>
        <Typography.Text type="secondary" style={{ fontSize: 11, display: "block" }}>
          Alimento total
        </Typography.Text>
        <Typography.Text strong style={{ fontSize: 15 }}>
          {fila.alimentoKg.toFixed(2)} kg
        </Typography.Text>
      </div>

      <div style={{ flex: 1, minWidth: 220 }}>
        {tieneRango ? (
          <BarraRango
            label="Días reales vs. esperado"
            actual={fila.diasPromedio!}
            min={fila.esperadoMin!}
            max={fila.esperadoMax!}
            unidad="días"
            color={colorMarco}
          />
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 8, height: "100%" }}>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              Duración:
            </Typography.Text>
            <EstadoDuracion dias={fila.diasPromedio} min={fila.esperadoMin} max={fila.esperadoMax} />
          </div>
        )}
      </div>
    </div>
  );
}

export function ResumenEtapasEvolucion({
  titulo,
  descripcion,
  filas,
  colorMarco,
  isLoading,
}: {
  titulo: string;
  descripcion: string;
  filas: FilaResumenEtapa[];
  colorMarco: string;
  isLoading?: boolean;
}) {
  return (
    <>
      <Typography.Title level={5} style={{ margin: "0 0 4px" }}>
        {titulo}
      </Typography.Title>
      <Typography.Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 12 }}>
        {descripcion}
      </Typography.Text>

      <Card style={{ border: BORDE, boxShadow: SOMBRA, marginBottom: 28 }} styles={{ body: { padding: "20px 20px 4px" } }}>
        <AlimentoPorEtapaChart filas={filas} />
      </Card>

      <Card style={{ border: BORDE, boxShadow: SOMBRA, marginBottom: 28 }} styles={{ body: { padding: 0 } }} loading={isLoading}>
        {filas.map((fila) => (
          <FilaEtapaCard key={fila.nombre} fila={fila} colorMarco={colorMarco} />
        ))}
      </Card>
    </>
  );
}
