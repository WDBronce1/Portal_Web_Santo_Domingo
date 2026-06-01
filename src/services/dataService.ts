// Capa de datos. Mock tipado persistido en localStorage, con CRUD.
// Arquitectura lista para conectar el API REST real (backend Express+Prisma):
// reemplazar cada función por fetch a `${API_BASE}/api/...`.

import type {
  Actividad,
  Noticia,
  Opinion,
  Proyecto,
  PuntoReciclaje,
  RecorridoBasura,
  Solicitud,
  TipoSolicitud,
  ZonaVerde,
} from '../types';
import { sanitizeText } from '../utils/sanitize';

export const API_BASE = (import.meta as any).env?.VITE_API_BASE ?? 'http://localhost:3264';

const KEYS = {
  proyectos: 'sd_proyectos',
  noticias: 'sd_noticias',
  actividades: 'sd_actividades',
  opiniones: 'sd_opiniones',
  solicitudes: 'sd_solicitudes',
} as const;

function load<T>(key: string, seed: T[]): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T[];
  } catch {
    /* noop */
  }
  localStorage.setItem(key, JSON.stringify(seed));
  return seed;
}

function save<T>(key: string, value: T[]): void {
  localStorage.setItem(key, JSON.stringify(value));
}

function nextId(items: { id: number }[]): number {
  return items.reduce((max, i) => Math.max(max, i.id), 0) + 1;
}

// ---------- Semillas ----------

const SEED_PROYECTOS: Proyecto[] = [
  { id: 1, nombre: 'Extensión de Ciclovía Costera', sector: 'Borde Costero', estado: 'En Planificación', duracionMeses: 8, fechaInicio: '2026-06-01', descripcion: 'Nueva ciclovía de 4,2 km que conecta el balneario con el centro cívico, fomentando la movilidad sustentable y reduciendo emisiones.' },
  { id: 2, nombre: 'Mejoramiento Plaza de Armas', sector: 'Centro', estado: 'En Ejecución', duracionMeses: 5, fechaInicio: '2026-03-15', descripcion: 'Renovación de áreas verdes, riego eficiente y luminarias solares en la principal plaza de la comuna.' },
  { id: 3, nombre: 'Centro Comunitario Ecológico', sector: 'Sector Sur', estado: 'Licitación', duracionMeses: 12, fechaInicio: '2026-08-01', descripcion: 'Edificio con certificación sustentable para talleres ambientales, reciclaje y reuniones vecinales.' },
  { id: 4, nombre: 'Restauración de Fachadas Patrimoniales', sector: 'Casco Histórico', estado: 'Evaluación Ambiental', duracionMeses: 10, fechaInicio: '2026-07-01', descripcion: 'Recuperación de fachadas históricas respetando lineamientos de conservación del patrimonio comunal.' },
];

const SEED_NOTICIAS: Noticia[] = [
  { id: 1, titulo: 'Gran Limpieza del Borde Costero', fecha: '2026-05-05', autor: 'Dirección de Medio Ambiente', resumen: 'Más de 200 voluntarios retiraron plásticos y residuos de nuestras playas, protegiendo la fauna marina.', contenido: 'La jornada reunió a juntas de vecinos, colegios y agrupaciones ecológicas en una limpieza colaborativa que retiró cerca de 1,2 toneladas de residuos del litoral.' },
  { id: 2, titulo: 'Nuevo programa de compostaje domiciliario', fecha: '2026-05-02', autor: 'Oficina de Reciclaje', resumen: 'La municipalidad entregará 500 composteras gratuitas a juntas de vecinos inscritas.', contenido: 'El programa busca reducir la fracción orgánica que llega al relleno sanitario y promover huertos urbanos en los hogares de la comuna.' },
  { id: 3, titulo: 'Luminarias solares en plazas principales', fecha: '2026-04-28', autor: 'Dirección de Obras', resumen: 'Se instalaron postes con paneles solares 100% autónomos en tres plazas, mejorando seguridad y eficiencia.', contenido: 'La inversión permitirá un ahorro energético anual estimado del 35% en alumbrado público de áreas verdes.' },
];

