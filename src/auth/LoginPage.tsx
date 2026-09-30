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
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#f0f2f5" }}>
      <Card style={{ width: 380 }}>
        <Typography.Title level={3} style={{ textAlign: "center", marginBottom: 4 }}>
          Sierra Nevada
        </Typography.Title>
        <Typography.Text type="secondary" style={{ display: "block", textAlign: "center", marginBottom: 24 }}>
          Sistema de producción
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
