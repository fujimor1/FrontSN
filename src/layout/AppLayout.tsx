import {
  AppstoreOutlined,
  CloudSyncOutlined,
  DashboardOutlined,
  ExperimentOutlined,
  HomeOutlined,
  InboxOutlined,
  LogoutOutlined,
  RobotOutlined,
  ShopOutlined,
  ShoppingOutlined,
  TagsOutlined,
  UnorderedListOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Avatar, Badge, Dropdown, Layout, Menu, Tag, Tooltip, Typography } from "antd";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useSincronizacionMuestreos } from "../offline/useSincronizacionMuestreos";

const { Header, Sider, Content } = Layout;

const ITEMS_MENU = [
  { key: "/", icon: <HomeOutlined style={{ fontSize: 16 }} />, label: "Inicio Producción" },
  {
    key: "inventario-menu",
    icon: <ShoppingOutlined style={{ fontSize: 16 }} />,
    label: "Inventario de Alimento",
    children: [
      { key: "/inventario/reorden", icon: <RobotOutlined />, label: "Plan Reorden y ML" },
      { key: "/inventario/kardex", icon: <UnorderedListOutlined />, label: "Kardex de Almacén" },
      { key: "/inventario/recepcion", icon: <InboxOutlined />, label: "Recepción de Compras" },
      { key: "/inventario/catalogo", icon: <ShopOutlined />, label: "Catálogo de Pellets" },
      { key: "/inventario/proveedores", icon: <TagsOutlined />, label: "Proveedores" },
    ],
  },
  {
    key: "herramientas",
    icon: <AppstoreOutlined style={{ fontSize: 16 }} />,
    label: "Producción y Lotes",
    children: [
      { key: "/lotes", icon: <ExperimentOutlined />, label: "Todos los lotes" },
      { key: "/campanias", icon: <TagsOutlined />, label: "Campañas" },
      { key: "/unidades", icon: <AppstoreOutlined />, label: "Unidades" },
      { key: "/reporte-produccion", icon: <DashboardOutlined />, label: "Reporte Global" },
    ],
  },
];

export function AppLayout() {
  const { usuario, cerrarSesion } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { sincronizando, pendientes } = useSincronizacionMuestreos();

  const seleccionActual = location.pathname === "/" ? "/" : location.pathname.startsWith("/etapas") ? "/" : location.pathname;

  const menuUsuario = {
    items: [
      {
        key: "user-info",
        disabled: true,
        label: (
          <div style={{ padding: "4px 0" }}>
            <Typography.Text strong style={{ display: "block", color: "#0f172a" }}>
              {usuario?.nombreCompleto}
            </Typography.Text>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {usuario?.nombreUsuario}
            </Typography.Text>
          </div>
        ),
      },
      { type: "divider" as const },
      { key: "logout", icon: <LogoutOutlined style={{ color: "#dc2626" }} />, label: "Cerrar sesión", danger: true },
    ],
    onClick: ({ key }: { key: string }) => {
      if (key === "logout") {
        cerrarSesion();
        navigate("/login", { replace: true });
      }
    },
  };

  return (
    <Layout style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <Sider
        breakpoint="lg"
        collapsedWidth="0"
        theme="light"
        width={250}
        style={{
          borderRight: "1px solid #e2e8f0",
          background: "#ffffff",
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.02)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "20px 22px",
            borderBottom: "1px solid #e2e8f0",
          }}
        >
          <img
            src="/logo-trucha.jpg"
            alt="Sierra Nevada Truchas"
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              objectFit: "cover",
              flexShrink: 0,
              boxShadow: "0 2px 6px rgba(37, 99, 235, 0.25)",
              border: "1px solid #e2e8f0",
            }}
          />
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#0f172a", lineHeight: 1.2 }}>
              Sierra Nevada
            </div>
            <div style={{ fontSize: 11, color: "#64748b", fontWeight: 500 }}>
              Piscigranja de Truchas
            </div>
          </div>
        </div>

        <div style={{ padding: "12px 6px" }}>
          <Menu
            theme="light"
            mode="inline"
            selectedKeys={[seleccionActual]}
            items={ITEMS_MENU}
            onClick={({ key }) => navigate(key)}
            style={{ border: "none", background: "transparent" }}
          />
        </div>
      </Sider>

      <Layout style={{ background: "#f8fafc" }}>
        <Header
          style={{
            background: "#ffffff",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingInline: 28,
            height: 64,
            boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.02)",
          }}
        >
          <div>
            <Tag color="blue" style={{ borderRadius: 9999, padding: "2px 10px", fontSize: 11, fontWeight: 500 }}>
              Piscigranja Sierra Nevada — Huaral 2026
            </Tag>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {pendientes > 0 && (
              <Tooltip title={sincronizando ? "Sincronizando muestreos..." : `${pendientes} muestreo(s) offline pendientes`}>
                <Badge count={pendientes} size="small">
                  <CloudSyncOutlined style={{ fontSize: 18, color: "#d97706" }} spin={sincronizando} />
                </Badge>
              </Tooltip>
            )}

            <Dropdown menu={menuUsuario} placement="bottomRight" arrow>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  cursor: "pointer",
                  padding: "4px 10px",
                  borderRadius: 8,
                  transition: "background 0.15s ease",
                }}
              >
                <Avatar
                  style={{
                    backgroundColor: "#eff6ff",
                    color: "#2563eb",
                    fontWeight: 600,
                    border: "1px solid #dbeafe",
                  }}
                  icon={!usuario?.nombreCompleto && <UserOutlined />}
                >
                  {usuario?.nombreCompleto?.[0]?.toUpperCase()}
                </Avatar>
                <div style={{ lineHeight: 1.2, textAlign: "left" }}>
                  <Typography.Text strong style={{ fontSize: 13, color: "#0f172a", display: "block" }}>
                    {usuario?.nombreCompleto ?? "Usuario"}
                  </Typography.Text>
                  <Typography.Text type="secondary" style={{ fontSize: 11, color: "#64748b" }}>
                    {usuario?.rol ?? "Operario"}
                  </Typography.Text>
                </div>
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content style={{ margin: "24px 28px", minHeight: 280 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
