import React from 'react';
import { useHistory } from 'react-router-dom';
import Layout from '../../components/Layout';
import { PageHero, EstadoBadge } from '../../components/ui';
import { Icons as I } from '../../components/Icons';
import { getProyectos, getOpiniones } from '../../services/dataService';

const ListaProyectos: React.FC = () => {
  const history = useHistory();
  const proyectos = getProyectos();
  const opiniones = getOpiniones();

  const promedio = (id: number) => {
    const ops = opiniones.filter((o) => o.proyectoId === id);
    if (!ops.length) return null;
    return { avg: ops.reduce((s, o) => s + o.calificacion, 0) / ops.length, n: ops.length };
  };

  return (
    <Layout>
      <PageHero kicker="Cartera comunal" title="Cartera de Proyectos" sub="Conoce las obras de la comuna, su estado de avance y participa con tu opinión validada." />
      <section className="section">
        <div className="wrap">
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
        </div>
      </section>
    </Layout>
  );
};

export default ListaProyectos;
