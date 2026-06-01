import React, { useState, useMemo } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { IonToast } from '@ionic/react';
import Layout from '../components/Layout';
import { PageHero } from '../components/ui';
import { Icons as I } from '../components/Icons';
import { useAuth } from '../context/AuthContext';
import { RECORRIDOS_BASURA, PUNTOS_RECICLAJE, ZONAS_VERDES, crearSolicitud } from '../services/dataService';
import type { TipoSolicitud } from '../types';

type Tab = 'basura' | 'reciclaje' | 'zonas' | 'solicitar';

const SERV: { id: Tab; label: string; icon: React.FC<{ size?: number }> }[] = [
  { id: 'basura', label: 'Horarios de basura', icon: I.Clock },
  { id: 'reciclaje', label: 'Puntos de reciclaje', icon: I.Recycle },
  { id: 'zonas', label: 'Zonas verdes', icon: I.Tree },
  { id: 'solicitar', label: 'Solicitar recolección', icon: I.Bin },
];

const MapaPlaceholder: React.FC<{ label: string }> = ({ label }) => (
  <div style={{ marginTop: 18, border: '1.5px dashed var(--green-200)', borderRadius: 14, background: 'repeating-linear-gradient(135deg, var(--paper-2) 0 14px, #fff 14px 28px)', minHeight: 150, display: 'grid', placeItems: 'center', color: 'var(--green-700)' }}>
    <span className="row" style={{ fontFamily: 'var(--font-mono)', fontSize: '.78rem', letterSpacing: '.06em' }}><I.Map size={18} /> {label}</span>
  </div>
);

