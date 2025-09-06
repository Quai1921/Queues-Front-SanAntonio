// import { apiClient } from './authService';

// const base = '/historial';

// const historialService = {
//     // Historial por Turno
//     obtenerPorTurnoId: (turnoId) =>
//         apiClient.get(`${base}/turno/${turnoId}`),

//     obtenerPorCodigo: (codigo) =>
//         apiClient.get(`${base}/turno-codigo/${encodeURIComponent(codigo)}`),

//     obtenerLegible: (turnoId) =>
//         apiClient.get(`${base}/turno/${turnoId}/legible`),

//     // Auditoría del sistema
//     ultimasAcciones: (limite = 50) =>
//         apiClient.get(`${base}/ultimas-acciones`, { params: { limite } }),

//     accionesHoy: () =>
//         apiClient.get(`${base}/acciones-hoy`),

//     actividadReciente: () =>
//         apiClient.get(`${base}/actividad-reciente`),

//     // Consultas por fecha
//     porFecha: (fechaISO, limite = 200) =>
//         apiClient.get(`${base}/fecha/${fechaISO}`, { params: { limite } }),

//     compararFechas: (fecha1ISO, fecha2ISO) =>
//         apiClient.get(`${base}/comparar-fechas`, { params: { fecha1: fecha1ISO, fecha2: fecha2ISO } }),

//     // Consultas específicas
//     redirecciones: (limite = 100) =>
//         apiClient.get(`${base}/redirecciones`, { params: { limite } }),

//     cambiosEstado: (limite = 100) =>
//         apiClient.get(`${base}/cambios-estado`, { params: { limite } }),

//     // Trazabilidad
//     trazabilidadCiudadano: (dni, limite = 500) =>
//         apiClient.get(`${base}/ciudadano/${encodeURIComponent(dni)}/trazabilidad`, { params: { limite } }),

//     // Auditoría por empleado
//     accionesEmpleadoPeriodo: (empleadoId, fechaInicioISO, fechaFinISO) =>
//         apiClient.get(`${base}/empleado/${empleadoId}/periodo`, {
//             params: { fechaInicio: fechaInicioISO, fechaFin: fechaFinISO }
//         }),

//     auditoriaEmpleado: (empleadoId, fechaInicioISO, fechaFinISO) =>
//         apiClient.get(`${base}/empleado/${empleadoId}/auditoria`, {
//             params: { fechaInicio: fechaInicioISO, fechaFin: fechaFinISO }
//         }),
// };

// export default historialService;



// Crear o actualizar historialService.js

// src/services/historialService.js

import { apiClient } from './authService';

class HistorialService {
    constructor() {
        this.apiClient = apiClient;
    }

    // ==========================================
    // MÉTODOS PRINCIPALES
    // ==========================================

