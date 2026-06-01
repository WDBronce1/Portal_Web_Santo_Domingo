import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { IonToast } from '@ionic/react';
import Layout from '../../components/Layout';
import { fmtFecha } from '../../components/ui';
import { Icons as I } from '../../components/Icons';
import { useAuth } from '../../context/AuthContext';
import type { EstadoProyecto } from '../../types';
import {
  getNoticias, crearNoticia, eliminarNoticia,
  getActividades, crearActividad, eliminarActividad,
  getProyectos, crearProyecto, eliminarProyecto,
} from '../../services/dataService';

type Pestana = 'noticias' | 'actividades' | 'proyectos';

const ESTADOS: EstadoProyecto[] = ['En Planificación', 'Licitación', 'En Ejecución', 'Evaluación Ambiental', 'Finalizado'];
const hoy = new Date().toISOString().slice(0, 10);

const TABS: { id: Pestana | 'reportes'; label: string; icon: React.FC<{ size?: number }> }[] = [
  { id: 'noticias', label: 'Noticias', icon: I.Drop },
  { id: 'actividades', label: 'Actividades', icon: I.Calendar },
  { id: 'proyectos', label: 'Proyectos', icon: I.Project },
  { id: 'reportes', label: 'Reportes', icon: I.Chart },
];