const Servicios: React.FC = () => {
  const location = useLocation();
  const history = useHistory();
  const { isAuthenticated, usuario, setIntentoPendiente } = useAuth();

  const tabInicial = useMemo<Tab>(() => {
    const q = new URLSearchParams(location.search).get('tipo');
    return (SERV.find((s) => s.id === q)?.id ?? 'basura') as Tab;
  }, [location.search]);

  const [tab, setTab] = useState<Tab>(tabInicial);
  const [tipoSolicitud, setTipoSolicitud] = useState<TipoSolicitud>('recoleccion');
  const [form, setForm] = useState({ nombre: '', direccion: '', detalle: '' });
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const exigirLogin = () => {
    setIntentoPendiente('/servicios?tipo=solicitar');
    history.push('/login');
  };

  const enviarSolicitud = () => {
    if (!isAuthenticated) return exigirLogin();
    if (!form.nombre.trim() || !form.direccion.trim()) {
      setError('Completa al menos tu nombre y la dirección.');
      return;
    }
    crearSolicitud({
      tipo: tipoSolicitud,
      nombre: form.nombre,
      direccion: form.direccion,
      detalle: form.detalle,
      usuarioRut: usuario!.rut,
    });
    setForm({ nombre: '', direccion: '', detalle: '' });
    setError('');
    setToast('✅ Solicitud enviada correctamente. La revisará un funcionario municipal.');
  };

  const renderServ = () => {
    if (tab === 'basura') return (
      <div>
        <span className="kicker kicker--lime">Recolección</span>
        <h2 style={{ margin: '10px 0 6px' }}>Recorridos del camión de basura</h2>
        <p className="muted" style={{ marginBottom: 22 }}>Selecciona tu sector para ver los días y horarios.</p>
        <div className="stack" style={{ gap: 10 }}>
          {RECORRIDOS_BASURA.map((r) => (
            <div key={r.sector} className="card card--paper l-split" style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.4fr 1fr', gap: 16, alignItems: 'center', padding: '16px 20px' }}>
              <div className="row" style={{ gap: 10 }}><span style={{ color: 'var(--green)' }}><I.Bin size={20} /></span><strong style={{ color: 'var(--green-800)', whiteSpace: 'nowrap' }}>{r.sector}</strong></div>
              <span className="muted" style={{ fontSize: '.92rem' }}>{r.dias}</span>
              <span className="badge badge--exec" style={{ justifySelf: 'start' }}>{r.horario}</span>
            </div>
          ))}
        </div>
        <MapaPlaceholder label="Mapa del recorrido por sector" />
      </div>
    );
    if (tab === 'reciclaje') return (
      <div>
        <span className="kicker kicker--lime">Reciclaje</span>
        <h2 style={{ margin: '10px 0 6px' }}>Puntos limpios de la comuna</h2>
        <p className="muted" style={{ marginBottom: 22 }}>Lleva tus residuos separados al punto más cercano.</p>
        <div className="grid grid--auto">
          {PUNTOS_RECICLAJE.map((p) => (
            <div key={p.id} className="card card--paper">
              <span className="tile__icon" style={{ marginBottom: 12 }}><I.Recycle size={22} /></span>
              <h4 style={{ color: 'var(--green-800)' }}>{p.sector}</h4>
              <p className="meta" style={{ marginTop: 4 }}><I.Pin size={15} /> {p.ubicacion}</p>
              <hr className="divider" style={{ margin: '14px 0' }} />
              <span className="muted" style={{ fontSize: '.85rem' }}>{p.tipos}</span>
            </div>
          ))}
        </div>
      </div>
    );
    if (tab === 'zonas') return (
      <div>
        <span className="kicker kicker--lime">Áreas verdes</span>
        <h2 style={{ margin: '10px 0 6px' }}>Zonas verdes y áreas protegidas</h2>
        <p className="muted" style={{ marginBottom: 22 }}>Espacios naturales para el cuidado y el encuentro de la comuna.</p>
        <div className="grid grid--auto">
          {ZONAS_VERDES.map((z) => (
            <div key={z.id} className="card card--paper">
              <span className="tile__icon"><I.Tree size={22} /></span>
              <h4 style={{ color: 'var(--green-800)', marginTop: 12 }}>{z.nombre}</h4>
              <span className="badge badge--plan" style={{ marginTop: 8 }}>{z.sector}</span>
              <p className="meta" style={{ marginTop: 12 }}><I.Pin size={15} /> {z.ubicacion}</p>
            </div>
          ))}
        </div>
      </div>
    );
    return (
      <div>
        <span className="kicker kicker--lime">A domicilio</span>
        <h2 style={{ margin: '10px 0 6px' }}>Solicitar recolección o retiro</h2>
        <p className="muted" style={{ marginBottom: 20 }}>Retiro de residuos voluminosos o tacho de reciclaje. Requiere sesión validada.</p>
        {!isAuthenticated && (
          <div className="card" style={{ background: '#FBF8E6', border: '1px solid #F1E6BD', display: 'flex', gap: 12, padding: '14px 18px', marginBottom: 20 }}>
            <span style={{ color: '#8A6D1B' }}><I.Lock size={20} /></span>
            <p style={{ color: '#73591a', fontSize: '.92rem' }}>Para enviar una solicitud, <a onClick={exigirLogin} style={{ color: '#73591a', textDecoration: 'underline', cursor: 'pointer' }}>inicia sesión con Clave Única</a>.</p>
          </div>
        )}
        <div className="stack-4">
          <div className="field"><label>Tipo de solicitud</label>
            <div className="input-icon"><I.Bin />
              <select className="input select" value={tipoSolicitud} onChange={(e) => setTipoSolicitud(e.target.value as TipoSolicitud)}>
                <option value="recoleccion">Retiro de voluminosos / escombros</option>
                <option value="tacho">Solicitar tacho de reciclaje</option>
              </select>
            </div>
          </div>
          <div className="field-grid">
            <div className="field"><label>Nombre</label><input className="input" placeholder="Ej. Camila Soto" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} /></div>
            <div className="field"><label>Dirección</label><input className="input" placeholder="Calle, número, sector" value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} /></div>
          </div>
          <div className="field"><label>Detalle</label><textarea className="textarea" placeholder="Describe brevemente lo que necesitas retirar…" value={form.detalle} onChange={(e) => setForm({ ...form, detalle: e.target.value })} /></div>
          {error && <p className="error-text">{error}</p>}
          <button className="btn btn--primary btn--block btn--lg" onClick={enviarSolicitud} disabled={!isAuthenticated} style={!isAuthenticated ? { opacity: .5, cursor: 'not-allowed' } : undefined}>
            {isAuthenticated ? 'Enviar solicitud' : 'Inicia sesión para enviar'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <PageHero kicker="Servicios ambientales" title="Servicios ambientales" sub="Consulta horarios, ubica puntos de reciclaje y solicita servicios a domicilio para tu sector." />
      <section className="section">
        <div className="wrap l-split" style={{ display: 'grid', gridTemplateColumns: '270px 1fr', gap: 28, alignItems: 'start' }}>
          <aside className="card l-aside" style={{ padding: 10, position: 'sticky', top: 16 }}>
            <div className="stack" style={{ gap: 4 }}>
              {SERV.map((s) => (
                <button key={s.id} onClick={() => setTab(s.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 12, border: 'none', cursor: 'pointer', textAlign: 'left', font: 'inherit',
                    background: tab === s.id ? 'var(--green-100)' : 'transparent', color: tab === s.id ? 'var(--green-800)' : 'var(--body)', fontWeight: tab === s.id ? 600 : 500 }}>
                  <span style={{ color: 'var(--green)' }}><s.icon size={20} /></span> {s.label}
                </button>
              ))}
            </div>
          </aside>
          <div className="card card--pad-lg">{renderServ()}</div>
        </div>
      </section>
      <IonToast isOpen={!!toast} message={toast} duration={3200} color="success" onDidDismiss={() => setToast('')} position="top" />
    </Layout>
  );
};

export default Servicios;
