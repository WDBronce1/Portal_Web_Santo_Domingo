import React from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { useHistory, useLocation } from 'react-router-dom';
import { Icons as I } from './Icons';
import { useAuth } from '../context/AuthContext';

/* Shell de navegación portado del handoff: Header (desktop) + Tabbar (móvil) + Footer.
   Envuelve cada pantalla en IonPage/IonContent para cumplir el stack Ionic. */

interface NavItem { path: string; label: string; icon: React.FC<{ size?: number }>; }

const NAV: NavItem[] = [
  { path: '/inicio', label: 'Inicio', icon: I.Home },
  { path: '/proyectos', label: 'Proyectos', icon: I.Project },
  { path: '/servicios', label: 'Servicios', icon: I.Leaf },
  { path: '/noticias', label: 'Noticias', icon: I.Drop },
  { path: '/actividades', label: 'Actividades', icon: I.Calendar },
  { path: '/opinion', label: 'Opinión', icon: I.Chat },
];

const TABS: NavItem[] = [
  { path: '/inicio', label: 'Inicio', icon: I.Home },
  { path: '/proyectos', label: 'Proyectos', icon: I.Project },
  { path: '/servicios', label: 'Servicios', icon: I.Leaf },
  { path: '/noticias', label: 'Noticias', icon: I.Drop },
  { path: '/actividades', label: 'Agenda', icon: I.Calendar },
  { path: '/perfil', label: 'Perfil', icon: I.User },
];

const Brand: React.FC = () => (
  <div className="brand">
    <span className="brand__badge"><img src="/assets/escudo-mark.png" alt="Escudo de Santo Domingo" /></span>
    <span className="brand__txt">
      <span className="brand__kicker">Municipalidad de Santo Domingo</span>
      <span className="brand__title">Portal Ambiental</span>
      <span className="brand__tag">Comuna Parque</span>
    </span>
  </div>
);

const Header: React.FC = () => {
  const history = useHistory();
  const { pathname } = useLocation();
  const { usuario, logout } = useAuth();

  const active = (path: string) => pathname === path || pathname.startsWith(path + '/');
  const links = usuario?.rol === 'admin'
    ? [...NAV, { path: '/admin', label: 'Admin', icon: I.Shield }]
    : NAV;

  return (
    <header className="hdr">
      <div className="wrap hdr__bar">
        <a onClick={() => history.push('/inicio')} style={{ cursor: 'pointer' }}><Brand /></a>
        <nav className="nav">
          {links.map((l) => (
            <a key={l.path} className={'nav__link' + (active(l.path) ? ' is-active' : '')} onClick={() => history.push(l.path)}>
              <l.icon size={17} /> {l.label}
            </a>
          ))}
        </nav>
        {usuario ? (
          <div className="row" style={{ gap: 6 }}>
            <a className="nav__link" onClick={() => history.push('/perfil')}><I.User size={17} /> {usuario.nombre.split(' ')[0]}</a>
            <a className="hdr__cta" onClick={() => { logout(); history.push('/inicio'); }} title="Cerrar sesión" style={{ padding: '9px 12px' }}><I.Logout size={16} /></a>
          </div>
        ) : (
          <a className="hdr__cta" onClick={() => history.push('/login')}><I.User size={16} /> Ingresar</a>
        )}
      </div>
    </header>
  );
};

const Tabbar: React.FC = () => {
  const history = useHistory();
  const { pathname } = useLocation();
  const { usuario } = useAuth();
  const active = (path: string) => pathname === path || pathname.startsWith(path + '/');
  return (
    <nav className="tabbar">
      {TABS.map((t) => (
        <button
          key={t.path}
          className={active(t.path) ? 'on' : ''}
          onClick={() => history.push(t.path === '/perfil' && !usuario ? '/login' : t.path)}
        >
          <t.icon size={21} /> {t.label}
        </button>
      ))}
    </nav>
  );
};

const Footer: React.FC = () => {
  const history = useHistory();
  const go = (p: string) => () => history.push(p);
  return (
    <footer className="ftr footdesk">
      <div className="wrap">
        <div className="ftr__inner">
          <div style={{ maxWidth: 300 }}>
            <Brand />
            <p style={{ marginTop: 14, color: 'rgba(255,255,255,.66)', fontSize: '.9rem' }}>
              Gestión ambiental participativa de la comuna de Santo Domingo, Región de Valparaíso.
            </p>
          </div>
          <div>
            <h5>Servicios</h5>
            <a onClick={go('/servicios')}>Horarios de basura</a>
            <a onClick={go('/servicios')}>Puntos de reciclaje</a>
            <a onClick={go('/servicios')}>Zonas verdes</a>
            <a onClick={go('/proyectos')}>Cartera de proyectos</a>
          </div>
          <div>
            <h5>Participa</h5>
            <a onClick={go('/opinion')}>Opinar proyectos</a>
            <a onClick={go('/actividades')}>Agenda de actividades</a>
            <a onClick={go('/noticias')}>Noticias ambientales</a>
            <a onClick={go('/login')}>Ingreso Clave Única</a>
          </div>
          <div>
            <h5>Contacto</h5>
            <a>Plaza de Armas s/n</a>
            <a>medioambiente@santodomingo.cl</a>
            <a>+56 35 220 0000</a>
          </div>
        </div>
        <div className="ftr__base">
          <span>© 2026 Ilustre Municipalidad de Santo Domingo · Comuna Parque</span>
          <span>Validación ciudadana mediante Clave Única (simulada)</span>
        </div>
      </div>
    </footer>
  );
};

interface LayoutProps { children: React.ReactNode; }

const Layout: React.FC<LayoutProps> = ({ children }) => (
  <IonPage>
    <IonContent>
      <div className="app has-tabbar">
        <Header />
        <main style={{ flex: 1 }}>{children}</main>
        <Footer />
      </div>
      <Tabbar />
    </IonContent>
  </IonPage>
);

export default Layout;
