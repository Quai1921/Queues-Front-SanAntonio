import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import authService from '../services/authService';

// Estados posibles de autenticación
const AUTH_STATES = {
    LOADING: 'loading',
    AUTHENTICATED: 'authenticated',
    UNAUTHENTICATED: 'unauthenticated',
    ERROR: 'error'
};

// Acciones del reducer
const AUTH_ACTIONS = {
    SET_LOADING: 'SET_LOADING',
    LOGIN_SUCCESS: 'LOGIN_SUCCESS',
    LOGIN_ERROR: 'LOGIN_ERROR',
    LOGOUT: 'LOGOUT',
    UPDATE_USER: 'UPDATE_USER',
    CLEAR_ERROR: 'CLEAR_ERROR'
};

// Estado inicial
const initialState = {
    status: AUTH_STATES.LOADING,
    user: null,
    sector: null,
    permissions: [],
    accessToken: null,
    error: null,
    isLoading: false
};

// Reducer para manejar el estado de autenticación
function authReducer(state, action) {
    switch (action.type) {
        case AUTH_ACTIONS.SET_LOADING:
            return {
                ...state,
                isLoading: action.payload,
                error: null
            };

        case AUTH_ACTIONS.LOGIN_SUCCESS:
            return {
                ...state,
                status: AUTH_STATES.AUTHENTICATED,
                user: action.payload.user,
                sector: action.payload.sector,
                permissions: action.payload.permissions || [],
                accessToken: action.payload.accessToken,
                isLoading: false,
                error: null
            };

        case AUTH_ACTIONS.LOGIN_ERROR:
            return {
                ...state,
                status: AUTH_STATES.UNAUTHENTICATED,
                user: null,
                sector: null,
                permissions: [],
                accessToken: null,
                isLoading: false,
                error: action.payload
            };

        case AUTH_ACTIONS.LOGOUT:
            return {
                ...state,
                status: AUTH_STATES.UNAUTHENTICATED,
                user: null,
                sector: null,
                permissions: [],
                accessToken: null,
                isLoading: false,
                error: null
            };

        case AUTH_ACTIONS.UPDATE_USER:
            return {
                ...state,
                user: { ...state.user, ...action.payload }
            };

        case AUTH_ACTIONS.CLEAR_ERROR:
            return {
                ...state,
                error: null
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
        throw new Error('useAuth debe ser usado dentro de AuthProvider');
    }
    return context;
};

// Provider del contexto de autenticación
export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    /**
     * Verificar el estado de autenticación actual
     */
    const checkAuthStatus = useCallback(async () => {
        try {
            if (authService.isAuthenticated()) {
                const user = authService.getCurrentUser();
                const sector = authService.getUserSector();
                const permissions = authService.getUserPermissions();
                const accessToken = authService.getAccessToken();

                if (user && accessToken) {
                    dispatch({
                        type: AUTH_ACTIONS.LOGIN_SUCCESS,
                        payload: {
                            user,
                            sector,
                            permissions,
                            accessToken
                        }
                    });
                } else {
                    // Datos inconsistentes, limpiar todo
                    await authService.clearAuthData();
                    dispatch({ type: AUTH_ACTIONS.LOGOUT });
                }
            } else {
                dispatch({ type: AUTH_ACTIONS.LOGOUT });
            }
        } catch (error) {
            console.error('Error verificando estado de autenticación:', error);
            await authService.clearAuthData();
            dispatch({ type: AUTH_ACTIONS.LOGOUT });
        }
    }, []);

    // Efecto para verificar autenticación al cargar la app
    useEffect(() => {
        const initAuth = async () => {

            // Asegurar que muestre loading por al menos 1 segundo
            const startTime = Date.now();

            await checkAuthStatus();

            // Si se resolvió muy rápido, esperar hasta completar el tiempo mínimo
            const elapsed = Date.now() - startTime;
            const minLoadTime = 1000; // 1 segundo mínimo

            if (elapsed < minLoadTime) {
                await new Promise(resolve => setTimeout(resolve, minLoadTime - elapsed));
            }
        };

        initAuth();
    }, [checkAuthStatus]);

    /**
     * Función para iniciar sesión
     * @param {Object} credentials - {username, password, rememberMe}
     */
    const login = useCallback(async (credentials) => {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });

        try {
            const response = await authService.login(credentials);

            dispatch({
                type: AUTH_ACTIONS.LOGIN_SUCCESS,
                payload: {
                    user: response.user,
                    sector: response.sector,
                    permissions: response.permissions,
                    accessToken: response.accessToken
                }
            });

            return response;
        } catch (error) {
            const errorMessage = error.message || 'Error de autenticación';
            dispatch({
                type: AUTH_ACTIONS.LOGIN_ERROR,
                payload: errorMessage
            });
            throw error;
        }
    }, []);

    /**
 * Función para cerrar sesión con duración mínima de loading
 */
    const logout = useCallback(async () => {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });

        try {
            // Registrar tiempo de inicio
            const startTime = Date.now();
            const minLoadingTime = 600; // Duración mínima: 600ms

            // Ejecutar el logout en el servicio
            await authService.logout();

            // Calcular tiempo transcurrido
            const elapsed = Date.now() - startTime;

            // Si fue muy rápido, esperar hasta completar el tiempo mínimo
            if (elapsed < minLoadingTime) {
                await new Promise(resolve => setTimeout(resolve, minLoadingTime - elapsed));
            }
        } catch (error) {
            console.error('Error en logout:', error);
        } finally {
            // Siempre limpiar el estado, incluso si hay error
            dispatch({ type: AUTH_ACTIONS.LOGOUT });
        }
    }, []);

    /**
     * Función para actualizar datos del usuario
     * @param {Object} userData - Datos actualizados del usuario
     */
    const updateUser = useCallback((userData) => {
        dispatch({
            type: AUTH_ACTIONS.UPDATE_USER,
            payload: userData
        });

        // También actualizar en localStorage
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
            const updatedUser = { ...currentUser, ...userData };
            localStorage.setItem('user', JSON.stringify(updatedUser));
        }
    }, []);

    /**
     * Limpiar errores de autenticación
     */
    const clearError = useCallback(() => {
        dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
    }, []);

    /**
     * Verificar si el usuario tiene un rol específico
     * @param {string} role - ADMIN, RESPONSABLE_SECTOR, OPERADOR
     * @returns {boolean}
     */
    const hasRole = (role) => {
        return state.user?.rol === role;
    };

    /**
     * Verificar si el usuario tiene alguno de los roles especificados
     * @param {Array<string>} roles - Array de roles
     * @returns {boolean}
     */
    const hasAnyRole = (roles) => {
        return roles.includes(state.user?.rol);
    };

    /**
     * Verificar si el usuario tiene un permiso específico
     * @param {string} permission - Nombre del permiso
     * @returns {boolean}
     */
    const hasPermission = (permission) => {
        return state.permissions.includes(permission);
    };

    /**
     * Verificar si es responsable de un sector
     * @param {number} sectorId - ID del sector (opcional)
     * @returns {boolean}
     */
    const isResponsableDeSector = (sectorId = null) => {
        if (!state.sector) return false;

        const isResponsable = state.sector.esResponsable || hasRole('ADMIN');

        if (sectorId) {
            return isResponsable && state.sector.id === sectorId;
        }

        return isResponsable;
    };

    /**
     * Obtener información completa del usuario para mostrar
     * @returns {Object}
     */
    const getUserInfo = () => {
        if (!state.user) return null;

        return {
            id: state.user.id,
            username: state.user.username,
            nombreCompleto: state.user.nombreCompleto,
            nombre: state.user.nombre,
            apellido: state.user.apellido,
            email: state.user.email,
            rol: state.user.rol,
            ultimoAcceso: state.user.ultimoAcceso,
            sector: state.sector
        };
    };

    // Valores del contexto
    const contextValue = {
        // Estado
        ...state,
        isAuthenticated: state.status === AUTH_STATES.AUTHENTICATED,
        isUnauthenticated: state.status === AUTH_STATES.UNAUTHENTICATED,
        isInitialLoading: state.status === AUTH_STATES.LOADING,

        // Acciones
        login,
        logout,
        updateUser,
        clearError,
        checkAuthStatus,

        // Verificaciones de permisos
        hasRole,
        hasAnyRole,
        hasPermission,
        isResponsableDeSector,

        // Utilidades
        getUserInfo,

        // Estados y constantes
        AUTH_STATES
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;