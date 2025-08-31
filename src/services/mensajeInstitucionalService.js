/**
 * Servicio para gestión de mensajes institucionales
 * Maneja todos los endpoints relacionados con mensajes para pantallas
 */
import { apiClient } from './authService';

class MensajeInstitucionalService {
    constructor() {
        this.baseURL = '/mensajes-institucionales';
    }

    // ==========================================
    // MÉTODOS PRINCIPALES DE CONSULTA
    // ==========================================

    /**
     * Obtener mensajes vigentes para pantallas públicas
     * @returns {Promise<Array>} - Lista de mensajes vigentes
     */
    async obtenerMensajesVigentes() {
        try {
            const response = await apiClient.get(`${this.baseURL}/vigentes`);

            if (response.data.success) {
                return response.data.data.map(mensaje => this.formatearParaUI(mensaje));
            } else {
                throw new Error(response.data.message || 'Error obteniendo mensajes vigentes');
            }
        } catch (error) {
            this.handleMensajeError(error);
            throw error;
        }
    }

    /**
     * Obtener mensajes por configuración (vista pública)
     * @param {number} configuracionId - ID de la configuración
     * @returns {Promise<Array>} - Lista de mensajes activos
     */
    async obtenerMensajesPorConfiguracion(configuracionId) {
        try {
            const response = await apiClient.get(`${this.baseURL}/configuracion/${configuracionId}`);

            if (response.data.success) {
                return response.data.data.map(mensaje => this.formatearParaUI(mensaje));
            } else {
                throw new Error(response.data.message || 'Error obteniendo mensajes por configuración');
            }
        } catch (error) {
            this.handleMensajeError(error);
            throw error;
        }
    }

    /**
     * Obtener todos los mensajes por configuración (vista admin)
     * @param {number} configuracionId - ID de la configuración
     * @returns {Promise<Array>} - Lista completa de mensajes
     */
    async obtenerMensajesAdminPorConfiguracion(configuracionId) {
        try {
            const response = await apiClient.get(`${this.baseURL}/admin/configuracion/${configuracionId}`);

            if (response.data.success) {
                return response.data.data.map(mensaje => this.formatearParaUI(mensaje));
            } else {
                throw new Error(response.data.message || 'Error obteniendo mensajes (vista admin)');
            }
        } catch (error) {
            this.handleMensajeError(error);
            throw error;
        }
    }

    /**
     * Obtener mensaje específico por ID
     * @param {number} id - ID del mensaje
     * @returns {Promise<Object>} - Mensaje completo
     */
    async obtenerPorId(id) {
        try {
            const response = await apiClient.get(`${this.baseURL}/${id}`);

            if (response.data.success) {
                return this.formatearParaUI(response.data.data);
            } else {
                throw new Error(response.data.message || 'Error obteniendo mensaje');
            }
        } catch (error) {
            this.handleMensajeError(error);
            throw error;
        }
    }

    // ==========================================
    // MÉTODOS DE CREACIÓN Y ACTUALIZACIÓN
    // ==========================================

    /**
     * Crear nuevo mensaje institucional
     * @param {number} configuracionId - ID de la configuración
     * @param {Object} mensajeData - Datos del mensaje
     * @returns {Promise<Object>} - Mensaje creado
     */
    async crear(configuracionId, mensajeData) {
        try {
            const response = await apiClient.post(`${this.baseURL}/configuracion/${configuracionId}`, mensajeData);

            if (response.data.success) {
                return this.formatearParaUI(response.data.data);
            } else {
                throw new Error(response.data.message || 'Error creando mensaje');
            }
        } catch (error) {
            this.handleMensajeError(error);
            throw error;
        }
    }

    // ==========================================
    // MÉTODOS DE GESTIÓN DE ESTADO
    // ==========================================

