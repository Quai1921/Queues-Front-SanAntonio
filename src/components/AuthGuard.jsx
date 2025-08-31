// components/AuthGuard.jsx
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';

const AuthGuard = ({ children, requireRoles = null }) => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {

        const checkAuthentication = () => {
            // Verificar autenticación básica (incluye verificación de expiración)
            if (!authService.isAuthenticated()) {
                navigate('/login', {
                    replace: true,
                    state: {
                        from: location,
                        reason: 'not_authenticated'
                    }
                });
                return false;
            }

            // Verificar roles si se requieren
            if (requireRoles && requireRoles.length > 0) {
                if (!authService.hasAnyRole(requireRoles)) {
                    navigate('/unauthorized', {
                        replace: true,
                        state: {
                            from: location,
                            requiredRoles: requireRoles,
                            userRole: authService.getCurrentUser()?.rol
                        }
                    });
                    return false;
                }
            }

            return true;
        };

        // Verificación inicial
        if (!checkAuthentication()) {
            return;
        }

        // Verificar periódicamente si el token sigue siendo válido
        const interval = setInterval(() => {

            if (!authService.isAuthenticated()) {
                clearInterval(interval);
                navigate('/login', {
                    replace: true,
                    state: {
                        from: location,
                        reason: 'session_expired',
                        message: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.'
                    }
                });
            } else {
                // Mostrar advertencia si el token expira pronto
                const remainingMinutes = authService.getTokenRemainingMinutes();
                if (remainingMinutes <= 5 && remainingMinutes > 0) {
                    console.warn(`⚠️ Token expira en ${remainingMinutes} minutos`);
                    // Aquí podrías mostrar una notificación al usuario
                }
            }
        }, 30000); // Verificar cada 30 segundos

        // Limpiar interval al desmontar
        return () => clearInterval(interval);
    }, [navigate, location, requireRoles]);

    // Solo renderizar hijos si está autenticado
    return authService.isAuthenticated() ? children : null;
};

export default AuthGuard;