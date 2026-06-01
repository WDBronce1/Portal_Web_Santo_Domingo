# Auditoría y Reconstrucción — Portal Web Municipalidad de Santo Domingo

**Fecha:** 2026-05-31
**Stack obligatorio respetado:** Ionic React 8 · React 19 · React Router DOM v5 · Vite 5 · TypeScript · Capacitor
**Resultado del build:** `tsc && vite build` ✅ sin errores · 13 chunks de páginas (lazy) · 0 errores de consola en runtime.

---

## 1. Resumen ejecutivo

El repositorio entregado tenía la estructura del stack correcto pero **no implementaba la mayoría de los requisitos**: el routing era un stub con autenticación simulada por `useState`, no existía gateway de seguridad real, faltaban casi todas las páginas, no había capa de datos ni modelo de roles, y convivían **dos árboles `src/` duplicados** (`/src` activo y `/frontend` muerto). Se reconstruyó el frontend completo sobre el mismo stack, con sistema de diseño propio (sin Tailwind roto), autenticación simulada de Clave Única + RBAC, gateway de rutas protegidas y capa de datos tipada persistida en `localStorage`, arquitectada para conmutar al API REST real (Express + Prisma) sin reescribir las vistas.

---

## 2. Hallazgos por severidad

| # | Severidad | Hallazgo | Resolución |
|---|-----------|----------|------------|
| H1 | 🔴 Crítica | Gateway de seguridad inexistente: rutas "protegidas" usaban `useState(false)` y nunca redirigían. | `ProtectedRoute` real con `useAuth`: intercepta, recuerda el intento (`intentoPendiente`) y redirige a `/login`; soporta `soloAdmin`. |
| H2 | 🔴 Crítica | Sin modelo de roles (RBAC). | Roles `ciudadano`/`admin` en `authService` + rutas `soloAdmin` para `/admin` y `/admin/reportes`. |
| H3 | 🟠 Alta | `setIntentoPendiente` se invocaba **durante el render** (anti-patrón React: "Cannot update a component while rendering"). | Extraído a componente `RedirigirALogin` que lo ejecuta dentro de `useEffect`. |
| H4 | 🟠 Alta | Validación de RUT ausente. | `validarRut` con algoritmo módulo-11 + `formatearRut` (formateo en `onIonBlur`). |
| H5 | 🟠 Alta | Sin saneamiento de entradas (riesgo XSS al renderizar comentarios/contenido). | `sanitizeText` aplicado en toda escritura de datos (opiniones, solicitudes, contenido admin). |
| H6 | 🟡 Media | Árbol `/frontend` duplicado y archivo `src/routes/AppRoutes.tsx` muerto que rompía el build. | Eliminado `AppRoutes.tsx` (dead code, recuperable vía git); routing unificado en `App.tsx`. |
| H7 | 🟡 Media | Sin code-splitting: bundle monolítico. | `React.lazy` + `Suspense` por ruta (13 chunks). |
| H8 | 🟢 Baja | `node_modules` versionado / sin garantías anti-secretos. | `.gitignore` ya cubre `node_modules`, `dist` y `.env*`; verificado que no hay secretos hardcodeados en `src`/`backend`. |

> **Nota de seguridad:** la "Clave Única" es **simulada** (validación local por RUT, fines académicos). No expone ni consume credenciales reales del Estado. El hashing real con `bcrypt` y JWT queda en el backend Express+Prisma (no ejecutable aquí por ausencia de PostgreSQL).

---

## 3. Matriz de trazabilidad de requisitos

### Requisitos funcionales (README)

| RF | Requisito | Implementación |
|----|-----------|----------------|
| RF1 | Consulta de servicios ambientales | `pages/Servicios.tsx` (recorridos de basura, puntos de reciclaje, zonas verdes) |
| RF2 | Geolocalización / ubicación de servicios | Datos de ubicación por sector en `Servicios` (puntos y zonas con dirección) |
| RF3 | Gestión de solicitudes ciudadanas | `crearSolicitud` (recolección / tacho) con validación + estado |
| RF4 | Visualización de proyectos comunales | `Proyectos/Lista-de-Proyectos.tsx` + `Detalle-de-Proyecto.tsx` |
| RF5 | Votación autenticada de proyectos | `Votar.tsx` tras gateway en `/proyectos/:id/opinar` + `RatingStars` |
| RF6 | Gestión de contenido (admin) | `Admin/Dashboard.tsx` — CRUD de noticias, actividades y proyectos |
| RF7 | Reportes (admin) | `Admin/Reportes.tsx` — consolidado de opiniones con gráficos de barras CSS |

### Requisitos no funcionales (README)

| RNF | Requisito | Implementación |
|-----|-----------|----------------|
| RNF1 | Identidad: RUT + Clave Única (gateway) | `ProtectedRoute` + `authService` (mod-11, RBAC, sesión) — **verificado**: `/admin` → redirige a login |
| RNF2 | Responsive Mobile-First | Sistema de diseño propio; tab-bar inferior fija con `safe-area-inset-bottom`; **verificado a 402×874 (iPhone 17 Pro)** |
| RNF3 | SPA | `IonReactRouter` + servidor con fallback SPA (`serve -s`) |

---

## 4. QA Responsive (iPhone 17 Pro)

- Viewport 402×874, DPR3 emulado en preview headless.
- **0 errores de consola** en carga inicial.
- Render correcto: header con escudo, dashboard de atajos, tarjeta de cogobernanza, tab-bar inferior de 6 ítems.
- Gateway verificado en vivo: ruta `/admin` redirige a "Ingreso con Clave Única".

---

## 5. Despliegue local

```bash
npm run build          # tsc + vite build → /dist
npx serve -s dist -l 4178
# → http://localhost:4178  (HTTP 200, abierto automáticamente en el navegador)
```

**Cuentas de prueba:** Ciudadana `12.345.678-5` / `clave1234` · Admin `11.111.111-1` / `admin1234`.

---

## 6. Pendientes / siguientes pasos

- Conectar la capa de datos al API real: reemplazar funciones de `dataService.ts` por `fetch` a `${API_BASE}/api/...` (la arquitectura ya lo contempla con `API_BASE`).
- Backend: añadir autenticación JWT + `bcrypt` en `backend/index.js` (modelos Prisma ya existen) y levantar PostgreSQL.
- Dockerizar (entrega final del curso): contenedor del frontend (build estático) + backend + base de datos.
- Evaluar eliminación del árbol `/frontend` duplicado (acción destructiva — requiere confirmación).