const AdminDashboard: React.FC = () => {
  const history = useHistory();
  const { usuario } = useAuth();
  const [tab, setTab] = useState<Pestana>('noticias');
  const [, force] = useState(0);
  const refrescar = () => force((n) => n + 1);
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');

  const [noti, setNoti] = useState({ titulo: '', autor: usuario?.nombre ?? 'Municipalidad', resumen: '', contenido: '' });
  const [acti, setActi] = useState({ titulo: '', fecha: hoy, hora: '10:00 – 12:00', ubicacion: '', descripcion: '', cuposTotales: 30 });
  const [proy, setProy] = useState({ nombre: '', sector: '', estado: 'En Planificación' as EstadoProyecto, descripcion: '', duracionMeses: 6, fechaInicio: hoy });

  const guardarNoticia = () => {
    if (!noti.titulo.trim() || noti.resumen.trim().length < 5) { setError('Completa título y un resumen de al menos 5 caracteres.'); return; }
    crearNoticia({ ...noti, fecha: hoy });
    setNoti({ titulo: '', autor: usuario?.nombre ?? 'Municipalidad', resumen: '', contenido: '' });
    setError(''); setToast('✅ Noticia publicada.'); refrescar();
  };

  const guardarActividad = () => {
    if (!acti.titulo.trim() || !acti.ubicacion.trim()) { setError('Completa título y ubicación de la actividad.'); return; }
    crearActividad({ ...acti, cuposOcupados: 0 });
    setActi({ titulo: '', fecha: hoy, hora: '10:00 – 12:00', ubicacion: '', descripcion: '', cuposTotales: 30 });
    setError(''); setToast('✅ Actividad agendada.'); refrescar();
  };

  const guardarProyecto = () => {
    if (!proy.nombre.trim() || !proy.sector.trim()) { setError('Completa nombre y sector del proyecto.'); return; }
    crearProyecto(proy);
    setProy({ nombre: '', sector: '', estado: 'En Planificación', descripcion: '', duracionMeses: 6, fechaInicio: hoy });
    setError(''); setToast('✅ Proyecto registrado.'); refrescar();
  };

  const tituloNuevo = tab === 'actividades' ? 'actividad' : tab === 'proyectos' ? 'proyecto' : 'noticia';

  return (
    <Layout>
      <section className="phero" style={{ minHeight: 0 }}>
        <div className="phero__media"><img src="/assets/santo-domingo.jpg" alt="" /></div>
        <div className="wrap phero__inner" style={{ paddingBlock: 40 }}>
          <span className="kicker"><I.Shield size={16} /> Gestión de contenido</span>
          <h1 style={{ fontSize: 'clamp(1.7rem,1.3rem+1.6vw,2.5rem)' }}>Panel de administración</h1>
          <p>Sesión validada: <strong style={{ color: '#fff' }}>{usuario?.nombre}</strong> ({usuario?.rut}).</p>
        </div>
      </section>

      <section className="section">
        <div className="wrap--mid">
          <div className="row-wrap" style={{ gap: 8, marginBottom: 22 }}>
            {TABS.map((t) => (
              <button key={t.id} className={'btn btn--sm ' + (tab === t.id ? 'btn--primary' : 'btn--ghost')}
                onClick={() => t.id === 'reportes' ? history.push('/admin/reportes') : setTab(t.id as Pestana)}>
                <t.icon size={15} /> {t.label}
              </button>
            ))}
          </div>

          {error && <p className="error-text" style={{ marginBottom: 14 }}>{error}</p>}

          <div className="card card--pad-lg">
            <h3 className="row" style={{ gap: 10, color: 'var(--green-800)', marginBottom: 18 }}><I.Plus size={20} /> Nueva {tituloNuevo}</h3>

            {tab === 'noticias' && (
              <div className="stack-4">
                <div className="field"><label>Título</label><input className="input" placeholder="Título…" value={noti.titulo} onChange={(e) => setNoti({ ...noti, titulo: e.target.value })} /></div>
                <div className="field"><label>Autor / dirección</label><input className="input" value={noti.autor} onChange={(e) => setNoti({ ...noti, autor: e.target.value })} /></div>
                <div className="field"><label>Resumen</label><textarea className="textarea" style={{ minHeight: 70 }} placeholder="Resumen breve…" value={noti.resumen} onChange={(e) => setNoti({ ...noti, resumen: e.target.value })} /></div>
                <div className="field"><label>Contenido</label><textarea className="textarea" placeholder="Contenido completo…" value={noti.contenido} onChange={(e) => setNoti({ ...noti, contenido: e.target.value })} /></div>
                <button className="btn btn--primary btn--block btn--lg" onClick={guardarNoticia}><I.Plus size={17} /> Publicar</button>
              </div>
            )}

            {tab === 'actividades' && (
              <div className="stack-4">
                <div className="field"><label>Título</label><input className="input" placeholder="Título…" value={acti.titulo} onChange={(e) => setActi({ ...acti, titulo: e.target.value })} /></div>
                <div className="field-grid">
                  <div className="field"><label>Fecha</label><input className="input" type="date" value={acti.fecha} onChange={(e) => setActi({ ...acti, fecha: e.target.value })} /></div>
                  <div className="field"><label>Horario</label><input className="input" value={acti.hora} onChange={(e) => setActi({ ...acti, hora: e.target.value })} /></div>
                </div>
                <div className="field-grid">
                  <div className="field"><label>Ubicación</label><input className="input" placeholder="Lugar…" value={acti.ubicacion} onChange={(e) => setActi({ ...acti, ubicacion: e.target.value })} /></div>
                  <div className="field"><label>Cupos totales</label><input className="input" type="number" value={acti.cuposTotales} onChange={(e) => setActi({ ...acti, cuposTotales: Number(e.target.value) || 0 })} /></div>
                </div>
                <div className="field"><label>Descripción</label><textarea className="textarea" placeholder="Descripción…" value={acti.descripcion} onChange={(e) => setActi({ ...acti, descripcion: e.target.value })} /></div>
                <button className="btn btn--primary btn--block btn--lg" onClick={guardarActividad}><I.Plus size={17} /> Agendar</button>
              </div>
            )}

            {tab === 'proyectos' && (
              <div className="stack-4">
                <div className="field"><label>Nombre</label><input className="input" placeholder="Nombre del proyecto…" value={proy.nombre} onChange={(e) => setProy({ ...proy, nombre: e.target.value })} /></div>
                <div className="field-grid">
                  <div className="field"><label>Sector</label><input className="input" placeholder="Sector…" value={proy.sector} onChange={(e) => setProy({ ...proy, sector: e.target.value })} /></div>
                  <div className="field"><label>Estado</label>
                    <select className="input select" value={proy.estado} onChange={(e) => setProy({ ...proy, estado: e.target.value as EstadoProyecto })}>
                      {ESTADOS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="field-grid">
                  <div className="field"><label>Duración (meses)</label><input className="input" type="number" value={proy.duracionMeses} onChange={(e) => setProy({ ...proy, duracionMeses: Number(e.target.value) || 0 })} /></div>
                  <div className="field"><label>Fecha de inicio</label><input className="input" type="date" value={proy.fechaInicio} onChange={(e) => setProy({ ...proy, fechaInicio: e.target.value })} /></div>
                </div>
                <div className="field"><label>Descripción</label><textarea className="textarea" placeholder="Descripción…" value={proy.descripcion} onChange={(e) => setProy({ ...proy, descripcion: e.target.value })} /></div>
                <button className="btn btn--primary btn--block btn--lg" onClick={guardarProyecto}><I.Plus size={17} /> Registrar</button>
              </div>
            )}
          </div>

          <h4 style={{ margin: '26px 0 14px', color: 'var(--green-800)' }}>Publicadas</h4>
          <div className="stack" style={{ gap: 12 }}>
            {tab === 'noticias' && getNoticias().map((n) => (
              <div key={n.id} className="card l-split" style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 14, alignItems: 'start' }}>
                <div>
                  <strong style={{ color: 'var(--green-800)' }}>{n.titulo}</strong>
                  <p className="meta" style={{ margin: '6px 0', fontFamily: 'var(--font-mono)', fontSize: '.76rem' }}>{fmtFecha(n.fecha)} · {n.autor}</p>
                  <p className="muted" style={{ fontSize: '.9rem' }}>{n.resumen}</p>
                </div>
                <button className="btn btn--ghost btn--sm" style={{ color: '#B23B3B', borderColor: '#F0D6D6' }} onClick={() => { eliminarNoticia(n.id); setToast('Noticia eliminada.'); refrescar(); }}><I.Trash size={16} /></button>
              </div>
            ))}

            {tab === 'actividades' && getActividades().map((a) => (
              <div key={a.id} className="card l-split" style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 14, alignItems: 'start' }}>
                <div>
                  <strong style={{ color: 'var(--green-800)' }}>{a.titulo}</strong>
                  <p className="meta" style={{ margin: '6px 0', fontFamily: 'var(--font-mono)', fontSize: '.76rem' }}>{fmtFecha(a.fecha)} · {a.hora} · {a.ubicacion}</p>
                </div>
                <button className="btn btn--ghost btn--sm" style={{ color: '#B23B3B', borderColor: '#F0D6D6' }} onClick={() => { eliminarActividad(a.id); setToast('Actividad eliminada.'); refrescar(); }}><I.Trash size={16} /></button>
              </div>
            ))}

            {tab === 'proyectos' && getProyectos().map((p) => (
              <div key={p.id} className="card l-split" style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 14, alignItems: 'start' }}>
                <div>
                  <strong style={{ color: 'var(--green-800)' }}>{p.nombre}</strong>
                  <p className="meta" style={{ margin: '6px 0', fontFamily: 'var(--font-mono)', fontSize: '.76rem' }}>{p.sector} · {p.estado} · {p.duracionMeses} meses</p>
                </div>
                <button className="btn btn--ghost btn--sm" style={{ color: '#B23B3B', borderColor: '#F0D6D6' }} onClick={() => { eliminarProyecto(p.id); setToast('Proyecto eliminado.'); refrescar(); }}><I.Trash size={16} /></button>
              </div>
            ))}
          </div>
        </div>
      </section>
      <IonToast isOpen={!!toast} message={toast} duration={1400} color="success" position="top" onDidDismiss={() => setToast('')} />
    </Layout>
  );
};

export default AdminDashboard;
