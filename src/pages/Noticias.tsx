import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { PageHero, fmtFecha } from '../components/ui';
import { Icons as I } from '../components/Icons';
import { getNoticias } from '../services/dataService';
import { apiClient } from '../services/apiClient';
import type { Noticia } from '../types';

const Noticias: React.FC = () => {
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 3; // Mostrar 3 noticias por página (1 destacada + 2 normales en pág 1)

  useEffect(() => {
    const fetchNoticias = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get('/api/noticias', {
          params: { page, limit }
        });
        if (res.data && Array.isArray(res.data.data)) {
          setNoticias(res.data.data);
          setTotalPages(res.data.pagination.pages);
        } else {
          // Fallback local
          const local = getNoticias();
          const start = (page - 1) * limit;
          setNoticias(local.slice(start, start + limit));
          setTotalPages(Math.ceil(local.length / limit));
        }
      } catch (err) {
        console.warn('[API] Falló conexión al backend al paginar noticias, usando caché local...', err);
        const local = getNoticias();
        const start = (page - 1) * limit;
        setNoticias(local.slice(start, start + limit));
        setTotalPages(Math.ceil(local.length / limit));
      } finally {
        setLoading(false);
      }
    };
    fetchNoticias();
  }, [page]);

  const feat = page === 1 && noticias.length > 0 ? noticias[0] : null;
  const rest = page === 1 ? noticias.slice(1) : noticias;

  return (
    <Layout>
      <PageHero kicker="Sala de prensa" title="Noticias Ambientales" sub="Lo último en sustentabilidad, reciclaje y obras de la comuna." />
      <section className="section">
        <div className="wrap">
          {loading ? (
            <div className="stack" style={{ gap: 24 }}>
              {page === 1 && (
                <div className="card card--pad-lg skeleton-loading" style={{ height: 260, backgroundColor: 'var(--paper)' }} />
              )}
              <div className="grid grid--2">
                <div className="card card--pad-lg skeleton-loading" style={{ height: 180, backgroundColor: 'var(--paper)' }} />
                <div className="card card--pad-lg skeleton-loading" style={{ height: 180, backgroundColor: 'var(--paper)' }} />
              </div>
            </div>
          ) : noticias.length === 0 ? (
            <div className="card card--pad-lg center">
              <p className="muted">No hay noticias registradas en esta página.</p>
            </div>
          ) : (
            <>
              {feat && (
                <article className="card card--pad-lg l-split" style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 0, overflow: 'hidden', padding: 0, marginBottom: 24 }}>
                  <div style={{ position: 'relative', minHeight: 240, background: 'var(--green-900)' }}>
                    <img src="/assets/santo-domingo.jpg" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: .85, position: 'absolute', inset: 0 }} />
                    <span className="badge badge--exec" style={{ position: 'absolute', top: 16, left: 16, background: '#fff', color: 'var(--green-800)', fontWeight: 600 }}>Destacada</span>
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

              {totalPages > 1 && (
                <div className="row-wrap" style={{ justifyContent: 'center', marginTop: 32, gap: 10 }}>
                  <button
                    className="btn btn--ghost btn--sm"
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  >
                    <I.ArrowLeft size={14} /> Anterior
                  </button>
                  <span style={{ fontSize: '.88rem', color: 'var(--muted)', alignSelf: 'center', fontFamily: 'var(--font-mono)' }}>
                    Página {page} de {totalPages}
                  </span>
                  <button
                    className="btn btn--ghost btn--sm"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  >
                    Siguiente <I.ArrowRight size={14} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Noticias;
