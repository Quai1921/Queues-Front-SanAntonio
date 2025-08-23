import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Login from '../components/Login';
import LoadingSpinner from '../components/LoadingSpinner';

/**
 * Página de login que maneja la integración con AuthContext
 */
const LoginPage = () => {
  const { login, isAuthenticated, isInitialLoading, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Debug - ver los estados
  console.log('LoginPage estados:', { 
    isAuthenticated, 
    isInitialLoading, 
    isLoading 
  });

  // Redirigir si ya está autenticado
  useEffect(() => {
    console.log('Efecto de redirección:', { isAuthenticated, isInitialLoading });
    
    if (isAuthenticated && !isInitialLoading) {
      console.log('Redirigiendo a dashboard...');
      // Obtener la ruta a la que quería acceder originalmente
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isInitialLoading, navigate, location.state?.from?.pathname]);

  // Mostrar spinner de carga inicial
  if (isInitialLoading) {
    console.log('Mostrando LoadingSpinner inicial...');
    return <LoadingSpinner message="Verificando sesión..." />;
  }

  const handleLogin = async (credentials) => {
    try {
      // Limpiar error antes del intento
      if (error) clearError();
      await login(credentials);
      // El useEffect de arriba manejará la redirección
    } catch (error) {
      // El error ya se maneja en el AuthContext
      console.error('Error en login:', error.message);
    }
  };

  return (
    <Login 
      onLogin={handleLogin}
      loading={isLoading}
      error={error}
    />
  );
};

export default LoginPage;