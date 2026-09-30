import { LockOutlined, MoonOutlined, SunOutlined, UserOutlined } from "@ant-design/icons";
import { Alert, Button, Card, Form, Input, Tooltip, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { useTheme } from "../theme/ThemeContext";

interface LoginFormValues {
  nombreUsuario: string;
  password: string;
}

export function LoginPage() {
  const { iniciarSesion, cargando, error } = useAuth();
  const { esOscuro, toggleTema } = useTheme();
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
        background: esOscuro ? "#141414" : "#f0f2f5",
        position: "relative",
      }}
    >
      <div style={{ position: "absolute", top: 20, right: 20 }}>
        <Tooltip title={esOscuro ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"}>
          <Button
            type="text"
            icon={esOscuro ? <SunOutlined style={{ color: "#faad14" }} /> : <MoonOutlined />}
            onClick={toggleTema}
            size="large"
          />
        </Tooltip>
      </div>

      <Card style={{ width: 380, borderColor: esOscuro ? "#303030" : undefined }}>
        <Typography.Title level={3} style={{ textAlign: "center", marginBottom: 4 }}>
          Sierra Nevada
        </Typography.Title>
        <Typography.Text type="secondary" style={{ display: "block", textAlign: "center", marginBottom: 24 }}>
          Sistema de producción e inventario
        </Typography.Text>

        {error && <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} />}

        <Form<LoginFormValues> layout="vertical" onFinish={onFinish} disabled={cargando}>
          <Form.Item name="nombreUsuario" label="Usuario" rules={[{ required: true, message: "Ingresa tu usuario" }]}>
            <Input prefix={<UserOutlined />} autoFocus />
          </Form.Item>
          <Form.Item name="password" label="Contraseña" rules={[{ required: true, message: "Ingresa tu contraseña" }]}>
            <Input.Password prefix={<LockOutlined />} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={cargando} block>
              Ingresar
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
