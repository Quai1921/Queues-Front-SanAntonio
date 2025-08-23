import axios from 'axios';

// Configuración base de Axios
const API_BASE_URL = 'http://localhost:8080/api';

// Crear instancia de Axios
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 segundos
});

// Interceptor para requests - añadir token automáticamente
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para responses - manejar errores y renovación de tokens
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Si el token expiró (401) y no hemos intentado renovar
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (refreshToken) {
                    const newTokens = await refreshTokens(refreshToken);

                    // Actualizar tokens en localStorage
                    localStorage.setItem('accessToken', newTokens.accessToken);
                    if (newTokens.refreshToken) {
                        localStorage.setItem('refreshToken', newTokens.refreshToken);
                    }

                    // Reintentar la petición original con el nuevo token
                    originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
                    return apiClient(originalRequest);
                }
            } catch (refreshError) {
                // Si falla la renovación, limpiar tokens y redirigir al login
                clearAuthData();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

// Funciones del servicio de autenticación
class AuthService {

    /**
     * Iniciar sesión
     * @param {Object} credentials - {username, password, rememberMe}
     * @returns {Promise<Object>} - Datos de respuesta del login
     */
    async login(credentials) {
        try {
            const response = await apiClient.post('/auth/login', {
                username: credentials.username,
                password: credentials.password,
                rememberMe: credentials.rememberMe || false,
                deviceInfo: this.getDeviceInfo()
            });

            if (response.data.success) {
                const { data } = response.data;

                // Guardar tokens y datos del usuario
                localStorage.setItem('accessToken', data.accessToken);
                localStorage.setItem('refreshToken', data.refreshToken);
                localStorage.setItem('user', JSON.stringify(data.user));

                if (data.sector) {
                    localStorage.setItem('sector', JSON.stringify(data.sector));
                }

                if (data.permissions) {
                    localStorage.setItem('permissions', JSON.stringify(data.permissions));
                }

                return data;
            } else {
                throw new Error(response.data.message || 'Error de autenticación');
            }
        } catch (error) {
            this.handleAuthError(error);
            throw error;
        }
    }

    /**
     * Renovar tokens usando refresh token
     * @param {string} refreshToken 
     * @returns {Promise<Object>} - Nuevos tokens
     */
    async refreshTokens(refreshToken) {
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                refreshToken: refreshToken,
                deviceInfo: this.getDeviceInfo()
            });

            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Error renovando token');
            }
        } catch (error) {
            throw error;
        }
    }

    /**
     * Cerrar sesión
     */
    async logout() {
        try {
            // Llamar al endpoint de logout si existe
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
                await apiClient.post('/auth/logout', {
                    refreshToken: refreshToken
                });
            }
        } catch (error) {
            console.warn('Error en logout:', error.message);
        } finally {
            // Limpiar datos locales independientemente del resultado
            this.clearAuthData();
        }
    }

    /**
     * Verificar si el usuario está autenticado
     * @returns {boolean}
     */
    isAuthenticated() {
        const token = localStorage.getItem('accessToken');
        const user = localStorage.getItem('user');

        return !!(token && user);
    }

    /**
     * Obtener datos del usuario actual
     * @returns {Object|null}
     */
    getCurrentUser() {
        try {
            const userStr = localStorage.getItem('user');
            return userStr ? JSON.parse(userStr) : null;
        } catch (error) {
            console.error('Error parsing user data:', error);
            return null;
        }
    }

    /**
     * Obtener datos del sector del usuario
     * @returns {Object|null}
     */
    getUserSector() {
        try {
            const sectorStr = localStorage.getItem('sector');
            return sectorStr ? JSON.parse(sectorStr) : null;
        } catch (error) {
            console.error('Error parsing sector data:', error);
            return null;
        }
    }

    /**
     * Obtener permisos del usuario
     * @returns {Array}
     */
    getUserPermissions() {
        try {
            const permissionsStr = localStorage.getItem('permissions');
            return permissionsStr ? JSON.parse(permissionsStr) : [];
        } catch (error) {
            console.error('Error parsing permissions:', error);
            return [];
        }
    }

    /**
     * Verificar si el usuario tiene un rol específico
     * @param {string} role - ADMIN, RESPONSABLE_SECTOR, OPERADOR
     * @returns {boolean}
     */
    hasRole(role) {
        const user = this.getCurrentUser();
        return user?.rol === role;
    }

    /**
     * Verificar si el usuario tiene alguno de los roles especificados
     * @param {Array<string>} roles - Array de roles
     * @returns {boolean}
     */
    hasAnyRole(roles) {
        const user = this.getCurrentUser();
        return roles.includes(user?.rol);
    }

    /**
     * Obtener token de acceso
     * @returns {string|null}
     */
    getAccessToken() {
        return localStorage.getItem('accessToken');
    }

    /**
     * Limpiar todos los datos de autenticación
     */
    clearAuthData() {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        localStorage.removeItem('sector');
        localStorage.removeItem('permissions');
    }

    /**
     * Obtener información del dispositivo para auditoría
     * @returns {string}
     */
    getDeviceInfo() {
        return `${navigator.userAgent} - ${window.screen.width}x${window.screen.height}`;
    }

    /**
     * Manejar errores de autenticación
     * @param {Error} error 
     */
    handleAuthError(error) {
        if (error.response) {
            // Error de respuesta del servidor
            const { status, data } = error.response;

            if (status === 401) {
                this.clearAuthData();
            }

            // Extraer mensaje de error del wrapper ApiResponseWrapper
            if (data?.message) {
                error.message = data.message;
            } else if (data?.error?.detail) {
                error.message = data.error.detail;
            }
        } else if (error.request) {
            // Error de conexión
            error.message = 'Error de conexión con el servidor';
        }
    }
}

// Función helper para renovar tokens (usada en interceptor)
const refreshTokens = async (refreshToken) => {
    const authService = new AuthService();
    return await authService.refreshTokens(refreshToken);
};

// Función helper para limpiar datos (usada en interceptor)
const clearAuthData = () => {
    const authService = new AuthService();
    authService.clearAuthData();
};

// Exportar instancia singleton del servicio
const authService = new AuthService();
export default authService;

// También exportar la instancia de Axios configurada para otros servicios
export { apiClient };