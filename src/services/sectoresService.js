import { apiClient } from './authService';

/**
 * Servicio para manejar operaciones con sectores
 */
class SectoresService {

    /**
     * Obtener todos los sectores
     * @returns {Promise<Array>} - Lista de sectores
     */
    async obtenerTodos() {
        try {
            const response = await apiClient.get('/sectores');

            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Error obteniendo sectores');
            }
        } catch (error) {
            this.handleSectoresError(error);
            throw error;
        }
    }

    /**
     * Obtener sector por ID
     * @param {number} id - ID del sector
     * @returns {Promise<Object>} - Sector encontrado
     */
    async obtenerPorId(id) {
        try {
            const response = await apiClient.get(`/sectores/${id}`);

            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Sector no encontrado');
            }
        } catch (error) {
            this.handleSectoresError(error);
            throw error;
        }
    }

    /**
     * Obtener información completa de un sector
     * @param {number} id - ID del sector
     * @returns {Promise<Object>} - Sector con información completa
     */
    async obtenerCompleto(id) {
        try {
            const response = await apiClient.get(`/sectores/${id}/completo`);

            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Error obteniendo información completa');
            }
        } catch (error) {
            this.handleSectoresError(error);
            throw error;
        }
    }

    /**
     * Obtener sector por código
     * @param {string} codigo - Código del sector
     * @returns {Promise<Object>} - Sector encontrado
     */
    async obtenerPorCodigo(codigo) {
        try {
            const response = await apiClient.get(`/sectores/codigo/${codigo}`);

            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Sector no encontrado');
            }
        } catch (error) {
            this.handleSectoresError(error);
            throw error;
        }
    }

    /**
     * Verificar si existe un sector con el código especificado
     * @param {string} codigo - Código del sector
     * @returns {Promise<boolean>} - True si existe
     */
    async existeCodigo(codigo) {
        try {
            const response = await apiClient.get(`/sectores/existe/${codigo}`);

            if (response.data.success) {
                return response.data.data.existe || false;
            } else {
                return false;
            }
        } catch (error) {
            // En caso de error, asumimos que no existe
            return false;
        }
    }

    /**
     * Crear nuevo sector
     * @param {Object} sectorData - Datos del sector
     * @returns {Promise<Object>} - Sector creado
     */
    async crear(sectorData) {
        try {
            // Validar datos requeridos
            this.validarDatosSector(sectorData);

            const response = await apiClient.post('/sectores', sectorData);

            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Error creando sector');
            }
        } catch (error) {
            this.handleSectoresError(error);
            throw error;
        }
    }

    /**
     * Actualizar sector existente
     * @param {string} codigo - Código del sector a actualizar
     * @param {Object} sectorData - Datos actualizados
     * @returns {Promise<Object>} - Sector actualizado
     */
    async actualizar(codigo, sectorData) {
        try {
            // Validar datos requeridos
            this.validarDatosSector(sectorData, false);

            const response = await apiClient.put(`/sectores/${codigo}`, sectorData);

            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Error actualizando sector');
            }
        } catch (error) {
            this.handleSectoresError(error);
            throw error;
        }
    }

    /**
     * Activar sector
     * @param {number} id - ID del sector
     * @returns {Promise<Object>} - Sector actualizado
     */
    async activar(id) {
        try {
            const response = await apiClient.patch(`/sectores/${id}/activar`);

            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Error activando sector');
            }
        } catch (error) {
            this.handleSectoresError(error);
            throw error;
        }
    }

    /**
     * Desactivar sector
     * @param {number} id - ID del sector
     * @returns {Promise<Object>} - Sector actualizado
     */
    async desactivar(id) {
        try {
            const response = await apiClient.patch(`/sectores/${id}/desactivar`);

            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Error desactivando sector');
            }
        } catch (error) {
            this.handleSectoresError(error);
            throw error;
        }
    }

    /**
     * Asignar responsable a un sector
     * @param {number} sectorId - ID del sector
     * @param {number} empleadoId - ID del empleado
     * @returns {Promise<Object>} - Sector actualizado
     */
    async asignarResponsable(sectorId, empleadoId) {
        try {
            const response = await apiClient.post(`/sectores/${sectorId}/responsable`, {
                empleadoId: empleadoId
            });

            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Error asignando responsable');
            }
        } catch (error) {
            this.handleSectoresError(error);
            throw error;
        }
    }

    /**
     * Obtener sectores públicos (para ciudadanos)
     * @returns {Promise<Array>} - Lista de sectores públicos
     */
    async obtenerPublicos() {
        try {
            const response = await apiClient.get('/sectores/publicos');

            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Error obteniendo sectores públicos');
            }
        } catch (error) {
            this.handleSectoresError(error);
            throw error;
        }
    }

    /**
     * Obtener sectores especiales (con cita previa)
     * @returns {Promise<Array>} - Lista de sectores especiales
     */
    async obtenerEspeciales() {
        try {
            const response = await apiClient.get('/sectores/especiales');

            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Error obteniendo sectores especiales');
            }
        } catch (error) {
            this.handleSectoresError(error);
            throw error;
        }
    }

    /**
     * Validar datos del sector antes de enviar
     * @param {Object} sectorData - Datos a validar
     * @param {boolean} esCreacion - Si es para creación (requiere código)
     */
    validarDatosSector(sectorData, esCreacion = true) {
        if (!sectorData) {
            throw new Error('Los datos del sector son requeridos');
        }

        if (esCreacion && (!sectorData.codigo || sectorData.codigo.trim() === '')) {
            throw new Error('El código del sector es requerido');
        }

        if (!sectorData.nombre || sectorData.nombre.trim() === '') {
            throw new Error('El nombre del sector es requerido');
        }

        if (sectorData.tipoSector && !['NORMAL', 'ESPECIAL'].includes(sectorData.tipoSector)) {
            throw new Error('El tipo de sector debe ser NORMAL o ESPECIAL');
        }

        if (sectorData.capacidadMaxima && sectorData.capacidadMaxima < 1) {
            throw new Error('La capacidad máxima debe ser mayor a 0');
        }

        if (sectorData.tiempoEstimadoAtencion && sectorData.tiempoEstimadoAtencion < 1) {
            throw new Error('El tiempo estimado debe ser mayor a 0');
        }

        // Validar formato de color si se proporciona
        if (sectorData.color) {
            const colorRegex = /^#[0-9A-Fa-f]{6}$/;
            if (!colorRegex.test(sectorData.color)) {
                throw new Error('El color debe estar en formato hexadecimal (#RRGGBB)');
            }
        }
    }

    /**
     * Obtener opciones para formularios
     * @returns {Object} - Opciones disponibles
     */
    getOpcionesFormulario() {
        return {
            tiposSector: [
                { value: 'NORMAL', label: 'Normal', description: 'Acceso directo sin cita previa' },
                { value: 'ESPECIAL', label: 'Especial', description: 'Requiere cita previa' }
            ],
            coloresDisponibles: [
                '#FF9500', // Naranja
                '#007AFF', // Azul
                '#34C759', // Verde
                '#FF3B30', // Rojo
                '#AF52DE', // Púrpura
                '#FF9F0A', // Amarillo
                '#5AC8FA', // Azul claro
                '#FFCC00', // Dorado
                '#FF6B6B', // Rosa
                '#4ECDC4'  // Turquesa
            ],
            capacidadDefault: 10,
            tiempoDefault: 15
        };
    }

    /**
     * Formatear sector para mostrar en UI
     * @param {Object} sector - Sector a formatear
     * @returns {Object} - Sector formateado
     */
    formatearParaUI(sector) {
        if (!sector) return null;

        return {
            ...sector,
            tipoSectorLabel: sector.tipoSector === 'ESPECIAL' ? 'Especial' : 'Normal',
            estadoLabel: sector.activo ? 'Activo' : 'Inactivo',
            estadoColor: sector.activo ? 'text-green-600' : 'text-red-600',
            estadoBg: sector.activo ? 'bg-green-50' : 'bg-red-50',
            requiereCitaLabel: sector.requiereCitaPrevia ? 'Sí' : 'No',
            tiempoEstimadoFormatted: `${sector.tiempoEstimadoAtencion || 0} min`,
            responsableNombre: sector.responsable ?
                `${sector.responsable.nombre || ''} ${sector.responsable.apellido || ''}`.trim() :
                (sector.empleadoResponsable ?
                    `${sector.empleadoResponsable.nombre || ''} ${sector.empleadoResponsable.apellido || ''}`.trim() :
                    'Sin asignar')
        };
    }

    /**
     * Manejar errores específicos de sectores
     * @param {Error} error 
     */
    handleSectoresError(error) {
        if (error.response) {
            const { status, data } = error.response;

            // Extraer mensaje de error del wrapper ApiResponseWrapper
            if (data?.message) {
                error.message = data.message;
            } else if (data?.error?.detail) {
                error.message = data.error.detail;
            }

            // Errores específicos de sectores
            if (status === 409) {
                error.message = 'El código del sector ya existe';
            } else if (status === 404) {
                error.message = 'Sector no encontrado';
            } else if (status === 403) {
                error.message = 'No tienes permisos para esta operación';
            }
        } else if (error.request) {
            error.message = 'Error de conexión al gestionar sectores';
        }
    }

    /**
 * Listar sectores especiales (alias para obtenerEspeciales)
 * @returns {Promise<Array>} - Lista de sectores especiales
 */
    async listarEspeciales() {
        return await this.obtenerEspeciales();
    }







}

// Exportar instancia singleton del servicio
const sectoresService = new SectoresService();
export default sectoresService;