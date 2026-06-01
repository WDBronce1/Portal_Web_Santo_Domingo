// Servicio de autenticación — Clave Única SIMULADA (RNF1).
// Identidad validada por RUT (algoritmo módulo 11) + sesión en localStorage.
// Arquitectura lista para reemplazar por API real con JWT (ver dataService.api()).

import type { Rol, Usuario } from '../types';
import { upsertRow } from './db';

const SESSION_KEY = 'sd_session';
export const USERS_KEY = 'sd_usuarios';

// RUTs que el municipio reconoce como funcionarios (rol admin).
const ADMIN_RUTS = ['11.111.111-1'];

interface UsuarioConClave extends Usuario {
  // Clave Única simulada: NUNCA es una credencial real del Estado.
  claveHash: string;
}

// ---------- RUT (módulo 11) ----------

/** Limpia el RUT dejando dígitos + dígito verificador (k/K). */
export function limpiarRut(rut: string): string {
  return rut.replace(/[^0-9kK]/g, '').toUpperCase();
}

/** Formatea 111111111 -> 11.111.111-1 */
export function formatearRut(rut: string): string {
  const limpio = limpiarRut(rut);
  if (limpio.length < 2) return limpio;
  const cuerpo = limpio.slice(0, -1);
  const dv = limpio.slice(-1);
  const conPuntos = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${conPuntos}-${dv}`;
}

/** Valida un RUT chileno con el algoritmo módulo 11. */
export function validarRut(rut: string): boolean {
  const limpio = limpiarRut(rut);
  if (limpio.length < 2) return false;
  const cuerpo = limpio.slice(0, -1);
  const dv = limpio.slice(-1);
  if (!/^\d+$/.test(cuerpo)) return false;

  let suma = 0;
  let multiplo = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo[i], 10) * multiplo;
    multiplo = multiplo === 7 ? 2 : multiplo + 1;
  }
  const resto = 11 - (suma % 11);
  const dvEsperado = resto === 11 ? '0' : resto === 10 ? 'K' : String(resto);
  return dv === dvEsperado;
}

// ---------- Persistencia simulada ----------

function leerUsuarios(): UsuarioConClave[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? (JSON.parse(raw) as UsuarioConClave[]) : [];
  } catch {
    return [];
  }
}

function guardarUsuarios(usuarios: UsuarioConClave[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(usuarios));
}

// Hash de demostración (NO es seguridad real; el backend usa bcrypt).
function hashDemo(clave: string): string {
  let h = 0;
  for (let i = 0; i < clave.length; i++) {
    h = (Math.imul(31, h) + clave.charCodeAt(i)) | 0;
  }
  return `sim$${h}`;
}

// Usuarios precargados (semilla). Se usan para sembrar la base de datos
// PostgreSQL la primera vez y como respaldo de la caché local.
export const SEED_USUARIOS: UsuarioConClave[] = [
  {
    rut: '11.111.111-1',
    nombre: 'Funcionario Municipal',
    email: 'admin@santodomingo.cl',
    region: 'Valparaíso',
    comuna: 'Santo Domingo',
    rol: 'admin',
    claveHash: hashDemo('admin1234'),
  },
  {
    rut: '12.345.678-5',
    nombre: 'Vecina Ciudadana',
    email: 'vecina@correo.cl',
    region: 'Valparaíso',
    comuna: 'Santo Domingo',
    rol: 'ciudadano',
    claveHash: hashDemo('clave1234'),
  },
];

function seedUsuarios(): void {
  if (leerUsuarios().length > 0) return;
  guardarUsuarios(SEED_USUARIOS);
}
seedUsuarios();

// ---------- API pública ----------

export interface RegistroInput {
  nombre: string;
  rut: string;
  email: string;
  region: string;
  comuna: string;
  clave: string;
}

export interface Resultado<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

export function rolPorRut(rut: string): Rol {
  return ADMIN_RUTS.includes(formatearRut(rut)) ? 'admin' : 'ciudadano';
}

export function registrar(input: RegistroInput): Resultado<Usuario> {
  const rut = formatearRut(input.rut);
  if (!validarRut(rut)) return { ok: false, error: 'El RUT ingresado no es válido.' };
  if (input.clave.length < 6)
    return { ok: false, error: 'La Clave Única debe tener al menos 6 caracteres.' };

  const usuarios = leerUsuarios();
  if (usuarios.some((u) => u.rut === rut))
    return { ok: false, error: 'Ya existe una cuenta registrada con este RUT.' };

  const usuario: UsuarioConClave = {
    rut,
    nombre: input.nombre.trim(),
    email: input.email.trim(),
    region: input.region,
    comuna: input.comuna,
    rol: rolPorRut(rut),
    claveHash: hashDemo(input.clave),
  };
  usuarios.push(usuario);
  guardarUsuarios(usuarios);
  // Persistir el usuario en PostgreSQL (segundo plano; no bloquea el registro).
  upsertRow('sd_usuarios', 'rut', usuario as unknown as Record<string, unknown>).catch(
    (err) => console.warn('[BD] No se pudo persistir el usuario en PostgreSQL:', err),
  );
  const { claveHash, ...publico } = usuario;
  void claveHash;
  iniciarSesion(publico);
  return { ok: true, data: publico };
}

/** Login con Clave Única simulada. */
export function login(rut: string, clave: string): Resultado<Usuario> {
  const rutFmt = formatearRut(rut);
  if (!validarRut(rutFmt)) return { ok: false, error: 'El RUT ingresado no es válido.' };

  const usuarios = leerUsuarios();
  const encontrado = usuarios.find((u) => u.rut === rutFmt);
  if (!encontrado)
    return { ok: false, error: 'No existe una cuenta con este RUT. Regístrate primero.' };
  if (encontrado.claveHash !== hashDemo(clave))
    return { ok: false, error: 'La Clave Única no coincide.' };

  const { claveHash, ...publico } = encontrado;
  void claveHash;
  iniciarSesion(publico);
  return { ok: true, data: publico };
}

function iniciarSesion(usuario: Usuario): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(usuario));
}

export function logout(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function getSesion(): Usuario | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Usuario) : null;
  } catch {
    return null;
  }
}
