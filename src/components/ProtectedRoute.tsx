import React from 'react';
import { Route, Redirect, RouteProps } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps extends RouteProps {
  /** Si true, exige rol admin además de estar autenticado. */
  soloAdmin?: boolean;
}

/**
 * Gateway de seguridad (RNF1). Intercepta rutas protegidas:
 * si no hay sesión, recuerda el intento y redirige a /login para volver luego.
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  soloAdmin,
  path,
  component: Componente,
  render,
  ...rest
}) => {
  const { isAuthenticated, isAdmin, setIntentoPendiente } = useAuth();

  // IMPORTANTE: `component` y `render` se extraen para que NO lleguen al <Route> vía spread.
  // En React Router v5, si un Route recibe `component`, este gana y el `render` (nuestro guard)
  // se ignora por completo — dejando la ruta sin protección.
  return (
    <Route
      path={path}
      {...rest}
      render={(props) => {
        if (!isAuthenticated) {
          const destino = props.location.pathname + props.location.search;
          return <RedirigirALogin destino={destino} recordar={setIntentoPendiente} />;
        }
        if (soloAdmin && !isAdmin) {
          return <Redirect to="/inicio" />;
        }
        if (Componente) return <Componente {...props} />;
        if (render) return render(props);
        return null;
      }}
    />
  );
};

/** Recuerda la ruta interceptada (en un efecto, no en render) y redirige al login. */
const RedirigirALogin: React.FC<{ destino: string; recordar: (r: string) => void }> = ({ destino, recordar }) => {
  React.useEffect(() => {
    recordar(destino);
  }, [destino, recordar]);
  return <Redirect to="/login" />;
};

export default ProtectedRoute;