const SEED_ACTIVIDADES: Actividad[] = [
  { id: 1, titulo: 'Taller de Huertos Urbanos', fecha: '2026-05-10', hora: '10:00 – 13:00', ubicacion: 'Invernadero Municipal', descripcion: 'Aprende a cultivar tus propios vegetales en espacios reducidos usando materiales reciclados.', cuposTotales: 30, cuposOcupados: 18 },
  { id: 2, titulo: 'Caminata de Observación de Aves', fecha: '2026-05-15', hora: '08:00 – 11:30', ubicacion: 'Humedal Costero', descripcion: 'Recorrido guiado para identificar especies endémicas y proteger los humedales.', cuposTotales: 25, cuposOcupados: 9 },
  { id: 3, titulo: 'Feria de Emprendimiento Sustentable', fecha: '2026-05-22', hora: '11:00 – 18:00', ubicacion: 'Plaza Principal', descripcion: 'Stands de artesanos y pymes locales que trabajan con economía circular.', cuposTotales: 50, cuposOcupados: 31 },
];

const SEED_OPINIONES: Opinion[] = [
  { id: 1, proyectoId: 2, usuarioRut: '12.345.678-5', usuarioNombre: 'Vecina Ciudadana', calificacion: 4, comentario: 'Excelente iniciativa, la plaza lo necesitaba hace años.', fecha: '2026-05-04' },
  { id: 2, proyectoId: 1, usuarioRut: '12.345.678-5', usuarioNombre: 'Vecina Ciudadana', calificacion: 5, comentario: 'La ciclovía conectará todo el borde costero, muy a favor.', fecha: '2026-05-06' },
];

// Datos estáticos de referencia (no editables por el usuario).
export const RECORRIDOS_BASURA: RecorridoBasura[] = [
  { sector: 'Sector Norte', dias: 'Lunes · Miércoles · Viernes', horario: '08:00 – 12:00' },
  { sector: 'Sector Centro', dias: 'Martes · Jueves · Sábado', horario: '09:00 – 14:00' },
  { sector: 'Sector Sur', dias: 'Lunes · Miércoles · Viernes', horario: '15:00 – 19:00' },
];

export const PUNTOS_RECICLAJE: PuntoReciclaje[] = [
  { id: 1, sector: 'Centro', ubicacion: 'Plaza de Armas, costado oriente', tipos: 'Vidrio · Papel · Plástico PET' },
  { id: 2, sector: 'Borde Costero', ubicacion: 'Estacionamiento Balneario', tipos: 'Vidrio · Latas' },
  { id: 3, sector: 'Sector Sur', ubicacion: 'Junta de Vecinos Los Aromos', tipos: 'Papel · Cartón · Plástico' },
];

export const ZONAS_VERDES: ZonaVerde[] = [
  { id: 1, nombre: 'Parque Costero', sector: 'Borde Costero', ubicacion: 'Av. del Mar s/n' },
  { id: 2, nombre: 'Plaza de Armas', sector: 'Centro', ubicacion: 'Calle Principal esq. Comercio' },
  { id: 3, nombre: 'Humedal Protegido', sector: 'Sector Sur', ubicacion: 'Ribera del estero' },
];

// ---------- Proyectos ----------
export function getProyectos(): Proyecto[] {
  return load(KEYS.proyectos, SEED_PROYECTOS);
}
export function getProyecto(id: number): Proyecto | undefined {
  return getProyectos().find((p) => p.id === id);
}
export function crearProyecto(input: Omit<Proyecto, 'id'>): Proyecto {
  const items = getProyectos();
  const nuevo: Proyecto = { ...input, id: nextId(items), nombre: sanitizeText(input.nombre, 120), descripcion: sanitizeText(input.descripcion, 800) };
  items.push(nuevo);
  save(KEYS.proyectos, items);
  return nuevo;
}
export function actualizarProyecto(id: number, cambios: Partial<Proyecto>): void {
  const items = getProyectos().map((p) => (p.id === id ? { ...p, ...cambios } : p));
  save(KEYS.proyectos, items);
}
export function eliminarProyecto(id: number): void {
  save(KEYS.proyectos, getProyectos().filter((p) => p.id !== id));
}

