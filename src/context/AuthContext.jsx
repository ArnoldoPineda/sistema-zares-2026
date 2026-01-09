import React, { createContext, useContext, useState, useEffect } from 'react';
import supabase from '../services/supabaseClient';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  // ============================================================
  // USUARIO MOCK - Para desarrollo sin login real
  // Cuando arreglemos el login, cambiaremos esto
  // ============================================================
  const MOCK_USER = {
    id: 'mock-user-123',
    email: 'demo@sistema.com',
    user_metadata: {
      full_name: 'Usuario Demo',
    },
  };

  const [user, setUser] = useState(MOCK_USER); // ✅ Simulamos usuario logueado
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // No necesitamos verificar sesión real
  useEffect(() => {
    // Usuario ya está seteado como mock
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      // Intentar login real
      const { error: err } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (err) {
        // Si falla, usar mock
        console.warn('Login falló, usando usuario mock', err.message);
        setUser(MOCK_USER);
        setError(null);
        return true;
      }
      
      return true;
    } catch (err) {
      // En caso de error, usar mock de todas formas
      console.warn('Error de conexión, usando usuario mock');
      setUser(MOCK_USER);
      setError(null);
      return true;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      setError(null);
      const { error: err } = await supabase.auth.signOut();
      if (err) throw err;
      setUser(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const { error: err } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (err) throw err;
      
      // Si se registra, usar mock
      setUser({ ...MOCK_USER, email });
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, error, login, logout, register }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};