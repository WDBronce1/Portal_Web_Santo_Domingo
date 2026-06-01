import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { bootstrapDb } from './services/bootstrap';

const container = document.getElementById('root');
const root = createRoot(container!);

let rendered = false;
function render() {
  if (rendered) return;
  rendered = true;
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

// Estrategia robusta: la página NUNCA debe quedar en blanco esperando a la base
// de datos. Se intenta hidratar la caché local desde PostgreSQL (PGlite), pero
// si la BD tarda más de 1,5 s en estar lista, se renderiza igual usando la
// caché/seed local y la hidratación termina en segundo plano (queda lista para
// la próxima carga). Si la BD falla, también se renderiza igual.
const tope = new Promise<void>((resolve) => setTimeout(resolve, 1500));

const arranque = bootstrapDb().catch((err) => {
  console.warn('[BD] Bootstrap PostgreSQL falló; se usa caché local.', err);
});

Promise.race([arranque, tope]).finally(render);
