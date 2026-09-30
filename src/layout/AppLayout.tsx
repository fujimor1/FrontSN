import {
  AppstoreOutlined,
  CloudSyncOutlined,
  DashboardOutlined,
  ExperimentOutlined,
  HomeOutlined,
  InboxOutlined,
  LogoutOutlined,
  MoonOutlined,
  RobotOutlined,
  ShopOutlined,
  ShoppingOutlined,
  SunOutlined,
  TagsOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import { Avatar, Badge, Button, Dropdown, Layout, Menu, Space, Tooltip, Typography } from "antd";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useSincronizacionMuestreos } from "../offline/useSincronizacionMuestreos";
import { useTheme } from "../theme/ThemeContext";

const { Header, Sider, Content } = Layout;

const ITEMS_MENU = [
  { key: "/", icon: <HomeOutlined />, label: "Inicio Producción" },
  {
    key: "inventario-menu",
    icon: <ShoppingOutlined />,
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
    icon: <AppstoreOutlined />,
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
  const { esOscuro, toggleTema } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { sincronizando, pendientes } = useSincronizacionMuestreos();

  const seleccionActual = location.pathname === "/" ? "/" : location.pathname.startsWith("/etapas") ? "/" : location.pathname;

  const menuUsuario = {
    items: [{ key: "logout", icon: <LogoutOutlined />, label: "Cerrar sesión" }],
    onClick: () => {
      cerrarSesion();
      navigate("/login", { replace: true });
    },
  };

  const borderColor = esOscuro ? "#303030" : "#e7e9ee";
  const headerBg = esOscuro ? "#141414" : "#ffffff";
  const logoTextColor = esOscuro ? "#ffffff" : "#1a1d24";

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        breakpoint="lg"
        collapsedWidth="0"
        theme={esOscuro ? "dark" : "light"}
        width={240}
        style={{ borderRight: `1px solid ${borderColor}` }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "18px 20px",
            fontWeight: 600,
            fontSize: 15,
            color: logoTextColor,
            borderBottom: `1px solid ${borderColor}`,
          }}
        >
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: 7,
              background: "#2a78d6",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            SN
          </div>
          Sierra Nevada
        </div>
        <Menu
          theme={esOscuro ? "dark" : "light"}
          mode="inline"
          selectedKeys={[seleccionActual]}
          items={ITEMS_MENU}
          onClick={({ key }) => navigate(key)}
          style={{ border: "none", padding: "8px" }}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            background: headerBg,
            borderBottom: `1px solid ${borderColor}`,
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 16,
            paddingInline: 24,
          }}
        >
          <Tooltip title={esOscuro ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"}>
            <Button
              type="text"
              icon={esOscuro ? <SunOutlined style={{ color: "#faad14" }} /> : <MoonOutlined />}
              onClick={toggleTema}
              style={{ fontSize: 16 }}
            />
          </Tooltip>

          {pendientes > 0 && (
            <Tooltip title={sincronizando ? "Sincronizando muestreos pendientes..." : `${pendientes} muestreo(s) esperando señal para sincronizar`}>
              <Badge count={pendientes} size="small">
                <CloudSyncOutlined style={{ fontSize: 18, color: "#eda100" }} spin={sincronizando} />
              </Badge>
            </Tooltip>
          )}
          <Dropdown menu={menuUsuario} placement="bottomRight">
            <Space style={{ cursor: "pointer", lineHeight: "normal" }}>
              <Avatar>{usuario?.nombreCompleto?.[0]?.toUpperCase()}</Avatar>
              <div style={{ lineHeight: 1.3 }}>
                <div>
                  <Typography.Text strong>{usuario?.nombreCompleto}</Typography.Text>
                </div>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  {usuario?.rol}
                </Typography.Text>
              </div>
            </Space>
          </Dropdown>
        </Header>
        <Content style={{ margin: 24 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
