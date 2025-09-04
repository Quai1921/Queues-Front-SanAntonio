// src/services/estadisticasService.js
import { apiClient } from './authService';

const estadisticasService = {
    // Diarias
    getSectorByDate: (sectorId, fecha) =>
        apiClient.get(`/estadisticas/sector/${sectorId}/fecha/${fecha}`),

    getEmpleadoByDate: (empleadoId, sectorId, fecha) =>
        apiClient.get(`/estadisticas/empleado/${empleadoId}/sector/${sectorId}/fecha/${fecha}`),

    getSectorToday: (sectorId) =>
        apiClient.get(`/estadisticas/sector/${sectorId}/hoy`),

    // Períodos
    getSectorPeriod: (sectorId, fechaInicio, fechaFin) =>
        apiClient.get(`/estadisticas/sector/${sectorId}/periodo`, { params: { fechaInicio, fechaFin } }),

    getGeneralPeriod: (fechaInicio, fechaFin) =>
        apiClient.get(`/estadisticas/general/periodo`, { params: { fechaInicio, fechaFin } }),

    getSemanaActual: () => apiClient.get(`/estadisticas/semana-actual`),
    getMesActual: () => apiClient.get(`/estadisticas/mes-actual`),

    // Comparaciones
    compararSectores: (sector1, sector2, fechaInicio, fechaFin) =>
        apiClient.get(`/estadisticas/comparar/sectores`, { params: { sector1, sector2, fechaInicio, fechaFin } }),

    // Resúmenes / Reportes
    getResumenHoy: () => apiClient.get(`/estadisticas/resumen-hoy`),
    getResumenDiario: (fecha) => apiClient.get(`/estadisticas/resumen-diario/${fecha}`),
    generarReporteResumen: (payload) => apiClient.post(`/estadisticas/reporte/resumen`, payload),
    generarReporteHoy: () => apiClient.post(`/estadisticas/reporte/hoy`),
    generarReporteFecha: (fecha) => apiClient.post(`/estadisticas/reporte/fecha/${fecha}`),

    // Análisis puntual
    calcularHoraPico: (sectorId, fecha) =>
        apiClient.put(`/estadisticas/sector/${sectorId}/hora-pico/fecha/${fecha}`),

    // Consultas rápidas
    getUltimosDiasSector: (sectorId, dias = 7) =>
        apiClient.get(`/estadisticas/sector/${sectorId}/ultimos-dias`, { params: { dias } }),
};

export default estadisticasService;
