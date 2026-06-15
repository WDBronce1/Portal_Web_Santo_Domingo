# Portal Ambiental Participativo — Municipalidad de Santo Domingo

Aplicación Fullstack para la gestión ambiental comunal de Santo Domingo. Permite a la ciudadanía consultar servicios (recolección, reciclaje, zonas verdes), participar en la toma de decisiones mediante votación y opinión sobre proyectos, y a los funcionarios municipales gestionar el contenido y visualizar reportes de participación

---

## 👥 Integrantes
- **Rodrigo Rojas**
- **Guadalupe Marín**
- **Matías Núñez**

---


### Requerimientos Funcionales (RF)
1.  **RF1: Consulta de Servicios:** Visualización de servicios de recolección de basura y puntos de reciclaje
2.  **RF2: Geolocalización Informativa:** Mapa/lista de zonas verdes y puntos de reciclaje en la comuna
3.  **RF3: Gestión de Solicitudes:** Formulario para solicitar retiro de escombros o nuevos puntos de reciclaje
4.  **RF4: Cartera de Proyectos:** Visualización detallada de proyectos municipales en curso y planificados
5.  **RF5: Participación Ciudadana:** Sistema de votación y comentarios en proyectos (requiere sesión)
6.  **RF6: Gestión de Contenido (Admin):** CRUD completo para que administradores gestionen proyectos, noticias y actividades
7.  **RF7: Reportes Consolidados (Admin):** Visualización de métricas de participación y estado de solicitudes

### Requerimientos No Funcionales (RNF)
1.  **RNF1: Seguridad de Identidad:** Autenticación basada en RUT y contraseñas cifradas con bcrypt + JWT
2.  **RNF2: Diseño Responsivo Mobile-First:** Interfaz construida con Ionic para una experiencia óptima en dispositivos móviles y web
3.  **RNF3: Persistencia Relacional:** Uso de PostgreSQL para asegurar la integridad de los datos y permitir consultas complejas

---

## Tecnologías Utilizadas

| Componente | Tecnología |
|---|---|
| **Frontend** | Ionic React 8, TypeScript, Vite |
| **Backend** | Node.js, Express.js |
| **Base de Datos** | PostgreSQL 17 |
| **ORM** | Prisma |
| **Seguridad** | JWT, bcrypt, Helmet, XSS-Clean |
| **Despliegue** | Docker & Docker Compose |

---

## Arquitectura del Proyecto

```
Portal_Web_Santo_Domingo/
├── frontend/           # Aplicación Ionic React
│   ├── src/pages/      # Vistas (Inicio, Servicios, Admin, etc.)
│   └── src/components/ # Componentes reutilizables
├── backend/            # API RESTful en Express
│   ├── index.js        # Servidor y lógica de negocio
│   └── prisma/         # Esquema y migraciones de BD
├── otros/              # Documentación, diagramas y colección Postman
├── docker-compose.yml  # Orquestación de servicios
└── Dockerfile          # Definiciones de contenedores
```

---

## Instrucciones de Ejecución con Docker (Recomendado)

Para levantar todo el entorno (Frontend, Backend y Base de Datos) de forma automática:

1.  **Instalar Docker y Docker Compose en caso de no tenerlos.**
    Para Linux/Ubuntu:
    ```bash
    sudo apt install docker.io docker-buildx docker-compose-v2
    ```
    Para Windows:
    ```bash
    wsl --install
    ```
    Reinicie su computadora depsues de que se instale
    ```bash
    Invoke-WebRequest -Uri "https://docker.com" -OutFile "DockerInstaller.exe"
    .\DockerInstaller.exe install
    ```
    Se recomienda ver en profundidad la instalación de docker en caso de usar un sistema operativo distinto a Ubuntu o basados en ubuntu
2.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/WDBronce1/Portal_Web_Santo_Domingo.git
    cd Portal_Web_Santo_Domingo
    ```
3.  **Levantar los servicios:**
    ```bash
    sudo docker compose up -d --build
    ```
4.  **Acceso:**
    - **Frontend:** [http://localhost:8100](http://localhost:8100)
    - **Backend (API):** [http://localhost:3264/api/proyectos](http://localhost:3264/api/proyectos)

---

## Cuentas de Prueba

| Rol | RUT | Clave |
|---|---|---|
| **Ciudadano/a** | `12.345.678-5` | `clave1234` |
| **Administrador** | `11.111.111-1` | `admin1234` |

---

## Carpeta /otros
En la carpeta `/otros` se encontraran:
- `ProyectoFinal.pdf`: Requerimientos oficiales
- `Portal_Santo_Domingo.postman_collection.json`: Colección para probar la API
- `Plan-de-Acción.md` y `AUDITORIA.md`: Documentos de gestión

---

## Prototipo en Figma
- **Diseño y Prototipo:** [Ver en Figma](https://www.figma.com/design/013ipqQanul4cv33jTLhFr/PortalWeb_Muni_San.Dom?node-id=0-1&t=Drwdu0TrpZ3ev1Vw-1)
