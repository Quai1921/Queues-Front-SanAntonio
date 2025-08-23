import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const ProtectedRoute = ({
    children,
    requiredRole = null,
    requiredPermission = null,
    allowedRoles = null
}) => {
    const { isAuthenticated, isLoading, hasRole, hasPermission } = useAuth();
    const location = useLocation();

    // Mostrar loading mientras verifica la autenticación
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Verificando autenticación...</p>
                </div>
            </div>
        );
    }

    // Redirigir al login si no está autenticado
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Verificar rol específico requerido
    if (requiredRole && !hasRole(requiredRole)) {
        return <Navigate to="/unauthorized" replace />;
    }

    // Verificar roles permitidos
    if (allowedRoles && !allowedRoles.some(role => hasRole(role))) {
        return <Navigate to="/unauthorized" replace />;
    }

    // Verificar permiso específico
    if (requiredPermission && !hasPermission(requiredPermission)) {
        return <Navigate to="/unauthorized" replace />;
    }

    // Si todas las verificaciones pasan, mostrar el componente hijo
    return children;
};

export default ProtectedRoute;