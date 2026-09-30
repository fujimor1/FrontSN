---
name: sierra-nevada-design-system
description: >-
  Estandares y Guia Oficial del Sistema de Diseno UI/UX de Sierra Nevada (Piscigranja de Truchas).
  Enfocado en maxima usabilidad, ergonomia para personal senior/adultos mayores,
  paleta de colores de alta definicion (Aqua/Slate), contraste accesible (WCAG AAA),
  tipografia legible, botones tactiles de 40px+, tablas limpias y componentes consistentes.
---

# 🐟 Sistema de Diseño Sierra Nevada (Truchas UI/UX)

Este documento establece las directrices, estándares y tokens obligatorios de diseño visual, accesibilidad y usabilidad para todos los módulos del software interno de la Piscigranja Sierra Nevada.

---

## 🎯 1. Principio Fundamental: Usabilidad para Personal Mayor (Senior-First UX)

El sistema interno es operado por personal de campo, administradores y biólogos acuícolas (muchos de ellos adultos mayores con visión cansada o expuestos a luz solar/reflejos de estanques).

### Reglas de Oro de Accesibilidad:
1. **Legibilidad Inmediata**:
   - Tamaño base de fuente: Mínimo **14px** para texto secundario, **15px** para cuerpo de texto y **20px - 26px** para títulos y métricas clave.
   - Peso de fuente: Mínimo `font-weight: 500` para datos críticos (evitar pesos finos 300/200 que se pierden).
   - Tipografía: **Inter** con `font-feature-settings: 'cv02', 'cv03', 'cv04', 'cv11'` para números tabulares nítidos.
2. **Área Táctil y Clickable Cómoda**:
   - Altura de controles (`controlHeight`): **40px a 44px**.
   - Espaciado entre botones: Mínimo **12px** para evitar clics accidentales.
3. **Alto Contraste y Cero Ambigüedad**:
   - Relación de contraste mínima de **4.5:1** (preferente **7:1** WCAG AAA).
   - Los iconos NUNCA deben ir solos sin texto explicativo o tooltip descriptivo en español claro.
   - Textos de estado siempre acompañados de píldoras coloreadas con borde visible.

---

## 🎨 2. Paleta de Colores y Tokens Visuales

### Colores de Identidad y Marca (Acuicultura Andina)
| Token | Valor Hex | Uso Principal |
| :--- | :--- | :--- |
| `color-primary-600` | `#1d4ed8` / `#2563eb` | Botones principales, enlaces activos, badges de marca |
| `color-primary-50` | `#eff6ff` | Fondo de elementos seleccionados en el menú, hover tenue |
| `color-aqua-600` | `#0284c7` | Acentos acuícolas, indicadores de oxígeno/biomasa |
| `color-aqua-50` | `#f0f9ff` | Fondos de tarjetas de monitoreo de agua |

### Escala de Grises y Superficies (Slate UI)
| Token | Valor Hex | Uso Principal |
| :--- | :--- | :--- |
| `color-bg-page` | `#f8fafc` | Fondo general de la aplicación |
| `color-bg-card` | `#ffffff` | Fondo de tarjetas, tablas y modales |
| `color-text-main` | `#0f172a` (Slate-900) | Títulos, encabezados y cifras métricas |
| `color-text-body` | `#334155` (Slate-700) | Texto general, etiquetas de formularios |
| `color-text-muted` | `#64748b` (Slate-500) | Textos secundarios, unidades de medida |
| `color-border` | `#e2e8f0` (Slate-200) | Bordes de inputs, tablas y divisiones |

### Estados Operativos (Píldoras Suaves con Alto Contraste)
| Estado | Fondo (`bg`) | Borde (`border`) | Texto (`text`) | Significado Operativo |
| :--- | :--- | :--- | :--- | :--- |
| **Óptimo** 🟢 | `#f0fdf4` | `#bbf7d0` | `#166534` | Stock suficiente, biomasa normal |
| **Reordenar / Alerta** 🟡 | `#fffbeb` | `#fde68a` | `#92400e` | Punto de Reorden alcanzado |
| **Crítico / Peligro** 🔴 | `#fef2f2` | `#fecaca` | `#991b1b` | Stock por debajo de seguridad, emergencia |
| **Informativo** 🔵 | `#eff6ff` | `#bfdbfe` | `#1e40af` | Lotes activos, cálculo bayesiano |

---

## 🧱 3. Estándares de Componentes UI

### Botones (`Button`)
```tsx
// Botón Primario de Acción (40px alto, texto claro con icono)
<Button type="primary" size="middle" icon={<SaveOutlined />} style={{ height: 40, borderRadius: 8, fontWeight: 600 }}>
  Guardar Registro
</Button>

// Botón Secundario / Cancelar
<Button size="middle" style={{ height: 40, borderRadius: 8, color: '#334155' }}>
  Cancelar
</Button>
```

### Form Inputs & Labels
- Todas las etiquetas (`label`) deben tener texto en **Slate-700** con peso `600` y tamaño de `14px`.
- Los inputs deben contar con placeholder de ejemplo real (ej: `"Ej. ALM-2026-001"`).
- Anillo de enfoque: `box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15)`.

### Tablas de Datos (`Table`)
- Cabecera: Fondo `#f8fafc`, texto Slate-600 en 13px mayúsculas pequeñas `letter-spacing: 0.05em`.
- Datos numéricos (kg, unidades, costos S/.): Alineación a la derecha (`align: 'right'`) con fuente monoespaciada/tabular.
- Paginación clara con indicador de total: `"Mostrando 1-10 de 45 registros"`.

---

## 🖼️ 4. Estándares de Imágenes y Multimedia

1. **Logo Corporativo (`logo-trucha.jpg`)**:
   - Renderizado en alta densidad (Retina ready: 2x/3x renderizado a tamaño display 48px o 64px).
   - Formato optimizado para carga instantánea (< 150 KB).
2. **Hero Image Acuícola (`trout-hero.jpg`)**:
   - Fotografía nítida de estanques raceway andinos con cielo y montañas de fondo.
   - Utilizado en el panel lateral del Login para generar sentido de pertenencia y calidez visual.
