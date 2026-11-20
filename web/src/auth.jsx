import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { apiRequest } from './api.js';

const STORAGE_KEY = 'contactbook.session';
const AuthContext = createContext(null);

// Lee la sesión guardada y la descarta si el token ya expiró
function loadSession() {
  try {
    const session = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!session?.token) return null;
    const payload = JSON.parse(atob(session.token.split('.')[1]));
    if (payload.exp * 1000 < Date.now()) return null;
    return session;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(loadSession);

  const login = useCallback(async (email, password) => {
    const result = await apiRequest('/auth/login', { method: 'POST', body: { email, password } });
    const next = { token: result.token, user: result.data.user };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSession(next);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({
      token: session?.token ?? null,
      user: session?.user ?? null,
      isAdmin: session?.user?.role === 'admin',
      login,
      logout,
    }),
    [session, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
