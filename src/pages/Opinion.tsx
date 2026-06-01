import React from 'react';
import { useHistory } from 'react-router-dom';
import Layout from '../components/Layout';
import { EstadoBadge, Stars } from '../components/ui';
import { Icons as I } from '../components/Icons';
import { useAuth } from '../context/AuthContext';
import { getProyectos, getOpinionesDeProyecto } from '../services/dataService';

const Opinion: React.FC = () => {
  const history = useHistory();
  const { isAuthenticated } = useAuth();
  const proyectos = getProyectos();

  return (
    <Layout>
      <section className="phero">
        <div className="phero__media"><img src="/assets/santo-domingo.jpg" alt="" /></div>
        <div className="wrap phero__inner">
          <span className="kicker">Participación ciudadana</span>
          <h1>Nos importa tu opinión</h1>
          <p>El desarrollo sustentable de la comuna se construye con cogobernanza. Tu voz orienta las obras.</p>
        </div>
      </section>
      <section className="section">
        <div className="wrap--mid">
          {!isAuthenticated && (
            <div className="card" style={{ background: '#FBF8E6', border: '1px solid #F1E6BD', display: 'flex', gap: 14, padding: '16px 20px', marginBottom: 22 }}>
              <span style={{ color: '#8A6D1B' }}><I.Lock size={22} /></span>
              <p style={{ color: '#73591a', fontSize: '.95rem' }}>Para garantizar la transparencia de las votaciones vecinales, se requiere autenticación con <strong>Clave Única</strong> al momento de emitir tu opinión. <a onClick={() => history.push('/login')} style={{ color: '#73591a', textDecoration: 'underline', cursor: 'pointer' }}>Ingresar ahora</a>.</p>
            </div>
          )}
          <div className="stack" style={{ gap: 14 }}>
            {proyectos.map((p) => {
              const ops = getOpinionesDeProyecto(p.id);
              const avg = ops.length ? ops.reduce((s, o) => s + o.calificacion, 0) / ops.length : 0;
              return (
                <div key={p.id} className="card card--pad-lg l-split" style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 18, alignItems: 'center' }}>
                  <div>
                    <div className="row-wrap" style={{ gap: 10, marginBottom: 8 }}><EstadoBadge estado={p.estado} /><span className="kicker kicker--bare muted">{p.sector}</span></div>
                    <h3 style={{ color: 'var(--green-800)', marginBottom: 8 }}>{p.nombre}</h3>
                    <div className="row" style={{ gap: 8 }}>{ops.length ? <><Stars value={avg} size={16} /><span className="muted" style={{ fontSize: '.88rem' }}>{avg.toFixed(1)} · {ops.length} {ops.length === 1 ? 'opinión' : 'opiniones'}</span></> : <span className="muted" style={{ fontSize: '.88rem' }}>Sin opiniones todavía</span>}</div>
                  </div>
                  <a className="btn btn--sky" onClick={() => history.push(`/proyectos/${p.id}/opinar`)}><I.Chat size={16} /> Opinar</a>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Opinion;
