import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConfigProvider, theme } from "antd";
import esES from "antd/locale/es_ES";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import "./index.css";
import { ThemeProvider, useTheme } from "./theme/ThemeContext";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

function ThemedConfigProvider({ children }: { children: React.ReactNode }) {
  const { esOscuro } = useTheme();

  return (
    <ConfigProvider
      locale={esES}
      theme={{
        algorithm: esOscuro ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: "#2a78d6",
          borderRadius: 10,
          colorBorderSecondary: esOscuro ? "#303030" : "#e7e9ee",
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <ThemedConfigProvider>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </QueryClientProvider>
      </ThemedConfigProvider>
    </ThemeProvider>
  </StrictMode>,
);
