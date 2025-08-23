import api from './api.js';

class AuthService {
    // Realizar login
    async login(credentials) {
        try {
            const response = await api.post('/auth/login', {
                username: credentials.username,
                password: credentials.password,
                rememberMe: credentials.rememberMe || false,
                deviceInfo: this.getDeviceInfo()
            });

            if (response.success && response.data) {
                const { accessToken, refreshToken, user, sector, permissions, expiresIn } = response.data;

                // Guardar tokens en localStorage
                localStorage.setItem('access_token', accessToken);
                localStorage.setItem('refresh_token', refreshToken);
                localStorage.setItem('user_info', JSON.stringify(user));
                localStorage.setItem('sector_info', JSON.stringify(sector));
                localStorage.setItem('permissions', JSON.stringify(permissions || []));
                localStorage.setItem('token_expires_at', Date.now() + (expiresIn * 1000));

                return {
                    success: true,
                    data: response.data,
                    message: response.message
                };
            } else {
                return {
                    success: false,
                    message: response.message || 'Error en el login'
                };
            }
        } catch (error) {
            console.error('Error en login:', error);
            return {
                success: false,
                message: this.getErrorMessage(error)
            };
        }
    }

    // Realizar logout
    logout() {
        // Limpiar localStorage
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_info');
        localStorage.removeItem('sector_info');
        localStorage.removeItem('permissions');
        localStorage.removeItem('token_expires_at');

        // Redirigir al login
        window.location.href = '/login';
    }

    // Verificar si está autenticado
    isAuthenticated() {
        const token = localStorage.getItem('access_token');
        const expiresAt = localStorage.getItem('token_expires_at');

        if (!token || !expiresAt) return false;

        // Verificar si el token no ha expirado (con margen de 5 minutos)
        const now = Date.now();
        const expiry = parseInt(expiresAt);
        const fiveMinutes = 5 * 60 * 1000; // 5 minutos en ms

        return now < (expiry - fiveMinutes);
    }

    // Obtener información del usuario actual
    getCurrentUser() {
        try {
            const userInfo = localStorage.getItem('user_info');
            return userInfo ? JSON.parse(userInfo) : null;
        } catch (error) {
            console.error('Error parsing user info:', error);
            return null;
        }
    }

    // Obtener información del sector actual
    getCurrentSector() {
        try {
            const sectorInfo = localStorage.getItem('sector_info');
            return sectorInfo ? JSON.parse(sectorInfo) : null;
        } catch (error) {
            console.error('Error parsing sector info:', error);
            return null;
        }
    }

    // Obtener permisos del usuario
    getUserPermissions() {
        try {
            const permissions = localStorage.getItem('permissions');
            return permissions ? JSON.parse(permissions) : [];
        } catch (error) {
            console.error('Error parsing permissions:', error);
            return [];
        }
    }

    // Verificar si el usuario tiene un rol específico
    hasRole(role) {
        const user = this.getCurrentUser();
        return user && user.rol === role;
    }

    // Verificar si es administrador
    isAdmin() {
        return this.hasRole('ADMIN');
    }

    // Verificar si es responsable de sector
    isResponsable() {
        return this.hasRole('RESPONSABLE_SECTOR');
    }

    // Verificar si es operador
    isOperador() {
        return this.hasRole('OPERADOR');
    }

    // Verificar si tiene un permiso específico
    hasPermission(permission) {
        const permissions = this.getUserPermissions();
        return permissions.includes(permission);
    }

    // Obtener nombre del rol legible
    getRoleName() {
        const user = this.getCurrentUser();
        if (!user || !user.rol) return 'Sin rol';

        const roleNames = {
            'ADMIN': 'Administrador',
            'RESPONSABLE_SECTOR': 'Responsable de Sector',
            'OPERADOR': 'Operador'
        };

        return roleNames[user.rol] || user.rol;
    }

    // Obtener información del dispositivo
    getDeviceInfo() {
        const userAgent = navigator.userAgent;
        const platform = navigator.platform;
        return `${platform} - ${userAgent.slice(0, 100)}`;
    }

    // Extraer mensaje de error
    getErrorMessage(error) {
        if (error.data && error.data.message) {
            return error.data.message;
        }

        if (error.message) {
            return error.message;
        }

        if (error.response?.data?.message) {
            return error.response.data.message;
        }

        // Mensajes por código de error HTTP
        if (error.response?.status) {
            switch (error.response.status) {
                case 400:
                    return 'Usuario o contraseña incorrectos';
                case 401:
                    return 'Credenciales inválidas';
                case 403:
                    return 'Acceso denegado';
                case 404:
                    return 'Servicio no encontrado';
                case 500:
                    return 'Error interno del servidor';
                default:
                    return 'Error de conexión';
            }
        }

        return 'Error de conexión';
    }

    // Renovar token manualmente
    async refreshToken() {
        try {
            const refreshToken = localStorage.getItem('refresh_token');
            if (!refreshToken) {
                throw new Error('No refresh token available');
            }

            const response = await api.post('/auth/refresh', {
                refreshToken: refreshToken,
                deviceInfo: this.getDeviceInfo()
            });

            if (response.success && response.data) {
                const { accessToken, refreshToken: newRefreshToken, expiresIn } = response.data;

                localStorage.setItem('access_token', accessToken);
                if (newRefreshToken) {
                    localStorage.setItem('refresh_token', newRefreshToken);
                }
                localStorage.setItem('token_expires_at', Date.now() + (expiresIn * 1000));

                return true;
            }

            return false;
        } catch (error) {
            console.error('Error refreshing token:', error);
            this.logout();
            return false;
        }
    }
}

export default new AuthService();