import React from 'react';

interface Props {
  valor: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
}

/** Selector / visor de calificación de 1 a 5 estrellas (accesible por teclado). */
const RatingStars: React.FC<Props> = ({ valor, onChange, readonly }) => {
  if (readonly) {
    return (
      <span className="sd-stars sd-stars--read" aria-label={`Calificación ${valor} de 5`}>
        {'★'.repeat(Math.round(valor))}
        <span style={{ color: '#d6d6d6' }}>{'★'.repeat(5 - Math.round(valor))}</span>
      </span>
    );
  }
  return (
    <div className="sd-stars" role="radiogroup" aria-label="Calificación del proyecto">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={valor === n}
          aria-label={`${n} estrella${n > 1 ? 's' : ''}`}
          className={n <= valor ? 'is-on' : ''}
          onClick={() => onChange?.(n)}
        >
          ★
        </button>
      ))}
    </div>
  );
};

export default RatingStars;
