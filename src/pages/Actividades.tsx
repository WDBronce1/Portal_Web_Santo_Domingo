import React from 'react';
import Layout from '../components/Layout';
import { PageHero, fmtFecha } from '../components/ui';
import { Icons as I } from '../components/Icons';
import { getActividades } from '../services/dataService';

const Actividades: React.FC = () => {
  const actividades = getActividades();

  return (
    <Layout>
      <PageHero kicker="Agenda comunal" title="Agenda de Actividades" sub="Talleres, caminatas y ferias para una comuna más sustentable." />
      <section className="section">
        <div className="wrap">
          <div className="grid grid--3">
            {actividades.map((a) => {
              const libres = a.cuposTotales - a.cuposOcupados;
              const pct = Math.round((a.cuposOcupados / a.cuposTotales) * 100);
              return (
                <div key={a.id} className="card card--pad-lg tile" data-tilt style={{ cursor: 'default', display: 'flex', flexDirection: 'column' }}>
                  <span className="tile__icon"><I.Calendar size={22} /></span>
                  <h3 style={{ margin: '14px 0 12px', color: 'var(--green-800)' }}>{a.titulo}</h3>
                  <div className="card card--paper" style={{ padding: '12px 14px' }}>
                    <span className="meta" style={{ display: 'flex' }}><I.Calendar size={15} /> {fmtFecha(a.fecha)}</span>
                    <span className="meta" style={{ display: 'flex', marginTop: 6 }}><I.Clock size={15} /> {a.hora}</span>
                    <span className="meta" style={{ display: 'flex', marginTop: 6 }}><I.Pin size={15} /> {a.ubicacion}</span>
                  </div>
                  <p className="muted" style={{ margin: '14px 0', fontSize: '.92rem' }}>{a.descripcion}</p>
                  <div style={{ marginTop: 'auto' }}>
                    <div className="row between" style={{ marginBottom: 6 }}>
                      <span className="meta"><I.Users size={15} /> {libres} cupos disponibles</span>
                      <span className="muted" style={{ fontSize: '.78rem', fontFamily: 'var(--font-mono)' }}>{pct}%</span>
                    </div>
                    <div className="bar-track"><div className="bar-fill" style={{ width: pct + '%' }} /></div>
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

export default Actividades;
