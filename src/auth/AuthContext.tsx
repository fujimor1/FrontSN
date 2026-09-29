import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { apiClient, borrarToken, guardarToken, USUARIO_STORAGE_KEY } from "../api/client";
import type { ResultadoLogin, RolUsuario } from "../api/types";

interface SesionUsuario {
  nombreUsuario: string;
  nombreCompleto: string;
  rol: RolUsuario;
}

interface AuthContextValue {
  usuario: SesionUsuario | null;
  cargando: boolean;
  error: string | null;
  iniciarSesion: (nombreUsuario: string, password: string) => Promise<boolean>;
  cerrarSesion: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function leerUsuarioGuardado(): SesionUsuario | null {
  const bruto = localStorage.getItem(USUARIO_STORAGE_KEY);
  if (!bruto) return null;
  try {
    return JSON.parse(bruto) as SesionUsuario;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<SesionUsuario | null>(leerUsuarioGuardado);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const iniciarSesion = async (nombreUsuario: string, password: string): Promise<boolean> => {
    setCargando(true);
    setError(null);
    try {
      const { data } = await apiClient.post<ResultadoLogin>("/api/auth/login", { nombreUsuario, password });
      guardarToken(data.token);
      const sesion: SesionUsuario = { nombreUsuario: data.nombreUsuario, nombreCompleto: data.nombreCompleto, rol: data.rol };
      localStorage.setItem(USUARIO_STORAGE_KEY, JSON.stringify(sesion));
      setUsuario(sesion);
      return true;
    } catch {
      setError("Usuario o contraseña incorrectos.");
      return false;
    } finally {
      setCargando(false);
    }
  };

  const cerrarSesion = () => {
    borrarToken();
    localStorage.removeItem(USUARIO_STORAGE_KEY);
    setUsuario(null);
  };

  const value = useMemo(
    () => ({ usuario, cargando, error, iniciarSesion, cerrarSesion }),
    [usuario, cargando, error],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return context;
}
