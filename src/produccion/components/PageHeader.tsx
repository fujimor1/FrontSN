import { ArrowLeftOutlined } from "@ant-design/icons";
import { Typography } from "antd";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

interface PageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  backTo?: string;
  backLabel?: string;
  extra?: ReactNode;
}

export function PageHeader({ title, subtitle, backTo, backLabel = "Volver", extra }: PageHeaderProps) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 24,
        gap: 16,
        flexWrap: "wrap",
      }}
    >
      <div>
        {backTo && (
          <Link
            to={backTo}
            style={{
              fontSize: 14,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 8,
              color: "#334155",
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            <ArrowLeftOutlined style={{ fontSize: 14 }} /> {backLabel}
          </Link>
        )}
        <Typography.Title
          level={3}
          style={{
            margin: 0,
            color: "#0f172a",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            fontSize: 22,
          }}
        >
          {title}
        </Typography.Title>
        {subtitle && (
          <div style={{ color: "#334155", fontSize: 14, marginTop: 4, fontWeight: 400 }}>
            {subtitle}
          </div>
        )}
      </div>
      {extra && <div style={{ display: "flex", alignItems: "center", gap: 12 }}>{extra}</div>}
    </div>
  );
}
