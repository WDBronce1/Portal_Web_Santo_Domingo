// Tipos centrales del Portal Web Municipalidad de Santo Domingo

export type Rol = 'ciudadano' | 'admin';

export interface Usuario {
  rut: string;
  nombre: string;
  email: string;
  region: string;
  comuna: string;
  rol: Rol;
}

export type EstadoProyecto =
  | 'En Planificación'
  | 'Licitación'
  | 'En Ejecución'
  | 'Evaluación Ambiental'
  | 'Finalizado';

export interface Proyecto {
  id: number;
  nombre: string;
  sector: string;
  estado: EstadoProyecto;
  descripcion: string;
  duracionMeses: number;
  fechaInicio: string; // ISO yyyy-mm-dd
}

export interface Opinion {
  id: number;
  proyectoId: number;
  usuarioRut: string;
  usuarioNombre: string;
  calificacion: number; // 1..5
  comentario: string;
  fecha: string; // ISO
}

export interface Noticia {
  id: number;
  titulo: string;
  fecha: string;
  resumen: string;
  contenido: string;
  autor: string;
}

export interface Actividad {
  id: number;
  titulo: string;
  fecha: string;
  hora: string;
  ubicacion: string;
  descripcion: string;
  cuposTotales: number;
  cuposOcupados: number;
}

export type TipoSolicitud = 'recoleccion' | 'tacho';

export interface Solicitud {
  id: number;
  tipo: TipoSolicitud;
  nombre: string;
  direccion: string;
  detalle: string;
  usuarioRut: string;
  estado: string; // PENDIENTE | EN PROCESO | RESUELTA
  fecha: string;
}

export interface PuntoReciclaje {
  id: number;
  sector: string;
  ubicacion: string;
  tipos: string;
}

export interface ZonaVerde {
  id: number;
  nombre: string;
  sector: string;
  ubicacion: string;
}

export interface RecorridoBasura {
  sector: string;
  dias: string;
  horario: string;
}
