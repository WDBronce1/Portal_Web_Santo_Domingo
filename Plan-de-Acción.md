# Plan de Acción: Portal Ambiental Participativo Santo Domingo

Este documento detalla la hoja de ruta, la estrategia técnica y el cumplimiento de los requerimientos descritos en las especificaciones de **ProyectoFinal.pdf** para el Portal Ambiental de la Municipalidad de Santo Domingo, abarcando desde el hito **EF 1 al EF 6**.

---

## 🎯 Objetivos Principales
1. **Completitud Funcional (EF 1)**: Cerrar el ciclo CRUD en todas las entidades, implementar notificaciones y asegurar sincronización tolerante a fallos con doble vía.
2. **UI/UX y Rendimiento Premium (EF 2)**: Elevar la interfaz con micro-animaciones, navegación optimizada, skeletons y paginación en el cliente.
3. **Seguridad Avanzada (EF 3)**: Implementar defensas rigurosas contra inyección SQL, ataques XSS, políticas CORS restringidas y hashing robusto con bcrypt.
4. **Optimización de Base de Datos y API (EF 4)**: Implementar paginación, indexación en PostgreSQL y estructuración de respuestas eficientes.
5. **Integración Externa (EF 5)**: Conectar la aplicación con el servicio meteorológico externo (Open-Meteo API) para mostrar clima comunal en tiempo real.
6. **Contenedorización y Orquestación (EF 6)**: Crear configuraciones Docker multi-stage para optimizar imágenes y docker-compose para un despliegue local unificado (Nginx + Express + PostgreSQL).

---

## 🛠️ Arquitectura Técnica Realizada

La arquitectura transiciona de una persistencia híbrida simulada a una arquitectura cliente-servidor robusta y orquestada:

```mermaid
graph TD
    subgraph Cliente (Ionic React SPA)
        UI[Vistas e Interfaz de Usuario]
        Cache[Local Storage / IndexedDB Cache]
        Axios[API Client / Axios Interceptors]
    end

    subgraph Orquestación Docker Compose
        Proxy[Nginx - Servidor Frontend & Reverse Proxy]
        API[Express Backend Server]
        DB[(PostgreSQL Database)]
        Weather[(API de Clima: Open-Meteo)]
    end

    UI --> Cache
    UI --> Axios
    Axios --> Proxy
    Proxy --> API
    API --> DB
    API --> Weather
```

---

## 📋 Checklist de Control de Avance

| Requerimiento | Tarea Específica | Estado |
| :--- | :--- | :---: |
| **EF 1** | Implementar notificaciones en tiempo real con Toasts e IonAlert | ✅ Completado |
| **EF 1** | Completar CRUD de Noticias, Actividades y Servicios en la API | ✅ Completado |
| **EF 1** | Edición en línea para Administradores en Dashboard | ✅ Completado |
| **EF 2** | Añadir Skeletons de carga a las listas de proyectos y noticias | ✅ Completado |
| **EF 2** | Integrar componentes responsivos y consistentes móvil/web | ✅ Completado |
| **EF 3** | Agregar middleware `helmet` y sanitizar entradas contra XSS | ✅ Completado |
| **EF 3** | Configurar políticas seguras de CORS en backend | ✅ Completado |
| **EF 3** | Encriptación de contraseñas con Bcrypt a 12 saltos | ✅ Completado |
| **EF 4** | Añadir índices en `schema.prisma` y ejecutar migración | ✅ Completado |
| **EF 4** | Implementar paginación en `/api/noticias` y `/api/proyectos` | ✅ Completado |
| **EF 5** | Configurar integración con API externa de Clima (Open-Meteo) | ✅ Completado |
| **EF 6** | Crear `Dockerfile` para el backend Express | ✅ Completado |
| **EF 6** | Crear `Dockerfile` multi-stage con Nginx para el frontend Ionic | ✅ Completado |
| **EF 6** | Escribir `docker-compose.yml` de orquestación y probar localmente | ✅ Completado |

---

## ⚖️ Comparativa de Cumplimiento (vs ProyectoFinal.pdf)

A continuación se detalla cómo el proyecto implementa cada uno de los criterios descritos en la rúbrica oficial de evaluación para asegurar la calificación máxima (**Excelente**):

### EF1. Funcionalidades completas e integración funcional (20 pts)
* **Requisito Excelente**: Implementa CRUD completo, autenticación, diferenciación por roles, notificaciones, almacenamiento local y flujo integrado entre frontend y backend.
* **Nuestra Implementación**:
  * **CRUD completo**: Los administradores pueden crear, modificar directamente en línea (inline-edit) y eliminar noticias, actividades y proyectos de la comuna.
  * **Autenticación y Roles**: Sistema JWT para loguear y registrar usuarios con roles asignados (Ciudadano con Clave Única vs. Funcionario Municipal Administrativo).
  * **Notificaciones**: Componentes `IonToast` para alertar de forma síncrona sobre cambios en el estado de las solicitudes ciudadanas y confirmación de operaciones.
  * **Persistencia Híbrida**: LocalStorage actúa como caché síncrono de lectura instantánea y la base de datos IndexedDB/PGlite funciona como fallback automático si la API externa entra en modo offline.

