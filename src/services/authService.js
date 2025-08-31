import axios from 'axios';

// Configuración base de Axios
const API_BASE_URL = 'http://localhost:8080/api';

// Variable para controlar el comportamiento del interceptor
const TEST_MODE = false; // CAMBIAR A true SOLO PARA PRUEBAS

// Crear instancia de Axios
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 segundos
});

// Variable para evitar múltiples intentos de refresh simultáneos
let isRefreshing = false;
let refreshPromise = null;

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

// Interceptor de response con lógica inteligente
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Si el token expiró (401) y no hemos intentado renovar
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            // EN MODO TEST: No renovar automáticamente, ir directo al login
            if (TEST_MODE) {
                clearAuthData();
                window.location.href = '/login';
                return Promise.reject(error);
            }

            // MODO PRODUCCIÓN: Intentar renovar token inteligentemente
            // Solo renovar si tenemos refresh token válido
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken || isTokenExpired(refreshToken)) {
                clearAuthData();
                window.location.href = '/login';
                return Promise.reject(error);
            }

            // Evitar múltiples intentos de refresh simultáneos
            if (isRefreshing) {
                try {
                    await refreshPromise;
                    const newToken = localStorage.getItem('accessToken');
                    if (newToken && !isTokenExpired(newToken)) {
                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        return apiClient(originalRequest);
                    } else {
                        throw new Error('Token renovado no válido');
                    }
                } catch (refreshError) {
                    clearAuthData();
                    window.location.href = '/login';
                    return Promise.reject(refreshError);
                }
            }

            isRefreshing = true;
            refreshPromise = (async () => {
                try {
                    const newTokens = await refreshTokens(refreshToken);

                    // Actualizar tokens en localStorage
                    localStorage.setItem('accessToken', newTokens.accessToken);
                    if (newTokens.refreshToken) {
                        localStorage.setItem('refreshToken', newTokens.refreshToken);
                    }

                    // Reintentar la petición original con el nuevo token
                    originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
                    return apiClient(originalRequest);

                } catch (refreshError) {
                    console.error('❌ Error renovando token:', refreshError);
                    clearAuthData();
                    window.location.href = '/login';
                    throw refreshError;
                } finally {
                    isRefreshing = false;
                    refreshPromise = null;
                }
            })();

            return refreshPromise;
        }

        return Promise.reject(error);
    }
);

// Función helper para decodificar JWT sin verificar firma (solo para leer claims)
function decodeJWTPayload(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Error decodificando JWT:', error);
        return null;
    }
}

// Función para verificar si un token está expirado
function isTokenExpired(token) {
    if (!token) return true;
    
    try {
        const payload = decodeJWTPayload(token);
        if (!payload || !payload.exp) return true;
        
        // payload.exp viene en segundos, Date.now() en milisegundos
        const expirationTime = payload.exp * 1000;
        const currentTime = Date.now();
        
        return currentTime >= expirationTime;
    } catch (error) {
        console.error('Error verificando expiración del token:', error);
        return true;
    }
}

// Funciones del servicio de autenticación
class AuthService {

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

    async refreshTokens(refreshToken) {
        try {
            // Usar axios directamente para evitar interceptors
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

    async logout() {
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
                await apiClient.post('/auth/logout', {
                    refreshToken: refreshToken
                });
            }
        } catch (error) {
            console.warn('Error en logout:', error.message);
        } finally {
            this.clearAuthData();
        }
    }

    /**
     * Verificar si el usuario está autenticado y el token no está expirado
     * ESTA ES LA FUNCIÓN CLAVE PARA LA SEGURIDAD
     */
    isAuthenticated() {
        const token = localStorage.getItem('accessToken');
        const user = localStorage.getItem('user');

        // Verificar existencia básica
        if (!token || !user) {
            return false;
        }

        // Verificar si el token está expirado
        if (isTokenExpired(token)) {
            this.clearAuthData();
            return false;
        }

        return true;
    }

    shouldRefreshToken() {
        const token = localStorage.getItem('accessToken');
        if (!token) return false;
        
        try {
            const payload = decodeJWTPayload(token);
            if (!payload || !payload.exp) return false;
            
            const expirationTime = payload.exp * 1000;
            const currentTime = Date.now();
            const fiveMinutes = 5 * 60 * 1000; // 5 minutos en milisegundos
            
            return (expirationTime - currentTime) <= fiveMinutes;
        } catch (error) {
            return false;
        }
    }

    getTokenRemainingMinutes() {
        const token = localStorage.getItem('accessToken');
        if (!token) return 0;
        
        try {
            const payload = decodeJWTPayload(token);
            if (!payload || !payload.exp) return 0;
            
            const expirationTime = payload.exp * 1000;
            const currentTime = Date.now();
            const remainingMs = expirationTime - currentTime;
            
            return Math.max(0, Math.floor(remainingMs / (1000 * 60)));
        } catch (error) {
            return 0;
        }
    }

    getRefreshTokenStatus() {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
            return { valid: false, expiresIn: 0 };
        }

        try {
            const payload = decodeJWTPayload(refreshToken);
            if (!payload || !payload.exp) {
                return { valid: false, expiresIn: 0 };
            }

            const expirationTime = payload.exp * 1000;
            const currentTime = Date.now();
            const remainingMs = expirationTime - currentTime;

            return {
                valid: remainingMs > 0,
                expiresIn: Math.max(0, Math.floor(remainingMs / (1000 * 60)))
            };
        } catch (error) {
            return { valid: false, expiresIn: 0 };
        }
    }

    getCurrentUser() {
        if (!this.isAuthenticated()) {
            return null;
        }

        try {
            const userStr = localStorage.getItem('user');
            return userStr ? JSON.parse(userStr) : null;
        } catch (error) {
            console.error('Error parsing user data:', error);
            this.clearAuthData();
            return null;
        }
    }

    getUserSector() {
        if (!this.isAuthenticated()) {
            return null;
        }

        try {
            const sectorStr = localStorage.getItem('sector');
            return sectorStr ? JSON.parse(sectorStr) : null;
        } catch (error) {
            console.error('Error parsing sector data:', error);
            return null;
        }
    }

    getUserPermissions() {
        if (!this.isAuthenticated()) {
            return [];
        }

        try {
            const permissionsStr = localStorage.getItem('permissions');
            return permissionsStr ? JSON.parse(permissionsStr) : [];
        } catch (error) {
            console.error('Error parsing permissions:', error);
            return [];
        }
    }

    hasRole(role) {
        const user = this.getCurrentUser();
        return user?.rol === role;
    }

    hasAnyRole(roles) {
        const user = this.getCurrentUser();
        return user && roles.includes(user.rol);
    }

    getAccessToken() {
        if (!this.isAuthenticated()) {
            return null;
        }
        return localStorage.getItem('accessToken');
    }

    clearAuthData() {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        localStorage.removeItem('sector');
        localStorage.removeItem('permissions');
    }

    getDeviceInfo() {
        return `${navigator.userAgent} - ${window.screen.width}x${window.screen.height}`;
    }

    handleAuthError(error) {
        if (error.response) {
            const { status, data } = error.response;

            if (status === 401) {
                this.clearAuthData();
            }

            if (data?.message) {
                error.message = data.message;
            } else if (data?.error?.detail) {
                error.message = data.error.detail;
            }
        } else if (error.request) {
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

export { apiClient };