import { useState, useEffect, useCallback } from 'react';
import sectoresService from '../services/sectoresService';

/**
 * Hook personalizado para manejar sectores en el AdminPanel
 * 
 * @param {Object} options - Opciones de configuración
 * @param {boolean} options.autoLoad - Si debe cargar automáticamente al montar (default: true)
 * @param {Function} options.onError - Callback personalizado para errores
 * @param {Function} options.onSuccess - Callback para operaciones exitosas
 * 
 * @returns {Object} Estado y funciones del hook
 */
export const useSectores = (options = {}) => {
    const {
        autoLoad = true,
        onError = null,
        onSuccess = null
    } = options;

    // Estados principales
    const [sectores, setSectores] = useState([]);
    const [sectorActual, setSectorActual] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [operacionEnCurso, setOperacionEnCurso] = useState(null);

    /**
     * Cargar todos los sectores
     */
    const cargarSectores = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const data = await sectoresService.obtenerTodos();

            // Formatear sectores para la UI
            const sectoresFormateados = data.map(sector =>
                sectoresService.formatearParaUI(sector)
            );

            setSectores(sectoresFormateados);

        } catch (err) {
            console.error('❌ Error cargando sectores:', err);
            setError(err.message || 'Error cargando sectores');

            if (onError) {
                onError(err, 'cargar');
            }
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Cargar sector específico por ID
     */
    const cargarSector = useCallback(async (id, completo = false) => {
        try {
            setLoading(true);
            setError(null);

            const data = completo
                ? await sectoresService.obtenerCompleto(id)
                : await sectoresService.obtenerPorId(id);

            const sectorFormateado = sectoresService.formatearParaUI(data);
            setSectorActual(sectorFormateado);

            return sectorFormateado;

        } catch (err) {
            console.error('❌ Error cargando sector:', err);
            setError(err.message || 'Error cargando sector');

            if (onError) {
                onError(err, 'cargarSector');
            }
            throw err;
        } finally {
            setLoading(false);
        }
    }, [onError]);

    /**
     * Crear nuevo sector
     */
    const crearSector = useCallback(async (datosSector) => {
        try {
            setOperacionEnCurso('crear');
            setError(null);

            const nuevoSector = await sectoresService.crear(datosSector);
            const sectorFormateado = sectoresService.formatearParaUI(nuevoSector);

            // Agregar a la lista local
            setSectores(prev => [...prev, sectorFormateado]);

            if (onSuccess) {
                onSuccess(sectorFormateado, 'crear');
            }

            return sectorFormateado;

        } catch (err) {
            console.error('❌ Error creando sector:', err);
            setError(err.message || 'Error creando sector');

            if (onError) {
                onError(err, 'crear');
            }
            throw err;
        } finally {
            setOperacionEnCurso(null);
        }
    }, [onError, onSuccess]);

    /**
     * Actualizar sector existente
     */
    const actualizarSector = useCallback(async (codigo, datosActualizados) => {
        try {
            setOperacionEnCurso('actualizar');
            setError(null);

            const sectorActualizado = await sectoresService.actualizar(codigo, datosActualizados);
            const sectorFormateado = sectoresService.formatearParaUI(sectorActualizado);

            // Actualizar en la lista local
            setSectores(prev => prev.map(sector =>
                sector.codigo === codigo ? sectorFormateado : sector
            ));

            // Actualizar sector actual si es el mismo
            if (sectorActual?.codigo === codigo) {
                setSectorActual(sectorFormateado);
            }

            if (onSuccess) {
                onSuccess(sectorFormateado, 'actualizar');
            }

            return sectorFormateado;

        } catch (err) {
            console.error('❌ Error actualizando sector:', err);
            setError(err.message || 'Error actualizando sector');

            if (onError) {
                onError(err, 'actualizar');
            }
            throw err;
        } finally {
            setOperacionEnCurso(null);
        }
    }, [onError, onSuccess, sectorActual]);

    /**
     * Activar sector
     */
    const activarSector = useCallback(async (id) => {
        try {
            setOperacionEnCurso('activar');
            setError(null);

            const sectorActualizado = await sectoresService.activar(id);
            const sectorFormateado = sectoresService.formatearParaUI(sectorActualizado);

            // Actualizar en la lista local
            setSectores(prev => prev.map(sector =>
                sector.id === id ? sectorFormateado : sector
            ));

            if (onSuccess) {
                onSuccess(sectorFormateado, 'activar');
            }

            return sectorFormateado;

        } catch (err) {
            console.error('❌ Error activando sector:', err);
            setError(err.message || 'Error activando sector');

            if (onError) {
                onError(err, 'activar');
            }
            throw err;
        } finally {
            setOperacionEnCurso(null);
        }
    }, [onError, onSuccess]);

    /**
     * Desactivar sector
     */
    const desactivarSector = useCallback(async (id) => {
        try {
            setOperacionEnCurso('desactivar');
            setError(null);

            const sectorActualizado = await sectoresService.desactivar(id);
            const sectorFormateado = sectoresService.formatearParaUI(sectorActualizado);

            // Actualizar en la lista local
            setSectores(prev => prev.map(sector =>
                sector.id === id ? sectorFormateado : sector
            ));

            if (onSuccess) {
                onSuccess(sectorFormateado, 'desactivar');
            }

            return sectorFormateado;

        } catch (err) {
            console.error('❌ Error desactivando sector:', err);
            setError(err.message || 'Error desactivando sector');

            if (onError) {
                onError(err, 'desactivar');
            }
            throw err;
        } finally {
            setOperacionEnCurso(null);
        }
    }, [onError, onSuccess]);

    /**
     * Asignar responsable a un sector
     */
    const asignarResponsable = useCallback(async (sectorId, empleadoId) => {
        try {
            setOperacionEnCurso('asignar-responsable');
            setError(null);

            const sectorActualizado = await sectoresService.asignarResponsable(sectorId, empleadoId);
            const sectorFormateado = sectoresService.formatearParaUI(sectorActualizado);

            // Actualizar en la lista local
            setSectores(prev => prev.map(sector =>
                sector.id === sectorId ? sectorFormateado : sector
            ));

            if (onSuccess) {
                onSuccess(sectorFormateado, 'asignar-responsable');
            }

            return sectorFormateado;

        } catch (err) {
            console.error('❌ Error asignando responsable:', err);
            setError(err.message || 'Error asignando responsable');

            if (onError) {
                onError(err, 'asignar-responsable');
            }
            throw err;
        } finally {
            setOperacionEnCurso(null);
        }
    }, [onError, onSuccess]);

    /**
     * Verificar si existe un código de sector
     */
    const verificarCodigo = useCallback(async (codigo) => {
        try {
            return await sectoresService.existeCodigo(codigo);
        } catch (err) {
            console.error('Error verificando código:', err);
            return false;
        }
    }, []);

    /**
     * Filtrar sectores según criterios
     */
    const filtrarSectores = useCallback((filtros = {}) => {
        const { busqueda, tipo, activo } = filtros;

        return sectores.filter(sector => {
            // Filtrar por búsqueda (nombre, código, descripción)
            if (busqueda && busqueda.trim()) {
                const texto = busqueda.toLowerCase();
                const coincide =
                    sector.nombre.toLowerCase().includes(texto) ||
                    sector.codigo.toLowerCase().includes(texto) ||
                    (sector.descripcion && sector.descripcion.toLowerCase().includes(texto));

                if (!coincide) return false;
            }

            // Filtrar por tipo
            if (tipo && tipo !== 'TODOS') {
                if (sector.tipoSector !== tipo) return false;
            }

            // Filtrar por estado activo
            if (activo !== undefined && activo !== null) {
                if (sector.activo !== activo) return false;
            }

            return true;
        });
    }, []);

    /**
     * Limpiar errores
     */
    const limpiarError = useCallback(() => {
        setError(null);
    }, []);

    /**
     * Limpiar sector actual
     */
    const limpiarSectorActual = useCallback(() => {
        setSectorActual(null);
    }, []);

    // Efecto para carga automática inicial
    useEffect(() => {
        if (autoLoad) {
            cargarSectores();
        }
    }, [autoLoad, cargarSectores]);

    // Estadísticas derivadas
    const estadisticas = {
        total: sectores.length,
        activos: sectores.filter(s => s.activo).length,
        inactivos: sectores.filter(s => !s.activo).length,
        publicos: sectores.filter(s => s.tipoSector === 'PUBLICO').length,
        especiales: sectores.filter(s => s.tipoSector === 'ESPECIAL').length,
        conResponsable: sectores.filter(s => s.empleadoResponsable).length,
        sinResponsable: sectores.filter(s => !s.empleadoResponsable).length
    };

    // Opciones para formularios
    const opciones = sectoresService.getOpcionesFormulario();

    return {
        // Estados principales
        sectores,
        sectorActual,
        loading,
        error,
        operacionEnCurso,

        // Acciones principales
        cargarSectores,
        cargarSector,
        crearSector,
        actualizarSector,
        activarSector,
        desactivarSector,
        asignarResponsable,

        // Utilidades
        verificarCodigo,
        filtrarSectores,
        limpiarError,
        limpiarSectorActual,

        // Información del estado
        isLoading: loading,
        hasError: !!error,
        isEmpty: sectores.length === 0,
        isOperating: !!operacionEnCurso,

        // Datos derivados
        estadisticas,
        opciones
    };
};

export default useSectores;