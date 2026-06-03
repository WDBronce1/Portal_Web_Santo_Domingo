// Arranque de datos: hidrata la caché local (localStorage) desde la API de Express o PostgreSQL (PGlite) local.
//
// Se ejecuta UNA vez antes de renderizar la app. Para cada tabla:
//   1. Intenta obtener los datos desde la API REST (Express) mediante apiClient.
//   2. Si tiene éxito, hidrata localStorage y actualiza PGlite en segundo plano.
//   3. Si falla (o no tiene endpoint, ej: solicitudes locales), lee desde PGlite.
//   4. Si PGlite está vacía, la siembra con los datos iniciales y persiste.
//   5. Vuelca el resultado en localStorage, que es la caché que leen las páginas de forma síncrona.

import { initDb, loadTable, upsertRow, type TableName } from './db';
import {
  KEYS,
  SEED_PROYECTOS,
  SEED_NOTICIAS,
  SEED_ACTIVIDADES,
  SEED_OPINIONES,
} from './dataService';
import { USERS_KEY, SEED_USUARIOS } from './authService';
import { apiClient } from './apiClient';

interface TablaConfig {
  tabla: TableName;
  cacheKey: string;
  pk: string;
  seed: Record<string, unknown>[];
  orderBy?: string;
  apiPath?: string;
}

const TABLAS: TablaConfig[] = [
  { tabla: 'sd_proyectos', cacheKey: KEYS.proyectos, pk: 'id', seed: SEED_PROYECTOS as unknown as Record<string, unknown>[], apiPath: '/api/proyectos' },
  { tabla: 'sd_noticias', cacheKey: KEYS.noticias, pk: 'id', seed: SEED_NOTICIAS as unknown as Record<string, unknown>[], orderBy: '"fecha" DESC', apiPath: '/api/noticias' },
  { tabla: 'sd_actividades', cacheKey: KEYS.actividades, pk: 'id', seed: SEED_ACTIVIDADES as unknown as Record<string, unknown>[], apiPath: '/api/actividades' },
  { tabla: 'sd_opiniones', cacheKey: KEYS.opiniones, pk: 'id', seed: SEED_OPINIONES as unknown as Record<string, unknown>[], apiPath: '/api/opiniones' },
  { tabla: 'sd_solicitudes', cacheKey: KEYS.solicitudes, pk: 'id', seed: [] },
  { tabla: 'sd_usuarios', cacheKey: USERS_KEY, pk: 'rut', seed: SEED_USUARIOS as unknown as Record<string, unknown>[] },
];

/**
 * Inicializa la base de datos e hidrata la caché local (localStorage)
 * intentando jalar desde la API REST primero.
 */
export async function bootstrapDb(): Promise<void> {
  // Inicializamos PGlite local
  await initDb();

  for (const cfg of TABLAS) {
    let filas: Record<string, unknown>[] = [];
    let apiSuccess = false;

    // Si tiene ruta de API configurada, intentamos jalar datos de la API real
    if (cfg.apiPath) {
      try {
        const response = await apiClient.get(cfg.apiPath);
        if (response.status === 200 && Array.isArray(response.data)) {
          // Adaptamos la respuesta del backend
          filas = response.data.map((item: any) => {
            // El backend puede enviar las fechas en formato ISO completo
            const itemAdaptado = { ...item };
            if (itemAdaptado.fechaInicio && typeof itemAdaptado.fechaInicio === 'string') {
              itemAdaptado.fechaInicio = itemAdaptado.fechaInicio.slice(0, 10);
            }
            if (itemAdaptado.fechaPublicacion && typeof itemAdaptado.fechaPublicacion === 'string') {
              itemAdaptado.fecha = itemAdaptado.fechaPublicacion.slice(0, 10);
            }
            if (itemAdaptado.fecha && typeof itemAdaptado.fecha === 'string') {
              itemAdaptado.fecha = itemAdaptado.fecha.slice(0, 10);
            }
            // Mapear campos de opiniones si hace falta
            if (cfg.tabla === 'sd_opiniones') {
              if (!itemAdaptado.usuarioNombre) {
                itemAdaptado.usuarioNombre = 'Vecino/a';
              }
            }
            return itemAdaptado;
          });
          apiSuccess = true;
          console.log(`[Bootstrap] Datos cargados desde API REST para ${cfg.tabla}:`, filas.length);
        }
      } catch (err) {
        console.warn(`[Bootstrap] No se pudo obtener datos desde API REST para ${cfg.tabla}. Usando local...`);
      }
    }

    // Si falló la API (o no tiene ruta API), cargamos de PGlite local
    if (!apiSuccess) {
      filas = await loadTable<Record<string, unknown>>(cfg.tabla, cfg.orderBy);

      // Si la base local también está vacía, sembramos
      if (filas.length === 0 && cfg.seed.length > 0) {
        for (const fila of cfg.seed) {
          await upsertRow(cfg.tabla, cfg.pk, fila);
        }
        filas = await loadTable<Record<string, unknown>>(cfg.tabla, cfg.orderBy);
      }
    } else {
      // Si la API funcionó, sincronizamos PGlite local en background
      for (const fila of filas) {
        upsertRow(cfg.tabla, cfg.pk, fila).catch((err) =>
          console.warn(`[Bootstrap] Error al actualizar PGlite para ${cfg.tabla}:`, err)
        );
      }
    }

    // Volcar a caché local
    localStorage.setItem(cfg.cacheKey, JSON.stringify(filas));
  }
}
