import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConfigProvider } from "antd";
import esES from "antd/locale/es_ES";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ConfigProvider
      locale={esES}
      theme={{
        token: {
          colorPrimary: "#2563eb",
          colorLink: "#2563eb",
          colorLinkHover: "#1d4ed8",
          colorSuccess: "#16a34a",
          colorWarning: "#d97706",
          colorError: "#dc2626",
          colorInfo: "#0284c7",
          colorText: "#0f172a",
          colorTextSecondary: "#475569",
          colorTextTertiary: "#64748b",
          colorBorder: "#cbd5e1",
          colorBorderSecondary: "#e2e8f0",
          colorBgContainer: "#ffffff",
          colorBgLayout: "#f8fafc",
          borderRadius: 10,
          borderRadiusLG: 14,
          borderRadiusSM: 6,
          controlHeight: 40,
          controlHeightLG: 46,
          controlHeightSM: 32,
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.04)",
          boxShadowSecondary: "0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.05)",
        },
        components: {
          Button: {
            controlHeight: 38,
            borderRadius: 8,
            fontWeight: 500,
            paddingInline: 16,
          },
          Card: {
            headerFontSize: 15,
            headerHeight: 52,
            paddingLG: 20,
          },
          Table: {
            headerBg: "#f8fafc",
            headerColor: "#475569",
            rowHoverBg: "#f8fafc",
            cellPaddingBlock: 13,
            cellPaddingInline: 16,
            borderRadius: 10,
          },
          Menu: {
            itemSelectedBg: "#eff6ff",
            itemSelectedColor: "#1d4ed8",
            itemBorderRadius: 8,
            itemMarginInline: 8,
          },
          Input: {
            controlHeight: 40,
            activeBorderColor: "#2563eb",
          },
          Select: {
            controlHeight: 40,
          },
          DatePicker: {
            controlHeight: 40,
          },
          Form: {
            itemMarginBottom: 18,
            labelFontSize: 13,
          },
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </ConfigProvider>
  </StrictMode>,
);