    /**
     * Activar mensaje
     * @param {number} id - ID del mensaje
     * @returns {Promise<Object>} - Mensaje actualizado
     */
    async activar(id) {
        try {
            const response = await apiClient.put(`${this.baseURL}/${id}/activar`);

            if (response.data.success) {
                return this.formatearParaUI(response.data.data);
            } else {
                throw new Error(response.data.message || 'Error activando mensaje');
            }
        } catch (error) {
            this.handleMensajeError(error);
            throw error;
        }
    }

    /**
     * Desactivar mensaje
     * @param {number} id - ID del mensaje
     * @returns {Promise<Object>} - Mensaje actualizado
     */
    async desactivar(id) {
        try {
            const response = await apiClient.put(`${this.baseURL}/${id}/desactivar`);

            if (response.data.success) {
                return this.formatearParaUI(response.data.data);
            } else {
                throw new Error(response.data.message || 'Error desactivando mensaje');
            }
        } catch (error) {
            this.handleMensajeError(error);
            throw error;
        }
    }

    /**
     * Establecer vigencia de mensaje
     * @param {number} id - ID del mensaje
     * @param {Object} vigenciaData - Datos de vigencia {fechaInicio, fechaFin}
     * @returns {Promise<Object>} - Mensaje actualizado
     */
    async establecerVigencia(id, vigenciaData) {
        try {
            const response = await apiClient.put(`${this.baseURL}/${id}/vigencia`, vigenciaData);

            if (response.data.success) {
                return this.formatearParaUI(response.data.data);
            } else {
                throw new Error(response.data.message || 'Error estableciendo vigencia');
            }
        } catch (error) {
            this.handleMensajeError(error);
            throw error;
        }
    }

    /**
     * Eliminar mensaje
     * @param {number} id - ID del mensaje
     * @returns {Promise<string>} - Mensaje de confirmación
     */
    async eliminar(id) {
        try {
            const response = await apiClient.delete(`${this.baseURL}/${id}`);

            if (response.data.success) {
                return response.data.message;
            } else {
                throw new Error(response.data.message || 'Error eliminando mensaje');
            }
        } catch (error) {
            this.handleMensajeError(error);
            throw error;
        }
    }

    // ==========================================
    // MÉTODOS DE UTILIDAD
    // ==========================================

