import { useState, useEffect, useCallback } from 'react';
import empleadosService from '../services/empleadosService';

/**
 * Hook personalizado para manejar empleados en el AdminPanel
 * 
 * @param {Object} options - Opciones de configuración
 * @param {boolean} options.autoLoad - Si debe cargar automáticamente al montar (default: true)
 * @param {Function} options.onError - Callback personalizado para errores
 * @param {Function} options.onSuccess - Callback para operaciones exitosas
 * 
 * @returns {Object} Estado y funciones del hook
 */
export const useEmpleados = (options = {}) => {
    const {
        autoLoad = true,
        onError = null,
        onSuccess = null
    } = options;

    // Estados principales
    const [empleados, setEmpleados] = useState([]);
    const [empleadoActual, setEmpleadoActual] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [operacionEnCurso, setOperacionEnCurso] = useState(null);

    /**
     * Cargar todos los empleados
     */
    const cargarEmpleados = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const data = await empleadosService.obtenerTodos();
            setEmpleados(data || []);

        } catch (err) {
            setError(err.message || 'Error cargando empleados');

            if (onError) {
                onError(err, 'cargar');
            }
        } finally {
            setLoading(false);
        }
    }, [onError]);

    /**
     * Cargar empleado específico por ID
     */
    const cargarEmpleado = useCallback(async (id) => {
        try {
            setLoading(true);
            setError(null);

            const data = await empleadosService.obtenerPorId(id);
            setEmpleadoActual(data);

            return data;
        } catch (err) {
            setError(err.message || 'Error cargando empleado');

            if (onError) {
                onError(err, 'cargar-empleado');
            }
            throw err;
        } finally {
            setLoading(false);
        }
    }, [onError]);

    /**
     * Cargar estadísticas de empleados
     */
    const cargarEstadisticas = useCallback(async () => {
        try {
            return await empleadosService.obtenerEstadisticas();
        } catch (err) {
            console.error('Error cargando estadísticas:', err);
            return {
                total: 0,
                activos: 0,
                admins: 0,
                responsables: 0,
                operadores: 0
            };
        }
    }, []);

    /**
     * Crear nuevo empleado
     */
    const crearEmpleado = useCallback(async (datosEmpleado) => {
        try {
            setOperacionEnCurso('crear');
            setError(null);

            const empleadoCreado = await empleadosService.crear(datosEmpleado);

            // Agregar a la lista local
            setEmpleados(prev => [...prev, empleadoCreado]);

            if (onSuccess) {
                onSuccess(empleadoCreado, 'crear');
            }

            return empleadoCreado;

        } catch (err) {
            setError(err.message || 'Error creando empleado');

            if (onError) {
                onError(err, 'crear');
            }
            throw err;
        } finally {
            setOperacionEnCurso(null);
        }
    }, [onError, onSuccess]);

    /**
     * Actualizar empleado existente
     */
    const actualizarEmpleado = useCallback(async (id, datosEmpleado) => {
        try {
            setOperacionEnCurso('actualizar');
            setError(null);

            const empleadoActualizado = await empleadosService.actualizar(id, datosEmpleado);

            // Actualizar en la lista local
            setEmpleados(prev => prev.map(empleado =>
                empleado.id === id ? empleadoActualizado : empleado
            ));

            // Actualizar empleado actual si es el mismo
            if (empleadoActual?.id === id) {
                setEmpleadoActual(empleadoActualizado);
            }

            if (onSuccess) {
                onSuccess(empleadoActualizado, 'actualizar');
            }

            return empleadoActualizado;

        } catch (err) {
            setError(err.message || 'Error actualizando empleado');

            if (onError) {
                onError(err, 'actualizar');
            }
            throw err;
        } finally {
            setOperacionEnCurso(null);
        }
    }, [onError, onSuccess, empleadoActual]);

    /**
     * Activar empleado
     */
    const activarEmpleado = useCallback(async (id) => {
        try {
            setOperacionEnCurso('activar');
            setError(null);

            const empleadoActualizado = await empleadosService.activar(id);

            // Actualizar en la lista local
            setEmpleados(prev => prev.map(empleado =>
                empleado.id === id ? empleadoActualizado : empleado
            ));

            if (onSuccess) {
                onSuccess(empleadoActualizado, 'activar');
            }

            return empleadoActualizado;

        } catch (err) {
            setError(err.message || 'Error activando empleado');

            if (onError) {
                onError(err, 'activar');
            }
            throw err;
        } finally {
            setOperacionEnCurso(null);
        }
    }, [onError, onSuccess]);

    /**
     * Desactivar empleado
     */
    const desactivarEmpleado = useCallback(async (id) => {
        try {
            setOperacionEnCurso('desactivar');
            setError(null);

            const empleadoActualizado = await empleadosService.desactivar(id);

            // Actualizar en la lista local
            setEmpleados(prev => prev.map(empleado =>
                empleado.id === id ? empleadoActualizado : empleado
            ));

            if (onSuccess) {
                onSuccess(empleadoActualizado, 'desactivar');
            }

            return empleadoActualizado;

        } catch (err) {
            setError(err.message || 'Error desactivando empleado');

            if (onError) {
                onError(err, 'desactivar');
            }
            throw err;
        } finally {
            setOperacionEnCurso(null);
        }
    }, [onError, onSuccess]);

    /**
     * Cambiar contraseña de empleado
     */
    const cambiarPassword = useCallback(async (id, passwordData) => {
        try {
            setOperacionEnCurso('cambiar-password');
            setError(null);

            await empleadosService.cambiarPassword(id, passwordData);

            if (onSuccess) {
                onSuccess(null, 'cambiar-password');
            }

        } catch (err) {
            setError(err.message || 'Error cambiando contraseña');

            if (onError) {
                onError(err, 'cambiar-password');
            }
            throw err;
        } finally {
            setOperacionEnCurso(null);
        }
    }, [onError, onSuccess]);

    /**
     * Asignar sector a empleado
     */
    const asignarSector = useCallback(async (empleadoId, sectorData) => {
        try {
            setOperacionEnCurso('asignar-sector');
            setError(null);

            const empleadoActualizado = await empleadosService.asignarSector(empleadoId, sectorData);

            // Actualizar en la lista local
            setEmpleados(prev => prev.map(empleado =>
                empleado.id === empleadoId ? empleadoActualizado : empleado
            ));

            if (onSuccess) {
                onSuccess(empleadoActualizado, 'asignar-sector');
            }

            return empleadoActualizado;

        } catch (err) {
            setError(err.message || 'Error asignando sector');

            if (onError) {
                onError(err, 'asignar-sector');
            }
            throw err;
        } finally {
            setOperacionEnCurso(null);
        }
    }, [onError, onSuccess]);

    /**
     * Filtrar empleados según criterios
     */
    const filtrarEmpleados = useCallback((filtros = {}) => {
        const { busqueda, rol, estado } = filtros;

        return empleados.filter(empleado => {
            // Filtrar por búsqueda (nombre, username, email, DNI)
            if (busqueda && busqueda.trim()) {
                const texto = busqueda.toLowerCase();
                const coincide =
                    empleado.nombreCompleto?.toLowerCase().includes(texto) ||
                    empleado.username?.toLowerCase().includes(texto) ||
                    empleado.email?.toLowerCase().includes(texto) ||
                    empleado.dni?.includes(busqueda.trim());

                if (!coincide) return false;
            }

            // Filtrar por rol
            if (rol && rol !== 'TODOS') {
                if (empleado.rol !== rol) return false;
            }

            // Filtrar por estado
            if (estado && estado !== 'TODOS') {
                const estadoActivo = estado === 'ACTIVO';
                if (empleado.activo !== estadoActivo) return false;
            }

            return true;
        });
    }, [empleados]);

    /**
     * Verificar si existe un username
     */
    const verificarUsername = useCallback(async (username) => {
        try {
            return await empleadosService.existeUsername(username);
        } catch (err) {
            return false;
        }
    }, []);

    /**
     * Verificar si existe un DNI
     */
    const verificarDni = useCallback(async (dni) => {
        try {
            return await empleadosService.existeDni(dni);
        } catch (err) {
            return false;
        }
    }, []);

    /**
     * Limpiar errores
     */
    const limpiarError = useCallback(() => {
        setError(null);
    }, []);

    /**
     * Limpiar empleado actual
     */
    const limpiarEmpleadoActual = useCallback(() => {
        setEmpleadoActual(null);
    }, []);

    // Efecto para carga automática inicial
    useEffect(() => {
        if (autoLoad) {
            cargarEmpleados();
        }
    }, [autoLoad, cargarEmpleados]);

    // Estadísticas derivadas
    const estadisticas = {
        total: empleados.length,
        activos: empleados.filter(e => e.activo).length,
        inactivos: empleados.filter(e => !e.activo).length,
        admins: empleados.filter(e => e.rol === 'ADMIN').length,
        responsables: empleados.filter(e => e.rol === 'RESPONSABLE_SECTOR').length,
        operadores: empleados.filter(e => e.rol === 'OPERADOR').length,
        conSector: empleados.filter(e => e.sectorResponsable).length,
        sinSector: empleados.filter(e => !e.sectorResponsable).length
    };

    return {
        // Estados principales
        empleados,
        empleadoActual,
        loading,
        error,
        operacionEnCurso,

        // Acciones principales
        cargarEmpleados,
        cargarEmpleado,
        cargarEstadisticas,
        crearEmpleado,
        actualizarEmpleado,
        activarEmpleado,
        desactivarEmpleado,
        cambiarPassword,
        asignarSector,

        // Utilidades
        filtrarEmpleados,
        verificarUsername,
        verificarDni,
        limpiarError,
        limpiarEmpleadoActual,

        // Información del estado
        isLoading: loading,
        hasError: !!error,
        isEmpty: empleados.length === 0,
        isOperating: !!operacionEnCurso,

        // Datos derivados
        estadisticas
    };
};

export default useEmpleados;