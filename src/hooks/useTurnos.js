import { useState, useEffect, useCallback } from 'react';
import turnosService from '../services/turnosService';

/**
 * Hook personalizado para manejar turnos en el sistema
 * 
 * @param {Object} options - Opciones de configuración
 * @param {boolean} options.autoLoad - Si debe cargar automáticamente al montar (default: false)
 * @param {number} options.sectorId - ID del sector para carga automática
 * @param {Function} options.onError - Callback personalizado para errores
 * @param {Function} options.onSuccess - Callback para operaciones exitosas
 * @param {number} options.refreshInterval - Intervalo de refresco automático en ms
 * 
 * @returns {Object} Estado y funciones del hook
 */
export const useTurnos = (options = {}) => {
    const {
        autoLoad = false,
        sectorId = null,
        onError = null,
        onSuccess = null,
        refreshInterval = null
    } = options;

    // Estados principales
    const [turnos, setTurnos] = useState([]);
    const [turnoActual, setTurnoActual] = useState(null);
    const [colaEspera, setColaEspera] = useState([]);
    const [proximoTurno, setProximoTurno] = useState(null);
    const [turnosPendientes, setTurnosPendientes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [operacionEnCurso, setOperacionEnCurso] = useState(null);

    /**
     * Consultar turno por código
     */
    const consultarTurnoPorCodigo = useCallback(async (codigo, fecha = null) => {
        try {
            setLoading(true);
            setError(null);

            const turno = fecha ?
                await turnosService.consultarPorCodigoYFecha(codigo, fecha) :
                await turnosService.consultarPorCodigo(codigo);

            setTurnoActual(turno);
            return turno;

        } catch (err) {
            setError(err.message || 'Error consultando turno');
            if (onError) {
                onError(err, 'consultar-turno');
            }
            throw err;
        } finally {
            setLoading(false);
        }
    }, [onError]);

    /**
     * Cargar turno por ID
     */
    const cargarTurno = useCallback(async (id) => {
        try {
            setLoading(true);
            setError(null);

            const turno = await turnosService.obtenerPorId(id);
            setTurnoActual(turno);
            return turno;

        } catch (err) {
            setError(err.message || 'Error cargando turno');
            if (onError) {
                onError(err, 'cargar-turno');
            }
            throw err;
        } finally {
            setLoading(false);
        }
    }, [onError]);

    /**
     * Cargar cola de espera de un sector
     */
    const cargarColaEspera = useCallback(async (sectorId) => {
        try {
            setLoading(true);
            setError(null);

            const cola = await turnosService.obtenerColaEspera(sectorId);
            setColaEspera(cola);
            return cola;

        } catch (err) {
            setError(err.message || 'Error cargando cola de espera');
            if (onError) {
                onError(err, 'cargar-cola');
            }
            throw err;
        } finally {
            setLoading(false);
        }
    }, [onError]);

    /**
     * Cargar próximo turno de un sector
     */
    const cargarProximoTurno = useCallback(async (sectorId) => {
        try {
            setError(null);

            const proximo = await turnosService.obtenerProximoTurno(sectorId);
            setProximoTurno(proximo);
            return proximo;

        } catch (err) {
            setError(err.message || 'Error cargando próximo turno');
            if (onError) {
                onError(err, 'cargar-proximo');
            }
            throw err;
        }
    }, [onError]);

    /**
     * Cargar turnos pendientes de un sector
     */
    const cargarTurnosPendientes = useCallback(async (sectorId) => {
        try {
            setLoading(true);
            setError(null);

            const pendientes = await turnosService.obtenerTurnosPendientes(sectorId);
            setTurnosPendientes(pendientes);
            return pendientes;

        } catch (err) {
            setError(err.message || 'Error cargando turnos pendientes');
            if (onError) {
                onError(err, 'cargar-pendientes');
            }
            throw err;
        } finally {
            setLoading(false);
        }
    }, [onError]);

    /**
     * Cargar turnos de un ciudadano
     */
    const cargarTurnosCiudadano = useCallback(async (dni) => {
        try {
            setLoading(true);
            setError(null);

            const turnosCiudadano = await turnosService.obtenerTurnosCiudadano(dni);
            setTurnos(turnosCiudadano);
            return turnosCiudadano;

        } catch (err) {
            setError(err.message || 'Error cargando turnos del ciudadano');
            if (onError) {
                onError(err, 'cargar-turnos-ciudadano');
            }
            throw err;
        } finally {
            setLoading(false);
        }
    }, [onError]);

    /**
     * Cargar turnos del día para un sector
     */
    const cargarTurnosDelDia = useCallback(async (sectorId, fecha) => {
        try {
            setLoading(true);
            setError(null);

            const turnosDelDia = await turnosService.obtenerTurnosDelDia(sectorId, fecha);
            setTurnos(turnosDelDia);
            return turnosDelDia;

        } catch (err) {
            setError(err.message || 'Error cargando turnos del día');
            if (onError) {
                onError(err, 'cargar-turnos-dia');
            }
            throw err;
        } finally {
            setLoading(false);
        }
    }, [onError]);

    /**
     * Generar nuevo turno
     */
    const generarTurno = useCallback(async (datosGeneracion) => {
        try {
            setOperacionEnCurso('generar');
            setError(null);

            const turnoGenerado = await turnosService.generarTurno(datosGeneracion);

            // Actualizar estados relevantes
            if (turnoGenerado.sector?.id === sectorId) {
                // Si es del sector actual, agregar a las listas locales
                setTurnos(prev => [...prev, turnoGenerado]);
                setColaEspera(prev => [...prev, turnoGenerado]);
                setTurnosPendientes(prev => [...prev, turnoGenerado]);
            }

            if (onSuccess) {
                onSuccess(turnoGenerado, 'generar');
            }

            return turnoGenerado;

        } catch (err) {
            setError(err.message || 'Error generando turno');
            if (onError) {
                onError(err, 'generar');
            }
            throw err;
        } finally {
            setOperacionEnCurso(null);
        }
    }, [onError, onSuccess, sectorId]);

    /**
     * Llamar turno
     */
    const llamarTurno = useCallback(async (turnoId, observaciones = '') => {
        try {
            setOperacionEnCurso('llamar');
            setError(null);

            const turnoLlamado = await turnosService.llamarTurno(turnoId, { observaciones });

            // Actualizar en todas las listas donde esté presente
            const actualizarTurno = (lista) =>
                lista.map(turno => turno.id === turnoId ? turnoLlamado : turno);

            setTurnos(actualizarTurno);
            setColaEspera(actualizarTurno);
            setTurnosPendientes(actualizarTurno);

            if (turnoActual?.id === turnoId) {
                setTurnoActual(turnoLlamado);
            }

            if (onSuccess) {
                onSuccess(turnoLlamado, 'llamar');
            }

            return turnoLlamado;

        } catch (err) {
            setError(err.message || 'Error llamando turno');
            if (onError) {
                onError(err, 'llamar');
            }
            throw err;
        } finally {
            setOperacionEnCurso(null);
        }
    }, [onError, onSuccess, turnoActual]);

    /**
     * Iniciar atención
     */
    const iniciarAtencion = useCallback(async (turnoId) => {
        try {
            setOperacionEnCurso('iniciar-atencion');
            setError(null);

            const turnoEnAtencion = await turnosService.iniciarAtencion(turnoId);

            // Actualizar en todas las listas
            const actualizarTurno = (lista) =>
                lista.map(turno => turno.id === turnoId ? turnoEnAtencion : turno);

            setTurnos(actualizarTurno);
            setColaEspera(actualizarTurno);
            setTurnosPendientes(prev => prev.filter(turno => turno.id !== turnoId)); // Quitar de pendientes

            if (turnoActual?.id === turnoId) {
                setTurnoActual(turnoEnAtencion);
            }

            if (onSuccess) {
                onSuccess(turnoEnAtencion, 'iniciar-atencion');
            }

            return turnoEnAtencion;

        } catch (err) {
            setError(err.message || 'Error iniciando atención');
            if (onError) {
                onError(err, 'iniciar-atencion');
            }
            throw err;
        } finally {
            setOperacionEnCurso(null);
        }
    }, [onError, onSuccess, turnoActual]);

    /**
     * Finalizar atención
     */
    const finalizarAtencion = useCallback(async (turnoId, observaciones = '') => {
        try {
            setOperacionEnCurso('finalizar');
            setError(null);

            const turnoFinalizado = await turnosService.finalizarAtencion(turnoId, observaciones);

            // Actualizar en todas las listas
            const actualizarTurno = (lista) =>
                lista.map(turno => turno.id === turnoId ? turnoFinalizado : turno);

            setTurnos(actualizarTurno);
            setColaEspera(prev => prev.filter(turno => turno.id !== turnoId)); // Quitar de cola
            setTurnosPendientes(prev => prev.filter(turno => turno.id !== turnoId)); // Quitar de pendientes

            if (turnoActual?.id === turnoId) {
                setTurnoActual(turnoFinalizado);
            }

            if (onSuccess) {
                onSuccess(turnoFinalizado, 'finalizar');
            }

            return turnoFinalizado;

        } catch (err) {
            setError(err.message || 'Error finalizando atención');
            if (onError) {
                onError(err, 'finalizar');
            }
            throw err;
        } finally {
            setOperacionEnCurso(null);
        }
    }, [onError, onSuccess, turnoActual]);

    /**
     * Marcar turno como ausente
     */
    const marcarAusente = useCallback(async (turnoId, observaciones = '') => {
        try {
            setOperacionEnCurso('marcar-ausente');
            setError(null);

            const turnoAusente = await turnosService.marcarAusente(turnoId, observaciones);

            // Actualizar en todas las listas
            const actualizarTurno = (lista) =>
                lista.map(turno => turno.id === turnoId ? turnoAusente : turno);

            setTurnos(actualizarTurno);
            setColaEspera(prev => prev.filter(turno => turno.id !== turnoId)); // Quitar de cola
            setTurnosPendientes(prev => prev.filter(turno => turno.id !== turnoId)); // Quitar de pendientes

            if (turnoActual?.id === turnoId) {
                setTurnoActual(turnoAusente);
            }

            if (onSuccess) {
                onSuccess(turnoAusente, 'marcar-ausente');
            }

            return turnoAusente;

        } catch (err) {
            setError(err.message || 'Error marcando como ausente');
            if (onError) {
                onError(err, 'marcar-ausente');
            }
            throw err;
        } finally {
            setOperacionEnCurso(null);
        }
    }, [onError, onSuccess, turnoActual]);

    /**
     * Redirigir turno
     */
    const redirigirTurno = useCallback(async (turnoId, nuevoSectorId, motivo, observaciones = '') => {
        try {
            setOperacionEnCurso('redirigir');
            setError(null);

            const turnoRedirigido = await turnosService.redirigirTurno(turnoId, nuevoSectorId, motivo, observaciones);

            // Actualizar en todas las listas
            const actualizarTurno = (lista) =>
                lista.map(turno => turno.id === turnoId ? turnoRedirigido : turno);

            setTurnos(actualizarTurno);

            // Si se redirige a otro sector, quitar de las listas del sector actual
            if (turnoRedirigido.sector?.id !== sectorId) {
                setColaEspera(prev => prev.filter(turno => turno.id !== turnoId));
                setTurnosPendientes(prev => prev.filter(turno => turno.id !== turnoId));
            } else {
                setColaEspera(actualizarTurno);
                setTurnosPendientes(actualizarTurno);
            }

            if (turnoActual?.id === turnoId) {
                setTurnoActual(turnoRedirigido);
            }

            if (onSuccess) {
                onSuccess(turnoRedirigido, 'redirigir');
            }

            return turnoRedirigido;

        } catch (err) {
            setError(err.message || 'Error redirigiendo turno');
            if (onError) {
                onError(err, 'redirigir');
            }
            throw err;
        } finally {
            setOperacionEnCurso(null);
        }
    }, [onError, onSuccess, turnoActual, sectorId]);

    /**
     * Refrescar datos del sector
     */
    const refrescarDatosSector = useCallback(async (sectorId) => {
        try {
            setError(null);

            // Cargar todos los datos en paralelo
            const [cola, proximo, pendientes] = await Promise.all([
                turnosService.obtenerColaEspera(sectorId),
                turnosService.obtenerProximoTurno(sectorId),
                turnosService.obtenerTurnosPendientes(sectorId)
            ]);

            setColaEspera(cola);
            setProximoTurno(proximo);
            setTurnosPendientes(pendientes);

            return { cola, proximo, pendientes };

        } catch (err) {
            setError(err.message || 'Error refrescando datos');
            if (onError) {
                onError(err, 'refrescar');
            }
            throw err;
        }
    }, [onError]);

    /**
     * Limpiar estados
     */
    const limpiarEstados = useCallback(() => {
        setTurnos([]);
        setTurnoActual(null);
        setColaEspera([]);
        setProximoTurno(null);
        setTurnosPendientes([]);
        setError(null);
    }, []);

    /**
     * Limpiar errores
     */
    const limpiarError = useCallback(() => {
        setError(null);
    }, []);

    /**
     * Filtrar turnos según criterios
     */
    const filtrarTurnos = useCallback((turnos, filtros = {}) => {
        const { estado, ciudadano, fechaDesde, fechaHasta } = filtros;

        return turnos.filter(turno => {
            // Filtrar por estado
            if (estado && estado !== 'TODOS') {
                if (turno.estado !== estado) return false;
            }

            // Filtrar por ciudadano (DNI o nombre)
            if (ciudadano && ciudadano.trim()) {
                const texto = ciudadano.toLowerCase();
                const coincide =
                    turno.ciudadano?.dni?.includes(texto) ||
                    turno.ciudadano?.nombreCompleto?.toLowerCase().includes(texto);
                if (!coincide) return false;
            }

            // Filtrar por fecha
            if (fechaDesde) {
                const fechaTurno = new Date(turno.fechaHoraCreacion).toDateString();
                const fechaDesdeObj = new Date(fechaDesde).toDateString();
                if (fechaTurno < fechaDesdeObj) return false;
            }

            if (fechaHasta) {
                const fechaTurno = new Date(turno.fechaHoraCreacion).toDateString();
                const fechaHastaObj = new Date(fechaHasta).toDateString();
                if (fechaTurno > fechaHastaObj) return false;
            }

            return true;
        });
    }, []);

    // Efecto para carga automática
    useEffect(() => {
        if (autoLoad && sectorId) {
            refrescarDatosSector(sectorId);
        }
    }, [autoLoad, sectorId, refrescarDatosSector]);

    // Efecto para refresco automático
    useEffect(() => {
        if (refreshInterval && sectorId) {
            const interval = setInterval(() => {
                refrescarDatosSector(sectorId).catch(console.error);
            }, refreshInterval);

            return () => clearInterval(interval);
        }
    }, [refreshInterval, sectorId, refrescarDatosSector]);

    // Estadísticas derivadas
    const estadisticas = {
        totalTurnos: turnos.length,
        enEspera: turnos.filter(t => t.estado === 'GENERADO').length,
        llamados: turnos.filter(t => t.estado === 'LLAMADO').length,
        enAtencion: turnos.filter(t => t.estado === 'EN_ATENCION').length,
        finalizados: turnos.filter(t => t.estado === 'FINALIZADO').length,
        ausentes: turnos.filter(t => t.estado === 'AUSENTE').length,
        redirigidos: turnos.filter(t => t.estado === 'REDIRIGIDO').length,
        prioritarios: turnos.filter(t => t.esPrioritario).length,
        colaActual: colaEspera.length,
        pendientesTotal: turnosPendientes.length
    };

    return {
        // Estados principales
        turnos,
        turnoActual,
        colaEspera,
        proximoTurno,
        turnosPendientes,
        loading,
        error,
        operacionEnCurso,

        // Acciones de consulta
        consultarTurnoPorCodigo,
        cargarTurno,
        cargarColaEspera,
        cargarProximoTurno,
        cargarTurnosPendientes,
        cargarTurnosCiudadano,
        cargarTurnosDelDia,

        // Acciones de operación
        generarTurno,
        llamarTurno,
        iniciarAtencion,
        finalizarAtencion,
        marcarAusente,
        redirigirTurno,

        // Utilidades
        refrescarDatosSector,
        filtrarTurnos,
        limpiarEstados,
        limpiarError,

        // Información del estado
        isLoading: loading,
        hasError: !!error,
        isEmpty: turnos.length === 0,
        isOperating: !!operacionEnCurso,
        hasProximoTurno: !!proximoTurno,
        hasColaEspera: colaEspera.length > 0,

        // Datos derivados
        estadisticas
    };
};

export default useTurnos;