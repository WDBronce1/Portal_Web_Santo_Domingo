import React from 'react';
import { useHistory } from 'react-router-dom';
import Layout from '../components/Layout';
import { PageHero } from '../components/ui';
import { Icons as I } from '../components/Icons';
import { useAuth } from '../context/AuthContext';

interface Atajo {
  icon: React.FC<{ size?: number }>;
  t: string;
  s: string;
  go: string;
}

const ATAJOS: Atajo[] = [
  { icon: I.Clock, t: 'Horarios de Basura', s: 'Recorridos por sector', go: '/servicios?tipo=basura' },
  { icon: I.Recycle, t: 'Puntos de Reciclaje', s: 'Campanas y contenedores', go: '/servicios?tipo=reciclaje' },
  { icon: I.Tree, t: 'Zonas Verdes', s: 'Parques y áreas protegidas', go: '/servicios?tipo=zonas' },
  { icon: I.Project, t: 'Proyectos Comunales', s: 'Cartera y participación', go: '/proyectos' },
  { icon: I.Calendar, t: 'Actividades', s: 'Agenda ambiental', go: '/actividades' },
  { icon: I.Chat, t: 'Tu Opinión', s: 'Vota los proyectos', go: '/opinion' },
];

const Inicio: React.FC = () => {
  const history = useHistory();
  const { usuario } = useAuth();

  return (
    <Layout>
      <PageHero
        kicker="Cogobernanza ambiental"
        title={usuario ? `Hola, ${usuario.nombre.split(' ')[0]}.` : 'Bienvenido/a a tu comuna.'}
        sub="Gestión ambiental participativa de Santo Domingo. Infórmate, solicita servicios y opina sobre los proyectos que dan forma al territorio."
      >
        <div className="row-wrap" style={{ marginTop: 24 }}>
          <a className="btn btn--primary" onClick={() => history.push('/servicios')}><I.Leaf size={17} /> Ver servicios</a>
          <a className="btn btn--ghost" style={{ color: '#fff', borderColor: 'rgba(255,255,255,.35)' }} onClick={() => history.push('/proyectos')}>Cartera de proyectos</a>
        </div>
      </PageHero>

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <span className="kicker kicker--lime">Accesos rápidos</span>
            <h2 style={{ marginTop: 10 }}>Todo lo de tu comuna, en un solo lugar</h2>
          </div>
          <div className="grid grid--3">
            {ATAJOS.map((a) => (
              <div
                key={a.t}
                className="card tile"
                data-tilt
                role="button"
                tabIndex={0}
                onClick={() => history.push(a.go)}
                onKeyDown={(e) => e.key === 'Enter' && history.push(a.go)}
              >
                <span className="tile__icon"><a.icon size={24} /></span>
                <h3>{a.t}</h3>
                <span className="sub">{a.s}</span>
                <span className="tile__arrow">Abrir <I.ArrowRight size={14} /></span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="card card--pad-lg" style={{ position: 'relative', overflow: 'hidden', background: 'var(--paper-2)' }}>
            <div className="tex tex--grass" style={{ opacity: 0.42 }} />
            <div className="cogob l-split" style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 36, alignItems: 'center' }}>
              <div>
                <span className="kicker"><I.Sprout size={16} /> Participación validada</span>
                <h2 style={{ margin: '14px 0 12px' }}>Cogobernanza ambiental</h2>
                <p className="lead">
                  Este portal fortalece la participación ciudadana en la gestión de residuos, áreas verdes,
                  movilidad e infraestructura sustentable. Tu voz, validada mediante{' '}
                  <strong style={{ color: 'var(--green-800)' }}>Clave Única</strong>, ayuda a decidir el rumbo
                  de los proyectos de la comuna.
                </p>
                <div className="row-wrap" style={{ marginTop: 22 }}>
                  <a className="btn btn--primary" onClick={() => history.push('/opinion')}><I.Chat size={17} /> Opinar proyectos</a>
                  <a className="btn btn--text" onClick={() => history.push('/login')}>Ingresar con Clave Única <I.ArrowRight size={15} /></a>
                </div>
              </div>
              <div className="stack" style={{ gap: 12 }}>
                {([['4', 'proyectos en cartera'], ['3', 'sectores con recolección'], ['3', 'zonas verdes protegidas']] as const).map(([n, l]) => (
                  <div key={l} className="card" style={{ display: 'flex', alignItems: 'baseline', gap: 14, padding: '16px 18px' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, color: 'var(--green)', lineHeight: 1 }}>{n}</span>
                    <span style={{ color: 'var(--body)' }}>{l}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Inicio;
