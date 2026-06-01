# Portal Ambiental Participativo — Municipalidad de Santo Domingo

Aplicación web (SPA) para la gestión ambiental comunal de Santo Domingo. Permite a la
ciudadanía consultar servicios (recolección de basura, puntos de reciclaje, zonas verdes),
revisar la cartera de proyectos comunales, participar mediante votación y opinión sobre
proyectos, y a los funcionarios municipales gestionar contenido y consultar reportes
consolidados de participación.

Construida con **Ionic React** como **Single Page Application**, bajo el paradigma
*Mobile-First*, con autenticación simulada por **RUT + Clave Única** y control de acceso por
roles (Ciudadano / Administrador).

---

## Integrantes

- **Rodrigo Rojas**
- **Guadalupe Marín**
- **Matías Núñez**

---

## Descripción de la entrega

Esta entrega corresponde al portal con su **sistema visual definitivo** ("Herbario
Patrimonial") aplicado sobre la arquitectura Ionic React del proyecto. Incluye:

- Las **7 funcionalidades requeridas (RF)**: consulta de servicios, geolocalización
  informativa de reciclaje/zonas verdes, gestión de solicitudes, visualización de proyectos,
  participación ciudadana (votación), gestión de contenido (Admin) y generación de reportes (Admin).
- Los **3 requerimientos no funcionales (RNF)**: seguridad de identidad (RUT + Clave Única),
  diseño responsivo *Mobile-First* y rendimiento como SPA (navegación sin recargas).
- Control de acceso por roles con un *gateway* de seguridad: las rutas informativas son
  públicas; opinar requiere sesión de Ciudadano; el panel y los reportes son exclusivos de Admin.

---

## Tecnologías

| Área | Tecnología |
|---|---|
| Framework UI | Ionic React 8 |
| Librería base | React 19 |
| Enrutamiento | React Router DOM v5 (`@ionic/react-router`) |
| Build tool | Vite 5 |
| Lenguaje | TypeScript |
| Runtime nativo | Capacitor 8 |
| Estilos | CSS propio (`src/theme/app.css` + `variables.css`) + variables de Ionic |
| Testing | Vitest (unit) · Cypress (e2e) |

La persistencia de datos es **simulada con `localStorage`** (capa de servicios síncrona),
por lo que el proyecto se ejecuta de forma autónoma sin necesidad de un backend.

---

## Estructura del proyecto

```
src/
├── App.tsx                 # Definición de rutas (públicas, protegidas y solo-admin)
├── main.tsx                # Punto de entrada / setupIonicReact
├── components/             # Layout, Header/Tabbar, Icons, ui, ProtectedRoute, etc.
├── context/                # AuthContext (estado de sesión y rol)
├── pages/                  # Pantallas: Inicio, Servicios, Noticias, Actividades,
│   ├── Proyectos/          #   Opinión, Login, Registro, Perfil, Votar,
│   └── Admin/              #   Proyectos (lista/detalle) y Admin (Dashboard/Reportes)
├── services/               # authService y dataService (localStorage)
├── theme/                  # Sistema visual: app.css + variables.css
├── types/                  # Tipos TypeScript del dominio
└── utils/                  # Utilidades (validación/sanitización)
```

---

## Requisitos previos

- **Node.js** 18 o superior y **npm** (incluido con Node).
- Opcional: **Ionic CLI** (`npm install -g @ionic/cli`) para usar `ionic serve`.

Verifica tu versión con:

```bash
node --version
npm --version
```

---

## Pasos para ejecutar el proyecto

1. **Clonar el repositorio**

   ```bash
   git clone https://github.com/WDBronce1/Portal_Web_Santo_Domingo.git
   cd Portal_Web_Santo_Domingo
   ```

2. **Instalar las dependencias**

   ```bash
   npm install
   ```

3. **Levantar el servidor de desarrollo**

   ```bash
   npm run dev
   ```

   Vite mostrará una URL local (por defecto `http://localhost:5173`). Ábrela en el navegador.

4. **Generar el build de producción** (opcional)

   ```bash
   npm run build
   ```

   El resultado queda en la carpeta `dist/`.

5. **Previsualizar el build de producción** (opcional)

   ```bash
   npm run preview
   ```

### Otros comandos disponibles

| Comando | Descripción |
|---|---|
| `npm run lint` | Análisis estático con ESLint |
| `npm run test.unit` | Pruebas unitarias con Vitest |
| `npm run test.e2e` | Pruebas end-to-end con Cypress |

---

## Cuentas de prueba

El sistema incluye usuarios precargados para probar los distintos roles:

| Rol | RUT | Clave |
|---|---|---|
| Ciudadano/a | `12.345.678-5` | `clave1234` |
| Administrador | `11.111.111-1` | `admin1234` |

También es posible registrar una cuenta nueva de Ciudadano desde `/registro`.

---

## Rutas principales

- **Públicas:** `/inicio`, `/proyectos`, `/proyectos/:id`, `/servicios`, `/noticias`,
  `/actividades`, `/opinion`, `/login`, `/registro`
- **Protegidas (Ciudadano):** `/proyectos/:id/opinar`, `/perfil`
- **Protegidas (Admin):** `/admin`, `/admin/reportes`

---

## Despliegue

El proyecto está preparado para desplegarse en **Vercel** como SPA (ver `vercel.json`, que
incluye el *rewrite* hacia `index.html` para soportar enlaces profundos).

---

## Prototipo en Figma

- **Prototipo navegable:** https://www.figma.com/proto/013ipqQanul4cv33jTLhFr/PortalWeb_Muni_San.Dom?node-id=1-3&p=f&t=dPYWLWwAmm5rmG3A-1&scaling=min-zoom&content-scaling=fixed&page-id=0%3A1&starting-point-node-id=1%3A3
- **Diseño:** https://www.figma.com/design/013ipqQanul4cv33jTLhFr/PortalWeb_Muni_San.Dom?node-id=0-1&t=Drwdu0TrpZ3ev1Vw-1
