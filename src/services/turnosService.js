import { apiClient } from './authService';

/**
 * Servicio para manejar operaciones con turnos
 */
class TurnosService {

    /**
     * Consultar turno por código (público)
     * @param {string} codigo - Código del turno (ej: INT001)
     * @returns {Promise<Object>} - Datos del turno
     */
    async consultarPorCodigo(codigo) {
        try {
            const response = await apiClient.get(`/turnos/codigo/${codigo}`);

            if (response.data.success) {
                return this.formatearParaUI(response.data.data);
            } else {
                throw new Error(response.data.message || 'Turno no encontrado');
            }
        } catch (error) {
            this.handleTurnosError(error);
            throw error;
        }
    }

    /**
     * Consultar turno por código y fecha específica (público)
     * @param {string} codigo - Código del turno
     * @param {string} fecha - Fecha en formato YYYY-MM-DD
     * @returns {Promise<Object>} - Datos del turno
     */
    async consultarPorCodigoYFecha(codigo, fecha) {
        try {
            const response = await apiClient.get(`/turnos/codigo/${codigo}/fecha/${fecha}`);

            if (response.data.success) {
                return this.formatearParaUI(response.data.data);
            } else {
                throw new Error(response.data.message || 'Turno no encontrado');
            }
        } catch (error) {
            this.handleTurnosError(error);
            throw error;
        }
    }

    /**
     * Obtener turno por ID
     * @param {number} id - ID del turno
     * @returns {Promise<Object>} - Datos del turno
     */
    async obtenerPorId(id) {
        try {
            const response = await apiClient.get(`/turnos/${id}`);

            if (response.data.success) {
                return this.formatearParaUI(response.data.data);
            } else {
                throw new Error(response.data.message || 'Turno no encontrado');
            }
        } catch (error) {
            this.handleTurnosError(error);
            throw error;
        }
    }

    /**
     * Obtener cola de espera de un sector
     * @param {number} sectorId - ID del sector
     * @returns {Promise<Array>} - Lista de turnos en cola
     */
    async obtenerColaEspera(sectorId) {
        try {
            const response = await apiClient.get(`/turnos/cola/${sectorId}`);

            if (response.data.success) {
                return response.data.data.map(turno => this.formatearParaUI(turno));
            } else {
                throw new Error(response.data.message || 'Error obteniendo cola de espera');
            }
        } catch (error) {
            this.handleTurnosError(error);
            throw error;
        }
    }

    /**
     * Obtener próximo turno de un sector
     * @param {number} sectorId - ID del sector
     * @returns {Promise<Object|null>} - Próximo turno o null si no hay
     */
    async obtenerProximoTurno(sectorId) {
        try {
            const response = await apiClient.get(`/turnos/proximo/${sectorId}`);

            if (response.data.success && response.data.data) {
                console.log('🔍 Raw backend response:', response.data.data);
                const formateado = this.formatearParaUI(response.data.data);
                console.log('🔍 Formatted turno:', formateado);
                return formateado;
            } else {
                return null; // No hay turnos pendientes
            }
        } catch (error) {
            if (error.response?.status === 404) {
                return null; // No hay turnos pendientes
            }
            this.handleTurnosError(error);
            throw error;
        }
    }

    /**
     * Obtener turnos pendientes por sector
     * @param {number} sectorId - ID del sector
     * @returns {Promise<Array>} - Lista de turnos pendientes
     */
    async obtenerTurnosPendientes(sectorId) {
        try {
            // CAMBIO: usar cola de espera que sí funciona y devuelve array
            const response = await apiClient.get(`/turnos/cola/${sectorId}`);

            if (response.data.success) {
                return response.data.data.map(turno => this.formatearParaUI(turno));
            } else {
                throw new Error(response.data.message || 'Error obteniendo turnos pendientes');
            }
        } catch (error) {
            this.handleTurnosError(error);
            throw error;
        }
    }

    /**
     * Obtener turnos de un ciudadano por DNI
     * @param {string} dni - DNI del ciudadano
     * @returns {Promise<Array>} - Lista de turnos del ciudadano
     */
    async obtenerTurnosCiudadano(dni) {
        try {
            const response = await apiClient.get(`/turnos/ciudadano/${dni}`);

            if (response.data.success) {
                return response.data.data.map(turno => this.formatearParaUI(turno));
            } else {
                throw new Error(response.data.message || 'Error obteniendo turnos del ciudadano');
            }
        } catch (error) {
            this.handleTurnosError(error);
            throw error;
        }
    }

