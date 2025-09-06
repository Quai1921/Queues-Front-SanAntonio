import { apiClient } from './authService';

const unwrap = (r) => r?.data?.data ?? r?.data ?? r;

const toCsv = (v) => {
    if (!v) return undefined;
    if (Array.isArray(v)) return v.filter(Boolean).join(',');
    return String(v);
};

const estadisticasService = {
    // ---------- SIMPLIFICADOS (Postman) ----------
    async getDiario({ fecha, sectorId, empleadoId } = {}) {
        const params = {};
        if (fecha) params.fecha = fecha;
        if (sectorId) params.sectorId = sectorId;
        if (empleadoId) params.empleadoId = empleadoId;
        const resp = await apiClient.get(`/estadisticas/diario`, { params });
        return unwrap(resp);
    },

    async getPeriodo({ desde, hasta, sectorId, groupBy } = {}) {
        const params = {};
        if (desde) params.desde = desde;
        if (hasta) params.hasta = hasta;
        if (sectorId) params.sectorId = toCsv(sectorId);
        if (groupBy) params.groupBy = groupBy; // FECHA | SECTOR | FECHA_SECTOR
        const resp = await apiClient.get(`/estadisticas/periodo`, { params });
        return unwrap(resp);
    },

    // ---------- ALIASES EXISTENTES (compat) ----------
    getSectorByDate: (sectorId, fecha) =>
        apiClient.get(`/estadisticas/sector/${sectorId}/fecha/${fecha}`).then(unwrap),

    getEmpleadoByDate: (empleadoId, sectorId, fecha) =>
        apiClient.get(`/estadisticas/empleado/${empleadoId}/sector/${sectorId}/fecha/${fecha}`).then(unwrap),

    getSectorToday: (sectorId) =>
        apiClient.get(`/estadisticas/sector/${sectorId}/hoy`).then(unwrap),

    getSectorPeriod: (sectorId, fechaInicio, fechaFin) =>
        apiClient.get(`/estadisticas/sector/${sectorId}/periodo`, { params: { fechaInicio, fechaFin } }).then(unwrap),

    getGeneralPeriod: (fechaInicio, fechaFin) =>
        apiClient.get(`/estadisticas/general/periodo`, { params: { fechaInicio, fechaFin } }).then(unwrap),

    getSemanaActual: () => apiClient.get(`/estadisticas/semana-actual`).then(unwrap),
    getMesActual: () => apiClient.get(`/estadisticas/mes-actual`).then(unwrap),

    compararSectores: (sector1, sector2, fechaInicio, fechaFin) =>
        apiClient.get(`/estadisticas/comparar/sectores`, { params: { sector1, sector2, fechaInicio, fechaFin } }).then(unwrap),

    getResumenHoy: () => apiClient.get(`/estadisticas/resumen-hoy`).then(unwrap),
    getResumenDiario: (fecha) => apiClient.get(`/estadisticas/resumen-diario/${fecha}`).then(unwrap),

    generarReporteResumen: (payload) => apiClient.post(`/estadisticas/reporte/resumen`, payload).then(unwrap),
    generarReporteHoy: () => apiClient.post(`/estadisticas/reporte/hoy`).then(unwrap),
    generarReporteFecha: (fecha) => apiClient.post(`/estadisticas/reporte/fecha/${fecha}`).then(unwrap),

    calcularHoraPico: (sectorId, fecha) =>
        apiClient.put(`/estadisticas/sector/${sectorId}/hora-pico/fecha/${fecha}`).then(unwrap),

    getUltimosDiasSector: (sectorId, dias = 7) =>
        apiClient.get(`/estadisticas/sector/${sectorId}/ultimos-dias`, { params: { dias } }).then(unwrap),
};

export default estadisticasService;
