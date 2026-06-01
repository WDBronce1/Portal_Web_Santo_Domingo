import React from 'react';
import { Star, StarOutline } from './Icons';
import type { EstadoProyecto } from '../types';

/* Helpers visuales compartidos — portados del shell "Herbario Patrimonial". */

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

export function fmtFecha(s: string): string {
  if (!s) return '';
  const d = new Date(s.length <= 10 ? s + 'T00:00:00' : s);
  if (isNaN(d.getTime())) return s;
  return `${d.getDate()} ${MESES[d.getMonth()]} ${d.getFullYear()}`;
}

interface PageHeroProps {
  kicker?: string;
  title: React.ReactNode;
  sub?: React.ReactNode;
  media?: boolean;
  children?: React.ReactNode;
}

export const PageHero: React.FC<PageHeroProps> = ({ kicker, title, sub, media = true, children }) => (
  <section className="phero">
    {media && (
      <div className="phero__media">
        <img src="/assets/santo-domingo.jpg" alt="Comuna de Santo Domingo" />
      </div>
    )}
    <div className="wrap phero__inner">
      {kicker && <span className="kicker">{kicker}</span>}
      <h1>{title}</h1>
      {sub && <p>{sub}</p>}
      {children}
    </div>
  </section>
);

const ESTADO_CLASS: Record<string, string> = {
  'En Planificación': 'badge--plan',
  'En Ejecución': 'badge--exec',
  'Licitación': 'badge--licit',
  'Evaluación Ambiental': 'badge--eval',
  'Finalizado': 'badge--fin',
};

export const EstadoBadge: React.FC<{ estado: EstadoProyecto | string }> = ({ estado }) => (
  <span className={'badge badge--dot ' + (ESTADO_CLASS[estado] || 'badge--plan')}>{estado}</span>
);

export const Stars: React.FC<{ value: number; size?: number }> = ({ value, size }) => {
  const v = Math.round(value);
  return (
    <span className="stars" style={size ? { fontSize: size } : undefined}>
      {[1, 2, 3, 4, 5].map((i) =>
        i <= v
          ? <Star key={i} size={size || 18} />
          : <StarOutline key={i} size={size || 18} style={{ color: '#D8DEDA' }} />
      )}
    </span>
  );
};
