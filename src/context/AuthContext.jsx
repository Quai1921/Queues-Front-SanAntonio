import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import authService from '../services/authService.js';

// Estado inicial
const initialState = {
    isAuthenticated: false,
    isLoading: true,
    user: null,
    sector: null,
    permissions: [],
    error: null
};

// Tipos de acciones
const AUTH_ACTIONS = {
    SET_LOADING: 'SET_LOADING',
    LOGIN_SUCCESS: 'LOGIN_SUCCESS',
    LOGIN_ERROR: 'LOGIN_ERROR',
    LOGOUT: 'LOGOUT',
    CLEAR_ERROR: 'CLEAR_ERROR',
    UPDATE_USER: 'UPDATE_USER'
};

// Reducer para manejar el estado de autenticación
function authReducer(state, action) {
    switch (action.type) {
        case AUTH_ACTIONS.SET_LOADING:
            return {
                ...state,
                isLoading: action.payload
            };

        case AUTH_ACTIONS.LOGIN_SUCCESS:
            return {
                ...state,
                isAuthenticated: true,
                isLoading: false,
                user: action.payload.user,
                sector: action.payload.sector,
                permissions: action.payload.permissions || [],
                error: null
            };

        case AUTH_ACTIONS.LOGIN_ERROR:
            return {
                ...state,
                isAuthenticated: false,
                isLoading: false,
                user: null,
                sector: null,
                permissions: [],
                error: action.payload
            };

        case AUTH_ACTIONS.LOGOUT:
            return {
                ...initialState,
                isLoading: false
            };

        case AUTH_ACTIONS.CLEAR_ERROR:
            return {
                ...state,
                error: null
            };

        case AUTH_ACTIONS.UPDATE_USER:
            return {
                ...state,
                user: { ...state.user, ...action.payload }
            };

        default:
            return state;
    }
}

// Crear el contexto
const AuthContext = createContext();

// Hook personalizado para usar el contexto
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};

// Componente Provider
export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // Verificar estado de autenticación - useCallback para evitar re-renders infinitos
    const checkAuthStatus = useCallback(async () => {
        try {
            dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });

            if (authService.isAuthenticated()) {
                const user = authService.getCurrentUser();
                const sector = authService.getCurrentSector();
                const permissions = authService.getUserPermissions();

                dispatch({
                    type: AUTH_ACTIONS.LOGIN_SUCCESS,
                    payload: { user, sector, permissions }
                });
            } else {
                dispatch({ type: AUTH_ACTIONS.LOGOUT });
            }
        } catch (error) {
            console.error('Error checking auth status:', error);
            dispatch({ type: AUTH_ACTIONS.LOGOUT });
        } finally {
            dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        }
    }, []);

    // Verificar autenticación al cargar la aplicación
    useEffect(() => {
        checkAuthStatus();
    }, [checkAuthStatus]);

    // Función de login
    const login = useCallback(async (credentials) => {
        try {
            dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
            dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

            const result = await authService.login(credentials);

            if (result.success) {
                const { user, sector, permissions } = result.data;

                dispatch({
                    type: AUTH_ACTIONS.LOGIN_SUCCESS,
                    payload: { user, sector, permissions }
                });

                return { success: true, message: result.message };
            } else {
                dispatch({
                    type: AUTH_ACTIONS.LOGIN_ERROR,
                    payload: result.message
                });

                return { success: false, message: result.message };
            }
        } catch (error) {
            const errorMessage = authService.getErrorMessage(error);
            dispatch({
                type: AUTH_ACTIONS.LOGIN_ERROR,
                payload: errorMessage
            });

            return { success: false, message: errorMessage };
        } finally {
            dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        }
    }, []);

    // Función de logout
    const logout = useCallback(() => {
        authService.logout();
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }, []);

    // Limpiar errores
    const clearError = useCallback(() => {
        dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
    }, []);

    // Verificar rol
    const hasRole = useCallback((role) => {
        return authService.hasRole(role);
    }, []);

    // Verificar permisos
    const hasPermission = useCallback((permission) => {
        return authService.hasPermission(permission);
    }, []);

    // Verificar si es admin
    const isAdmin = useCallback(() => {
        return hasRole('ADMIN');
    }, [hasRole]);

    // Verificar si es responsable
    const isResponsable = useCallback(() => {
        return hasRole('RESPONSABLE_SECTOR');
    }, [hasRole]);

    // Verificar si es operador
    const isOperador = useCallback(() => {
        return hasRole('OPERADOR');
    }, [hasRole]);

    // Obtener nombre del rol
    const getRoleName = useCallback(() => {
        return authService.getRoleName();
    }, []);

    // Obtener usuario completo con métodos de conveniencia
    const getUser = useCallback(() => {
        if (!state.user) return null;

        return {
            ...state.user,
            isAdmin: () => isAdmin(),
            isResponsable: () => isResponsable(),
            isOperador: () => isOperador(),
            hasRole: (role) => hasRole(role),
            hasPermission: (permission) => hasPermission(permission),
            getRoleName: () => getRoleName()
        };
    }, [state.user, isAdmin, isResponsable, isOperador, hasRole, hasPermission, getRoleName]);

    // Valor del contexto - usar useMemo sería mejor, pero useCallback funciona
    const contextValue = {
        // Estado
        ...state,

        // Métodos
        login,
        logout,
        clearError,
        checkAuthStatus,

        // Verificaciones
        hasRole,
        hasPermission,
        isAdmin,
        isResponsable,
        isOperador,
        getRoleName,
        getUser
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;