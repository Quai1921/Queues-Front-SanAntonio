// hooks/useAuth.js
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';

export const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [tokenExpiresIn, setTokenExpiresIn] = useState(0);
    const navigate = useNavigate();
    const location = useLocation();

    // Función para actualizar el estado de autenticación
    const updateAuthState = useCallback(() => {
        const authenticated = authService.isAuthenticated();
        const currentUser = authenticated ? authService.getCurrentUser() : null;
        const remainingMinutes = authenticated ? authService.getTokenRemainingMinutes() : 0;

        setIsAuthenticated(authenticated);
        setUser(currentUser);
        setTokenExpiresIn(remainingMinutes);

        return authenticated;
    }, []);

    // Función para hacer login
    const login = useCallback(async (credentials) => {
        try {
            setIsLoading(true);
            const result = await authService.login(credentials);
            updateAuthState();
            return result;
        } catch (error) {
            console.error('Error en login:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [updateAuthState]);

    // Función para hacer logout
    const logout = useCallback(async () => {
        try {
            await authService.logout();
            setIsAuthenticated(false);
            setUser(null);
            setTokenExpiresIn(0);
            navigate('/login', { replace: true });
        } catch (error) {
            console.error('Error en logout:', error);
            // Limpiar estado local aunque falle el logout del servidor
            setIsAuthenticated(false);
            setUser(null);
            setTokenExpiresIn(0);
            navigate('/login', { replace: true });
        }
    }, [navigate]);

    // Función para verificar si el usuario tiene un rol
    const hasRole = useCallback((role) => {
        return authService.hasRole(role);
    }, []);

    // Función para verificar si el usuario tiene alguno de los roles
    const hasAnyRole = useCallback((roles) => {
        return authService.hasAnyRole(roles);
    }, []);

    // Efecto principal para monitorear autenticación
    useEffect(() => {
        // Verificación inicial
        const initialCheck = () => {
            const authenticated = updateAuthState();
            setIsLoading(false);

            if (!authenticated && location.pathname !== '/login') {
                navigate('/login', {
                    replace: true,
                    state: { from: location }
                });
            }
        };

        initialCheck();

        // Monitoreo periódico del token
        const monitoringInterval = setInterval(() => {
            const authenticated = updateAuthState();

            if (!authenticated && isAuthenticated) {
                navigate('/login', {
                    replace: true,
                    state: {
                        from: location,
                        reason: 'session_expired',
                        message: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.'
                    }
                });
            }
        }, 30000); // Cada 30 segundos

        // Advertencias de expiración próxima
        const warningInterval = setInterval(() => {
            if (isAuthenticated) {
                const remaining = authService.getTokenRemainingMinutes();
                if (remaining <= 5 && remaining > 0) {
                    console.warn(`⚠️ Token expira en ${remaining} minutos`);
                    // Aquí podrías disparar un evento o callback para mostrar notificación
                    // onTokenExpiringSoon?.(remaining);
                }
            }
        }, 60000); // Cada minuto

        return () => {
            clearInterval(monitoringInterval);
            clearInterval(warningInterval);
        };
    }, [updateAuthState, navigate, location, isAuthenticated]);

    return {
        isAuthenticated,
        user,
        isLoading,
        tokenExpiresIn,
        login,
        logout,
        hasRole,
        hasAnyRole,
        updateAuthState
    };
};