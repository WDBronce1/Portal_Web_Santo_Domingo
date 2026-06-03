import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { Usuario } from '../types';
import * as auth from '../services/authService';

interface AuthContextValue {
  usuario: Usuario | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (rut: string, clave: string) => Promise<auth.Resultado<Usuario>>;
  registrar: (input: auth.RegistroInput) => Promise<auth.Resultado<Usuario>>;
  logout: () => void;
  /** Ruta a la que volver tras un login forzado por el gateway de seguridad. */
  intentoPendiente: string | null;
  setIntentoPendiente: (ruta: string | null) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(() => auth.getSesion());
  const [intentoPendiente, setIntentoPendiente] = useState<string | null>(null);

  const login = useCallback(async (rut: string, clave: string) => {
    const res = await auth.login(rut, clave);
    if (res.ok && res.data) setUsuario(res.data);
    return res;
  }, []);

  const registrar = useCallback(async (input: auth.RegistroInput) => {
    const res = await auth.registrar(input);
    if (res.ok && res.data) setUsuario(res.data);
    return res;
  }, []);

  const logout = useCallback(() => {
    auth.logout();
    setUsuario(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      usuario,
      isAuthenticated: !!usuario,
      isAdmin: usuario?.rol === 'admin',
      login,
      registrar,
      logout,
      intentoPendiente,
      setIntentoPendiente,
    }),
    [usuario, intentoPendiente, login, registrar, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
