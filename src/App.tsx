import React, { Suspense, lazy } from 'react';
import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, IonSpinner, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

/* Core CSS de Ionic */
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Tokens + sistema de diseño */
import './theme/variables.css';
import './theme/app.css';

/* Páginas (lazy para reducir el bundle inicial) */
const Inicio = lazy(() => import('./pages/Inicio'));
const Servicios = lazy(() => import('./pages/Servicios'));
const ListaProyectos = lazy(() => import('./pages/Proyectos/Lista-de-Proyectos'));
const DetalleProyecto = lazy(() => import('./pages/Proyectos/Detalle-de-Proyecto'));
const Noticias = lazy(() => import('./pages/Noticias'));
const Actividades = lazy(() => import('./pages/Actividades'));
const Opinion = lazy(() => import('./pages/Opinion'));
const Votar = lazy(() => import('./pages/Votar'));
const Login = lazy(() => import('./pages/Login'));
const Registro = lazy(() => import('./pages/Registro'));
const Perfil = lazy(() => import('./pages/Perfil'));
const AdminDashboard = lazy(() => import('./pages/Admin/Dashboard'));
const AdminReportes = lazy(() => import('./pages/Admin/Reportes'));

setupIonicReact({ mode: 'md' });

const Cargando: React.FC = () => (
  <div style={{ display: 'grid', placeItems: 'center', height: '100vh' }}>
    <IonSpinner name="crescent" style={{ color: '#fff', transform: 'scale(1.6)' }} />
  </div>
);

const App: React.FC = () => (
  <IonApp>
    <AuthProvider>
      <IonReactRouter>
        <Suspense fallback={<Cargando />}>
          <IonRouterOutlet>
            {/* Públicas */}
            <Route exact path="/inicio" component={Inicio} />
            <Route exact path="/proyectos" component={ListaProyectos} />
            <Route exact path="/proyectos/:id" component={DetalleProyecto} />
            <Route exact path="/servicios" component={Servicios} />
            <Route exact path="/noticias" component={Noticias} />
            <Route exact path="/actividades" component={Actividades} />
            <Route exact path="/opinion" component={Opinion} />
            <Route exact path="/login" component={Login} />
            <Route exact path="/registro" component={Registro} />

            {/* Protegidas (ciudadano autenticado) */}
            <ProtectedRoute exact path="/proyectos/:id/opinar" component={Votar} />
            <ProtectedRoute exact path="/perfil" component={Perfil} />

            {/* Protegidas (solo admin) */}
            <ProtectedRoute exact path="/admin" component={AdminDashboard} soloAdmin />
            <ProtectedRoute exact path="/admin/reportes" component={AdminReportes} soloAdmin />

            <Route exact path="/">
              <Redirect to="/inicio" />
            </Route>
          </IonRouterOutlet>
        </Suspense>
      </IonReactRouter>
    </AuthProvider>
  </IonApp>
);

export default App;
