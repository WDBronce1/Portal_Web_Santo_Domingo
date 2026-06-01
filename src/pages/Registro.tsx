import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { formatearRut, validarRut } from '../services/authService';
import { isEmail } from '../utils/sanitize';

const REGIONES: Record<string, string[]> = {
  'Valparaíso': ['Santo Domingo', 'San Antonio', 'Cartagena', 'El Tabo', 'Valparaíso', 'Viña del Mar'],
  'Metropolitana': ['Santiago', 'Maipú', 'Puente Alto', 'La Florida'],
  "O'Higgins": ['Rancagua', 'San Fernando', 'Pichilemu'],
};

const Registro: React.FC = () => {
  const history = useHistory();
  const { registrar } = useAuth();

  const [f, setF] = useState({
    nombre: '', rut: '', email: '', region: 'Valparaíso', comuna: 'Santo Domingo',
    clave: '', confirmar: '', terminos: false,
  });
  const [error, setError] = useState('');

  const set = (k: keyof typeof f, v: string | boolean) => setF({ ...f, [k]: v });

  const enviar = () => {
    if (!f.nombre.trim()) return setError('Ingresa tu nombre de usuario.');
    if (!validarRut(f.rut)) return setError('El RUT ingresado no es válido (revisa el dígito verificador).');
    if (!isEmail(f.email)) return setError('Ingresa un correo electrónico válido.');
    if (f.clave.length < 6) return setError('La contraseña debe tener al menos 6 caracteres.');
    if (f.clave !== f.confirmar) return setError('Las contraseñas no coinciden.');
    if (!f.terminos) return setError('Debes aceptar los términos y condiciones.');

    const res = registrar({
      nombre: f.nombre, rut: f.rut, email: f.email,
      region: f.region, comuna: f.comuna, clave: f.clave,
    });
    if (!res.ok) return setError(res.error ?? 'No fue posible registrar la cuenta.');
    history.replace('/inicio');
  };

  return (
    <Layout>
      <section style={{ position: 'relative', minHeight: '78vh', display: 'grid', placeItems: 'center', padding: '40px 20px', overflow: 'hidden' }}>
        <div className="phero__media" style={{ position: 'absolute', inset: 0 }}><img src="/assets/santo-domingo.jpg" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, rgba(10,46,30,.72) 0%, rgba(15,74,46,.80) 50%, rgba(20,99,62,.86) 100%)' }} />
        <div className="card card--pad-lg" style={{ position: 'relative', width: 'min(560px,100%)', boxShadow: 'var(--sh-3)' }}>
          <span className="kicker kicker--lime">Registro ciudadano</span>
          <h2 style={{ margin: '8px 0 6px' }}>Crear cuenta ciudadana</h2>
          <p className="muted" style={{ marginBottom: 22 }}>Regístrate para participar y solicitar servicios municipales.</p>
          <div className="stack-4">
            <div className="field"><label>Nombre de usuario</label>
              <input className="input" placeholder="Ej. Camila Soto" value={f.nombre} onChange={(e) => set('nombre', e.target.value)} />
            </div>
            <div className="field-grid">
              <div className="field"><label>RUT</label>
                <input className="input" placeholder="12.345.678-5" value={f.rut}
                  onChange={(e) => set('rut', e.target.value)}
                  onBlur={() => f.rut && set('rut', formatearRut(f.rut))} />
              </div>
              <div className="field"><label>Correo electrónico</label>
                <input className="input" type="email" placeholder="correo@ejemplo.cl" value={f.email} onChange={(e) => set('email', e.target.value)} />
              </div>
            </div>
            <div className="field-grid">
              <div className="field"><label>Región</label>
                <select className="input select" value={f.region}
                  onChange={(e) => { const r = e.target.value; setF({ ...f, region: r, comuna: REGIONES[r][0] }); }}>
                  {Object.keys(REGIONES).map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="field"><label>Comuna</label>
                <select className="input select" value={f.comuna} onChange={(e) => set('comuna', e.target.value)}>
                  {REGIONES[f.region].map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="field-grid">
              <div className="field"><label>Contraseña</label>
                <input className="input" type="password" placeholder="••••••••" value={f.clave} onChange={(e) => set('clave', e.target.value)} />
              </div>
              <div className="field"><label>Confirmar contraseña</label>
                <input className="input" type="password" placeholder="••••••••" value={f.confirmar} onChange={(e) => set('confirmar', e.target.value)} />
              </div>
            </div>
            <label className="checkbox">
              <input type="checkbox" checked={f.terminos} onChange={(e) => set('terminos', e.target.checked)} /> Acepto los términos y condiciones y el tratamiento de mis datos.
            </label>
            {error && <p className="error-text">{error}</p>}
            <button className="btn btn--primary btn--block btn--lg" onClick={enviar}>Crear cuenta</button>
          </div>
          <p className="center muted" style={{ marginTop: 16, fontSize: '.9rem' }}>¿Ya tienes cuenta? <a onClick={() => history.push('/login')} style={{ color: 'var(--green-700)', fontWeight: 600, cursor: 'pointer' }}>Inicia sesión</a></p>
        </div>
      </section>
    </Layout>
  );
};

export default Registro;
