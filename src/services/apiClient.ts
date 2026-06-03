import axios from 'axios';

export const API_BASE = (import.meta as any).env?.VITE_API_BASE ?? 'http://localhost:3264';

// Crear instancia de Axios con la URL base de nuestro servidor
export const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de Peticiones: Adjunta el JWT token si existe en localStorage
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('sd_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('[API Client] Error en petición saliente:', error);
    return Promise.reject(error);
  }
);

// Interceptor de Respuestas: Manejo de errores global (ej: 401 Unauthorized para tokens vencidos)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      console.error(`[API Client] Error devuelto por el servidor (Status ${status}):`, data);

      if (status === 401) {
        console.warn('[API Client] No autorizado / Token expirado. Limpiando sesión...');
        localStorage.removeItem('sd_token');
        localStorage.removeItem('sd_session');
        // Redirigir al inicio o login si estamos en el navegador
        if (typeof window !== 'undefined' && !window.location.pathname.endsWith('/login')) {
          window.location.href = '/login';
        }
      }
    } else if (error.request) {
      console.error('[API Client] Error de conexión, sin respuesta del servidor:', error.request);
    } else {
      console.error('[API Client] Error de configuración de petición:', error.message);
    }
    return Promise.reject(error);
  }
);
