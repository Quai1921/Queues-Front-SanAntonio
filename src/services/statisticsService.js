import { apiClient } from './authService';

/**
 * Servicio para manejar estadísticas del dashboard
 */
class StatisticsService {

    /**
     * Obtener resumen de estadísticas de hoy (todos los sectores)
     * @returns {Promise<Object>} - Datos de turnos de hoy
     */
    async getResumenHoy() {
        try {
            const response = await apiClient.get('/estadisticas/resumen-hoy');

            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Error obteniendo resumen de hoy');
            }
        } catch (error) {
            this.handleStatisticsError(error);
            throw error;
        }
    }

    /**
     * Obtener estadísticas de empleados (total, activos, etc.)
     * @returns {Promise<Object>} - Estadísticas generales de empleados
     */
    async getEstadisticasEmpleados() {
        try {
            const response = await apiClient.get('/empleados/estadisticas');

            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Error obteniendo estadísticas de empleados');
            }
        } catch (error) {
            this.handleStatisticsError(error);
            throw error;
        }
    }

    /**
     * Obtener estadísticas de un sector específico para hoy
     * @param {number} sectorId - ID del sector
     * @returns {Promise<Object>} - Estadísticas del sector
     */
    async getEstadisticasSectorHoy(sectorId) {
        try {
            const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
            const response = await apiClient.get(`/estadisticas/sector/${sectorId}/fecha/${today}`);

            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Error obteniendo estadísticas del sector');
            }
        } catch (error) {
            this.handleStatisticsError(error);
            throw error;
        }
    }

    /**
     * Obtener estadísticas generales para un período
     * @param {string} fechaInicio - Fecha de inicio (YYYY-MM-DD)
     * @param {string} fechaFin - Fecha de fin (YYYY-MM-DD)
     * @returns {Promise<Array>} - Lista de estadísticas
     */
    async getEstadisticasPeriodo(fechaInicio, fechaFin) {
        try {
            const response = await apiClient.get('/estadisticas/general/periodo', {
                params: { fechaInicio, fechaFin }
            });

            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Error obteniendo estadísticas del período');
            }
        } catch (error) {
            this.handleStatisticsError(error);
            throw error;
        }
    }

    /**
     * Procesar datos de resumen de hoy para el dashboard
     * @param {Array} resumenHoy - Datos del endpoint /estadisticas/resumen-hoy
     * @returns {Object} - Estadísticas procesadas para el dashboard
     */
    procesarResumenDashboard(resumenHoy) {
        if (!resumenHoy || !Array.isArray(resumenHoy)) {
            return this.getEstadisticasVacias();
        }

        // Sumar estadísticas de todos los sectores
        const totales = resumenHoy.reduce((acc, sector) => {

            const pendientes = Math.max(0,
                (sector.turnosGenerados || 0) -
                (sector.turnosAtendidos || 0) -
                (sector.turnosAusentes || 0) -
                (sector.turnosCancelados || 0)
            );

            acc.turnosPendientes += pendientes;
            acc.turnosAtendidos += sector.turnosAtendidos || 0;
            acc.turnosGenerados += sector.turnosGenerados || 0;
            acc.turnosAusentes += sector.turnosAusentes || 0;
            acc.turnosRedirigidos += sector.turnosRedirigidos || 0;

            // Acumular tiempo total para calcular promedio después
            if (sector.tiempoPromedioAtencion && sector.turnosAtendidos > 0) {
                acc.tiempoTotalMinutos += (sector.tiempoPromedioAtencion * sector.turnosAtendidos);
                acc.totalTurnosConTiempo += sector.turnosAtendidos;
            }

            return acc;
        }, {
            turnosPendientes: 0,
            turnosAtendidos: 0,
            turnosGenerados: 0,
            turnosAusentes: 0,
            turnosRedirigidos: 0,
            tiempoTotalMinutos: 0,
            totalTurnosConTiempo: 0
        });

        // Calcular tiempo promedio global
        const tiempoPromedio = totales.totalTurnosConTiempo > 0
            ? Math.round(totales.tiempoTotalMinutos / totales.totalTurnosConTiempo)
            : 0;

        return {
            turnosPendientes: totales.turnosPendientes,
            turnosAtendidosHoy: totales.turnosAtendidos,
            turnosGenerados: totales.turnosGenerados,
            tiempoPromedio: tiempoPromedio,
            // Datos adicionales para análisis
            turnosAusentes: totales.turnosAusentes,
            turnosRedirigidos: totales.turnosRedirigidos,
            eficiencia: totales.turnosGenerados > 0
                ? Math.round((totales.turnosAtendidos / totales.turnosGenerados) * 100)
                : 0
        };
    }

    /**
     * Obtener estadísticas completas del dashboard
     * @returns {Promise<Object>} - Todas las estadísticas necesarias para el dashboard
     */
    async getDashboardStats() {
        try {
            // Ejecutar llamadas en paralelo para mejor rendimiento
            const [resumenHoy, estadisticasEmpleados] = await Promise.all([
                this.getResumenHoy(),
                this.getEstadisticasEmpleados()
            ]);

            // Procesar estadísticas de turnos
            const statsProvider = this.procesarResumenDashboard(resumenHoy);

            // Combinar con estadísticas de empleados
            return {
                turnos: statsProvider,
                empleados: {
                    total: estadisticasEmpleados.totalEmpleados || 0,
                    activos: estadisticasEmpleados.empleadosActivos || 0,
                    inactivos: estadisticasEmpleados.empleadosInactivos || 0,
                    porcentajeActivos: estadisticasEmpleados.porcentajeActivos || 0
                },
                fechaActualizacion: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error obteniendo estadísticas del dashboard:', error);
            throw error;
        }
    }

    /**
     * Obtener estadísticas vacías/por defecto cuando hay errores
     * @returns {Object} - Estructura de estadísticas con valores por defecto
     */
    getEstadisticasVacias() {
        return {
            turnosPendientes: 0,
            turnosAtendidosHoy: 0,
            turnosGenerados: 0,
            tiempoPromedio: 0,
            turnosAusentes: 0,
            turnosRedirigidos: 0,
            eficiencia: 0
        };
    }

    /**
     * Formatear tiempo en minutos a texto legible
     * @param {number} minutos - Tiempo en minutos
     * @returns {string} - Tiempo formateado (ej: "15 min", "1h 20min")
     */
    formatearTiempo(minutos) {
        if (!minutos || minutos === 0) return '0 min';

        if (minutos < 60) {
            return `${minutos} min`;
        }

        const horas = Math.floor(minutos / 60);
        const minutosRestantes = minutos % 60;

        if (minutosRestantes === 0) {
            return `${horas}h`;
        }

        return `${horas}h ${minutosRestantes}min`;
    }

    /**
     * Manejar errores específicos de estadísticas
     * @param {Error} error 
     */
    handleStatisticsError(error) {
        if (error.response) {
            const { status, data } = error.response;

            // Extraer mensaje de error del wrapper ApiResponseWrapper
            if (data?.message) {
                error.message = data.message;
            } else if (data?.error?.detail) {
                error.message = data.error.detail;
            }

            // Errores específicos de estadísticas
            if (status === 403) {
                error.message = 'No tienes permisos para ver estas estadísticas';
            } else if (status === 404) {
                error.message = 'Datos de estadísticas no encontrados';
            }
        } else if (error.request) {
            error.message = 'Error de conexión al obtener estadísticas';
        }

        console.error('Statistics Service Error:', {
            message: error.message,
            status: error.response?.status,
            url: error.config?.url
        });
    }
}

// Exportar instancia singleton del servicio
const statisticsService = new StatisticsService();
export default statisticsService;