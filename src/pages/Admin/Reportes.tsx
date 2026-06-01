import React from 'react';
import { useHistory } from 'react-router-dom';
import Layout from '../../components/Layout';
import { EstadoBadge, Stars } from '../../components/ui';
import { Icons as I } from '../../components/Icons';
import { getReportes } from '../../services/dataService';

const AdminReportes: React.FC = () => {
  const history = useHistory();
  const reportes = getReportes();

  const totalOpiniones = reportes.reduce((s, r) => s + r.totalOpiniones, 0);
  const conOpiniones = reportes.filter((r) => r.totalOpiniones > 0);
  const promedioGlobal = conOpiniones.length
    ? conOpiniones.reduce((s, r) => s + r.promedio, 0) / conOpiniones.length
    : 0;

  return (
    <Layout>
      <section className="section">
        <div className="wrap--mid">
          <a className="btn btn--text" onClick={() => history.push('/admin')} style={{ marginBottom: 14 }}><I.ArrowLeft size={16} /> Volver al panel</a>
          <span className="kicker kicker--lime">Transparencia</span>
          <h1 style={{ fontSize: 'clamp(1.7rem,1.3rem+1.5vw,2.4rem)', margin: '10px 0 8px' }}>Reportes de participación</h1>
          <p className="lead" style={{ marginBottom: 24 }}>Consolidado de la votación ciudadana sobre los proyectos comunales.</p>

          <div className="grid grid--2" style={{ marginBottom: 22 }}>
            <div className="card card--pad-lg row" style={{ gap: 16 }}>
              <span className="tile__icon"><I.Users size={24} /></span>
              <div><div style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 700, color: 'var(--green)', lineHeight: 1 }}>{totalOpiniones}</div><span className="muted">opiniones registradas</span></div>
            </div>
            <div className="card card--pad-lg row" style={{ gap: 16 }}>
              <span className="tile__icon"><I.Star size={24} style={{ color: '#E8B100' }} /></span>
              <div><div style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 700, color: 'var(--green)', lineHeight: 1 }}>{promedioGlobal.toFixed(1)}</div><span className="muted">promedio global</span></div>
            </div>
          </div>

          <div className="stack" style={{ gap: 16 }}>
            {reportes.map((r) => (
              <div key={r.proyecto.id} className="card card--pad-lg">
                <div className="row between" style={{ alignItems: 'start', marginBottom: 14 }}>
                  <div>
                    <h3 style={{ color: 'var(--green-800)' }}>{r.proyecto.nombre}</h3>
                    {r.totalOpiniones > 0
                      ? <div className="row" style={{ gap: 8, marginTop: 6 }}><Stars value={r.promedio} size={16} /><span className="muted" style={{ fontSize: '.86rem' }}>{r.promedio.toFixed(1)} · {r.totalOpiniones} {r.totalOpiniones === 1 ? 'opinión' : 'opiniones'}</span></div>
                      : <span className="muted" style={{ fontSize: '.86rem' }}>Sin opiniones todavía</span>}
                  </div>
                  <EstadoBadge estado={r.proyecto.estado} />
                </div>
                {r.totalOpiniones > 0 && [5, 4, 3, 2, 1].map((star) => {
                  const conteo = r.distribucion[star] ?? 0;
                  const pct = r.totalOpiniones ? (conteo / r.totalOpiniones) * 100 : 0;
                  return (
                    <div key={star} className="bar-row">
                      <span className="lab">{star}★</span>
                      <div className="bar-track"><div className="bar-fill" style={{ width: pct + '%' }} /></div>
                      <span className="num">{conteo}</span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default AdminReportes;
