import { useState, useEffect, useCallback } from 'react';
import ciudadanoService from '../services/ciudadanoService';

/**
 * Hook personalizado para la gestión de ciudadanos
 * Centraliza toda la lógica de estado y operaciones
 */
export const useCiudadano = () => {
    // Estados principales
    const [ciudadanos, setCiudadanos] = useState([]);
    const [ciudadanosFiltrados, setCiudadanosFiltrados] = useState([]);
    const [ciudadanoSeleccionado, setCiudadanoSeleccionado] = useState(null);

    // Estados de búsqueda y filtros
    const [busqueda, setBusqueda] = useState('');
    const [filtroActivo, setFiltroActivo] = useState('todos');

    // Estados de carga
    const [loading, setLoading] = useState(false);
    const [loadingOperacion, setLoadingOperacion] = useState(false);

    // Estados de estadísticas
    const [estadisticas, setEstadisticas] = useState({
        total: 0,
        prioritarios: 0,
        conTurnoPendiente: 0,
        sinTurnos: 0
    });

    // Estados de notificación
    const [notificacion, setNotificacion] = useState({
        mensaje: '',
        tipo: '',
        visible: false
    });

    /**
     * Carga la lista completa de ciudadanos desde el backend
     */
    const cargarCiudadanos = useCallback(async () => {
        try {
            setLoading(true);
            const data = await ciudadanoService.listarTodos();
            setCiudadanos(data);

            // Calcular estadísticas
            calcularEstadisticas(data);
        } catch (error) {
            console.error('Error cargando ciudadanos:', error);
            mostrarNotificacion('Error al cargar ciudadanos', 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Calcula estadísticas basadas en los datos de ciudadanos
     */
    const calcularEstadisticas = useCallback((data) => {
        const stats = {
            total: data.length,
            prioritarios: data.filter(c => c.esPrioritario).length,
            conTurnoPendiente: data.filter(c => c.tieneTurnoPendiente).length,
            sinTurnos: data.filter(c => (c.cantidadTurnos || 0) === 0).length
        };
        setEstadisticas(stats);
    }, []);

    /**
     * Aplica filtros y búsqueda a la lista de ciudadanos
     */
    const aplicarFiltros = useCallback(() => {
        let resultado = [...ciudadanos];

        // Aplicar búsqueda por DNI, nombre o teléfono
        if (busqueda.trim()) {
            const termino = busqueda.trim()?.toLowerCase();
            resultado = resultado.filter(ciudadano =>
                ciudadano.dni.includes(termino) ||
                ciudadano.nombreCompleto?.toLowerCase().includes(termino) ||
                ciudadano.nombre?.toLowerCase().includes(termino) ||
                ciudadano.apellido?.toLowerCase().includes(termino) ||
                ciudadano.telefono.includes(termino)
            );
        }

        // Aplicar filtro activo
        switch (filtroActivo) {
            case 'prioritarios':
                resultado = resultado.filter(c => c.esPrioritario);
                break;
            case 'conTurno':
                resultado = resultado.filter(c => c.tieneTurnoPendiente);
                break;
            case 'sinTurnos':
                resultado = resultado.filter(c => (c.cantidadTurnos || 0) === 0);
                break;
            default:
                // 'todos' - no filtrar
                break;
        }

        // Ordenar por apellido
        resultado.sort((a, b) => a.nombreCompleto?.localeCompare(b.nombreCompleto));
        setCiudadanosFiltrados(resultado);
    }, [ciudadanos, busqueda, filtroActivo]);

    /**
     * Muestra una notificación temporal
     */
    const mostrarNotificacion = useCallback((mensaje, tipo = 'success') => {
        setNotificacion({ mensaje, tipo, visible: true });
        setTimeout(() => {
            setNotificacion(prev => ({ ...prev, visible: false }));
        }, 3000);
    }, []);

    /**
     * Busca un ciudadano por DNI
     */
    const buscarCiudadanoPorDni = useCallback(async (dni) => {
        try {
            setLoadingOperacion(true);
            const ciudadano = await ciudadanoService.buscarPorDni(dni);
            return ciudadano;
        } catch (error) {
            console.error('Error buscando ciudadano:', error);
            mostrarNotificacion('Error al buscar ciudadano', 'error');
            return null;
        } finally {
            setLoadingOperacion(false);
        }
    }, [mostrarNotificacion]);

    /**
     * Verifica si un DNI ya existe
     */
    const verificarDniExistente = useCallback(async (dni) => {
        try {
            const existe = await ciudadanoService.existeCiudadano(dni);
            return existe;
        } catch (error) {
            console.error('Error verificando DNI:', error);
            return false;
        }
    }, []);

    /**
     * Crea un nuevo ciudadano
     */
    const crearCiudadano = useCallback(async (datosCiudadano) => {
        try {
            setLoadingOperacion(true);
            const nuevoCiudadano = await ciudadanoService.crear(datosCiudadano);
            await cargarCiudadanos(); // Recargar lista
            mostrarNotificacion('Ciudadano creado exitosamente');
            return nuevoCiudadano;
        } catch (error) {
            console.error('Error creando ciudadano:', error);
            mostrarNotificacion(error.message || 'Error al crear ciudadano', 'error');
            throw error;
        } finally {
            setLoadingOperacion(false);
        }
    }, [cargarCiudadanos, mostrarNotificacion]);

    /**
     * Actualiza un ciudadano existente
     */
    const actualizarCiudadano = useCallback(async (dni, datosActualizados) => {
        try {
            setLoadingOperacion(true);
            const ciudadanoActualizado = await ciudadanoService.actualizar(dni, datosActualizados);
            await cargarCiudadanos(); // Recargar lista
            mostrarNotificacion('Ciudadano actualizado exitosamente');
            return ciudadanoActualizado;
        } catch (error) {
            console.error('Error actualizando ciudadano:', error);
            mostrarNotificacion(error.message || 'Error al actualizar ciudadano', 'error');
            throw error;
        } finally {
            setLoadingOperacion(false);
        }
    }, [cargarCiudadanos, mostrarNotificacion]);

    /**
     * Crea o actualiza un ciudadano (para uso en turnos)
     */
    const crearOActualizarCiudadano = useCallback(async (datosCiudadano) => {
        try {
            setLoadingOperacion(true);
            const ciudadano = await ciudadanoService.crearOActualizar(datosCiudadano);
            await cargarCiudadanos(); // Recargar lista
            mostrarNotificacion('Ciudadano procesado exitosamente');
            return ciudadano;
        } catch (error) {
            console.error('Error procesando ciudadano:', error);
            mostrarNotificacion(error.message || 'Error al procesar ciudadano', 'error');
            throw error;
        } finally {
            setLoadingOperacion(false);
        }
    }, [cargarCiudadanos, mostrarNotificacion]);

    /**
     * Establece o quita la prioridad de un ciudadano
     */
    const establecerPrioridad = useCallback(async (dni, esPrioritario, motivo = '') => {
        try {
            setLoadingOperacion(true);
            await ciudadanoService.establecerPrioridad(dni, esPrioritario, motivo);
            await cargarCiudadanos(); // Recargar lista

            const mensaje = esPrioritario ?
                'Prioridad establecida exitosamente' :
                'Prioridad removida exitosamente';
            mostrarNotificacion(mensaje);
        } catch (error) {
            console.error('Error estableciendo prioridad:', error);
            mostrarNotificacion(error.message || 'Error al cambiar prioridad', 'error');
            throw error;
        } finally {
            setLoadingOperacion(false);
        }
    }, [cargarCiudadanos, mostrarNotificacion]);

    /**
     * Realiza búsqueda flexible por criterios
     */
    const buscarCiudadanos = useCallback(async (criterios) => {
        try {
            setLoadingOperacion(true);
            const resultados = await ciudadanoService.buscar(criterios);
            return resultados;
        } catch (error) {
            console.error('Error en búsqueda:', error);
            mostrarNotificacion('Error en la búsqueda', 'error');
            return [];
        } finally {
            setLoadingOperacion(false);
        }
    }, [mostrarNotificacion]);

    /**
     * Limpia todos los filtros y búsqueda
     */
    const limpiarFiltros = useCallback(() => {
        setBusqueda('');
        setFiltroActivo('todos');
    }, []);

    /**
     * Selecciona un ciudadano para operaciones
     */
    const seleccionarCiudadano = useCallback((ciudadano) => {
        setCiudadanoSeleccionado(ciudadano);
    }, []);

    /**
     * Limpia la selección actual
     */
    const limpiarSeleccion = useCallback(() => {
        setCiudadanoSeleccionado(null);
    }, []);

    // Efecto para cargar ciudadanos al inicializar
    useEffect(() => {
        cargarCiudadanos();
    }, [cargarCiudadanos]);

    // Efecto para aplicar filtros cuando cambian los datos
    useEffect(() => {
        aplicarFiltros();
    }, [aplicarFiltros]);

    // Funciones de utilidad del servicio
    const validarDatos = ciudadanoService.validarDatos;
    const formatearDni = ciudadanoService.formatearDni;
    const formatearTelefono = ciudadanoService.formatearTelefono;
    const getMotivosPrioridadComunes = ciudadanoService.getMotivosPrioridadComunes;

    return {
        // Estados
        ciudadanos,
        ciudadanosFiltrados,
        ciudadanoSeleccionado,
        busqueda,
        filtroActivo,
        loading,
        loadingOperacion,
        estadisticas,
        notificacion,

        // Setters de estado
        setBusqueda,
        setFiltroActivo,

        // Operaciones CRUD
        cargarCiudadanos,
        crearCiudadano,
        actualizarCiudadano,
        crearOActualizarCiudadano,
        establecerPrioridad,

        // Operaciones de búsqueda
        buscarCiudadanoPorDni,
        buscarCiudadanos,
        verificarDniExistente,

        // Utilidades
        limpiarFiltros,
        seleccionarCiudadano,
        limpiarSeleccion,
        mostrarNotificacion,

        // Funciones de validación y formato
        validarDatos,
        formatearDni,
        formatearTelefono,
        getMotivosPrioridadComunes
    };
};

export default useCiudadano;