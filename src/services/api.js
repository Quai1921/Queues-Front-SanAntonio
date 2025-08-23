import axios from 'axios';

// Configuración base de Axios
const API_BASE_URL = 'http://localhost:8080/api';

// Crear instancia de axios
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para agregar token a las requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para manejar responses y errores
api.interceptors.response.use(
    (response) => {
        // Si la respuesta tiene la estructura ApiResponseWrapper
        if (response.data && response.data.success !== undefined) {
            return response.data;
        }
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Si el token expiró (401) y no es el endpoint de login
        if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/auth/login')) {
            originalRequest._retry = true;

            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
                try {
                    const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                        refreshToken: refreshToken
                    });

                    if (refreshResponse.data.success) {
                        const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data.data;
                        localStorage.setItem('access_token', accessToken);
                        if (newRefreshToken) {
                            localStorage.setItem('refresh_token', newRefreshToken);
                        }

                        // Reintentar la request original con el nuevo token
                        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                        return api(originalRequest);
                    }
                } catch (refreshError) {
                    // Error al renovar token - limpiar storage y redirigir al login
                    localStorage.clear();
                    window.location.href = '/login';
                    return Promise.reject(refreshError);
                }
            } else {
                // No hay refresh token - redirigir al login
                localStorage.clear();
                window.location.href = '/login';
            }
        }

        // Manejar otros errores
        const errorMessage = error.response?.data?.message || error.message || 'Error de conexión';
        return Promise.reject({
            ...error,
            message: errorMessage,
            data: error.response?.data
        });
    }
);

export default api;