import React from 'react';
import Layout from '../components/Layout';
import { PageHero, fmtFecha } from '../components/ui';
import { Icons as I } from '../components/Icons';
import { getNoticias } from '../services/dataService';

const Noticias: React.FC = () => {
  const [feat, ...rest] = getNoticias();

  return (
    <Layout>
      <PageHero kicker="Sala de prensa" title="Noticias Ambientales" sub="Lo último en sustentabilidad, reciclaje y obras de la comuna." />
      <section className="section">
        <div className="wrap">
          {feat && (
            <article className="card card--pad-lg l-split" style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 0, overflow: 'hidden', padding: 0, marginBottom: 24 }}>
              <div style={{ position: 'relative', minHeight: 240, background: 'var(--green-900)' }}>
                <img src="/assets/santo-domingo.jpg" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: .85, position: 'absolute', inset: 0 }} />
                <span className="badge badge--exec" style={{ position: 'absolute', top: 16, left: 16, background: '#fff' }}>Destacada</span>
              </div>
              <div style={{ padding: 'clamp(20px,3vw,34px)' }}>
                <span className="meta" style={{ fontFamily: 'var(--font-mono)', fontSize: '.78rem' }}><I.Calendar size={15} /> {fmtFecha(feat.fecha)} · {feat.autor}</span>
                <h2 style={{ margin: '12px 0', color: 'var(--green-800)' }}>{feat.titulo}</h2>
                <p className="lead">{feat.resumen}</p>
                <p className="muted" style={{ marginTop: 12 }}>{feat.contenido}</p>
              </div>
            </article>
          )}
          <div className="grid grid--2">
            {rest.map((n) => (
              <article key={n.id} className="card card--pad-lg tile" data-tilt style={{ cursor: 'default' }}>
                <span className="meta" style={{ fontFamily: 'var(--font-mono)', fontSize: '.76rem' }}><I.Calendar size={14} /> {fmtFecha(n.fecha)} · {n.autor}</span>
                <h3 style={{ margin: '10px 0 8px', color: 'var(--green-800)' }}>{n.titulo}</h3>
                <p style={{ color: 'var(--body)' }}>{n.resumen}</p>
                <p className="muted" style={{ marginTop: 10, fontSize: '.92rem' }}>{n.contenido}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Noticias;
