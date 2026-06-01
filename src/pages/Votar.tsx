import React, { useState } from 'react';
import { useParams, useHistory, Redirect } from 'react-router-dom';
import { IonToast } from '@ionic/react';
import Layout from '../components/Layout';
import { Icons as I } from '../components/Icons';
import { useAuth } from '../context/AuthContext';
import { getProyecto, crearOpinion, getOpinionesDeProyecto } from '../services/dataService';

const Votar: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const { usuario } = useAuth();

  const proyecto = getProyecto(Number(id));
  const yaOpino = !!usuario && getOpinionesDeProyecto(Number(id)).some((o) => o.usuarioRut === usuario.rut);

  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comentario, setComentario] = useState('');
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  // Defensa en profundidad: solo ciudadanos con Clave Única pueden opinar.
  // El gateway (ProtectedRoute) ya intercepta; este guard cierra cualquier acceso
  // directo. Va después de los hooks para no romper las Reglas de Hooks.
  if (!usuario) return <Redirect to="/login" />;

  if (!proyecto) {
    return (
      <Layout>
        <section className="section">
          <div className="wrap--mid">
            <div className="card card--pad-lg center">
              <p className="muted">Proyecto no encontrado.</p>
              <button className="btn btn--primary" style={{ marginTop: 16 }} onClick={() => history.push('/opinion')}>Volver a opiniones</button>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  const enviar = () => {
    if (rating === 0) { setError('Selecciona una calificación de 1 a 5 estrellas.'); return; }
    if (comentario.trim().length < 5) { setError('Escribe un comentario de al menos 5 caracteres.'); return; }
    crearOpinion({
      proyectoId: proyecto.id,
      usuarioRut: usuario.rut,
      usuarioNombre: usuario.nombre,
      calificacion: rating,
      comentario,
    });
    setError('');
    setToast('✅ ¡Gracias! Tu opinión fue registrada.');
    setTimeout(() => history.push(`/proyectos/${proyecto.id}`), 1400);
  };

  return (
    <Layout>
      <section className="section">
        <div className="wrap--narrow">
          <a className="btn btn--text" onClick={() => history.push('/opinion')} style={{ marginBottom: 14 }}><I.ArrowLeft size={16} /> Volver</a>
          <div className="card card--pad-lg">
            <span className="kicker kicker--lime">{proyecto.estado} · {proyecto.sector}</span>
            <h2 style={{ margin: '10px 0 8px', color: 'var(--green-800)' }}>Opinar: {proyecto.nombre}</h2>
            <p className="muted" style={{ marginBottom: 22 }}>Sesión validada como <strong style={{ color: 'var(--green-800)' }}>{usuario.nombre}</strong> ({usuario.rut}).</p>

            {yaOpino && (
              <div className="card card--paper" style={{ display: 'flex', gap: 10, padding: '12px 16px', marginBottom: 18 }}>
                <span style={{ color: 'var(--green)' }}><I.Chat size={18} /></span>
                <p style={{ fontSize: '.9rem', color: 'var(--body)' }}>Ya registraste una opinión para este proyecto. Puedes enviar otra valoración si lo deseas.</p>
              </div>
            )}

            <div className="field" style={{ marginBottom: 18 }}>
              <label>Tu calificación</label>
              <span className="stars stars--input" onMouseLeave={() => setHover(0)}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <span key={i} onMouseEnter={() => setHover(i)} onClick={() => setRating(i)} style={{ cursor: 'pointer' }}>
                    {(hover || rating) >= i ? <I.Star size={30} style={{ color: '#E8B100' }} /> : <I.StarOutline size={30} style={{ color: '#D8DEDA' }} />}
                  </span>
                ))}
              </span>
            </div>
            <div className="field"><label>Comentario</label><textarea className="textarea" maxLength={500} value={comentario} onChange={(e) => setComentario(e.target.value)} placeholder="Cuéntanos qué te parece este proyecto para la comuna…" /></div>
            <div className="row between" style={{ margin: '8px 0 18px' }}><span className="muted" style={{ fontSize: '.8rem', fontFamily: 'var(--font-mono)' }}>{comentario.length}/500 caracteres</span></div>
            {error && <p className="error-text">{error}</p>}
            <button className="btn btn--sky btn--block btn--lg" onClick={enviar}><I.Chat size={18} /> Enviar mi opinión</button>
          </div>
        </div>
      </section>
      <IonToast isOpen={!!toast} message={toast} duration={1400} color="success" position="top" onDidDismiss={() => setToast('')} />
    </Layout>
  );
};

export default Votar;
