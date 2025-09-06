import { apiClient } from './authService';

const base = '/historial';

const historialService = {
    // Historial por Turno
    obtenerPorTurnoId: (turnoId) =>
        apiClient.get(`${base}/turno/${turnoId}`),

    obtenerPorCodigo: (codigo) =>
        apiClient.get(`${base}/turno-codigo/${encodeURIComponent(codigo)}`),

    obtenerLegible: (turnoId) =>
        apiClient.get(`${base}/turno/${turnoId}/legible`),

    // Auditoría del sistema
    ultimasAcciones: (limite = 50) =>
        apiClient.get(`${base}/ultimas-acciones`, { params: { limite } }),

    accionesHoy: () =>
        apiClient.get(`${base}/acciones-hoy`),

    actividadReciente: () =>
        apiClient.get(`${base}/actividad-reciente`),

    // Consultas por fecha
    porFecha: (fechaISO, limite = 200) =>
        apiClient.get(`${base}/fecha/${fechaISO}`, { params: { limite } }),

    compararFechas: (fecha1ISO, fecha2ISO) =>
        apiClient.get(`${base}/comparar-fechas`, { params: { fecha1: fecha1ISO, fecha2: fecha2ISO } }),

    // Consultas específicas
    redirecciones: (limite = 100) =>
        apiClient.get(`${base}/redirecciones`, { params: { limite } }),

    cambiosEstado: (limite = 100) =>
        apiClient.get(`${base}/cambios-estado`, { params: { limite } }),

    // Trazabilidad
    trazabilidadCiudadano: (dni, limite = 500) =>
        apiClient.get(`${base}/ciudadano/${encodeURIComponent(dni)}/trazabilidad`, { params: { limite } }),

    // Auditoría por empleado
    accionesEmpleadoPeriodo: (empleadoId, fechaInicioISO, fechaFinISO) =>
        apiClient.get(`${base}/empleado/${empleadoId}/periodo`, {
            params: { fechaInicio: fechaInicioISO, fechaFin: fechaFinISO }
        }),

    auditoriaEmpleado: (empleadoId, fechaInicioISO, fechaFinISO) =>
        apiClient.get(`${base}/empleado/${empleadoId}/auditoria`, {
            params: { fechaInicio: fechaInicioISO, fechaFin: fechaFinISO }
        }),
};

export default historialService;