// ---------- Noticias ----------
export function getNoticias(): Noticia[] {
  return load(KEYS.noticias, SEED_NOTICIAS).sort((a, b) => b.fecha.localeCompare(a.fecha));
}
export function getNoticia(id: number): Noticia | undefined {
  return getNoticias().find((n) => n.id === id);
}
export function crearNoticia(input: Omit<Noticia, 'id'>): Noticia {
  const items = load(KEYS.noticias, SEED_NOTICIAS);
  const nueva: Noticia = { ...input, id: nextId(items), titulo: sanitizeText(input.titulo, 120), resumen: sanitizeText(input.resumen, 300), contenido: sanitizeText(input.contenido, 2000) };
  items.push(nueva);
  save(KEYS.noticias, items);
  return nueva;
}
export function eliminarNoticia(id: number): void {
  save(KEYS.noticias, load(KEYS.noticias, SEED_NOTICIAS).filter((n) => n.id !== id));
}

// ---------- Actividades ----------
export function getActividades(): Actividad[] {
  return load(KEYS.actividades, SEED_ACTIVIDADES);
}
export function crearActividad(input: Omit<Actividad, 'id'>): Actividad {
  const items = getActividades();
  const nueva: Actividad = { ...input, id: nextId(items), titulo: sanitizeText(input.titulo, 120), descripcion: sanitizeText(input.descripcion, 800) };
  items.push(nueva);
  save(KEYS.actividades, items);
  return nueva;
}
export function eliminarActividad(id: number): void {
  save(KEYS.actividades, getActividades().filter((a) => a.id !== id));
}

// ---------- Opiniones (votación ciudadana) ----------
export function getOpiniones(): Opinion[] {
  return load(KEYS.opiniones, SEED_OPINIONES);
}
export function getOpinionesDeProyecto(proyectoId: number): Opinion[] {
  return getOpiniones().filter((o) => o.proyectoId === proyectoId);
}
export function crearOpinion(input: Omit<Opinion, 'id' | 'fecha'>): Opinion {
  const items = getOpiniones();
  const nueva: Opinion = {
    ...input,
    id: nextId(items),
    comentario: sanitizeText(input.comentario, 500),
    fecha: new Date().toISOString().slice(0, 10),
  };
  items.push(nueva);
  save(KEYS.opiniones, items);
  return nueva;
}

// ---------- Solicitudes (recolección / tacho) ----------
export function getSolicitudes(): Solicitud[] {
  return load<Solicitud>(KEYS.solicitudes, []);
}
export function crearSolicitud(input: {
  tipo: TipoSolicitud;
  nombre: string;
  direccion: string;
  detalle: string;
  usuarioRut: string;
}): Solicitud {
  const items = getSolicitudes();
  const nueva: Solicitud = {
    id: nextId(items),
    tipo: input.tipo,
    nombre: sanitizeText(input.nombre, 120),
    direccion: sanitizeText(input.direccion, 200),
    detalle: sanitizeText(input.detalle, 500),
    usuarioRut: input.usuarioRut,
    estado: 'PENDIENTE',
    fecha: new Date().toISOString().slice(0, 10),
  };
  items.push(nueva);
  save(KEYS.solicitudes, items);
  return nueva;
}

// ---------- Reportes (admin) ----------
export interface ReporteProyecto {
  proyecto: Proyecto;
  totalOpiniones: number;
  promedio: number;
  distribucion: Record<number, number>; // estrella -> conteo
}

export function getReportes(): ReporteProyecto[] {
  const opiniones = getOpiniones();
  return getProyectos().map((proyecto) => {
    const delProyecto = opiniones.filter((o) => o.proyectoId === proyecto.id);
    const distribucion: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    delProyecto.forEach((o) => {
      distribucion[o.calificacion] = (distribucion[o.calificacion] ?? 0) + 1;
    });
    const promedio = delProyecto.length
      ? delProyecto.reduce((s, o) => s + o.calificacion, 0) / delProyecto.length
      : 0;
    return { proyecto, totalOpiniones: delProyecto.length, promedio, distribucion };
  });
}