    /**
     * Formatear mensaje para mostrar en UI
     * @param {Object} mensaje - Mensaje a formatear
     * @returns {Object} - Mensaje formateado
     */
    formatearParaUI(mensaje) {
        if (!mensaje) return null;

        return {
            ...mensaje,
            estadoLabel: mensaje.activo ? 'Activo' : 'Inactivo',
            estadoColor: mensaje.activo ? 'text-green-800' : 'text-red-800',
            estadoBg: mensaje.activo ? 'bg-green-50' : 'bg-red-50',
            tipoLabel: this.getTipoLabel(mensaje.tipo),
            tipoColor: this.getTipoColor(mensaje.tipo),
            fechaCreacionFormateada: mensaje.fechaCreacion
                ? new Date(mensaje.fechaCreacion).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })
                : '',
            fechaInicioFormateada: mensaje.fechaInicio
                ? new Date(mensaje.fechaInicio).toLocaleDateString('es-ES')
                : '',
            fechaFinFormateada: mensaje.fechaFin
                ? new Date(mensaje.fechaFin).toLocaleDateString('es-ES')
                : '',
            duracionFormateada: `${mensaje.duracion} seg.`,
            tieneFechas: mensaje.fechaInicio && mensaje.fechaFin,
            esVigente: this.esVigente(mensaje),
            requiereArchivo: ['IMAGEN', 'VIDEO'].includes(mensaje.tipo)
        };
    }

    /**
     * Obtener etiqueta del tipo de mensaje
     * @param {string} tipo - Tipo del mensaje
     * @returns {string} - Etiqueta formateada
     */
    getTipoLabel(tipo) {
        const tipos = {
            'TEXTO': 'Texto',
            'IMAGEN': 'Imagen',
            'VIDEO': 'Video'
        };
        return tipos[tipo] || tipo;
    }

    /**
     * Obtener color del tipo de mensaje
     * @param {string} tipo - Tipo del mensaje
     * @returns {string} - Clase de color
     */
    getTipoColor(tipo) {
        const colores = {
            'TEXTO': 'text-blue-800',
            'IMAGEN': 'text-green-800',
            'VIDEO': 'text-purple-800'
        };
        return colores[tipo] || 'text-slate-800';
    }

    /**
     * Verificar si un mensaje está vigente
     * @param {Object} mensaje - Mensaje a verificar
     * @returns {boolean} - True si está vigente
     */
    esVigente(mensaje) {
        if (!mensaje.fechaInicio || !mensaje.fechaFin) {
            return mensaje.activo; // Si no tiene fechas, solo depende del estado activo
        }

        const ahora = new Date();
        const inicio = new Date(mensaje.fechaInicio);
        const fin = new Date(mensaje.fechaFin);

        return mensaje.activo && ahora >= inicio && ahora <= fin;
    }

    /**
     * Validar datos del mensaje antes de enviar
     * @param {Object} mensajeData - Datos del mensaje
     * @returns {Object} - Objeto con validación {valid: boolean, errors: string[]}
     */
    validarMensaje(mensajeData) {
        const errors = [];

        // Validar tipo
        if (!mensajeData.tipo) {
            errors.push('El tipo de mensaje es obligatorio');
        }

        // Validar duración
        if (!mensajeData.duracion || mensajeData.duracion < 3 || mensajeData.duracion > 60) {
            errors.push('La duración debe estar entre 3 y 60 segundos');
        }

        // Validar contenido según tipo
        if (mensajeData.tipo === 'TEXTO' && !mensajeData.contenido) {
            errors.push('El contenido es obligatorio para mensajes de texto');
        }

        if (['IMAGEN', 'VIDEO'].includes(mensajeData.tipo)) {
            if (!mensajeData.titulo) {
                errors.push('El título es obligatorio para mensajes con archivo');
            }
            if (!mensajeData.rutaArchivo) {
                errors.push('La ruta del archivo es obligatoria para este tipo de mensaje');
            }
        }

        // Validar fechas de vigencia
        if (mensajeData.fechaInicio && mensajeData.fechaFin) {
            const inicio = new Date(mensajeData.fechaInicio);
            const fin = new Date(mensajeData.fechaFin);

            if (fin <= inicio) {
                errors.push('La fecha de fin debe ser posterior a la fecha de inicio');
            }
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * Manejo de errores específicos para mensajes
     * @param {Error} error - Error a manejar
     */
    handleMensajeError(error) {
        console.error('Error en MensajeInstitucionalService:', error);

        // Errores específicos de validación
        if (error.response?.status === 400) {
            const data = error.response.data;
            if (data.code === 'MISSING_FILE_PATH') {
                throw new Error('La ruta del archivo es obligatoria para mensajes de imagen y video');
            } else if (data.code === 'INVALID_DATE_RANGE') {
                throw new Error('La fecha de fin no puede ser anterior a la fecha de inicio');
            }
        }

        // Error de recurso no encontrado
        if (error.response?.status === 404) {
            throw new Error('El mensaje solicitado no existe');
        }

        // Error de autorización
        if (error.response?.status === 403) {
            throw new Error('No tiene permisos para realizar esta acción');
        }

        // Error genérico de servidor
        if (error.response?.status >= 500) {
            throw new Error('Error interno del servidor. Intente nuevamente');
        }

        // Si es un error de red
        if (!error.response) {
            throw new Error('Error de conexión. Verifique su conexión a internet');
        }

        // Error genérico
        throw new Error(error.response?.data?.message || error.message || 'Error inesperado');
    }
}

// Exportar instancia única
const mensajeInstitucionalService = new MensajeInstitucionalService();
export default mensajeInstitucionalService;