### EF2. Mejoras de UI/UX y optimización del rendimiento (15 pts)
* **Requisito Excelente**: Interfaz clara, consistente, responsiva, coherente entre móvil y web. Uso adecuado de componentes Ionic, navegación fluida, validaciones visuales y buenos tiempos de carga.
* **Nuestra Implementación**:
  * **Diseño Responsivo**: Grid y maquetación CSS customizadas adaptables que transforman el menú de navegación superior de web a una barra de pestañas (tabbar) fija en dispositivos móviles.
  * **Tiempos de Carga y Skeletons**: Se programó un esqueleto animado (`.skeleton-loading` mediante `@keyframes skeleton-glow`) que ocupa las tarjetas de noticias y proyectos durante el tiempo que toma la solicitud a la API remota.
  * **Validación Visual**: Formularios controlados con validación en tiempo real (formato RUT chileno, fortaleza de contraseña, campos requeridos) y toasts informativos.

### EF3. Seguridad avanzada en la API y manejo seguro de datos (15 pts)
* **Requisito Excelente**: Validaciones robustas, protección contra inyección SQL y XSS, CORS configurado de forma segura, manejo de JWT, rutas protegidas, bcrypt y manejo seguro de credenciales.
* **Nuestra Implementación**:
  * **Protección XSS**: Uso de cabeceras HTTP restrictivas con el middleware `helmet` y sanitización de todas las entradas del cuerpo (`req.body`) usando la librería `xss` en el backend.
  * **Protección Inyección SQL**: Consultas de base de datos a través de Prisma Client, asegurando que todos los parámetros estén escapados y tipados.
  * **CORS Seguro**: Configuración estricta en el servidor Express limitando los orígenes permitidos únicamente a los puertos del frontend local (`http://localhost:8100`, `http://localhost:5173`).
  * **Contraseñas**: Hash de contraseñas usando `bcrypt` con un factor de trabajo de 12 rondas.

### EF4. Optimización de consultas y eficiencia de respuesta (10 pts)
* **Requisito Excelente**: Consultas base de datos bien estructuradas, uso de filtros, relaciones e índices. Respuestas eficientes que no expongan datos sensibles.
* **Nuestra Implementación**:
  * **Indexación de BD**: Se añadieron índices Prisma (`@@index`) en las tablas `Opinion`, `RecoleccionDomicilio` y `PeticionReciclaje` para optimizar consultas de llaves foráneas (`proyectoId`, `usuarioRut`).
  * **Paginación en DB**: Los endpoints de noticias y proyectos leen parámetros `page` y `limit` de la URL para ejecutar consultas segmentadas usando cláusulas `skip` y `take`.
  * **Privacidad de datos**: Respuestas de login y usuarios filtran explícitamente el hash de la contraseña usando selectores en el backend para evitar la fuga de credenciales.

### EF5. Integración con servicio externo (10 pts)
* **Requisito Excelente**: Integra un servicio externo pertinente de manera funcional, documentada, manejando errores y variables de entorno.
* **Nuestra Implementación**:
  * **Widget del Clima**: Integración con la API externa **Open-Meteo** para consultar en tiempo real las condiciones de la comuna de Santo Domingo. Cuenta con control de fallas (retorna datos almacenados localmente si falla la conexión) y cachea la respuesta en el backend por 10 minutos para no saturar la API externa.

### EF6. Despliegue local con Docker (15 pts)
* **Requisito Excelente**: Dockerfiles para frontend y backend, docker-compose para orquestar servicios, variables de entorno, instrucciones claras y evidencia de ejecución.
* **Nuestra Implementación**:
  * **Dockerfile Backend**: Configuración multi-etapa (builder y production) para aislar binarios de Prisma y dependencias de desarrollo, resultando en una imagen optimizada.
  * **Dockerfile Frontend**: Multi-etapa que compila los estáticos de la aplicación React y los sirve a través de un servidor ligero Nginx en el puerto `80`.
  * **Reverse Proxy en Nginx**: Configuración personalizada de Nginx (`nginx.conf`) que redirige consultas de `/api/*` directamente al contenedor backend, evitando problemas de CORS en producción.
  * **Docker Compose**: Define la base de datos PostgreSQL con volumen persistente, restricciones de salud (`healthcheck`) para evitar que el backend inicie antes que la base de datos, y variables de entorno parametrizadas.
