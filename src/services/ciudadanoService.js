import { apiClient } from './authService';

/**
 * Servicio para la gestión de ciudadanos
 * Incluye todas las operaciones CRUD y búsquedas
 */
class CiudadanoService {

    // ==========================================
    // MÉTODOS DE CONSULTA
    // ==========================================

    /**
     * Obtiene todos los ciudadanos
     */
    async listarTodos() {
        try {
            const response = await apiClient.get('/ciudadanos');
            return response.data.data || [];
        } catch (error) {
            console.error('Error listando ciudadanos:', error);
            throw new Error(error.response?.data?.message || 'Error al listar ciudadanos');
        }
    }

    /**
     * Busca un ciudadano por DNI
     */
    async buscarPorDni(dni) {
        try {
            const response = await apiClient.get(`/ciudadanos/dni/${dni}`);
            return response.data.data;
        } catch (error) {
            if (error.response?.status === 404) {
                return null;
            }
            console.error('Error buscando ciudadano por DNI:', error);
            throw new Error(error.response?.data?.message || 'Error al buscar ciudadano');
        }
    }

    /**
     * Verifica si existe un ciudadano por DNI
     */
    async existeCiudadano(dni) {
        try {
            const response = await apiClient.get(`/ciudadanos/existe/${dni}`);
            return response.data.data;
        } catch (error) {
            console.error('Error verificando existencia de ciudadano:', error);
            throw new Error(error.response?.data?.message || 'Error al verificar ciudadano');
        }
    }

    /**
     * Búsqueda flexible por DNI y/o apellido
     */
    async buscar(criterios = {}) {
        try {
            const params = new URLSearchParams();

            if (criterios.dni) {
                params.append('dni', criterios.dni);
            }
            if (criterios.apellido) {
                params.append('apellido', criterios.apellido);
            }

            const response = await apiClient.get(`/ciudadanos/search?${params.toString()}`);
            return response.data.data || [];
        } catch (error) {
            console.error('Error en búsqueda de ciudadanos:', error);
            throw new Error(error.response?.data?.message || 'Error en la búsqueda');
        }
    }

    // ==========================================
    // MÉTODOS DE CREACIÓN Y ACTUALIZACIÓN
    // ==========================================

    /**
     * Crea un nuevo ciudadano
     */
    async crear(datosciudadano) {
        try {
            const response = await apiClient.post('/ciudadanos', this.prepararDatos(datosciudadano));
            return response.data.data;
        } catch (error) {
            console.error('Error creando ciudadano:', error);
            throw new Error(error.response?.data?.message || 'Error al crear ciudadano');
        }
    }

    /**
     * Actualiza un ciudadano existente
     */
    async actualizar(dni, datosActualizados) {
        try {
            const response = await apiClient.put(`/ciudadanos/${dni}`, this.prepararDatos(datosActualizados));
            return response.data.data;
        } catch (error) {
            console.error('Error actualizando ciudadano:', error);
            throw new Error(error.response?.data?.message || 'Error al actualizar ciudadano');
        }
    }

    /**
     * Crea o actualiza un ciudadano (método helper para turnos)
     */
    async crearOActualizar(datosciudadano) {
        try {
            const response = await apiClient.post('/ciudadanos/crear-o-actualizar', this.prepararDatos(datosciudadano));
            return response.data.data;
        } catch (error) {
            console.error('Error en crear o actualizar ciudadano:', error);
            throw new Error(error.response?.data?.message || 'Error al procesar ciudadano');
        }
    }

    /**
     * Establece o quita la prioridad de un ciudadano
     */
    async establecerPrioridad(dni, esPrioritario, motivo = '') {
        try {
            const response = await apiClient.put(`/ciudadanos/${dni}/prioridad`, {
                esPrioritario,
                motivo: motivo || ''
            });
            return response.data.data;
        } catch (error) {
            console.error('Error estableciendo prioridad:', error);
            throw new Error(error.response?.data?.message || 'Error al establecer prioridad');
        }
    }

    // ==========================================
    // MÉTODOS DE UTILIDAD
    // ==========================================

    /**
     * Prepara los datos del ciudadano para envío al backend
     */
    prepararDatos(datos) {
        return {
            dni: datos.dni?.trim(),
            nombre: datos.nombre?.trim(),
            apellido: datos.apellido?.trim(),
            telefono: datos.telefono?.trim(),
            direccion: datos.direccion?.trim(),
            esPrioritario: datos.esPrioritario || false,
            motivoPrioridad: datos.motivoPrioridad?.trim() || null,
            observaciones: datos.observaciones?.trim() || null
        };
    }

