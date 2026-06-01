import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import Layout from '../components/Layout';
import { Icons as I } from '../components/Icons';
import { useAuth } from '../context/AuthContext';
import { formatearRut } from '../services/authService';

const Login: React.FC = () => {
  const history = useHistory();
  const { login, intentoPendiente, setIntentoPendiente } = useAuth();

  const [rut, setRut] = useState('');
  const [clave, setClave] = useState('');
  const [error, setError] = useState('');

  const ingresar = () => {
    const res = login(rut, clave);
    if (!res.ok) { setError(res.error ?? 'No fue posible iniciar sesión.'); return; }
    const destino = intentoPendiente ?? '/inicio';
    setIntentoPendiente(null);
    history.replace(destino);
  };

  return (
    <Layout>
      <section style={{ position: 'relative', minHeight: '78vh', display: 'grid', placeItems: 'center', padding: '40px 20px', overflow: 'hidden' }}>
        <div className="phero__media" style={{ position: 'absolute', inset: 0 }}><img src="/assets/santo-domingo.jpg" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, rgba(10,46,30,.72) 0%, rgba(15,74,46,.80) 50%, rgba(20,99,62,.86) 100%)' }} />
        <div className="card card--pad-lg" style={{ position: 'relative', width: 'min(440px,100%)', overflow: 'hidden', boxShadow: 'var(--sh-3)' }}>
          <div className="tex tex--wave" style={{ opacity: .05, backgroundSize: '720px', filter: 'grayscale(.5)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(130% 100% at 50% 0%, rgba(255,255,255,.7), rgba(255,255,255,.25) 55%, transparent 80%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative' }}>
            <div className="center" style={{ marginBottom: 18 }}>
              <span className="tile__icon float" style={{ margin: '0 auto 14px', width: 56, height: 56, background: 'var(--green-100)' }}><I.Shield size={28} /></span>
              <span className="kicker kicker--bare kicker--lime" style={{ justifyContent: 'center' }}>Acceso ciudadano</span>
              <h2 style={{ margin: '8px 0 6px' }}>Ingreso con Clave Única</h2>
              <p className="muted" style={{ fontSize: '.92rem' }}>Acceso validado por RUT (simulación oficial del Estado).</p>
            </div>

            {intentoPendiente && (
              <div className="card" style={{ background: '#FBF8E6', border: '1px solid #F1E6BD', display: 'flex', gap: 12, padding: '12px 16px', marginBottom: 16 }}>
                <span style={{ color: '#8A6D1B' }}><I.Lock size={18} /></span>
                <p style={{ color: '#73591a', fontSize: '.88rem' }}>Para continuar con esa acción necesitas iniciar sesión.</p>
              </div>
            )}

            <div className="stack-4">
              <div className="field">
                <label>RUT</label>
                <div className="input-icon"><I.IdCard />
                  <input className="input" placeholder="12.345.678-5" value={rut}
                    onChange={(e) => setRut(e.target.value)}
                    onBlur={() => rut && setRut(formatearRut(rut))} />
                </div>
              </div>
              <div className="field">
                <label>Clave Única</label>
                <div className="input-icon"><I.Lock />
                  <input className="input" type="password" placeholder="••••••••" value={clave}
                    onChange={(e) => setClave(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && ingresar()} />
                </div>
              </div>
              {error && <p className="error-text">{error}</p>}
              <button className="btn btn--primary btn--block btn--lg" onClick={ingresar}>Ingresar</button>
            </div>

            <p className="center muted" style={{ margin: '16px 0', fontSize: '.9rem' }}>¿No tienes cuenta? <a onClick={() => history.push('/registro')} style={{ color: 'var(--green-700)', fontWeight: 600, cursor: 'pointer' }}>Regístrate</a></p>

            <div className="card card--paper" style={{ padding: '14px 16px' }}>
              <span className="kicker kicker--bare" style={{ color: 'var(--green-700)', marginBottom: 8, display: 'block' }}>Cuentas de prueba</span>
              <div className="stack-2" style={{ fontFamily: 'var(--font-mono)', fontSize: '.78rem', color: 'var(--body)' }}>
                <div className="row between"><span>Ciudadana</span><span>12.345.678-5 · clave1234</span></div>
                <div className="row between"><span>Admin</span><span>11.111.111-1 · admin1234</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Login;
