import React from 'react';
import { useParams, useHistory } from 'react-router-dom';
import Layout from '../../components/Layout';
import { EstadoBadge, Stars, fmtFecha } from '../../components/ui';
import { Icons as I } from '../../components/Icons';
import { getProyecto, getOpinionesDeProyecto } from '../../services/dataService';

const DetalleProyecto: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const proyecto = getProyecto(Number(id));

  if (!proyecto) {
    return (
      <Layout>
        <section className="section">
          <div className="wrap--mid">
            <div className="card card--pad-lg center">
              <p className="muted">Proyecto no encontrado.</p>
              <button className="btn btn--primary" style={{ marginTop: 16 }} onClick={() => history.push('/proyectos')}>Volver a la cartera</button>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  const ops = getOpinionesDeProyecto(proyecto.id);
  const avg = ops.length ? ops.reduce((s, o) => s + o.calificacion, 0) / ops.length : 0;

  return (
    <Layout>
      <section className="section">
        <div className="wrap--mid">
          <a className="btn btn--text" onClick={() => history.push('/proyectos')} style={{ marginBottom: 16 }}><I.ArrowLeft size={16} /> Volver a la cartera</a>
          <div className="card card--pad-lg">
            <div className="row between" style={{ alignItems: 'start' }}>
              <span className="kicker kicker--lime">{proyecto.sector}</span>
              <EstadoBadge estado={proyecto.estado} />
            </div>
            <h1 style={{ fontSize: 'clamp(1.7rem,1.3rem+1.5vw,2.4rem)', margin: '12px 0 14px', color: 'var(--green-800)' }}>{proyecto.nombre}</h1>
            <p className="lead">{proyecto.descripcion}</p>
            <div className="meta-row" style={{ marginTop: 20 }}>
              <span className="meta"><I.Pin size={16} /> {proyecto.sector}</span>
              <span className="meta"><I.Clock size={16} /> {proyecto.duracionMeses} meses</span>
              <span className="meta"><I.Calendar size={16} /> Inicio: {fmtFecha(proyecto.fechaInicio)}</span>
            </div>
            <a className="btn btn--sky btn--lg" style={{ marginTop: 24 }} onClick={() => history.push(`/proyectos/${proyecto.id}/opinar`)}><I.Chat size={18} /> Opinar sobre este proyecto</a>
          </div>

          <div className="card card--pad-lg" style={{ marginTop: 20 }}>
            <div className="row between">
              <h3>Opiniones ciudadanas</h3>
              {ops.length > 0 && <div className="row" style={{ gap: 8 }}><Stars value={avg} /><strong style={{ color: 'var(--green-800)' }}>{avg.toFixed(1)}</strong><span className="muted">({ops.length})</span></div>}
            </div>
            <hr className="divider" />
            {ops.length === 0 ? <p className="muted">Sé la primera persona en opinar sobre este proyecto.</p> : (
              <div className="stack" style={{ gap: 14 }}>
                {ops.map((o) => (
                  <div key={o.id} className="card card--paper">
                    <div className="row between">
                      <strong style={{ color: 'var(--green-800)' }}>{o.usuarioNombre}</strong>
                      <Stars value={o.calificacion} size={16} />
                    </div>
                    <p style={{ margin: '8px 0', color: 'var(--body)' }}>{o.comentario}</p>
                    <span className="muted" style={{ fontSize: '.82rem', fontFamily: 'var(--font-mono)' }}>{fmtFecha(o.fecha)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default DetalleProyecto;
