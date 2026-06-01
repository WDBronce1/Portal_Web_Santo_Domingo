// Sanitización anti-XSS para todo input que se persiste o se muestra (FASE 3).
// Escapa caracteres peligrosos y recorta. No confiamos en el cliente: el backend
// debe validar también, pero esto evita inyección de markup en la SPA.

export function sanitizeText(input: string, maxLen = 1000): string {
  return input
    .slice(0, maxLen)
    .replace(/[<>]/g, (c) => (c === '<' ? '&lt;' : '&gt;'))
    .replace(/javascript:/gi, '')
    .trim();
}

export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}
