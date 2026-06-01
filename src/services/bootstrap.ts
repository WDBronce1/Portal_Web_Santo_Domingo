// Arranque de datos: hidrata la caché local (localStorage) desde PostgreSQL.
//
// Se ejecuta UNA vez antes de renderizar la app. Para cada tabla:
//   1. Lee las filas desde PostgreSQL (PGlite).
//   2. Si la tabla está vacía, la siembra con los datos iniciales y persiste.
//   3. Vuelca el resultado en localStorage, que es la caché que leen las páginas.
//
// Así las lecturas siguen siendo síncronas e instantáneas (las 11 pantallas no
// cambian) pero el dato proviene de una base de datos PostgreSQL real. Si la BD
// falla, se hace throw y main.tsx renderiza igual usando la caché/seed local.

import { initDb, loadTable, upsertRow, type TableName } from './db';
import {
  KEYS,
  SEED_PROYECTOS,
  SEED_NOTICIAS,
  SEED_ACTIVIDADES,
  SEED_OPINIONES,
} from './dataService';
import { USERS_KEY, SEED_USUARIOS } from './authService';

interface TablaConfig {
  tabla: TableName;
  cacheKey: string;
  pk: string;
  seed: Record<string, unknown>[];
  orderBy?: string;
}

const TABLAS: TablaConfig[] = [
  { tabla: 'sd_proyectos', cacheKey: KEYS.proyectos, pk: 'id', seed: SEED_PROYECTOS as unknown as Record<string, unknown>[] },
  { tabla: 'sd_noticias', cacheKey: KEYS.noticias, pk: 'id', seed: SEED_NOTICIAS as unknown as Record<string, unknown>[], orderBy: '"fecha" DESC' },
  { tabla: 'sd_actividades', cacheKey: KEYS.actividades, pk: 'id', seed: SEED_ACTIVIDADES as unknown as Record<string, unknown>[] },
  { tabla: 'sd_opiniones', cacheKey: KEYS.opiniones, pk: 'id', seed: SEED_OPINIONES as unknown as Record<string, unknown>[] },
  { tabla: 'sd_solicitudes', cacheKey: KEYS.solicitudes, pk: 'id', seed: [] },
  { tabla: 'sd_usuarios', cacheKey: USERS_KEY, pk: 'rut', seed: SEED_USUARIOS as unknown as Record<string, unknown>[] },
];

/**
 * Inicializa PostgreSQL e hidrata la caché local. Lanza error si la BD no se
 * puede inicializar (el llamador decide cómo degradar).
 */
export async function bootstrapDb(): Promise<void> {
  await initDb();

  for (const cfg of TABLAS) {
    let filas = await loadTable<Record<string, unknown>>(cfg.tabla, cfg.orderBy);

    if (filas.length === 0 && cfg.seed.length > 0) {
      // Primera ejecución: sembrar la base de datos con los datos iniciales.
      for (const fila of cfg.seed) {
        await upsertRow(cfg.tabla, cfg.pk, fila);
      }
      filas = await loadTable<Record<string, unknown>>(cfg.tabla, cfg.orderBy);
    }

    localStorage.setItem(cfg.cacheKey, JSON.stringify(filas));
  }
}
