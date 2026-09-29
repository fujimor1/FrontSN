import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { PuntoCurvaCrecimiento } from "../../api/types";

// Misma paleta que las barras de "Progreso en la etapa": azul = FONDEPES, naranja = Sierra
// Nevada. El real va en un tercer color neutro oscuro para no confundirse con ningún marco.
const COLOR_REAL = "#1f2430";
const COLOR_FONDEPES = "#2a78d6";
const COLOR_SIERRA_NEVADA = "#eb6834";
const COLOR_GRID = "#e1e0d9";
const COLOR_EJE = "#c3c2b7";
const COLOR_TEXTO_MUTED = "#898781";

interface Props {
  real: PuntoCurvaCrecimiento[];
  esperadoFondepes: PuntoCurvaCrecimiento[];
  esperadoSierraNevada: PuntoCurvaCrecimiento[];
  metrica: "tallaCm" | "pesoGr";
  titulo: string;
  unidad: string;
}

export function CurvaCrecimientoChart({ real, esperadoFondepes, esperadoSierraNevada, metrica, titulo, unidad }: Props) {
  if (real.length === 0) {
    return <p style={{ color: COLOR_TEXTO_MUTED, fontSize: 13 }}>Todavía no hay muestreos registrados para este lote.</p>;
  }

  return (
    <div>
      <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{titulo}</p>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
          <CartesianGrid stroke={COLOR_GRID} strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="dia"
            type="number"
            allowDuplicatedCategory={false}
            tick={{ fontSize: 12, fill: COLOR_TEXTO_MUTED }}
            stroke={COLOR_EJE}
            tickLine={false}
            label={{ value: "Días desde el primer muestreo", position: "insideBottom", offset: -4, fontSize: 11, fill: COLOR_TEXTO_MUTED }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: COLOR_TEXTO_MUTED }}
            stroke={COLOR_EJE}
            tickLine={false}
            width={40}
            domain={["auto", "auto"]}
            unit={unidad}
          />
          <Tooltip
            formatter={(value: unknown) => (typeof value === "number" ? [`${value.toFixed(2)} ${unidad}`, undefined] : [String(value), undefined])}
            labelFormatter={(dia) => `Día ${dia}`}
            contentStyle={{ fontSize: 12, borderRadius: 6, borderColor: COLOR_GRID }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line
            data={esperadoFondepes}
            type="monotone"
            dataKey={metrica}
            name="Esperado FONDEPES"
            stroke={COLOR_FONDEPES}
            strokeWidth={2}
            strokeDasharray="5 4"
            dot={false}
            isAnimationActive={false}
          />
          <Line
            data={esperadoSierraNevada}
            type="monotone"
            dataKey={metrica}
            name="Esperado Sierra Nevada"
            stroke={COLOR_SIERRA_NEVADA}
            strokeWidth={2}
            strokeDasharray="5 4"
            dot={false}
            isAnimationActive={false}
          />
          <Line
            data={real}
            type="monotone"
            dataKey={metrica}
            name="Real"
            stroke={COLOR_REAL}
            strokeWidth={2.5}
            dot={{ r: 4, fill: COLOR_REAL, strokeWidth: 0 }}
            activeDot={{ r: 6 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
