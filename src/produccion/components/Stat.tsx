import type { ReactNode } from "react";
import { Tag, Typography } from "antd";

// Piezas visuales compartidas entre Dashboard, EtapaUnidadesPage y LoteDetailPage — mismo borde,
// mismo patrón de "badge de ícono con tinte" y "número grande + label chico" en toda la app.
export const BORDE = "1px solid #e7e9ee";
export const SOMBRA = "0 1px 2px rgba(16,24,40,0.04)";

export function IconoBadge({ color, icono, size = 40 }: { color: string; icono: ReactNode; size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size >= 36 ? 10 : 8,
        background: `${color}1a`,
        color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size >= 36 ? 18 : 14,
        flexShrink: 0,
      }}
    >
      {icono}
    </div>
  );
}

export function MiniStat({
  label,
  value,
  suffix,
  valueColor,
  nota,
}: {
  label: string;
  value: ReactNode;
  suffix?: string;
  valueColor?: string;
  nota?: ReactNode;
}) {
  return (
    <div>
      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
        {label}
      </Typography.Text>
      <div style={{ fontSize: 20, fontWeight: 600, lineHeight: 1.4, color: valueColor }}>
        {value}
        {suffix && (
          <Typography.Text type="secondary" style={{ fontSize: 13, fontWeight: 400, marginLeft: 4 }}>
            {suffix}
          </Typography.Text>
        )}
      </div>
      {nota && (
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          {nota}
        </Typography.Text>
      )}
    </div>
  );
}

export function BarraRango({
  label,
  actual,
  min,
  max,
  unidad,
  color = "#2a78d6",
}: {
  label: string;
  actual: number;
  min: number;
  max: number;
  unidad: string;
  color?: string;
}) {
  const bajo = actual < min;
  const alto = actual > max;
  const pctCrudo = max > min ? ((actual - min) / (max - min)) * 100 : 0;
  // Con el valor real muy por debajo del mínimo, el ancho calculado da 0% — invisible, parece que
  // no hay dato. Se deja un mínimo visible (4%) para que la barra siempre muestre algo, aunque sea
  // "recién empezando".
  const pct = bajo ? 4 : Math.min(100, pctCrudo);
  const colorBarra = alto ? "#d03b3b" : bajo ? "#eda100" : color;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          {label}
        </Typography.Text>
        <Typography.Text strong style={{ fontSize: 12, color: alto || bajo ? colorBarra : undefined }}>
          {actual.toFixed(2)} {unidad}
        </Typography.Text>
      </div>
      <div style={{ height: 8, borderRadius: 4, background: "#eef0f3", position: "relative", overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            width: `${pct}%`,
            background: colorBarra,
            borderRadius: 4,
            transition: "width 0.2s",
          }}
        />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
        <Typography.Text type="secondary" style={{ fontSize: 11 }}>
          {Number(min.toFixed(1))} {unidad}
        </Typography.Text>
        <Typography.Text type="secondary" style={{ fontSize: 11 }}>
          {Number(max.toFixed(1))} {unidad}
        </Typography.Text>
      </div>
    </div>
  );
}

export function BarraOcupacion({
  actual,
  max,
  unidad,
  label,
}: {
  actual: number;
  max: number;
  unidad: string;
  label?: string;
}) {
  const pctCrudo = max > 0 ? (actual / max) * 100 : 0;
  const sobrecargada = pctCrudo > 100;
  const colorBarra = sobrecargada ? "#d03b3b" : pctCrudo >= 80 ? "#eda100" : "#2a9d4a";
  return (
    <div>
      {label && (
        <Typography.Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 6 }}>
          {label}
        </Typography.Text>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <Typography.Text strong style={{ fontSize: 12, color: sobrecargada ? colorBarra : undefined }}>
          {actual.toFixed(2)} / {max.toFixed(2)} {unidad}
        </Typography.Text>
        <Typography.Text type="secondary" style={{ fontSize: 12, color: sobrecargada ? colorBarra : undefined }}>
          {pctCrudo.toFixed(0)}%
        </Typography.Text>
      </div>
      <div style={{ height: 8, borderRadius: 4, background: "#eef0f3", position: "relative", overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            width: `${Math.min(100, pctCrudo)}%`,
            background: colorBarra,
            borderRadius: 4,
            transition: "width 0.2s",
          }}
        />
      </div>
    </div>
  );
}

/// Días reales vs. rango esperado (min/max) — "Rápido"/"Lento"/"En línea", con tolerancia
/// opcional (usada para el tramo Sierra Nevada, que solo da un número central, no un rango).
export function EstadoDuracion({
  dias,
  min,
  max,
  tolerancia,
}: {
  dias: number | null;
  min: number | null;
  max: number | null;
  tolerancia?: number;
}) {
  if (dias == null) return <Tag>En curso</Tag>;
  if (min == null || max == null) return <Tag>Sin referencia</Tag>;

  const efMin = tolerancia ? min * (1 - tolerancia) : min;
  const efMax = tolerancia ? max * (1 + tolerancia) : max;

  if (dias < efMin) return <Tag color="blue">Rápido</Tag>;
  if (dias > efMax) return <Tag color="orange">Lento</Tag>;
  return <Tag color="green">En línea</Tag>;
}

export function EtiquetaSeccion({ children }: { children: ReactNode }) {
  return (
    <Typography.Text
      type="secondary"
      style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4 }}
    >
      {children}
    </Typography.Text>
  );
}
