import { Line, LineChart, ReferenceArea, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { PuntoFactorCondicion } from "../../api/types";

// Paleta validada del proyecto (dataviz skill) — un solo hue para una sola serie, sin leyenda
// (el título del gráfico ya nombra la serie). Banda de referencia 1.0–2.0: rango "sano" de K
// según la literatura de salmónidos (docs/investigacion-parametros-produccion.md sección 7.1).
const COLOR_LINEA = "#2a78d6";
const COLOR_GRID = "#e1e0d9";
const COLOR_EJE = "#c3c2b7";
const COLOR_TEXTO_MUTED = "#898781";
const COLOR_BANDA_SANA = "#e1e0d9";

interface Props {
  datos: PuntoFactorCondicion[];
}

export function FactorCondicionChart({ datos }: Props) {
  if (datos.length === 0) {
    return <p style={{ color: COLOR_TEXTO_MUTED }}>Todavía no hay muestreos registrados para este lote.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={datos} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
        <ReferenceArea y1={1.0} y2={2.0} fill={COLOR_BANDA_SANA} fillOpacity={0.4} ifOverflow="extendDomain" />
        <XAxis
          dataKey="fecha"
          tick={{ fontSize: 12, fill: COLOR_TEXTO_MUTED }}
          stroke={COLOR_EJE}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 12, fill: COLOR_TEXTO_MUTED }}
          stroke={COLOR_EJE}
          tickLine={false}
          width={36}
          domain={["auto", "auto"]}
        />
        <Tooltip
          formatter={(value: unknown, name: unknown) => {
            if (name === "factorK" && typeof value === "number") return [value.toFixed(3), "Factor K"];
            return [String(value), String(name)];
          }}
          labelFormatter={(fecha) => `Muestreo: ${fecha}`}
          contentStyle={{ fontSize: 12, borderRadius: 6, borderColor: COLOR_GRID }}
        />
        <Line
          type="monotone"
          dataKey="factorK"
          stroke={COLOR_LINEA}
          strokeWidth={2}
          dot={{ r: 4, fill: COLOR_LINEA, strokeWidth: 0 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