    /**
     * Obtener turnos de un sector en una fecha específica
     * @param {number} sectorId - ID del sector
     * @param {string} fecha - Fecha en formato YYYY-MM-DD
     * @returns {Promise<Array>} - Lista de turnos del día
     */
    async obtenerTurnosDelDia(sectorId, fecha) {
        try {
            const response = await apiClient.get(`/turnos/sector/${sectorId}/fecha/${fecha}`);

            if (response.data.success) {
                return response.data.data.map(turno => this.formatearParaUI(turno));
            } else {
                throw new Error(response.data.message || 'Error obteniendo turnos del día');
            }
        } catch (error) {
            this.handleTurnosError(error);
            throw error;
        }
    }

    /**
     * Generar un nuevo turno
     * @param {Object} datosGeneracion - Datos para generar el turno
     * @returns {Promise<Object>} - Turno generado
     */
    async generarTurno(datosGeneracion) {
        try {
            const response = await apiClient.post('/turnos/generar', datosGeneracion);

            if (response.data.success) {
                return this.formatearParaUI(response.data.data);
            } else {
                throw new Error(response.data.message || 'Error generando turno');
            }
        } catch (error) {
            this.handleTurnosError(error);
            throw error;
        }
    }

    /**
     * Llamar un turno
     * @param {number} turnoId - ID del turno
     * @param {Object} datos - Datos del llamado (observaciones, etc.)
     * @returns {Promise<Object>} - Turno actualizado
     */
    async llamarTurno(turnoId, datos = {}) {
        try {
            const response = await apiClient.post(`/turnos/${turnoId}/llamar`, {
                turnoId: turnoId,
                observaciones: datos.observaciones || ''
            });

            if (response.data.success) {
                return this.formatearParaUI(response.data.data);
            } else {
                throw new Error(response.data.message || 'Error llamando turno');
            }
        } catch (error) {
            this.handleTurnosError(error);
            throw error;
        }
    }

    /**
     * Iniciar atención de un turno
     * @param {number} turnoId - ID del turno
     * @returns {Promise<Object>} - Turno actualizado
     */
    async iniciarAtencion(turnoId) {
        try {
            const response = await apiClient.post(`/turnos/${turnoId}/iniciar-atencion`);

            if (response.data.success) {
                return this.formatearParaUI(response.data.data);
            } else {
                throw new Error(response.data.message || 'Error iniciando atención');
            }
        } catch (error) {
            this.handleTurnosError(error);
            throw error;
        }
    }

    /**
     * Finalizar atención de un turno
     * @param {number} turnoId - ID del turno
     * @param {string} observaciones - Observaciones de finalización
     * @returns {Promise<Object>} - Turno finalizado
     */
    async finalizarAtencion(turnoId, observaciones = '') {
        try {
            const response = await apiClient.post(`/turnos/${turnoId}/finalizar`, {
                observaciones
            });

            if (response.data.success) {
                return this.formatearParaUI(response.data.data);
            } else {
                throw new Error(response.data.message || 'Error finalizando atención');
            }
        } catch (error) {
            this.handleTurnosError(error);
            throw error;
        }
    }

    /**
     * Marcar turno como ausente
     * @param {number} turnoId - ID del turno
     * @param {string} observaciones - Motivo de ausencia
     * @returns {Promise<Object>} - Turno marcado como ausente
     */
    async marcarAusente(turnoId, observaciones = '') {
        try {
            const response = await apiClient.post(`/turnos/${turnoId}/marcar-ausente`, {
                observaciones
            });

            if (response.data.success) {
                return this.formatearParaUI(response.data.data);
            } else {
                throw new Error(response.data.message || 'Error marcando como ausente');
            }
        } catch (error) {
            this.handleTurnosError(error);
            throw error;
        }
    }

    /**
     * Redirigir turno a otro sector
     * @param {number} turnoId - ID del turno
     * @param {number} nuevoSectorId - ID del nuevo sector
     * @param {string} motivo - Motivo de redirección
     * @param {string} observaciones - Observaciones adicionales
     * @returns {Promise<Object>} - Turno redirigido
     */
    async redirigirTurno(turnoId, nuevoSectorId, motivo, observaciones = '') {
        try {
            const response = await apiClient.post(`/turnos/${turnoId}/redirigir`, {
                nuevoSectorId,
                motivo,
                observaciones
            });

            if (response.data.success) {
                return this.formatearParaUI(response.data.data);
            } else {
                throw new Error(response.data.message || 'Error redirigiendo turno');
            }
        } catch (error) {
            this.handleTurnosError(error);
            throw error;
        }
    }

