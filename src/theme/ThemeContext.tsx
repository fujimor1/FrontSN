import React, { createContext, useContext, useEffect, useState } from "react";

export type ModoTema = "light" | "dark";

interface ThemeContextValue {
  tema: ModoTema;
  esOscuro: boolean;
  toggleTema: () => void;
  setTema: (tema: ModoTema) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "sierranevada_theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [tema, setTemaState] = useState<ModoTema>(() => {
    const guardado = localStorage.getItem(STORAGE_KEY);
    if (guardado === "dark" || guardado === "light") {
      return guardado;
    }
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  const setTema = (nuevoTema: ModoTema) => {
    setTemaState(nuevoTema);
    localStorage.setItem(STORAGE_KEY, nuevoTema);
  };

  const toggleTema = () => {
    setTema(tema === "dark" ? "light" : "dark");
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", tema);
    if (tema === "dark") {
      document.body.style.backgroundColor = "#141414";
      document.body.style.color = "#ffffffd9";
    } else {
      document.body.style.backgroundColor = "#f0f2f5";
      document.body.style.color = "#1a1d24";
    }
  }, [tema]);

  const esOscuro = tema === "dark";

  return (
    <ThemeContext.Provider value={{ tema, esOscuro, toggleTema, setTema }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme debe usarse dentro de un ThemeProvider");
  }
  return context;
}
