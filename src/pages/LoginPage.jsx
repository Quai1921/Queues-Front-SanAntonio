import React, { useEffect, useState } from 'react';
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

    // Estado local para controlar el spinner de login
    const [showLoginSpinner, setShowLoginSpinner] = useState(false);

    // Redirigir si ya está autenticado
    useEffect(() => {

        if (isAuthenticated && !isInitialLoading) {
            // Obtener la ruta a la que quería accesar originalmente
            const from = location.state?.from?.pathname || '/dashboard';

            // Mostrar spinner de redirección por un momento
            setShowLoginSpinner(true);

            // Pequeña demora para que se vea la animación
            setTimeout(() => {
                navigate(from, { replace: true });
            }, 800);
        }
    }, [isAuthenticated, isInitialLoading, navigate, location.state?.from?.pathname]);

    // Mostrar spinner de carga inicial
    if (isInitialLoading) {
        return <LoadingSpinner message="Verificando sesión..." />;
    }

    // Mostrar spinner durante el proceso de login exitoso
    if (showLoginSpinner) {
        return <LoadingSpinner message="Accediendo al sistema..." />;
    }

    const handleLogin = async (credentials) => {
        try {
            // Limpiar error antes del intento
            if (error) clearError();

            // Mostrar spinner local inmediatamente
            setShowLoginSpinner(true);

            await login(credentials);
            // El useEffect de arriba manejará la redirección con el spinner
        } catch (error) {
            // Ocultar spinner en caso de error
            setShowLoginSpinner(false);
            // El error ya se maneja en el AuthContext
            console.error('Error en login:', error.message);
        }
    };

    return (
        <Login
            onLogin={handleLogin}
            loading={isLoading || showLoginSpinner}
            error={error}
        />
    );
};

export default LoginPage;