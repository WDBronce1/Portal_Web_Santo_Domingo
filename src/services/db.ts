// Capa de base de datos PostgreSQL real (PGlite).
//
// PGlite es el motor oficial de PostgreSQL compilado a WebAssembly: ejecuta un
// Postgres completo dentro de la aplicación y persiste los datos en IndexedDB del
// navegador. Es PostgreSQL de verdad (esquema, tipos, SQL, llaves primarias y
// constraints), sin servidores que mantener ni costos.
//
// Esta capa expone operaciones genéricas (loadTable / upsertRow / deleteRow) que
// el resto de los servicios usa para leer y escribir. La estrategia es
// "caché-a-través-de-BD": al iniciar la app se hidrata localStorage desde Postgres
// (ver bootstrap.ts) para que las lecturas sigan siendo síncronas e instantáneas,
// y cada escritura se replica aquí para que el dato persista en la base de datos.

import { PGlite } from '@electric-sql/pglite';

// Nombres de tabla permitidos (allowlist) — evita interpolar identificadores
// arbitrarios en el SQL.
export type TableName =
  | 'sd_proyectos'
  | 'sd_noticias'
  | 'sd_actividades'
  | 'sd_opiniones'
  | 'sd_solicitudes'
  | 'sd_usuarios';

const TABLE_NAMES: readonly TableName[] = [
  'sd_proyectos',
  'sd_noticias',
  'sd_actividades',
  'sd_opiniones',
  'sd_solicitudes',
  'sd_usuarios',
];

// Esquema. Se usan identificadores entre comillas para conservar el camelCase y
// que cada fila mapee 1:1 con los tipos TypeScript del dominio.
const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS sd_proyectos (
  "id" integer PRIMARY KEY,
  "nombre" text NOT NULL,
  "sector" text NOT NULL,
  "estado" text NOT NULL,
  "descripcion" text NOT NULL,
  "duracionMeses" integer NOT NULL,
  "fechaInicio" text NOT NULL
);

CREATE TABLE IF NOT EXISTS sd_noticias (
  "id" integer PRIMARY KEY,
  "titulo" text NOT NULL,
  "fecha" text NOT NULL,
  "resumen" text NOT NULL,
  "contenido" text NOT NULL,
  "autor" text NOT NULL
);

CREATE TABLE IF NOT EXISTS sd_actividades (
  "id" integer PRIMARY KEY,
  "titulo" text NOT NULL,
  "fecha" text NOT NULL,
  "hora" text NOT NULL,
  "ubicacion" text NOT NULL,
  "descripcion" text NOT NULL,
  "cuposTotales" integer NOT NULL,
  "cuposOcupados" integer NOT NULL
);

CREATE TABLE IF NOT EXISTS sd_opiniones (
  "id" integer PRIMARY KEY,
  "proyectoId" integer NOT NULL,
  "usuarioRut" text NOT NULL,
  "usuarioNombre" text NOT NULL,
  "calificacion" integer NOT NULL,
  "comentario" text NOT NULL,
  "fecha" text NOT NULL
);

CREATE TABLE IF NOT EXISTS sd_solicitudes (
  "id" integer PRIMARY KEY,
  "tipo" text NOT NULL,
  "nombre" text NOT NULL,
  "direccion" text NOT NULL,
  "detalle" text NOT NULL,
  "usuarioRut" text NOT NULL,
  "estado" text NOT NULL,
  "fecha" text NOT NULL
);

CREATE TABLE IF NOT EXISTS sd_usuarios (
  "rut" text PRIMARY KEY,
  "nombre" text NOT NULL,
  "email" text NOT NULL,
  "region" text NOT NULL,
  "comuna" text NOT NULL,
  "rol" text NOT NULL,
  "claveHash" text NOT NULL
);
`;

let _db: PGlite | null = null;
let _ready: Promise<PGlite> | null = null;

/** Inicializa (una sola vez) la base de datos PostgreSQL y aplica el esquema. */
export function initDb(): Promise<PGlite> {
  if (_ready) return _ready;
  _ready = (async () => {
    // Persistencia en IndexedDB: los datos sobreviven recargas y cierres.
    const db = new PGlite('idb://portal-santo-domingo');
    await db.waitReady;
    await db.exec(SCHEMA_SQL);
    _db = db;
    return db;
  })();
  return _ready;
}

function assertTable(table: TableName): void {
  if (!TABLE_NAMES.includes(table)) {
    throw new Error(`Tabla no permitida: ${table}`);
  }
}

/** Devuelve todas las filas de una tabla, opcionalmente ordenadas. */
export async function loadTable<T = Record<string, unknown>>(
  table: TableName,
  orderBy?: string,
): Promise<T[]> {
  assertTable(table);
  const db = await initDb();
  const order = orderBy ? ` ORDER BY ${orderBy}` : '';
  const res = await db.query<T>(`SELECT * FROM ${table}${order}`);
  return res.rows;
}

/** Inserta o actualiza una fila (UPSERT por llave primaria). */
export async function upsertRow(
  table: TableName,
  pk: string,
  row: Record<string, unknown>,
): Promise<void> {
  assertTable(table);
  const db = await initDb();
  const keys = Object.keys(row);
  if (keys.length === 0) return;
  const cols = keys.map((k) => `"${k}"`).join(', ');
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
  const updates = keys
    .filter((k) => k !== pk)
    .map((k) => `"${k}" = EXCLUDED."${k}"`)
    .join(', ');
  const onConflict = updates
    ? `ON CONFLICT ("${pk}") DO UPDATE SET ${updates}`
    : `ON CONFLICT ("${pk}") DO NOTHING`;
  const sql = `INSERT INTO ${table} (${cols}) VALUES (${placeholders}) ${onConflict}`;
  await db.query(sql, keys.map((k) => row[k]));
}

/** Elimina una fila por su llave primaria. */
export async function deleteRow(
  table: TableName,
  pk: string,
  value: unknown,
): Promise<void> {
  assertTable(table);
  const db = await initDb();
  await db.query(`DELETE FROM ${table} WHERE "${pk}" = $1`, [value]);
}

/** True si la base de datos quedó inicializada correctamente. */
export function isDbReady(): boolean {
  return _db !== null;
}
