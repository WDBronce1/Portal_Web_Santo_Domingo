import React from 'react';
import { IonHeader, IonToolbar, IonButtons, IonButton, IonIcon } from '@ionic/react';
import { useLocation, useHistory } from 'react-router-dom';
import {
  homeOutline,
  constructOutline,
  newspaperOutline,
  leafOutline,
  calendarOutline,
  chatbubbleEllipsesOutline,
  personCircleOutline,
  logOutOutline,
  shieldCheckmarkOutline,
} from 'ionicons/icons';
import { useAuth } from '../context/AuthContext';

interface NavItem {
  ruta: string;
  label: string;
  icon: string;
  soloAdmin?: boolean;
}

const ITEMS: NavItem[] = [
  { ruta: '/inicio', label: 'Inicio', icon: homeOutline },
  { ruta: '/proyectos', label: 'Proyectos', icon: constructOutline },
  { ruta: '/servicios', label: 'Servicios', icon: leafOutline },
  { ruta: '/noticias', label: 'Noticias', icon: newspaperOutline },
  { ruta: '/actividades', label: 'Actividades', icon: calendarOutline },
  { ruta: '/opinion', label: 'Opinión', icon: chatbubbleEllipsesOutline },
  { ruta: '/admin', label: 'Admin', icon: shieldCheckmarkOutline, soloAdmin: true },
];

const Navbar: React.FC = () => {
  const location = useLocation();
  const history = useHistory();
  const { usuario, isAuthenticated, isAdmin, logout } = useAuth();

  const visibles = ITEMS.filter((i) => !i.soloAdmin || isAdmin);
  const esActiva = (ruta: string) => location.pathname.startsWith(ruta);

  const handleLogout = () => {
    logout();
    history.push('/inicio');
  };

  return (
    <>
      <IonHeader>
        <IonToolbar className="sd-toolbar">
          <div className="sd-brand" slot="start" onClick={() => history.push('/inicio')} role="button" tabIndex={0}
               onKeyDown={(e) => e.key === 'Enter' && history.push('/inicio')}>
            <img src="/escudo-santo-domingo.png" alt="Escudo Municipalidad de Santo Domingo · Comuna Parque" />
            <div>
              <strong>Municipalidad de Santo Domingo</strong>
              <small>Portal Ciudadano Ambiental · Comuna Parque</small>
            </div>
          </div>

          <IonButtons slot="end" className="sd-navlinks sd-navlinks-desktop">
            {visibles.map((item) => (
              <IonButton
                key={item.ruta}
                routerLink={item.ruta}
                className={esActiva(item.ruta) ? 'is-active' : ''}
              >
                <IonIcon slot="start" icon={item.icon} />
                {item.label}
              </IonButton>
            ))}
            {isAuthenticated ? (
              <>
                <IonButton className="sd-user-chip" routerLink="/perfil">
                  <IonIcon slot="start" icon={personCircleOutline} />
                  {usuario?.nombre.split(' ')[0]}
                </IonButton>
                <IonButton onClick={handleLogout} aria-label="Cerrar sesión">
                  <IonIcon slot="icon-only" icon={logOutOutline} />
                </IonButton>
              </>
            ) : (
              <IonButton routerLink="/login" className="is-active">
                <IonIcon slot="start" icon={personCircleOutline} />
                Ingresar
              </IonButton>
            )}
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      {/* Barra inferior móvil */}
      <nav className="sd-tabbar" aria-label="Navegación principal móvil">
        {visibles.slice(0, 5).map((item) => (
          <a
            key={item.ruta}
            href={item.ruta}
            className={esActiva(item.ruta) ? 'is-active' : ''}
            onClick={(e) => {
              e.preventDefault();
              history.push(item.ruta);
            }}
          >
            <IonIcon icon={item.icon} />
            {item.label}
          </a>
        ))}
        <a
          href={isAuthenticated ? '/perfil' : '/login'}
          className={esActiva('/login') || esActiva('/perfil') ? 'is-active' : ''}
          onClick={(e) => {
            e.preventDefault();
            history.push(isAuthenticated ? '/perfil' : '/login');
          }}
        >
          <IonIcon icon={personCircleOutline} />
          {isAuthenticated ? 'Perfil' : 'Ingresar'}
        </a>
      </nav>
    </>
  );
};

export default Navbar;