    /**
     * Formatear datos de turno para la UI
     * @param {Object} turno - Datos del turno desde API
     * @returns {Object} - Turno formateado para UI
     */
    formatearParaUI(turno) {
        if (!turno) return null;

        // Determinar si es un TurnoResponse completo o TurnoSummaryResponse
        const esTurnoCompleto = turno.ciudadano && typeof turno.ciudadano === 'object';

        if (esTurnoCompleto) {
            // Caso: TurnoResponse (objeto completo con objetos anidados)
            return {
                id: turno.id,
                codigo: turno.codigo,
                estado: turno.estado,
                estadoTexto: this.getEstadoTexto(turno.estado),
                estadoColor: this.getEstadoColor(turno.estado),
                fechaHoraCreacion: turno.fechaGeneracion || turno.fechaHoraCreacion,
                fechaHoraLlamado: turno.fechaLlamado || turno.fechaHoraLlamado,
                fechaHoraInicioAtencion: turno.fechaAtencion || turno.fechaHoraInicioAtencion,
                fechaHoraFin: turno.fechaFinalizacion || turno.fechaHoraFin,
                tipoTurno: turno.tipo,
                esPrioritario: turno.prioridad > 1,
                observaciones: turno.observaciones,
                ciudadano: turno.ciudadano ? {
                    id: turno.ciudadano.id,
                    dni: turno.ciudadano.dni,
                    nombreCompleto: turno.ciudadano.nombreCompleto,
                    esPrioritario: turno.ciudadano.esPrioritario || false
                } : null,
                sector: turno.sector ? {
                    id: turno.sector.id,
                    codigo: turno.sector.codigo,
                    nombre: turno.sector.nombre,
                    tipo: turno.sector.tipo
                } : null,
                empleadoLlamada: turno.empleadoLlamada || null,
                empleadoAtencion: turno.empleadoAtencion || null,
                fechaCita: turno.fechaCita,
                horaCita: turno.horaCita,
                tiempoEspera: turno.tiempoEspera,
                tiempoAtencion: turno.tiempoAtencion,
                // Estados de operaciones (calculados)
                puedeSerLlamado: this.puedeSerLlamado({ estado: turno.estado }),
                puedeIniciarAtencion: this.puedeIniciarAtencion({ estado: turno.estado }),
                puedeSerFinalizado: this.puedeSerFinalizado({ estado: turno.estado }),
                puedeSerRedirigido: this.puedeSerRedirigido({ estado: turno.estado })
            };
        } else {
            // Caso: TurnoSummaryResponse (campos planos)
            return {
                id: turno.id,
                codigo: turno.codigo,
                estado: turno.estado,
                estadoTexto: this.getEstadoTexto(turno.estado),
                estadoColor: this.getEstadoColor(turno.estado),
                fechaHoraCreacion: turno.fechaGeneracion,
                fechaHoraLlamado: null,
                fechaHoraInicioAtencion: null,
                fechaHoraFin: null,
                tipoTurno: turno.tipo,
                esPrioritario: turno.prioridad > 1,
                observaciones: null,
                ciudadano: {
                    dni: turno.ciudadanoDni,
                    nombreCompleto: turno.ciudadanoNombre || `DNI: ${turno.ciudadanoDni}`,
                    esPrioritario: turno.prioridad > 1
                },
                sector: {
                    codigo: turno.sectorCodigo,
                    nombre: turno.sectorNombre
                },
                empleadoLlamada: null,
                empleadoAtencion: turno.empleadoUsername ? {
                    username: turno.empleadoUsername
                } : null,
                fechaCita: null,
                horaCita: null,
                tiempoEspera: turno.tiempoEspera,
                tiempoAtencion: null,
                // Estados de operaciones (calculados)
                puedeSerLlamado: this.puedeSerLlamado({ estado: turno.estado }),
                puedeIniciarAtencion: this.puedeIniciarAtencion({ estado: turno.estado }),
                puedeSerFinalizado: this.puedeSerFinalizado({ estado: turno.estado }),
                puedeSerRedirigido: this.puedeSerRedirigido({ estado: turno.estado })
            };
        }
    }

    /**
     * Obtener texto descriptivo del estado
     */
    getEstadoTexto(estado) {
        const estados = {
            'GENERADO': 'En Espera',
            'LLAMADO': 'Llamado',
            'EN_ATENCION': 'En Atención',
            'FINALIZADO': 'Finalizado',
            'AUSENTE': 'Ausente',
            'REDIRIGIDO': 'Redirigido'
        };
        return estados[estado] || estado;
    }

    /**
     * Obtener color según estado
     */
    getEstadoColor(estado) {
        const colores = {
            'GENERADO': 'bg-blue-100 text-blue-800',
            'LLAMADO': 'bg-yellow-100 text-yellow-800',
            'EN_ATENCION': 'bg-green-100 text-green-800',
            'FINALIZADO': 'bg-gray-100 text-gray-800',
            'AUSENTE': 'bg-red-100 text-red-800',
            'REDIRIGIDO': 'bg-purple-100 text-purple-800'
        };
        return colores[estado] || 'bg-gray-100 text-gray-800';
    }