    async ultimas(limite = 50) {
        try {
            const response = await this.apiClient.get(`/historial/ultimas-acciones?limite=${limite}`);
            return response.data?.success ? response.data.data : [];
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }

    async hoy() {
        try {
            const response = await this.apiClient.get('/historial/acciones-hoy');
            return response.data?.success ? response.data.data : [];
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }

    async reciente() {
        try {
            const response = await this.apiClient.get('/historial/actividad-reciente');
            return response.data?.success ? response.data.data : [];
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }

    async porTurnoId(turnoId) {
        try {
            const response = await this.apiClient.get(`/historial/turno/${turnoId}`);
            return response.data?.success ? response.data.data : [];
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }

    async porCodigo(codigo) {
        try {
            const response = await this.apiClient.get(`/historial/turno-codigo/${codigo}`);
            return response.data?.success ? response.data.data : [];
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }

    async legible(turnoId) {
        try {
            const response = await this.apiClient.get(`/historial/turno/${turnoId}/legible`);
            return response.data?.success ? response.data.data : null;
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }

    async porFecha(fecha, limite = 200) {
        try {
            const response = await this.apiClient.get(`/historial/fecha/${fecha}?limite=${limite}`);
            return response.data?.success ? response.data.data : [];
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }

    async compararFechas(fecha1, fecha2) {
        try {
            const response = await this.apiClient.get(`/historial/comparar-fechas/${fecha1}/${fecha2}`);
            return response.data?.success ? response.data.data : [];
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }

    async redirecciones(limite = 100) {
        try {
            const response = await this.apiClient.get(`/historial/redirecciones?limite=${limite}`);
            return response.data?.success ? response.data.data : [];
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }

    async cambiosEstado(limite = 100) {
        try {
            const response = await this.apiClient.get(`/historial/cambios-estado?limite=${limite}`);
            return response.data?.success ? response.data.data : [];
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }

    async trazabilidadDni(dni, limite = 200) {
        try {
            const response = await this.apiClient.get(`/historial/trazabilidad-dni/${dni}?limite=${limite}`);
            return response.data?.success ? response.data.data : [];
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }

    async accionesEmpleado(empleadoId, fechaInicio, fechaFin) {
        try {
            const response = await this.apiClient.get(`/historial/empleado/${empleadoId}/periodo?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`);
            return response.data?.success ? response.data.data : [];
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }

    async auditoriaEmpleado(empleadoId, fechaInicio, fechaFin) {
        try {
            const response = await this.apiClient.get(`/historial/empleado/${empleadoId}/auditoria?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`);
            return response.data?.success ? response.data.data : null;
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }

    // ==========================================
    // NUEVOS MÉTODOS
    // ==========================================

    async historialCiudadano(dni, limite = 100) {
        try {
            const response = await this.apiClient.get(`/historial/ciudadano/${dni}?limite=${limite}`);
            return response.data?.success ? response.data.data : [];
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }

    async metricasHoy() {
        try {
            const response = await this.apiClient.get('/historial/metricas/hoy');
            return response.data?.success ? response.data.data : null;
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }

    async compararSectores(sectorId1, sectorId2, fecha) {
        try {
            const queryParams = fecha ? `?fecha=${fecha}` : '';
            const response = await this.apiClient.get(`/historial/comparar-sectores/${sectorId1}/${sectorId2}${queryParams}`);
            return response.data?.success ? response.data.data : null;
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }

    // ==========================================
    // MÉTODOS DE UTILIDAD
    // ==========================================

    formatearHistorialLegible(historialLegible) {
        if (!historialLegible) return null;

        return {
            codigo: historialLegible.turnoCodigo || 'Sin código',
            estado: historialLegible.estadoActual || 'DESCONOCIDO',
            completado: historialLegible.completado || false,
            totalAcciones: historialLegible.totalAcciones || 0,
            resumen: historialLegible.resumen || 'Sin resumen',
            fechaGeneracion: historialLegible.fechaGeneracion,
            fechaFinalizacion: historialLegible.fechaFinalizacion,
            acciones: (historialLegible.historialLegible || []).map((accion, index) => ({
                id: index,
                texto: accion,
                timestamp: this.extraerTimestamp(accion),
                empleado: this.extraerEmpleado(accion),
                evento: this.extraerEvento(accion)
            }))
        };
    }

    extraerTimestamp(linea) {
        const match = linea.match(/\[([\d-T:.]+)\]/);
        return match ? match[1] : null;
    }

    extraerEmpleado(linea) {
        const match = linea.match(/ - (.+)$/);
        return match ? match[1] : 'Sistema';
    }

    extraerEvento(linea) {
        const match = linea.match(/\] (.+?) -/);
        return match ? match[1] : linea.replace(/\[[\d-T:.]+\]\s/, '');
    }

    agruparPorFecha(acciones) {
        const agrupado = {};
        
        acciones.forEach(accion => {
            const fecha = accion.fechaHora ? accion.fechaHora.split('T')[0] : 'sin-fecha';
            if (!agrupado[fecha]) {
                agrupado[fecha] = [];
            }
            agrupado[fecha].push(accion);
        });
        
        return agrupado;
    }

    filtrarPorTipo(acciones, tipo) {
        return acciones.filter(accion => 
            accion.tipoAccion?.toLowerCase() === tipo.toLowerCase() ||
            accion.tipo?.toLowerCase() === tipo.toLowerCase()
        );
    }

    calcularEstadisticas(acciones) {
        const total = acciones.length;
        const porTipo = {};
        const empleados = new Set();
        const sectores = new Set();
        
        acciones.forEach(accion => {
            // Contar por tipo
            const tipo = accion.tipoAccion || accion.tipo || 'DESCONOCIDO';
            porTipo[tipo] = (porTipo[tipo] || 0) + 1;
            
            // Contar empleados únicos
            if (accion.empleadoNombre || accion.empleado?.nombreCompleto) {
                empleados.add(accion.empleadoNombre || accion.empleado.nombreCompleto);
            }
            
            // Contar sectores únicos
            if (accion.sectorNombre || accion.sector?.nombre) {
                sectores.add(accion.sectorNombre || accion.sector.nombre);
            }
        });
        
        return {
            total,
            porTipo,
            empleadosUnicos: empleados.size,
            sectoresUnicos: sectores.size
        };
    }

    handleError(error) {
        if (error.response) {
            const { status, data } = error.response;
            
            if (status === 404) {
                error.message = 'Registro de historial no encontrado';
            } else if (status === 400) {
                error.message = data?.message || 'Parámetros inválidos en consulta de historial';
            } else if (status === 403) {
                error.message = 'No tienes permisos para acceder a este historial';
            } else if (status === 500) {
                error.message = 'Error interno del servidor consultando historial';
            }
        } else if (error.request) {
            error.message = 'Error de conexión al consultar historial';
        }
        
        console.error('Error en historialService:', error);
    }
}

export default new HistorialService();