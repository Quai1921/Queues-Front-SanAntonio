import { apiClient } from './authService';

/**
 * Servicio para gestión de configuraciones de pantalla
 */
class ConfiguracionPantallaService {

    // ==========================================
    // MÉTODOS PRINCIPALES DE CONSULTA
    // ==========================================

    /**
     * Obtener configuración activa para pantallas
     * @returns {Promise<Object|null>} - Configuración activa
     */
    async obtenerConfiguracionActiva() {
        try {
            const response = await apiClient.get('/configuraciones-pantalla/activa');
            console.log('=== DEBUG CONFIGURACIONES ===');
            console.log('Response completo:', response.data);
            console.log('Data array:', response.data.data);
            if (response.data.data && response.data.data[0]) {
                console.log('Primera configuración:', response.data.data[0]);
            }
            return response.data.success ? response.data.data : null;
        } catch (error) {
            this.handleConfiguracionError(error);
            throw error;
        }
    }

    /**
     * Listar todas las configuraciones (solo para administradores)
     * @returns {Promise<Array>} - Lista de configuraciones
     */
    async obtenerTodas() {
        try {
            const response = await apiClient.get('/configuraciones-pantalla');
            console.log('=== RESPONSE CONFIGURACIONES ===');
            console.log('Response status:', response.status);
            console.log('Response data:', response.data);
            console.log('Configuraciones recibidas:', response.data.data);
            if (response.data.data && response.data.data[0]) {
                console.log('Primera configuración completa:', response.data.data[0]);
            }
            console.log('=== FIN DEBUG ===');
            if (response.data.success) {
                return response.data.data.map(config => this.formatearParaUI(config));
            } else {
                throw new Error(response.data.message || 'Error obteniendo configuraciones');
            }
        } catch (error) {
            this.handleConfiguracionError(error);
            throw error;
        }
    }

    /**
     * Obtener configuración específica por ID
     * @param {number} id - ID de la configuración
     * @returns {Promise<Object>} - Configuración detallada
     */
    async obtenerPorId(id) {
        try {
            const response = await apiClient.get(`/configuraciones-pantalla/${id}`);
            if (response.data.success) {
                return this.formatearParaUI(response.data.data);
            } else {
                throw new Error(response.data.message || 'Error obteniendo configuración');
            }
        } catch (error) {
            this.handleConfiguracionError(error);
            throw error;
        }
    }

    // ==========================================
    // MÉTODOS DE CREACIÓN Y ACTUALIZACIÓN
    // ==========================================

    /**
     * Crear nueva configuración de pantalla
     * @param {Object} configuracionData - Datos de la configuración
     * @returns {Promise<Object>} - Configuración creada
     */
    async crear(configuracionData) {
        try {
            this.validarDatosConfiguracion(configuracionData, true);

            const response = await apiClient.post('/configuraciones-pantalla', configuracionData);

            if (response.data.success) {
                return this.formatearParaUI(response.data.data);
            } else {
                throw new Error(response.data.message || 'Error creando configuración');
            }
        } catch (error) {
            this.handleConfiguracionError(error);
            throw error;
        }
    }

    /**
     * Actualizar configuración existente
     * @param {number} id - ID de la configuración
     * @param {Object} configuracionData - Datos actualizados
     * @returns {Promise<Object>} - Configuración actualizada
     */
    async actualizar(id, configuracionData) {
        try {
            this.validarDatosConfiguracion(configuracionData, false);

            const response = await apiClient.put(`/configuraciones-pantalla/${id}`, configuracionData);

            if (response.data.success) {
                return this.formatearParaUI(response.data.data);
            } else {
                throw new Error(response.data.message || 'Error actualizando configuración');
            }
        } catch (error) {
            this.handleConfiguracionError(error);
            throw error;
        }
    }

    // ==========================================
    // MÉTODOS DE GESTIÓN DE ESTADO
    // ==========================================

    /**
     * Activar una configuración específica (desactiva las demás)
     * @param {number} id - ID de la configuración
     * @returns {Promise<Object>} - Configuración activada
     */
    async activar(id) {
        try {
            const response = await apiClient.put(`/configuraciones-pantalla/${id}/activar`);

            if (response.data.success) {
                return this.formatearParaUI(response.data.data);
            } else {
                throw new Error(response.data.message || 'Error activando configuración');
            }
        } catch (error) {
            this.handleConfiguracionError(error);
            throw error;
        }
    }

    // ==========================================
    // MÉTODOS DE CONFIGURACIÓN ESPECÍFICA
    // ==========================================

    /**
     * Configurar sonido de una configuración
     * @param {number} id - ID de la configuración
     * @param {Object} configuracionSonido - Configuración de sonido
     * @returns {Promise<string>} - Mensaje de éxito
     */
    async configurarSonido(id, configuracionSonido) {
        try {
            const response = await apiClient.put(`/configuraciones-pantalla/${id}/sonido`, configuracionSonido);

            if (response.data.success) {
                return response.data.message;
            } else {
                throw new Error(response.data.message || 'Error configurando sonido');
            }
        } catch (error) {
            this.handleConfiguracionError(error);
            throw error;
        }
    }

    /**
     * Configurar apariencia de una configuración
     * @param {number} id - ID de la configuración
     * @param {Object} configuracionApariencia - Configuración de apariencia
     * @returns {Promise<string>} - Mensaje de éxito
     */
    async configurarApariencia(id, configuracionApariencia) {
        try {
            const response = await apiClient.put(`/configuraciones-pantalla/${id}/apariencia`, configuracionApariencia);

            if (response.data.success) {
                return response.data.message;
            } else {
                throw new Error(response.data.message || 'Error configurando apariencia');
            }
        } catch (error) {
            this.handleConfiguracionError(error);
            throw error;
        }
    }

