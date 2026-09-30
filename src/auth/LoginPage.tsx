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
        padding: 24,
      }}
    >
      <Card
        style={{
          width: "100%",
          maxWidth: 920,
          boxShadow: "0 20px 35px -10px rgba(15, 23, 42, 0.12), 0 1px 3px 0 rgba(0, 0, 0, 0.05)",
          borderRadius: 20,
          border: "1px solid #e2e8f0",
          overflow: "hidden",
          padding: 0,
        }}
        styles={{ body: { padding: 0 } }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
            minHeight: 520,
          }}
        >
          {/* Panel Izquierdo: Formulario Accesible */}
          <div
            style={{
              padding: "44px 38px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              background: "#ffffff",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
              <img
                src="/logo-trucha.jpg"
                alt="Logo Trucha Sierra Nevada"
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 12,
                  objectFit: "cover",
                  boxShadow: "0 3px 8px rgba(37, 99, 235, 0.2)",
                  border: "1px solid #e2e8f0",
                }}
              />
              <div>
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
                  Sierra Nevada
                </Typography.Title>
                <Typography.Text style={{ fontSize: 14, color: "#334155", fontWeight: 500 }}>
                  Piscigranja de Truchas • Sistema Interno
                </Typography.Text>
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <Typography.Title level={4} style={{ margin: "0 0 6px 0", color: "#1e293b", fontWeight: 600 }}>
                Acceso al Sistema
              </Typography.Title>
              <Typography.Text style={{ fontSize: 14, color: "#475569" }}>
                Ingrese sus credenciales de operador o administrador para continuar.
              </Typography.Text>
            </div>

            {error && (
              <Alert
                type="error"
                message={error}
                showIcon
                style={{ marginBottom: 20, borderRadius: 10, fontSize: 14 }}
              />
            )}

            <Form<LoginFormValues> layout="vertical" onFinish={onFinish} disabled={cargando} size="large" >
              <Form.Item
                name="nombreUsuario"
                label={<span style={{ fontSize: 14, fontWeight: 600, color: "#334155" }}>Usuario</span>}
                rules={[{ required: true, message: "Por favor ingrese su usuario" }]}
              >
                <Input size="large" prefix={<UserOutlined style={{ color: "#334155", fontSize: 16 }} />}
                  placeholder="Ej. admin"
                  autoFocus
                  style={{ height: 44, borderRadius: 8, fontSize: 15 }}
                />
              </Form.Item>

              <Form.Item
                name="password"
                label={<span style={{ fontSize: 14, fontWeight: 600, color: "#334155" }}>Contraseña</span>}
                rules={[{ required: true, message: "Por favor ingrese su contraseña" }]}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: "#334155", fontSize: 16 }} />}
                  placeholder="••••••••"
                  style={{ height: 44, borderRadius: 8, fontSize: 15 }}
                />
              </Form.Item>

              <Form.Item style={{ marginTop: 28, marginBottom: 0 }}>
                <Button size="large" type="primary"
                  htmlType="submit"
                  loading={cargando}
                  block
                  style={{
                    height: 46,
                    fontSize: 16,
                    fontWeight: 600,
                    borderRadius: 8,
                    background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                    boxShadow: "0 4px 12px rgba(37, 99, 235, 0.35)",
                  }}
                >
                  Iniciar Sesión
                </Button>
              </Form.Item>
            </Form>
          </div>

          {/* Panel Derecho: Fotografía Andina en Alta Definición */}
          <div
            style={{
              position: "relative",
              backgroundImage: `url('/trout-hero.jpg')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              padding: 36,
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "linear-gradient(180deg, rgba(15, 23, 42, 0.2) 0%, rgba(15, 23, 42, 0.75) 100%)",
              }}
            />
            <div
              style={{
                position: "relative",
                zIndex: 1,
                color: "#ffffff",
              }}
            >
              <div
                style={{
                  display: "inline-block",
                  padding: "4px 12px",
                  borderRadius: 20,
                  background: "rgba(37, 99, 235, 0.85)",
                  backdropFilter: "blur(4px)",
                  fontSize: 14,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: 10,
                }}
              >
                Acuicultura de Precisión
              </div>
              <Typography.Title
                level={3}
                style={{
                  color: "#ffffff",
                  fontWeight: 700,
                  margin: "0 0 8px 0",
                  lineHeight: 1.3,
                  textShadow: "0 2px 4px rgba(0,0,0,0.4)",
                }}
              >
                Control Total de Producción & Alimentación
              </Typography.Title>
              <Typography.Text
                style={{
                  color: "rgba(255, 255, 255, 0.9)",
                  fontSize: 14,
                  lineHeight: 1.5,
                  display: "block",
                  textShadow: "0 1px 3px rgba(0,0,0,0.4)",
                }}
              >
                Monitoreo continuo de biomasa, cálculo bayesiano de crecimiento y gestión integral de inventario.
              </Typography.Text>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
