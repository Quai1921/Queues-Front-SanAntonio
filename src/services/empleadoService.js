import { apiClient } from './authService';

/**
 * Servicio para manejar operaciones con empleados
 */
class EmpleadosService {

    /**
     * Obtener empleados por rol
     * @param {string} rol - Rol del empleado (ej: 'RESPONSABLE_SECTOR')
     * @returns {Promise<Array>} - Lista de empleados con el rol especificado
     */
    async obtenerPorRol(rol) {
        try {
            const response = await apiClient.get(`/empleados/rol/${rol}`);

            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Error obteniendo empleados por rol');
            }
        } catch (error) {
            this.handleEmpleadosError(error);
            throw error;
        }
    }

    /**
     * Obtener empleados responsables de sector disponibles
     * @returns {Promise<Array>} - Lista de empleados RESPONSABLE_SECTOR
     */
    async obtenerResponsablesDisponibles() {
        try {
            return await this.obtenerPorRol('RESPONSABLE_SECTOR');
        } catch (error) {
            console.error('Error obteniendo responsables disponibles:', error);
            throw error;
        }
    }

    /**
     * Obtener todos los empleados
     * @returns {Promise<Array>} - Lista de todos los empleados
     */
    async obtenerTodos() {
        try {
            const response = await apiClient.get('/empleados');

            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Error obteniendo empleados');
            }
        } catch (error) {
            this.handleEmpleadosError(error);
            throw error;
        }
    }

    /**
     * Obtener empleado por ID
     * @param {number} id - ID del empleado
     * @returns {Promise<Object>} - Empleado encontrado
     */
    async obtenerPorId(id) {
        try {
            const response = await apiClient.get(`/empleados/${id}`);

            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Empleado no encontrado');
            }
        } catch (error) {
            this.handleEmpleadosError(error);
            throw error;
        }
    }

    /**
     * Formatear empleado para mostrar en UI
     * @param {Object} empleado - Empleado a formatear
     * @returns {Object} - Empleado formateado
     */
    formatearParaUI(empleado) {
        if (!empleado) return null;

        return {
            ...empleado,
            nombreCompleto: empleado.nombreCompleto,
            rolLabel: this.getRolLabel(empleado.rol),
            estadoLabel: empleado.activo ? 'Activo' : 'Inactivo',
            estadoColor: empleado.activo ? 'text-green-600' : 'text-red-600',
            estadoBg: empleado.activo ? 'bg-green-50' : 'bg-red-50',
            sectorAsignado: empleado.sectorResponsable ? empleado.sectorResponsable.codigo : null,
            sectorNombre: empleado.sectorResponsable ? empleado.sectorResponsable.nombre : null
        };
    }

    /**
     * Obtener label del rol
     * @param {string} rol - Rol del empleado
     * @returns {string} - Label del rol
     */
    getRolLabel(rol) {
        const roles = {
            'ADMIN': 'Administrador',
            'RESPONSABLE_SECTOR': 'Responsable de Sector',
            'OPERADOR': 'Operador'
        };
        return roles[rol] || rol;
    }

    /**
     * Validar datos del empleado
     * @param {Object} empleadoData - Datos a validar
     * @param {boolean} esCreacion - Si es para creación
     */
    validarDatosEmpleado(empleadoData, esCreacion = true) {
        if (!empleadoData) {
            throw new Error('Los datos del empleado son requeridos');
        }

        if (esCreacion && (!empleadoData.username || empleadoData.username.trim() === '')) {
            throw new Error('El nombre de usuario es requerido');
        }

        if (!empleadoData.nombre || empleadoData.nombre.trim() === '') {
            throw new Error('El nombre es requerido');
        }

        if (!empleadoData.apellido || empleadoData.apellido.trim() === '') {
            throw new Error('El apellido es requerido');
        }

        if (!empleadoData.email || empleadoData.email.trim() === '') {
            throw new Error('El email es requerido');
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(empleadoData.email)) {
            throw new Error('El formato del email no es válido');
        }

        if (empleadoData.rol && !['ADMIN', 'RESPONSABLE_SECTOR', 'OPERADOR'].includes(empleadoData.rol)) {
            throw new Error('El rol debe ser ADMIN, RESPONSABLE_SECTOR u OPERADOR');
        }
    }

    /**
     * Manejar errores específicos de empleados
     * @param {Error} error 
     */
    handleEmpleadosError(error) {
        if (error.response) {
            const { status, data } = error.response;

            // Extraer mensaje de error del wrapper ApiResponseWrapper
            if (data?.message) {
                error.message = data.message;
            } else if (data?.error?.detail) {
                error.message = data.error.detail;
            }

            // Errores específicos de empleados
            if (status === 409) {
                error.message = 'El usuario o email ya existe';
            } else if (status === 404) {
                error.message = 'Empleado no encontrado';
            } else if (status === 403) {
                error.message = 'No tienes permisos para esta operación';
            }
        } else if (error.request) {
            error.message = 'Error de conexión al gestionar empleados';
        }

        console.error('Empleados Service Error:', {
            message: error.message,
            status: error.response?.status,
            url: error.config?.url
        });
    }
}

// Exportar instancia singleton del servicio
const empleadosService = new EmpleadosService();
export default empleadosService;