import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Alert, Button, Card, Form, Input, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

interface LoginFormValues {
  nombreUsuario: string;
  password: string;
}

export function LoginPage() {
  const { iniciarSesion, cargando, error } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values: LoginFormValues) => {
    const exito = await iniciarSesion(values.nombreUsuario, values.password);
    if (exito) navigate("/", { replace: true });
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f8fafc 0%, #edf2f7 100%)",
        padding: 20,
      }}
    >
      <Card
        style={{
          width: 420,
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)",
          borderRadius: 16,
          border: "1px solid #e2e8f0",
          padding: "16px 8px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
              color: "#fff",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              fontWeight: 700,
              boxShadow: "0 4px 10px 0 rgba(37, 99, 235, 0.35)",
              marginBottom: 14,
            }}
          >
            SN
          </div>
          <Typography.Title
            level={3}
            style={{
              margin: 0,
              color: "#0f172a",
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            Sierra Nevada
          </Typography.Title>
          <Typography.Text type="secondary" style={{ fontSize: 13, color: "#64748b", marginTop: 4, display: "block" }}>
            Sistema de Producción y Gestión de Inventario
          </Typography.Text>
        </div>

        {error && <Alert type="error" message={error} showIcon style={{ marginBottom: 20, borderRadius: 8 }} />}

        <Form<LoginFormValues> layout="vertical" onFinish={onFinish} disabled={cargando} size="large">
          <Form.Item
            name="nombreUsuario"
            label="Usuario"
            rules={[{ required: true, message: "Ingresa tu nombre de usuario" }]}
          >
            <Input prefix={<UserOutlined style={{ color: "#94a3b8" }} />} placeholder="Ej. admin" autoFocus />
          </Form.Item>
          <Form.Item
            name="password"
            label="Contraseña"
            rules={[{ required: true, message: "Ingresa tu contraseña" }]}
          >
            <Input.Password prefix={<LockOutlined style={{ color: "#94a3b8" }} />} placeholder="••••••••" />
          </Form.Item>
          <Form.Item style={{ marginTop: 24, marginBottom: 8 }}>
            <Button type="primary" htmlType="submit" loading={cargando} block size="large" style={{ height: 44, fontSize: 15 }}>
              Iniciar Sesión
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
