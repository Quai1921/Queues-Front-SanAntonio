import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

/**
 * Componente para proteger rutas según autenticación y roles
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Componentes hijos a renderizar si tiene acceso
 * @param {string} props.requiredRole - Rol específico requerido (exacto)
 * @param {Array<string>} props.allowedRoles - Array de roles permitidos
 * @param {Array<string>} props.requiredPermissions - Permisos específicos requeridos
 * @param {boolean} props.requireSectorAssignment - Si requiere tener sector asignado
 * @param {string} props.redirectTo - Ruta a redirigir si no tiene acceso
 */
const ProtectedRoute = ({
    children,
    requiredRole = null,
    allowedRoles = null,
    requiredPermissions = [],
    requireSectorAssignment = false,
    redirectTo = null
}) => {
    const {
        isAuthenticated,
        isInitialLoading,
        user,
        sector,
        hasRole,
        hasAnyRole,
        hasPermission
    } = useAuth();

    const location = useLocation();

    // Mostrar spinner mientras verifica la autenticación inicial
    if (isInitialLoading) {
        return <LoadingSpinner message="Verificando acceso..." />;
    }

    // Si no está autenticado, redirigir al login
    if (!isAuthenticated) {
        return (
            <Navigate
                to="/login"
                state={{ from: location }}
                replace
            />
        );
    }

    // Verificar rol específico requerido
    if (requiredRole && !hasRole(requiredRole)) {
        return (
            <Navigate
                to={redirectTo || "/unauthorized"}
                state={{
                    from: location,
                    reason: `Acceso denegado. Se requiere rol: ${requiredRole}`,
                    currentRole: user?.rol
                }}
                replace
            />
        );
    }

    // Verificar roles permitidos (cualquiera de la lista)
    if (allowedRoles && allowedRoles.length > 0 && !hasAnyRole(allowedRoles)) {
        return (
            <Navigate
                to={redirectTo || "/unauthorized"}
                state={{
                    from: location,
                    reason: `Acceso denegado. Se requiere uno de los roles: ${allowedRoles.join(', ')}`,
                    currentRole: user?.rol
                }}
                replace
            />
        );
    }

    // Verificar permisos específicos
    if (requiredPermissions.length > 0) {
        const hasAllPermissions = requiredPermissions.every(permission =>
            hasPermission(permission)
        );

        if (!hasAllPermissions) {
            const missingPermissions = requiredPermissions.filter(permission =>
                !hasPermission(permission)
            );

            return (
                <Navigate
                    to={redirectTo || "/unauthorized"}
                    state={{
                        from: location,
                        reason: `Acceso denegado. Permisos faltantes: ${missingPermissions.join(', ')}`,
                        currentRole: user?.rol
                    }}
                    replace
                />
            );
        }
    }

    // Verificar asignación de sector si es requerida
    if (requireSectorAssignment && !sector) {
        return (
            <Navigate
                to={redirectTo || "/unauthorized"}
                state={{
                    from: location,
                    reason: 'Acceso denegado. No tiene sector asignado.',
                    currentRole: user?.rol
                }}
                replace
            />
        );
    }

    // Si pasa todas las verificaciones, renderizar los children
    return children;
};

// Componentes especializados para casos comunes
export const AdminRoute = ({ children, ...props }) => (
    <ProtectedRoute requiredRole="ADMIN" {...props}>
        {children}
    </ProtectedRoute>
);

export const ResponsableRoute = ({ children, ...props }) => (
    <ProtectedRoute allowedRoles={['ADMIN', 'RESPONSABLE_SECTOR']} {...props}>
        {children}
    </ProtectedRoute>
);

export const OperadorRoute = ({ children, ...props }) => (
    <ProtectedRoute allowedRoles={['ADMIN', 'RESPONSABLE_SECTOR', 'OPERADOR']} {...props}>
        {children}
    </ProtectedRoute>
);

export const ResponsableConSectorRoute = ({ children, ...props }) => (
    <ProtectedRoute
        allowedRoles={['ADMIN', 'RESPONSABLE_SECTOR']}
        requireSectorAssignment={true}
        {...props}
    >
        {children}
    </ProtectedRoute>
);

export default ProtectedRoute;