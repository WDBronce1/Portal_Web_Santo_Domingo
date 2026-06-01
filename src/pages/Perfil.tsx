import React from 'react';
import { useHistory } from 'react-router-dom';
import Layout from '../components/Layout';
import { Stars, fmtFecha } from '../components/ui';
import { Icons as I } from '../components/Icons';
import { useAuth } from '../context/AuthContext';
import { getSolicitudes, getOpiniones, getProyecto } from '../services/dataService';

const TIPO_LABEL: Record<string, string> = {
  recoleccion: 'Recolección domiciliaria',
  tacho: 'Solicitud de tacho',
};

const Perfil: React.FC = () => {
  const history = useHistory();
  const { usuario, isAdmin, logout } = useAuth();

  if (!usuario) return null;

  const misSolicitudes = getSolicitudes().filter((s) => s.usuarioRut === usuario.rut);
  const misOpiniones = getOpiniones().filter((o) => o.usuarioRut === usuario.rut);

  const salir = () => {
    logout();
    history.replace('/inicio');
  };

  return (
    <Layout>
      <section className="section">
        <div className="wrap--mid stack-4">
          <div className="card card--pad-lg center" style={{ position: 'relative', overflow: 'hidden' }}>
            <div className="tex tex--grass" style={{ opacity: .3, height: 120, inset: 'auto 0 auto 0', top: 0 }} />
            <span className="tile__icon" style={{ margin: '0 auto 14px', width: 64, height: 64, position: 'relative' }}><I.User size={32} /></span>
            <h2 style={{ color: 'var(--green-800)' }}>{usuario.nombre}</h2>
            <p className="muted" style={{ fontFamily: 'var(--font-mono)', fontSize: '.86rem' }}>{usuario.email}</p>
            <div className="card card--paper" style={{ textAlign: 'left', marginTop: 18, display: 'grid', gap: 8 }}>
              <div className="row between"><span className="kicker kicker--bare muted">RUT</span><span style={{ fontFamily: 'var(--font-mono)', fontSize: '.86rem', color: 'var(--ink)' }}>{usuario.rut}</span></div>
              <div className="row between"><span className="kicker kicker--bare muted">Comuna</span><span style={{ fontSize: '.9rem', color: 'var(--ink)' }}>{usuario.comuna}, {usuario.region}</span></div>
              <div className="row between"><span className="kicker kicker--bare muted">Perfil</span><span style={{ fontSize: '.9rem', color: 'var(--ink)' }}>{isAdmin ? 'Administrador municipal' : 'Ciudadano/a'}</span></div>
            </div>
            <div className="stack-3" style={{ marginTop: 18 }}>
              {isAdmin && <button className="btn btn--ghost btn--block" onClick={() => history.push('/admin')}><I.Shield size={17} /> Panel de administración</button>}
              <button className="btn btn--text" onClick={salir}><I.Logout size={16} /> Cerrar sesión</button>
            </div>
          </div>

          <div className="card card--pad-lg">
            <h3 className="row" style={{ gap: 10, color: 'var(--green-800)' }}><I.Drop size={20} /> Mis solicitudes</h3>
            {misSolicitudes.length === 0 ? (
              <p className="muted" style={{ marginTop: 10 }}>Aún no has enviado solicitudes de servicios.</p>
            ) : (
              <div className="stack" style={{ gap: 10, marginTop: 12 }}>
                {misSolicitudes.map((s) => (
                  <div key={s.id} className="card card--paper">
                    <div className="row between"><strong style={{ color: 'var(--green-800)' }}>{TIPO_LABEL[s.tipo] ?? s.tipo}</strong><span className="badge badge--plan">{s.estado}</span></div>
                    <p className="muted" style={{ marginTop: 6, fontSize: '.88rem' }}>{s.direccion} · {fmtFecha(s.fecha)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card card--pad-lg">
            <h3 className="row" style={{ gap: 10, color: 'var(--green-800)' }}><I.Chat size={20} /> Mis opiniones</h3>
            {misOpiniones.length === 0 ? (
              <p className="muted" style={{ marginTop: 10 }}>Todavía no has opinado sobre proyectos comunales.</p>
            ) : (
              <div className="stack" style={{ gap: 10, marginTop: 12 }}>
                {misOpiniones.map((o) => {
                  const proy = getProyecto(o.proyectoId);
                  return (
                    <div key={o.id} className="card card--paper">
                      <div className="row between"><strong style={{ color: 'var(--green-800)' }}>{proy?.nombre ?? `Proyecto #${o.proyectoId}`}</strong><Stars value={o.calificacion} size={15} /></div>
                      <p style={{ margin: '8px 0 4px', color: 'var(--body)', fontSize: '.92rem' }}>{o.comentario}</p>
                      <span className="muted" style={{ fontSize: '.8rem', fontFamily: 'var(--font-mono)' }}>{fmtFecha(o.fecha)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Perfil;