    // ==========================================
    // MÉTODOS DE UTILIDAD
    // ==========================================

    /**
     * Formatear configuración para mostrar en UI
     * @param {Object} configuracion - Configuración a formatear
     * @returns {Object} - Configuración formateada
     */
    formatearParaUI(configuracion) {
        if (!configuracion) return null;

        return {
            ...configuracion,
            estadoLabel: configuracion.activo ? 'Activa' : 'Inactiva',
            estadoColor: configuracion.activo ? 'text-green-800' : 'text-slate-600',
            estadoBg: configuracion.activo ? 'bg-green-50' : 'bg-slate-50',
            sonidoLabel: configuracion.sonidoActivo ? 'Activado' : 'Desactivado',
            sonidoColor: configuracion.sonidoActivo ? 'text-green-600' : 'text-red-600',
            // temaLabel: this.getTemaLabel(configuracion.temaColor),
            temaLabel: this.getTemaLabel(configuracion.temaColor),
            temaColor: configuracion.temaColor,
            logoLabel: configuracion.mostrarLogo ? 'Mostrar' : 'Ocultar',
            fechaCreacionFormateada: configuracion.fechaCreacion
                ? new Date(configuracion.fechaCreacion).toLocaleDateString('es-ES')
                : '',
            fechaModificacionFormateada: configuracion.fechaModificacion
                ? new Date(configuracion.fechaModificacion).toLocaleDateString('es-ES')
                : ''
        };
    }

    /**
     * Obtener label del tema de color
     * @param {string} tema - Tema de color
     * @returns {string} - Label del tema
     */
    getTemaLabel(tema) {
        const temas = {
            'default': 'Por Defecto',
            'blue': 'Azul',
            'green': 'Verde',
            'red': 'Rojo',
            'purple': 'Morado',
            'orange': 'Naranja',
            'dark': 'Oscuro',
            'light': 'Claro'
        };
        return temas[tema] || tema || 'Por Defecto';
    }

    /**
     * Validar datos de la configuración
     * @param {Object} configuracionData - Datos a validar
     * @param {boolean} esCreacion - Si es para creación
     */
    validarDatosConfiguracion(configuracionData, esCreacion = false) {
        if (!configuracionData) {
            throw new Error('Los datos de la configuración son requeridos');
        }

        // Validaciones para creación
        if (esCreacion) {
            if (!configuracionData.nombre || configuracionData.nombre.trim().length < 3) {
                throw new Error('El nombre debe tener al menos 3 caracteres');
            }

            if (!configuracionData.tiempoMensaje || configuracionData.tiempoMensaje < 3 || configuracionData.tiempoMensaje > 60) {
                throw new Error('El tiempo de mensaje debe estar entre 3 y 60 segundos');
            }

            if (!configuracionData.tiempoTurno || configuracionData.tiempoTurno < 3 || configuracionData.tiempoTurno > 30) {
                throw new Error('El tiempo de turno debe estar entre 3 y 30 segundos');
            }
        }

        // Validaciones comunes
        if (configuracionData.nombre && configuracionData.nombre.length > 100) {
            throw new Error('El nombre no puede exceder 100 caracteres');
        }

        if (configuracionData.textoEncabezado && configuracionData.textoEncabezado.length > 200) {
            throw new Error('El texto del encabezado no puede exceder 200 caracteres');
        }

        if (configuracionData.volumenSonido && (configuracionData.volumenSonido < 0 || configuracionData.volumenSonido > 100)) {
            throw new Error('El volumen debe estar entre 0 y 100');
        }

        if (configuracionData.rutaLogo && configuracionData.rutaLogo.length > 200) {
            throw new Error('La ruta del logo no puede exceder 200 caracteres');
        }

        if (configuracionData.archivoSonido && configuracionData.archivoSonido.length > 200) {
            throw new Error('La ruta del archivo de sonido no puede exceder 200 caracteres');
        }
    }

    /**
     * Manejar errores específicos de configuraciones
     * @param {Error} error - Error a procesar
     */
    handleConfiguracionError(error) {
        if (error.response) {
            const { status, data } = error.response;

            if (status === 409) {
                if (data?.errorCode === 'CONFIGURATION_DUPLICATE') {
                    error.message = 'Ya existe una configuración con ese nombre';
                } else {
                    error.message = 'Ya existe una configuración con esos datos';
                }
            } else if (status === 404) {
                error.message = 'Configuración no encontrada';
            } else if (status === 403) {
                error.message = 'No tienes permisos para esta operación';
            } else if (status === 400) {
                if (data?.errorCode === 'VALIDATION_ERROR') {
                    error.message = data.message || 'Datos de configuración inválidos';
                }
            }
        } else if (error.request) {
            error.message = 'Error de conexión al gestionar configuraciones';
        }
    }

    /**
     * Obtener opciones de temas disponibles
     * @returns {Array} - Lista de temas disponibles
     */
    obtenerTemasDisponibles() {
        return [
            { value: 'default', label: 'Por Defecto', color: '#224666' },
            { value: 'blue', label: 'Azul', color: '#2563EB' },
            { value: 'green', label: 'Verde', color: '#059669' },
            { value: 'red', label: 'Rojo', color: '#DC2626' },
            { value: 'purple', label: 'Morado', color: '#7C3AED' },
            { value: 'orange', label: 'Naranja', color: '#EA580C' },
            { value: 'dark', label: 'Oscuro', color: '#1F2937' },
            { value: 'light', label: 'Claro', color: '#F8FAFC' }
        ];
    }
}

// Exportar instancia singleton del servicio
const configuracionPantallaService = new ConfiguracionPantallaService();
export default configuracionPantallaService;