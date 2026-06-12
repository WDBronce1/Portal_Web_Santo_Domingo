import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import Layout from '../../components/Layout';
import { PageHero, EstadoBadge } from '../../components/ui';
import { Icons as I } from '../../components/Icons';
import { getProyectos, getOpiniones } from '../../services/dataService';
import { apiClient } from '../../services/apiClient';
import type { Proyecto } from '../../types';

const ListaProyectos: React.FC = () => {
  const history = useHistory();
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 4; // Mostrar de a 4 proyectos por página

  const opiniones = getOpiniones();

  const promedio = (id: number) => {
    const ops = opiniones.filter((o) => o.proyectoId === id);
    if (!ops.length) return null;
    return { avg: ops.reduce((s, o) => s + o.calificacion, 0) / ops.length, n: ops.length };
  };

  useEffect(() => {
    const fetchProyectos = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get('/api/proyectos', {
          params: { page, limit }
        });
        if (res.data && Array.isArray(res.data.data)) {
          setProyectos(res.data.data);
          setTotalPages(res.data.pagination.pages);
        } else {
          // Fallback local
          const local = getProyectos();
          const start = (page - 1) * limit;
          setProyectos(local.slice(start, start + limit));
          setTotalPages(Math.ceil(local.length / limit));
        }
      } catch (err) {
        console.warn('[API] Falló conexión al backend al paginar proyectos, usando caché local...', err);
        const local = getProyectos();
        const start = (page - 1) * limit;
        setProyectos(local.slice(start, start + limit));
        setTotalPages(Math.ceil(local.length / limit));
      } finally {
        setLoading(false);
      }
    };
    fetchProyectos();
  }, [page]);

  return (
    <Layout>
      <PageHero kicker="Cartera comunal" title="Cartera de Proyectos" sub="Conoce las obras de la comuna, su estado de avance y participa con tu opinión validada." />
      <section className="section">
        <div className="wrap">
          {loading ? (
            <div className="grid grid--2">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="card card--pad-lg skeleton-loading" style={{ height: 220, backgroundColor: 'var(--paper)' }} />
              ))}
            </div>
          ) : proyectos.length === 0 ? (
            <div className="card card--pad-lg center">
              <p className="muted">No hay proyectos registrados en esta página.</p>
            </div>
          ) : (
            <>
              <div className="grid grid--2">
                {proyectos.map((p) => {
                  const op = promedio(p.id);
                  return (
                    <div key={p.id} className="card card--pad-lg tile" data-tilt style={{ cursor: 'default' }}>
                      <div className="row between" style={{ alignItems: 'start' }}>
                        <span className="kicker kicker--bare" style={{ color: 'var(--muted)' }}>{p.sector}</span>
                        <EstadoBadge estado={p.estado} />
                      </div>
                      <h3 style={{ margin: '10px 0 8px', color: 'var(--green-800)' }}>{p.nombre}</h3>
                      <p style={{ color: 'var(--body)' }}>{p.descripcion}</p>
                      <div className="meta-row" style={{ marginTop: 16 }}>
                        <span className="meta"><I.Pin size={15} /> {p.sector}</span>
                        <span className="meta"><I.Clock size={15} /> {p.duracionMeses} meses</span>
                        {op && <span className="meta"><I.Star size={15} style={{ color: '#E8B100' }} /> {op.avg.toFixed(1)} · {op.n}</span>}
                      </div>
                      <div className="row-wrap" style={{ marginTop: 20 }}>
                        <a className="btn btn--ghost btn--sm" onClick={() => history.push(`/proyectos/${p.id}`)}>Ver detalles <I.ArrowRight size={15} /></a>
                        <a className="btn btn--sky btn--sm" onClick={() => history.push(`/proyectos/${p.id}/opinar`)}><I.Chat size={15} /> Dar mi opinión</a>
                      </div>
                    </div>
                  );
                })}
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

export default ListaProyectos;
