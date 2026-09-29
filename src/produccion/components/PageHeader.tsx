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
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, gap: 16, flexWrap: "wrap" }}>
      <div>
        {backTo && (
          <Link
            to={backTo}
            style={{ fontSize: 13, display: "inline-flex", alignItems: "center", gap: 4, marginBottom: 6, color: "#8a8f99" }}
          >
            <ArrowLeftOutlined /> {backLabel}
          </Link>
        )}
        <Typography.Title level={3} style={{ margin: 0 }}>
          {title}
        </Typography.Title>
        {subtitle && <Typography.Text type="secondary">{subtitle}</Typography.Text>}
      </div>
      {extra}
    </div>
  );
}
