import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { IonToast } from '@ionic/react';
import Layout from '../../components/Layout';
import { fmtFecha } from '../../components/ui';
import { Icons as I } from '../../components/Icons';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../services/apiClient';
import type { EstadoProyecto, Solicitud, TipoSolicitud, Proyecto, Noticia, Actividad } from '../../types';
import {
  getNoticias, crearNoticia, eliminarNoticia, actualizarNoticia,
  getActividades, crearActividad, eliminarActividad, actualizarActividad,
  getProyectos, crearProyecto, eliminarProyecto, actualizarProyecto,
  getSolicitudes, actualizarEstadoSolicitud,
} from '../../services/dataService';

type Pestana = 'noticias' | 'actividades' | 'proyectos' | 'solicitudes';

const ESTADOS: EstadoProyecto[] = ['En Planificación', 'Licitación', 'En Ejecución', 'Evaluación Ambiental', 'Finalizado'];
const hoy = new Date().toISOString().slice(0, 10);

const TABS: { id: Pestana | 'reportes'; label: string; icon: React.FC<{ size?: number }> }[] = [
  { id: 'noticias', label: 'Noticias', icon: I.Drop },
  { id: 'actividades', label: 'Actividades', icon: I.Calendar },
  { id: 'proyectos', label: 'Proyectos', icon: I.Project },
  { id: 'solicitudes', label: 'Solicitudes', icon: I.Bin },
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
  const [cargando, setCargando] = useState(false);

  // States para creación
  const [noti, setNoti] = useState({ titulo: '', autor: usuario?.nombre ?? 'Municipalidad', resumen: '', contenido: '' });
  const [acti, setActi] = useState({ titulo: '', fecha: hoy, hora: '10:00 – 12:00', ubicacion: '', descripcion: '', cuposTotales: 30 });
  const [proy, setProy] = useState({ nombre: '', sector: '', estado: 'En Planificación' as EstadoProyecto, descripcion: '', duracionMeses: 6, fechaInicio: hoy });

  // States para solicitudes
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [cargandoSolis, setCargandoSolis] = useState(false);

  // States para edición
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editNoti, setEditNoti] = useState({ titulo: '', autor: '', resumen: '', contenido: '' });
  const [editActi, setEditActi] = useState({ titulo: '', fecha: '', hora: '', ubicacion: '', descripcion: '', cuposTotales: 0, cuposOcupados: 0 });
  const [editProy, setEditProy] = useState({ nombre: '', sector: '', estado: 'En Planificación' as EstadoProyecto, descripcion: '', duracionMeses: 0, fechaInicio: '' });

  // Efecto para jalar solicitudes cuando entra a esa pestaña
  useEffect(() => {
    if (tab === 'solicitudes') {
      cargarSolicitudes();
    }
  }, [tab]);

  const cargarSolicitudes = async () => {
    setCargandoSolis(true);
    try {
      const res = await apiClient.get('/api/servicios/solicitudes');
      setSolicitudes(res.data);
    } catch (err) {
      console.warn('[Admin] Falló obtención en API real, usando local cache...', err);
      setSolicitudes(getSolicitudes());
    } finally {
      setCargandoSolis(false);
    }
  };

  const cambiarEstado = async (tipo: TipoSolicitud, id: number, nuevoEstado: string) => {
    setCargando(true);
    try {
      await actualizarEstadoSolicitud(tipo, id, nuevoEstado);
      setToast('✅ Estado de solicitud actualizado.');
      await cargarSolicitudes();
    } catch (err: any) {
      setError(err.message || 'Error al actualizar estado.');
    } finally {
      setCargando(false);
    }
  };

  // Guardar nuevos
  const guardarNoticia = async () => {
    if (!noti.titulo.trim() || noti.resumen.trim().length < 5) { setError('Completa título y un resumen de al menos 5 caracteres.'); return; }
    setCargando(true);
    try {
      await crearNoticia({ ...noti, fecha: hoy });
      setNoti({ titulo: '', autor: usuario?.nombre ?? 'Municipalidad', resumen: '', contenido: '' });
      setError(''); setToast('✅ Noticia publicada.'); refrescar();
    } catch (err: any) {
      setError(err.message || 'Error al publicar noticia.');
    } finally {
      setCargando(false);
    }
  };

  const guardarActividad = async () => {
    if (!acti.titulo.trim() || !acti.ubicacion.trim()) { setError('Completa título y ubicación de la actividad.'); return; }
    setCargando(true);
    try {
      await crearActividad({ ...acti, cuposOcupados: 0 });
      setActi({ titulo: '', fecha: hoy, hora: '10:00 – 12:00', ubicacion: '', descripcion: '', cuposTotales: 30 });
      setError(''); setToast('✅ Actividad agendada.'); refrescar();
    } catch (err: any) {
      setError(err.message || 'Error al agendar actividad.');
    } finally {
      setCargando(false);
    }
  };

  const guardarProyecto = async () => {
    if (!proy.nombre.trim() || !proy.sector.trim()) { setError('Completa nombre y sector del proyecto.'); return; }
    setCargando(true);
    try {
      await crearProyecto(proy);
      setProy({ nombre: '', sector: '', estado: 'En Planificación', descripcion: '', duracionMeses: 6, fechaInicio: hoy });
      setError(''); setToast('✅ Proyecto registrado.'); refrescar();
    } catch (err: any) {
      setError(err.message || 'Error al registrar proyecto.');
    } finally {
      setCargando(false);
    }
  };

  // Edición inicializadores
  const iniciarEdicionNoticia = (n: Noticia) => {
    setEditingId(n.id);
    setEditNoti({ titulo: n.titulo, autor: n.autor, resumen: n.resumen, contenido: n.contenido });
  };
  const guardarEdicionNoticia = async (id: number) => {
    if (!editNoti.titulo.trim() || editNoti.resumen.trim().length < 5) { setError('Completa título y un resumen de al menos 5 caracteres.'); return; }
    setCargando(true);
    try {
      await actualizarNoticia(id, editNoti);
      setEditingId(null);
      setError(''); setToast('✅ Noticia actualizada.'); refrescar();
    } catch (err: any) {
      setError(err.message || 'Error al actualizar noticia.');
    } finally {
      setCargando(false);
    }
  };

  const iniciarEdicionActividad = (a: Actividad) => {
    setEditingId(a.id);
    setEditActi({ titulo: a.titulo, fecha: a.fecha, hora: a.hora, ubicacion: a.ubicacion, descripcion: a.descripcion, cuposTotales: a.cuposTotales, cuposOcupados: a.cuposOcupados });
  };
  const guardarEdicionActividad = async (id: number) => {
    if (!editActi.titulo.trim() || !editActi.ubicacion.trim()) { setError('Completa título y ubicación.'); return; }
    setCargando(true);
    try {
      await actualizarActividad(id, editActi);
      setEditingId(null);
      setError(''); setToast('✅ Actividad actualizada.'); refrescar();
    } catch (err: any) {
      setError(err.message || 'Error al actualizar actividad.');
    } finally {
      setCargando(false);
    }
  };

  const iniciarEdicionProyecto = (p: Proyecto) => {
    setEditingId(p.id);
    setEditProy({ nombre: p.nombre, sector: p.sector, estado: p.estado, descripcion: p.descripcion || '', duracionMeses: p.duracionMeses, fechaInicio: p.fechaInicio });
  };
  const guardarEdicionProyecto = async (id: number) => {
    if (!editProy.nombre.trim() || !editProy.sector.trim()) { setError('Completa nombre y sector.'); return; }
    setCargando(true);
    try {
      await actualizarProyecto(id, editProy);
      setEditingId(null);
      setError(''); setToast('✅ Proyecto actualizado.'); refrescar();
    } catch (err: any) {
      setError(err.message || 'Error al actualizar proyecto.');
    } finally {
      setCargando(false);
    }
  };

  // Eliminación con async/await
  const handleEliminarNoticia = async (id: number) => {
    setCargando(true);
    try {
      await eliminarNoticia(id);
      setToast('Noticia eliminada.');
      refrescar();
    } catch (err: any) {
      setError('Error al eliminar noticia.');
    } finally {
      setCargando(false);
    }
  };

  const handleEliminarActividad = async (id: number) => {
    setCargando(true);
    try {
      await eliminarActividad(id);
      setToast('Actividad eliminada.');
      refrescar();
    } catch (err: any) {
      setError('Error al eliminar actividad.');
    } finally {
      setCargando(false);
    }
  };

  const handleEliminarProyecto = async (id: number) => {
    setCargando(true);
    try {
      await eliminarProyecto(id);
      setToast('Proyecto eliminado.');
      refrescar();
    } catch (err: any) {
      setError('Error al eliminar proyecto.');
    } finally {
      setCargando(false);
    }
  };

  const tituloNuevo = tab === 'actividades' ? 'actividad' : tab === 'proyectos' ? 'proyecto' : tab === 'solicitudes' ? 'solicitud' : 'noticia';

  return (
    <Layout>
      <section className="phero" style={{ minHeight: 0 }}>
        <div className="phero__media"><img src="/assets/santo-domingo.jpg" alt="" /></div>
        <div className="wrap phero__inner" style={{ paddingBlock: 40 }}>
          <span className="kicker"><I.Shield size={16} /> Panel de Control</span>
          <h1 style={{ fontSize: 'clamp(1.7rem,1.3rem+1.6vw,2.5rem)' }}>Administración Municipal</h1>
          <p>Sesión activa: <strong style={{ color: '#fff' }}>{usuario?.nombre}</strong> ({usuario?.rut}).</p>
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
          {cargando && <p className="muted" style={{ marginBottom: 14 }}>Guardando cambios en el servidor...</p>}

          {tab !== 'solicitudes' && (
            <div className="card card--pad-lg" style={{ marginBottom: 26 }}>
              <h3 className="row" style={{ gap: 10, color: 'var(--green-800)', marginBottom: 18 }}><I.Plus size={20} /> Nueva {tituloNuevo}</h3>

              {tab === 'noticias' && (
                <div className="stack-4">
                  <div className="field"><label>Título</label><input className="input" placeholder="Título de la noticia…" value={noti.titulo} onChange={(e) => setNoti({ ...noti, titulo: e.target.value })} /></div>
                  <div className="field"><label>Autor / dirección</label><input className="input" value={noti.autor} onChange={(e) => setNoti({ ...noti, autor: e.target.value })} /></div>
                  <div className="field"><label>Resumen</label><textarea className="textarea" style={{ minHeight: 70 }} placeholder="Resumen breve para listados…" value={noti.resumen} onChange={(e) => setNoti({ ...noti, resumen: e.target.value })} /></div>
                  <div className="field"><label>Contenido</label><textarea className="textarea" placeholder="Contenido completo de la noticia…" value={noti.contenido} onChange={(e) => setNoti({ ...noti, contenido: e.target.value })} /></div>
                  <button className="btn btn--primary btn--block btn--lg" disabled={cargando} onClick={guardarNoticia}><I.Plus size={17} /> Publicar Noticia</button>
                </div>
              )}

              {tab === 'actividades' && (
                <div className="stack-4">
                  <div className="field"><label>Título de Actividad</label><input className="input" placeholder="Ej: Limpieza comunitaria humedal…" value={acti.titulo} onChange={(e) => setActi({ ...acti, titulo: e.target.value })} /></div>
                  <div className="field-grid">
                    <div className="field"><label>Fecha</label><input className="input" type="date" value={acti.fecha} onChange={(e) => setActi({ ...acti, fecha: e.target.value })} /></div>
                    <div className="field"><label>Horario</label><input className="input" value={acti.hora} onChange={(e) => setActi({ ...acti, hora: e.target.value })} /></div>
                  </div>
                  <div className="field-grid">
                    <div className="field"><label>Ubicación</label><input className="input" placeholder="Ej: Acceso humedal sur…" value={acti.ubicacion} onChange={(e) => setActi({ ...acti, ubicacion: e.target.value })} /></div>
                    <div className="field"><label>Cupos totales</label><input className="input" type="number" value={acti.cuposTotales} onChange={(e) => setActi({ ...acti, cuposTotales: Number(e.target.value) || 0 })} /></div>
                  </div>
                  <div className="field"><label>Descripción</label><textarea className="textarea" placeholder="Breve detalle y requisitos de la actividad…" value={acti.descripcion} onChange={(e) => setActi({ ...acti, descripcion: e.target.value })} /></div>
                  <button className="btn btn--primary btn--block btn--lg" disabled={cargando} onClick={guardarActividad}><I.Plus size={17} /> Agendar Actividad</button>
                </div>
              )}

              {tab === 'proyectos' && (
                <div className="stack-4">
                  <div className="field"><label>Nombre del Proyecto</label><input className="input" placeholder="Ej: Mejoramiento de Plaza de Armas…" value={proy.nombre} onChange={(e) => setProy({ ...proy, nombre: e.target.value })} /></div>
                  <div className="field-grid">
                    <div className="field"><label>Sector</label><input className="input" placeholder="Sector geográfico de Santo Domingo…" value={proy.sector} onChange={(e) => setProy({ ...proy, sector: e.target.value })} /></div>
                    <div className="field"><label>Estado actual</label>
                      <select className="input select" value={proy.estado} onChange={(e) => setProy({ ...proy, estado: e.target.value as EstadoProyecto })}>
                        {ESTADOS.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="field-grid">
                    <div className="field"><label>Duración estimada (meses)</label><input className="input" type="number" value={proy.duracionMeses} onChange={(e) => setProy({ ...proy, duracionMeses: Number(e.target.value) || 0 })} /></div>
                    <div className="field"><label>Fecha de inicio estimado</label><input className="input" type="date" value={proy.fechaInicio} onChange={(e) => setProy({ ...proy, fechaInicio: e.target.value })} /></div>
                  </div>
                  <div className="field"><label>Descripción / Detalle Técnico</label><textarea className="textarea" placeholder="Descripción detallada del impacto ecológico del proyecto…" value={proy.descripcion} onChange={(e) => setProy({ ...proy, descripcion: e.target.value })} /></div>
                  <button className="btn btn--primary btn--block btn--lg" disabled={cargando} onClick={guardarProyecto}><I.Plus size={17} /> Registrar Proyecto</button>
                </div>
              )}
            </div>
          )}

          {tab === 'solicitudes' ? (
            <div>
              <h3 className="row" style={{ gap: 10, color: 'var(--green-800)', marginBottom: 18 }}><I.Bin size={20} /> Solicitudes Ciudadanas Recibidas</h3>
              <p className="muted" style={{ marginBottom: 18 }}>Control y actualización de solicitudes de recolección de voluminosos e instalación de tachos de reciclaje.</p>
              
              {cargandoSolis ? (
                <p>Cargando solicitudes desde el servidor REST...</p>
              ) : solicitudes.length === 0 ? (
                <p className="muted">No hay solicitudes ciudadanas pendientes.</p>
              ) : (
                <div className="stack" style={{ gap: 14 }}>
                  {solicitudes.map((soli) => {
                    const badgeColor =
                      soli.estado === 'PENDIENTE'
                        ? { bg: '#FFF9E6', text: '#B27D00', border: '#FFE599' }
                        : soli.estado === 'EN PROCESO'
                        ? { bg: '#E8F4FD', text: '#0066B2', border: '#B3DCFB' }
                        : soli.estado === 'RESUELTO' || soli.estado === 'RESUELTA'
                        ? { bg: '#EAF6EC', text: '#1E7E34', border: '#C3E6CB' }
                        : { bg: '#FDF2F2', text: '#D32F2F', border: '#F8D7DA' };

                    return (
                      <div key={`${soli.tipo}-${soli.id}`} className="card" style={{ padding: 18 }}>
                        <div className="row-wrap" style={{ justifyContent: 'space-between', alignItems: 'start', gap: 10 }}>
                          <div>
                            <span style={{ fontSize: '.75rem', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>
                              {soli.tipo === 'recoleccion' ? 'Retiro Voluminoso' : 'Tacho Reciclaje'}
                            </span>
                            <h4 style={{ margin: '4px 0 8px', color: 'var(--green-800)' }}>{soli.nombre}</h4>
                          </div>
                          <span style={{
                            fontSize: '.75rem',
                            padding: '3px 8px',
                            borderRadius: 6,
                            fontWeight: 600,
                            backgroundColor: badgeColor.bg,
                            color: badgeColor.text,
                            border: `1px solid ${badgeColor.border}`,
                          }}>
                            {soli.estado}
                          </span>
                        </div>

                        <div className="stack" style={{ gap: 6, fontSize: '.9rem', margin: '8px 0 14px' }}>
                          <p><strong>Dirección:</strong> {soli.direccion}</p>
                          <p><strong>Detalle / Motivo:</strong> {soli.detalle}</p>
                          <p className="meta" style={{ fontSize: '.8rem', color: 'var(--muted)' }}>
                            Solicitante RUT: {soli.usuarioRut} · Fecha: {fmtFecha(soli.fecha)}
                          </p>
                        </div>

                        <div className="row-wrap" style={{ gap: 8, borderTop: '1px solid var(--line)', paddingTop: 12 }}>
                          <span style={{ fontSize: '.8rem', color: 'var(--muted)', alignSelf: 'center' }}>Actualizar Estado:</span>
                          <select
                            className="input select"
                            style={{ width: 'auto', padding: '4px 10px', fontSize: '.85rem', height: 'auto' }}
                            value={soli.estado}
                            disabled={cargando}
                            onChange={(e) => cambiarEstado(soli.tipo, soli.id, e.target.value)}
                          >
                            <option value="PENDIENTE">PENDIENTE</option>
                            <option value="EN PROCESO">EN PROCESO</option>
                            <option value="RESUELTO">RESUELTO</option>
                            <option value="RECHAZADO">RECHAZADO</option>
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div>
              <h4 style={{ margin: '26px 0 14px', color: 'var(--green-800)' }}>Publicadas</h4>
              <div className="stack" style={{ gap: 12 }}>
                {tab === 'noticias' && getNoticias().map((n) => (
                  <div key={n.id} className="card" style={{ padding: 18 }}>
                    {editingId === n.id ? (
                      <div className="stack-4">
                        <strong style={{ color: 'var(--green-800)' }}>Editar Noticia #{n.id}</strong>
                        <div className="field"><label>Título</label><input className="input" value={editNoti.titulo} onChange={(e) => setEditNoti({ ...editNoti, titulo: e.target.value })} /></div>
                        <div className="field"><label>Autor</label><input className="input" value={editNoti.autor} onChange={(e) => setEditNoti({ ...editNoti, autor: e.target.value })} /></div>
                        <div className="field"><label>Resumen</label><textarea className="textarea" value={editNoti.resumen} onChange={(e) => setEditNoti({ ...editNoti, resumen: e.target.value })} /></div>
                        <div className="field"><label>Contenido</label><textarea className="textarea" value={editNoti.contenido} onChange={(e) => setEditNoti({ ...editNoti, contenido: e.target.value })} /></div>
                        <div className="row-wrap" style={{ gap: 8 }}>
                          <button className="btn btn--primary btn--sm" onClick={() => guardarEdicionNoticia(n.id)}>Guardar</button>
                          <button className="btn btn--ghost btn--sm" onClick={() => setEditingId(null)}>Cancelar</button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 14, alignItems: 'start' }}>
                        <div>
                          <strong style={{ color: 'var(--green-800)' }}>{n.titulo}</strong>
                          <p className="meta" style={{ margin: '6px 0', fontFamily: 'var(--font-mono)', fontSize: '.76rem' }}>{fmtFecha(n.fecha)} · {n.autor}</p>
                          <p className="muted" style={{ fontSize: '.9rem' }}>{n.resumen}</p>
                        </div>
                        <div className="row-wrap" style={{ gap: 6 }}>
                          <button className="btn btn--ghost btn--sm" style={{ color: 'var(--green-800)', borderColor: 'var(--green)' }} onClick={() => iniciarEdicionNoticia(n)}>Editar</button>
                          <button className="btn btn--ghost btn--sm" style={{ color: '#B23B3B', borderColor: '#F0D6D6' }} onClick={() => handleEliminarNoticia(n.id)}><I.Trash size={16} /></button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {tab === 'actividades' && getActividades().map((a) => (
                  <div key={a.id} className="card" style={{ padding: 18 }}>
                    {editingId === a.id ? (
                      <div className="stack-4">
                        <strong style={{ color: 'var(--green-800)' }}>Editar Actividad #{a.id}</strong>
                        <div className="field"><label>Título</label><input className="input" value={editActi.titulo} onChange={(e) => setEditActi({ ...editActi, titulo: e.target.value })} /></div>
                        <div className="field-grid">
                          <div className="field"><label>Fecha</label><input className="input" type="date" value={editActi.fecha} onChange={(e) => setEditActi({ ...editActi, fecha: e.target.value })} /></div>
                          <div className="field"><label>Hora</label><input className="input" value={editActi.hora} onChange={(e) => setEditActi({ ...editActi, hora: e.target.value })} /></div>
                        </div>
                        <div className="field-grid">
                          <div className="field"><label>Ubicación</label><input className="input" value={editActi.ubicacion} onChange={(e) => setEditActi({ ...editActi, ubicacion: e.target.value })} /></div>
                          <div className="field"><label>Cupos Totales</label><input className="input" type="number" value={editActi.cuposTotales} onChange={(e) => setEditActi({ ...editActi, cuposTotales: Number(e.target.value) || 0 })} /></div>
                        </div>
                        <div className="field"><label>Descripción</label><textarea className="textarea" value={editActi.descripcion} onChange={(e) => setEditActi({ ...editActi, descripcion: e.target.value })} /></div>
                        <div className="row-wrap" style={{ gap: 8 }}>
                          <button className="btn btn--primary btn--sm" onClick={() => guardarEdicionActividad(a.id)}>Guardar</button>
                          <button className="btn btn--ghost btn--sm" onClick={() => setEditingId(null)}>Cancelar</button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 14, alignItems: 'start' }}>
                        <div>
                          <strong style={{ color: 'var(--green-800)' }}>{a.titulo}</strong>
                          <p className="meta" style={{ margin: '6px 0', fontFamily: 'var(--font-mono)', fontSize: '.76rem' }}>{fmtFecha(a.fecha)} · {a.hora} · {a.ubicacion} · {a.cuposOcupados}/{a.cuposTotales} cupos</p>
                        </div>
                        <div className="row-wrap" style={{ gap: 6 }}>
                          <button className="btn btn--ghost btn--sm" style={{ color: 'var(--green-800)', borderColor: 'var(--green)' }} onClick={() => iniciarEdicionActividad(a)}>Editar</button>
                          <button className="btn btn--ghost btn--sm" style={{ color: '#B23B3B', borderColor: '#F0D6D6' }} onClick={() => handleEliminarActividad(a.id)}><I.Trash size={16} /></button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {tab === 'proyectos' && getProyectos().map((p) => (
                  <div key={p.id} className="card" style={{ padding: 18 }}>
                    {editingId === p.id ? (
                      <div className="stack-4">
                        <strong style={{ color: 'var(--green-800)' }}>Editar Proyecto #{p.id}</strong>
                        <div className="field"><label>Nombre del Proyecto</label><input className="input" value={editProy.nombre} onChange={(e) => setEditProy({ ...editProy, nombre: e.target.value })} /></div>
                        <div className="field-grid">
                          <div className="field"><label>Sector</label><input className="input" value={editProy.sector} onChange={(e) => setEditProy({ ...editProy, sector: e.target.value })} /></div>
                          <div className="field"><label>Estado</label>
                            <select className="input select" value={editProy.estado} onChange={(e) => setEditProy({ ...editProy, estado: e.target.value as EstadoProyecto })}>
                              {ESTADOS.map((s) => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </div>
                        </div>
                        <div className="field-grid">
                          <div className="field"><label>Duración (meses)</label><input className="input" type="number" value={editProy.duracionMeses} onChange={(e) => setEditProy({ ...editProy, duracionMeses: Number(e.target.value) || 0 })} /></div>
                          <div className="field"><label>Fecha de inicio</label><input className="input" type="date" value={editProy.fechaInicio} onChange={(e) => setEditProy({ ...editProy, fechaInicio: e.target.value })} /></div>
                        </div>
                        <div className="field"><label>Descripción</label><textarea className="textarea" value={editProy.descripcion} onChange={(e) => setEditProy({ ...editProy, descripcion: e.target.value })} /></div>
                        <div className="row-wrap" style={{ gap: 8 }}>
                          <button className="btn btn--primary btn--sm" onClick={() => guardarEdicionProyecto(p.id)}>Guardar</button>
                          <button className="btn btn--ghost btn--sm" onClick={() => setEditingId(null)}>Cancelar</button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 14, alignItems: 'start' }}>
                        <div>
                          <strong style={{ color: 'var(--green-800)' }}>{p.nombre}</strong>
                          <p className="meta" style={{ margin: '6px 0', fontFamily: 'var(--font-mono)', fontSize: '.76rem' }}>{p.sector} · {p.estado} · {p.duracionMeses} meses · Inicio: {fmtFecha(p.fechaInicio)}</p>
                        </div>
                        <div className="row-wrap" style={{ gap: 6 }}>
                          <button className="btn btn--ghost btn--sm" style={{ color: 'var(--green-800)', borderColor: 'var(--green)' }} onClick={() => iniciarEdicionProyecto(p)}>Editar</button>
                          <button className="btn btn--ghost btn--sm" style={{ color: '#B23B3B', borderColor: '#F0D6D6' }} onClick={() => handleEliminarProyecto(p.id)}><I.Trash size={16} /></button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
      <IonToast isOpen={!!toast} message={toast} duration={1400} color="success" position="top" onDidDismiss={() => setToast('')} />
    </Layout>
  );
};

export default AdminDashboard;
