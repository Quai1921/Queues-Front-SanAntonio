import { apiClient } from './authService';

class StatisticsService {
    async getDiario({ fecha, sectorId, empleadoId } = {}) {
        const params = {};
        if (fecha) params.fecha = fecha;
        if (sectorId) params.sectorId = sectorId;
        if (empleadoId) params.empleadoId = empleadoId;
        const { data } = await apiClient.get('/estadisticas/diario', { params });
        if (!data?.success) throw new Error(data?.message || 'Error obteniendo diario');
        return data.data;
    }

    async getPeriodo({ desde, hasta, sectorId, empleadoId, groupBy } = {}) {
        const params = { desde, hasta };
        if (sectorId) params.sectorId = sectorId;
        if (empleadoId) params.empleadoId = empleadoId;
        if (groupBy) params.groupBy = groupBy;
        const { data } = await apiClient.get('/estadisticas/periodo', { params });
        if (!data?.success) throw new Error(data?.message || 'Error obteniendo período');
        return data.data;
    }

    async getEmpleadosStats() {
        const { data } = await apiClient.get('/empleados/estadisticas');
        if (data?.success) return data.data;
        // por si tu endpoint devuelve plano
        return data;
    }

    // utilidades opcionales que ya usabas
    formatearTiempo(min) {
        if (!min) return '0 min';
        if (min < 60) return `${min} min`;
        const h = Math.floor(min / 60), m = min % 60;
        return m ? `${h}h ${m}min` : `${h}h`;
    }

    handleStatisticsError(error) {
        if (error.response) {
            const { status, data } = error.response;
            if (data?.message) error.message = data.message;
            else if (data?.error?.detail) error.message = data.error.detail;
            if (status === 403) error.message = 'No tienes permisos para ver estas estadísticas';
            else if (status === 404) error.message = 'Datos de estadísticas no encontrados';
        } else if (error.request) {
            error.message = 'Error de conexión al obtener estadísticas';
        }
        console.error('Statistics Service Error:', {
            message: error.message, status: error.response?.status, url: error.config?.url
        });
    }
}

const statisticsService = new StatisticsService();
export default statisticsService;