    /**
     * Valida los datos de un ciudadano antes del envío
     */
    validarDatos(datos) {
        const errores = {};

        // Validar DNI
        if (!datos.dni) {
            errores.dni = 'El DNI es obligatorio';
        } else if (!/^[0-9]{7,8}$/.test(datos.dni.trim())) {
            errores.dni = 'El DNI debe tener entre 7 y 8 dígitos';
        }

        // Validar nombre
        if (!datos.nombre) {
            errores.nombre = 'El nombre es obligatorio';
        } else if (datos.nombre.trim().length > 100) {
            errores.nombre = 'El nombre no puede exceder 100 caracteres';
        }

        // Validar apellido
        if (!datos.apellido) {
            errores.apellido = 'El apellido es obligatorio';
        } else if (datos.apellido.trim().length > 100) {
            errores.apellido = 'El apellido no puede exceder 100 caracteres';
        }

        // Validar teléfono
        if (!datos.telefono) {
            errores.telefono = 'El teléfono es obligatorio';
        } else if (!/^[+]?[0-9\s\-\(\)]{8,20}$/.test(datos.telefono.trim())) {
            errores.telefono = 'Formato de teléfono inválido';
        }

        // Validar dirección
        if (!datos.direccion) {
            errores.direccion = 'La dirección es obligatoria';
        } else if (datos.direccion.trim().length > 200) {
            errores.direccion = 'La dirección no puede exceder 200 caracteres';
        }

        // Validar motivo de prioridad si es prioritario
        if (datos.esPrioritario && !datos.motivoPrioridad) {
            errores.motivoPrioridad = 'El motivo de prioridad es obligatorio para ciudadanos prioritarios';
        } else if (datos.motivoPrioridad && datos.motivoPrioridad.trim().length > 100) {
            errores.motivoPrioridad = 'El motivo de prioridad no puede exceder 100 caracteres';
        }

        return {
            esValido: Object.keys(errores).length === 0,
            errores
        };
    }

    /**
     * Formatea el DNI agregando puntos
     */
    formatearDni(dni) {
        if (!dni) return '';
        const dniLimpio = dni.toString().replace(/\D/g, '');
        if (dniLimpio.length <= 7) {
            return dniLimpio.replace(/(\d{1,2})(\d{3})(\d{3})/, '$1.$2.$3');
        } else {
            return dniLimpio.replace(/(\d{2})(\d{3})(\d{3})/, '$1.$2.$3');
        }
    }

    /**
     * Formatea el teléfono
     */
    formatearTelefono(telefono) {
        if (!telefono) return '';
        // Eliminar espacios, guiones y paréntesis
        const telefonoLimpio = telefono.replace(/[\s\-\(\)]/g, '');

        // Si empieza con 0351 (Córdoba)
        if (telefonoLimpio.startsWith('0351')) {
            return telefonoLimpio.replace(/^(0351)(\d{7})/, '$1-$2');
        }

        // Si es celular (15 dígitos)
        if (telefonoLimpio.length === 10 && telefonoLimpio.startsWith('351')) {
            return `0${telefonoLimpio.replace(/^(351)(\d{7})/, '$1-$2')}`;
        }

        return telefono;
    }

    /**
     * Obtiene los motivos de prioridad más comunes
     */
    getMotivosPrioridadComunes() {
        return [
            'Adulto Mayor (+65 años)',
            'Embarazada',
            'Discapacidad motriz',
            'Discapacidad visual',
            'Discapacidad auditiva',
            'Enfermedad crónica',
            'Menor de edad con tutor',
            'Urgencia médica',
            'Otro'
        ];
    }

    /**
     * Formatea un ciudadano para mostrar en la UI
     */
    formatearParaUI(ciudadano) {
        if (!ciudadano) return null;

        return {
            ...ciudadano,
            dniFormateado: this.formatearDni(ciudadano.dni),
            telefonoFormateado: this.formatearTelefono(ciudadano.telefono),
            estadoPrioridad: ciudadano.esPrioritario ? 'Prioritario' : 'Normal',
            estadoPrioridadColor: ciudadano.esPrioritario ? 'text-red-600' : 'text-slate-600',
            estadoPrioridadBg: ciudadano.esPrioritario ? 'bg-red-50' : 'bg-slate-50',
            turnosLabel: `${ciudadano.cantidadTurnos || 0} turnos`,
            tieneTurnoLabel: ciudadano.tieneTurnoPendiente ? 'Turno pendiente' : 'Sin turno pendiente'
        };
    }

    /**
     * Maneja errores específicos de ciudadanos
     */
    handleCiudadanosError(error) {
        if (error.response) {
            const { status, data } = error.response;

            // Extraer mensaje de error del wrapper ApiResponseWrapper
            if (data?.message) {
                error.message = data.message;
            } else if (data?.error?.detail) {
                error.message = data.error.detail;
            }

            // Errores específicos de ciudadanos
            if (status === 409) {
                if (data?.errorCode === 'DUPLICATE_DNI') {
                    error.message = 'Ya existe un ciudadano con este DNI';
                } else {
                    error.message = 'Ya existe un ciudadano con esos datos';
                }
            } else if (status === 404) {
                error.message = 'Ciudadano no encontrado';
            } else if (status === 403) {
                error.message = 'No tienes permisos para esta operación';
            } else if (status === 400) {
                if (data?.errorCode === 'VALIDATION_ERROR') {
                    error.message = 'Datos del ciudadano inválidos';
                } else if (data?.errorCode === 'PRIORITY_REQUIRED') {
                    error.message = 'El motivo de prioridad es obligatorio';
                }
            }
        } else if (error.request) {
            error.message = 'Error de conexión al gestionar ciudadanos';
        }
    }

    /**
     * Obtiene estadísticas básicas para el dashboard
     */
    async obtenerEstadisticas() {
        try {
            const ciudadanos = await this.listarTodos();

            return {
                total: ciudadanos.length,
                prioritarios: ciudadanos.filter(c => c.esPrioritario).length,
                conTurnoPendiente: ciudadanos.filter(c => c.tieneTurnoPendiente).length,
                sinTurnos: ciudadanos.filter(c => c.cantidadTurnos === 0).length
            };
        } catch (error) {
            console.error('Error obteniendo estadísticas:', error);
            return {
                total: 0,
                prioritarios: 0,
                conTurnoPendiente: 0,
                sinTurnos: 0
            };
        }
    }
}

// Exportar instancia singleton del servicio
const ciudadanoService = new CiudadanoService();
export default ciudadanoService;