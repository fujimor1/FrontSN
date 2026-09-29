import { message } from "antd";
import axios from "axios";

const TOKEN_STORAGE_KEY = "sierranevada_token";
export const USUARIO_STORAGE_KEY = "sierranevada_usuario";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5299",
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Si el token expiró o quedó inválido, cualquier request autenticado empieza a fallar con 401
// en silencio (React Query solo deja `data` en undefined) — sin esto, la app se queda mostrando
// al usuario "logueado" con todo vacío, sin avisar que hay que volver a iniciar sesión.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const esRutaDeAuth = error.config?.url?.includes("/api/auth/");
    if (error.response?.status === 401 && !esRutaDeAuth) {
      borrarToken();
      localStorage.removeItem(USUARIO_STORAGE_KEY);
      if (!window.location.pathname.startsWith("/login")) {
        message.warning("Tu sesión expiró — vuelve a iniciar sesión.");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export function guardarToken(token: string) {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function borrarToken() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export function obtenerToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}