    /**
     * Calcular tiempo de espera
     */
    calcularTiempoEspera(turno) {
        if (!turno.fechaHoraCreacion) return null;

        const inicio = new Date(turno.fechaHoraCreacion);
        const fin = turno.fechaHoraLlamado ?
            new Date(turno.fechaHoraLlamado) :
            new Date();

        const diff = fin - inicio;
        return Math.floor(diff / 1000 / 60); // minutos
    }

    /**
     * Calcular tiempo de atención
     */
    calcularTiempoAtencion(turno) {
        if (!turno.fechaHoraInicioAtencion) return null;

        const inicio = new Date(turno.fechaHoraInicioAtencion);
        const fin = turno.fechaHoraFin ?
            new Date(turno.fechaHoraFin) :
            new Date();

        const diff = fin - inicio;
        return Math.floor(diff / 1000 / 60); // minutos
    }

    /**
     * Método de debug para ver la estructura de datos
     */
    debugTurno(turno, origen = 'unknown') {
        console.log(`🔍 Debug Turno [${origen}]:`, {
            raw: turno,
            hasId: !!turno?.id,
            hasCiudadanoObject: turno?.ciudadano && typeof turno.ciudadano === 'object',
            hasCiudadanoNombre: !!turno?.ciudadanoNombre,
            structure: typeof turno?.ciudadano,
            keys: turno ? Object.keys(turno) : 'null'
        });
    }

    /**
     * Verificar si un turno puede ser llamado
     */
    puedeSerLlamado(turno) {
        return turno.estado === 'GENERADO';
    }

    /**
     * Verificar si un turno puede iniciar atención
     */
    puedeIniciarAtencion(turno) {
        return turno.estado === 'LLAMADO';
    }

    /**
     * Verificar si un turno puede ser finalizado
     */
    puedeSerFinalizado(turno) {
        return turno.estado === 'EN_ATENCION';
    }

    /**
     * Verificar si un turno puede ser redirigido
     */
    puedeSerRedirigido(turno) {
        return ['GENERADO', 'LLAMADO', 'EN_ATENCION'].includes(turno.estado);
    }

    /**
     * Manejar errores específicos de turnos
     * @param {Error} error - Error capturado
     */
    handleTurnosError(error) {
        if (error.response) {
            const { status, data } = error.response;

            if (status === 404) {
                error.message = 'Turno no encontrado';
            } else if (status === 400) {
                if (data?.errorCode === 'TURNO_INVALID_STATE') {
                    error.message = 'El turno no está en estado válido para esta operación';
                } else if (data?.errorCode === 'CITIZEN_PENDING_TURN') {
                    error.message = 'El ciudadano ya tiene un turno pendiente';
                } else if (data?.errorCode === 'SECTOR_INACTIVE') {
                    error.message = 'El sector no está activo';
                } else {
                    error.message = data?.message || 'Error en los datos del turno';
                }
            } else if (status === 403) {
                error.message = 'No tienes permisos para esta operación';
            } else if (status === 409) {
                error.message = 'Conflicto: La operación no se puede realizar';
            }
        } else if (error.request) {
            error.message = 'Error de conexión al gestionar turnos';
        }
    }
    
    construirNombreCompleto(ciudadano) {
        if (!ciudadano) return 'Sin información';

        // Si viene nombreCompleto desde el backend y está OK, usarlo
        if (ciudadano.nombreCompleto &&
            ciudadano.nombreCompleto !== 'undefined undefined' &&
            ciudadano.nombreCompleto !== 'null null' &&
            ciudadano.nombreCompleto !== 'Sin apellido, Sin nombre' &&
            !ciudadano.nombreCompleto.includes('�')) {
            return ciudadano.nombreCompleto;
        }

        // Si hay campos individuales, construir desde ahí
        if (ciudadano.nombre || ciudadano.apellido) {
            const nombre = (ciudadano.nombre && ciudadano.nombre !== 'null')
                ? ciudadano.nombre.trim()
                : 'Sin nombre';
            const apellido = (ciudadano.apellido && ciudadano.apellido !== 'null')
                ? ciudadano.apellido.trim()
                : 'Sin apellido';
            return `${apellido}, ${nombre}`;
        }

        // Si solo hay DNI, usar como fallback
        if (ciudadano.dni && ciudadano.dni !== 'null') {
            return `Ciudadano DNI: ${ciudadano.dni}`;
        }

        return 'Datos no disponibles';
    }

}

// Exportar instancia singleton del servicio
const turnosService = new TurnosService();
export default turnosService;