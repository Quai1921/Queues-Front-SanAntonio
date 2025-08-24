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
                // return response.data.data;
                return response.data.data.map(this.formatearParaUI);
            } else {
                throw new Error(response.data.message || 'Error obteniendo empleados por rol');
            }
        } catch (error) {
            this.handleEmpleadosError(error);
            throw error;
        }
    }

    /**
     * Obtener empleados de un sector
     * @param {number} sectorId - ID del sector
     * @returns {Promise<Array>} - Lista de empleados del sector
     */
    async obtenerPorSector(sectorId) {
        try {
            const response = await apiClient.get(`/empleados/sector/${sectorId}`);

            if (response.data.success) {
                return response.data.data.map(this.formatearParaUI);
            } else {
                throw new Error(response.data.message || 'Error obteniendo empleados del sector');
            }
        } catch (error) {
            this.handleEmpleadosError(error);
            throw error;
        }
    }

    /**
     * Obtener empleado por username
     * @param {string} username - Username del empleado
     * @returns {Promise<Object>} - Empleado encontrado
     */
    async obtenerPorUsername(username) {
        try {
            const response = await apiClient.get(`/empleados/username/${username}`);

            if (response.data.success) {
                return this.formatearParaUI(response.data.data);
            } else {
                throw new Error(response.data.message || 'Empleado no encontrado');
            }
        } catch (error) {
            this.handleEmpleadosError(error);
            throw error;
        }
    }

    /**
     * Obtener estadísticas de empleados
     * @returns {Promise<Object>} - Estadísticas de empleados
     */
    async obtenerEstadisticas() {
        try {
            const response = await apiClient.get('/empleados/estadisticas');

            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Error obteniendo estadísticas');
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
                // return response.data.data;
                return response.data.data.map(empleado => this.formatearParaUI(empleado));
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
                // return response.data.data;
                return this.formatearParaUI(response.data.data);
            } else {
                throw new Error(response.data.message || 'Empleado no encontrado');
            }
        } catch (error) {
            this.handleEmpleadosError(error);
            throw error;
        }
    }

    /**
     * Verificar si existe un username
     * @param {string} username - Username a verificar
     * @returns {Promise<boolean>} - True si existe
     */
    async existeUsername(username) {
        try {
            const response = await apiClient.get(`/empleados/existe-username/${username}`);

            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Error verificando username');
            }
        } catch (error) {
            this.handleEmpleadosError(error);
            throw error;
        }
    }

    /**
     * Verificar si existe un DNI
     * @param {string} dni - DNI a verificar
     * @returns {Promise<boolean>} - True si existe
     */
    async existeDni(dni) {
        try {
            const response = await apiClient.get(`/empleados/existe-dni/${dni}`);

            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Error verificando DNI');
            }
        } catch (error) {
            this.handleEmpleadosError(error);
            throw error;
        }
    }

    /**
     * Crear un nuevo empleado
     * @param {Object} empleadoData - Datos del empleado a crear
     * @returns {Promise<Object>} - Empleado creado
     */
    async crear(empleadoData) {
        try {
            this.validarDatosEmpleado(empleadoData, true);

            const response = await apiClient.post('/empleados', empleadoData);

            if (response.data.success) {
                return this.formatearParaUI(response.data.data);
            } else {
                throw new Error(response.data.message || 'Error creando empleado');
            }
        } catch (error) {
            this.handleEmpleadosError(error);
            throw error;
        }
    }

    /**
     * Actualizar un empleado existente
     * @param {number} id - ID del empleado
     * @param {Object} empleadoData - Datos del empleado a actualizar
     * @returns {Promise<Object>} - Empleado actualizado
     */
    async actualizar(id, empleadoData) {
        try {
            this.validarDatosEmpleado(empleadoData, false);

            const response = await apiClient.put(`/empleados/${id}`, empleadoData);

            if (response.data.success) {
                return this.formatearParaUI(response.data.data);
            } else {
                throw new Error(response.data.message || 'Error actualizando empleado');
            }
        } catch (error) {
            this.handleEmpleadosError(error);
            throw error;
        }
    }

    /**
     * Cambiar contraseña de un empleado
     * @param {number} id - ID del empleado
     * @param {Object} passwordData - Datos de la nueva contraseña
     * @returns {Promise<Object>} - Resultado de la operación
     */
    async cambiarPassword(id, passwordData) {
        try {
            if (!passwordData.nuevaPassword || !passwordData.confirmarPassword) {
                throw new Error('Ambas contraseñas son requeridas');
            }

            if (passwordData.nuevaPassword !== passwordData.confirmarPassword) {
                throw new Error('Las contraseñas no coinciden');
            }

            if (passwordData.nuevaPassword.length < 6) {
                throw new Error('La contraseña debe tener al menos 6 caracteres');
            }

            const response = await apiClient.patch(`/empleados/${id}/password`, passwordData);

            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Error cambiando contraseña');
            }
        } catch (error) {
            this.handleEmpleadosError(error);
            throw error;
        }
    }

    /**
     * Asignar sector a un empleado
     * @param {number} id - ID del empleado
     * @param {Object} sectorData - Datos del sector a asignar
     * @returns {Promise<Object>} - Empleado actualizado
     */
    async asignarSector(id, sectorData) {
        try {
            const response = await apiClient.post(`/empleados/${id}/asignar-sector`, sectorData);

            if (response.data.success) {
                return this.formatearParaUI(response.data.data);
            } else {
                throw new Error(response.data.message || 'Error asignando sector');
            }
        } catch (error) {
            this.handleEmpleadosError(error);
            throw error;
        }
    }

    /**
     * Activar un empleado
     * @param {number} id - ID del empleado
     * @returns {Promise<Object>} - Empleado actualizado
     */
    async activar(id) {
        try {
            const response = await apiClient.patch(`/empleados/${id}/activar`);

            if (response.data.success) {
                return this.formatearParaUI(response.data.data);
            } else {
                throw new Error(response.data.message || 'Error activando empleado');
            }
        } catch (error) {
            this.handleEmpleadosError(error);
            throw error;
        }
    }

    /**
     * Desactivar un empleado
     * @param {number} id - ID del empleado
     * @returns {Promise<Object>} - Empleado actualizado
     */
    async desactivar(id) {
        try {
            const response = await apiClient.patch(`/empleados/${id}/desactivar`);

            if (response.data.success) {
                return this.formatearParaUI(response.data.data);
            } else {
                throw new Error(response.data.message || 'Error desactivando empleado');
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
     * Formatear empleado para mostrar en UI
     * @param {Object} empleado - Empleado a formatear
     * @returns {Object} - Empleado formateado
     */
    formatearParaUI(empleado) {
        console.log(empleado)

        if (!empleado) return null;
        
        return {
            ...empleado,
            nombreCompleto: empleado.nombreCompleto,
            rolLabel: this?.getRolLabel(empleado.rol),
            estadoLabel: empleado.activo ? 'Activo' : 'Inactivo',
            estadoColor: empleado.activo ? 'text-green-600' : 'text-red-600',
            estadoBg: empleado.activo ? 'bg-green-50' : 'bg-red-50',
            // sectorAsignado: empleado.sectorResponsable ? empleado.sectorResponsable.codigo : null,
            sectorAsignado: empleado.sectorResponsable ?
                `${empleado.sectorResponsable.codigo} - ${empleado.sectorResponsable.nombre}` :
                'Sin asignar',
            // sectorNombre: empleado.sectorResponsable ? empleado.sectorResponsable.nombre : null
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
        // return roles[rol] || rol;
        return roles[rol] || 'Sin rol';
    }

    /**
     * Validar datos del empleado
     * @param {Object} empleadoData - Datos a validar
     * @param {boolean} esCreacion - Si es para creación
     */
    // validarDatosEmpleado(empleadoData, esCreacion = true) {
    //     if (!empleadoData) {
    //         throw new Error('Los datos del empleado son requeridos');
    //     }

    //     if (esCreacion && (!empleadoData.username || empleadoData.username.trim() === '')) {
    //         throw new Error('El nombre de usuario es requerido');
    //     }

    //     if (!empleadoData.nombre || empleadoData.nombre.trim() === '') {
    //         throw new Error('El nombre es requerido');
    //     }

    //     if (!empleadoData.apellido || empleadoData.apellido.trim() === '') {
    //         throw new Error('El apellido es requerido');
    //     }

    //     if (!empleadoData.email || empleadoData.email.trim() === '') {
    //         throw new Error('El email es requerido');
    //     }

    //     // Validar formato de email
    //     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    //     if (!emailRegex.test(empleadoData.email)) {
    //         throw new Error('El formato del email no es válido');
    //     }

    //     if (empleadoData.rol && !['ADMIN', 'RESPONSABLE_SECTOR', 'OPERADOR'].includes(empleadoData.rol)) {
    //         throw new Error('El rol debe ser ADMIN, RESPONSABLE_SECTOR u OPERADOR');
    //     }
    // }

    validarDatosEmpleado(empleadoData, esCreacion = false) {
        if (!empleadoData) {
            throw new Error('Los datos del empleado son requeridos');
        }

        // Validaciones para creación
        if (esCreacion) {
            if (!empleadoData.username || empleadoData.username.length < 3) {
                throw new Error('El username debe tener al menos 3 caracteres');
            }

            if (!empleadoData.password || empleadoData.password.length < 6) {
                throw new Error('La contraseña debe tener al menos 6 caracteres');
            }
        }

        // Validaciones comunes
        if (!empleadoData.nombre || empleadoData.nombre.length < 1) {
            throw new Error('El nombre es requerido');
        }

        if (!empleadoData.apellido || empleadoData.apellido.length < 1) {
            throw new Error('El apellido es requerido');
        }

        // Validar email si se proporciona
        if (empleadoData.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(empleadoData.email)) {
                throw new Error('El formato del email no es válido');
            }
        }

        // Validar DNI si se proporciona
        if (empleadoData.dni) {
            if (!/^\d{7,8}$/.test(empleadoData.dni)) {
                throw new Error('El DNI debe tener entre 7 y 8 dígitos');
            }
        }

        // Validar rol
        if (empleadoData.rol && !['ADMIN', 'RESPONSABLE_SECTOR', 'OPERADOR'].includes(empleadoData.rol)) {
            throw new Error('El rol debe ser ADMIN, RESPONSABLE_SECTOR u OPERADOR');
        }

        // Validar sector para responsables
        if (empleadoData.rol === 'RESPONSABLE_SECTOR' && esCreacion && !empleadoData.sectorId) {
            throw new Error('Los responsables de sector deben tener un sector asignado');
        }
    }

    /**
     * Manejar errores específicos de empleados
     * @param {Error} error 
     */
    // handleEmpleadosError(error) {
    //     if (error.response) {
    //         const { status, data } = error.response;

    //         // Extraer mensaje de error del wrapper ApiResponseWrapper
    //         if (data?.message) {
    //             error.message = data.message;
    //         } else if (data?.error?.detail) {
    //             error.message = data.error.detail;
    //         }

    //         // Errores específicos de empleados
    //         if (status === 409) {
    //             error.message = 'El usuario o email ya existe';
    //         } else if (status === 404) {
    //             error.message = 'Empleado no encontrado';
    //         } else if (status === 403) {
    //             error.message = 'No tienes permisos para esta operación';
    //         }
    //     } else if (error.request) {
    //         error.message = 'Error de conexión al gestionar empleados';
    //     }

    //     console.error('Empleados Service Error:', {
    //         message: error.message,
    //         status: error.response?.status,
    //         url: error.config?.url
    //     });
    // }
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
                if (data?.errorCode === 'DUPLICATE_USERNAME') {
                    error.message = 'Ya existe un empleado con ese username';
                } else if (data?.errorCode === 'DUPLICATE_DNI') {
                    error.message = 'Ya existe un empleado con ese DNI';
                } else if (data?.errorCode === 'DUPLICATE_EMAIL') {
                    error.message = 'Ya existe un empleado con ese email';
                } else {
                    error.message = 'Ya existe un empleado con esos datos';
                }
            } else if (status === 404) {
                error.message = 'Empleado no encontrado';
            } else if (status === 403) {
                error.message = 'No tienes permisos para esta operación';
            } else if (status === 400) {
                if (data?.errorCode === 'PASSWORD_REQUIRED') {
                    error.message = 'La contraseña es requerida para crear empleados';
                } else if (data?.errorCode === 'SECTOR_ASSIGNMENT_ERROR') {
                    error.message = 'Error en la asignación de sector';
                }
            }
        } else if (error.request) {
            error.message = 'Error de conexión al gestionar empleados';
        }

        console.error('Empleados Service Error:', {
            message: error.message,
            status: error.response?.status,
            url: error.config?.url,
            data: error.response?.data
        });
    }
}

// Exportar instancia singleton del servicio
const empleadosService = new EmpleadosService();
export default empleadosService;