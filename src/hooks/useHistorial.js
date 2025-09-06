// import { useCallback, useMemo, useRef, useState } from 'react';
// import historialService from '../services/historialService';

// export function useHistorial() {
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState(null);
//     const abortRef = useRef(null);

//     const cancelPending = () => {
//         if (abortRef.current) {
//             abortRef.current.abort();
//             abortRef.current = null;
//         }
//     };

//     const run = useCallback(async (fn) => {
//         setLoading(true);
//         setError(null);
//         cancelPending();
//         abortRef.current = new AbortController();
//         try {
//             const resp = await fn({ signal: abortRef.current.signal });
//             return resp?.data?.data ?? resp?.data; // ApiResponseWrapper.success(data, msg)
//         } catch (e) {
//             setError(e?.response?.data?.message || e.message);
//             return null;
//         } finally {
//             setLoading(false);
//         }
//     }, []);

//     // Exponemos funciones enfocadas (evitamos sobrecargar el componente)
//     const api = useMemo(() => ({
//         porTurnoId: (id) => run(() => historialService.obtenerPorTurnoId(id)),
//         porCodigo: (codigo) => run(() => historialService.obtenerPorCodigo(codigo)),
//         legible: (id) => run(() => historialService.obtenerLegible(id)),

//         ultimas: (limite) => run(() => historialService.ultimasAcciones(limite)),
//         hoy: () => run(() => historialService.accionesHoy()),
//         reciente: () => run(() => historialService.actividadReciente()),

//         porFecha: (fechaISO, limite) => run(() => historialService.porFecha(fechaISO, limite)),
//         compararFechas: (f1, f2) => run(() => historialService.compararFechas(f1, f2)),

//         redirecciones: (limite) => run(() => historialService.redirecciones(limite)),
//         cambiosEstado: (limite) => run(() => historialService.cambiosEstado(limite)),

//         trazabilidadDni: (dni, limite) => run(() => historialService.trazabilidadCiudadano(dni, limite)),

//         accionesEmpleado: (empleadoId, fi, ff) => run(() => historialService.accionesEmpleadoPeriodo(empleadoId, fi, ff)),
//         auditoriaEmpleado: (empleadoId, fi, ff) => run(() => historialService.auditoriaEmpleado(empleadoId, fi, ff)),
//         cancelPending,
//     }), [run]);

//     return { loading, error, ...api };
// }


import { useState, useCallback } from 'react';
import historialService from '../services/historialService';

export default function useHistorial() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Helper para manejo de operaciones
    const executeOperation = useCallback(async (operation, operationName) => {
        try {
            setLoading(true);
            setError(null);
            const result = await operation();
            return result;
        } catch (err) {
            const message = err.message || `Error en ${operationName}`;
            setError(message);
            console.error(`Error en ${operationName}:`, err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // ==========================================
    // MÉTODOS EXISTENTES
    // ==========================================

    const ultimas = useCallback(async (limite = 50) => {
        return executeOperation(
            () => historialService.ultimas(limite),
            'últimas acciones'
        );
    }, [executeOperation]);

    const hoy = useCallback(async () => {
        return executeOperation(
            () => historialService.hoy(),
            'acciones de hoy'
        );
    }, [executeOperation]);

    const reciente = useCallback(async () => {
        return executeOperation(
            () => historialService.reciente(),
            'actividad reciente'
        );
    }, [executeOperation]);

    const porTurnoId = useCallback(async (turnoId) => {
        return executeOperation(
            () => historialService.porTurnoId(turnoId),
            'historial por turno ID'
        );
    }, [executeOperation]);

    const porCodigo = useCallback(async (codigo) => {
        return executeOperation(
            () => historialService.porCodigo(codigo),
            'historial por código'
        );
    }, [executeOperation]);

    const legible = useCallback(async (turnoId) => {
        return executeOperation(
            () => historialService.legible(turnoId),
            'historial legible'
        );
    }, [executeOperation]);

    const porFecha = useCallback(async (fecha, limite = 200) => {
        return executeOperation(
            () => historialService.porFecha(fecha, limite),
            'historial por fecha'
        );
    }, [executeOperation]);

    const compararFechas = useCallback(async (fecha1, fecha2) => {
        return executeOperation(
            () => historialService.compararFechas(fecha1, fecha2),
            'comparación de fechas'
        );
    }, [executeOperation]);

    const redirecciones = useCallback(async (limite = 100) => {
        return executeOperation(
            () => historialService.redirecciones(limite),
            'redirecciones'
        );
    }, [executeOperation]);

    const cambiosEstado = useCallback(async (limite = 100) => {
        return executeOperation(
            () => historialService.cambiosEstado(limite),
            'cambios de estado'
        );
    }, [executeOperation]);

    const trazabilidadDni = useCallback(async (dni, limite = 200) => {
        return executeOperation(
            () => historialService.trazabilidadDni(dni, limite),
            'trazabilidad por DNI'
        );
    }, [executeOperation]);

    const accionesEmpleado = useCallback(async (empleadoId, fechaInicio, fechaFin) => {
        return executeOperation(
            () => historialService.accionesEmpleado(empleadoId, fechaInicio, fechaFin),
            'acciones de empleado'
        );
    }, [executeOperation]);

    const auditoriaEmpleado = useCallback(async (empleadoId, fechaInicio, fechaFin) => {
        return executeOperation(
            () => historialService.auditoriaEmpleado(empleadoId, fechaInicio, fechaFin),
            'auditoría de empleado'
        );
    }, [executeOperation]);

    // ==========================================
    // NUEVOS MÉTODOS
    // ==========================================

    const historialCiudadano = useCallback(async (dni, limite = 100) => {
        return executeOperation(
            () => historialService.historialCiudadano(dni, limite),
            'historial de ciudadano'
        );
    }, [executeOperation]);

    const metricasHoy = useCallback(async () => {
        return executeOperation(
            () => historialService.metricasHoy(),
            'métricas de hoy'
        );
    }, [executeOperation]);

    const compararSectores = useCallback(async (sectorId1, sectorId2, fecha) => {
        return executeOperation(
            () => historialService.compararSectores(sectorId1, sectorId2, fecha),
            'comparación de sectores'
        );
    }, [executeOperation]);

    // ==========================================
    // MÉTODOS DE UTILIDAD
    // ==========================================

    const formatearHistorialLegible = useCallback((historialLegible) => {
        return historialService.formatearHistorialLegible(historialLegible);
    }, []);

    const agruparPorFecha = useCallback((acciones) => {
        return historialService.agruparPorFecha(acciones);
    }, []);

    const filtrarPorTipo = useCallback((acciones, tipo) => {
        return historialService.filtrarPorTipo(acciones, tipo);
    }, []);

    const calcularEstadisticas = useCallback((acciones) => {
        return historialService.calcularEstadisticas(acciones);
    }, []);

    const limpiarError = useCallback(() => {
        setError(null);
    }, []);

    const limpiarEstado = useCallback(() => {
        setError(null);
        setLoading(false);
    }, []);

    // ==========================================
    // MÉTODOS AVANZADOS PARA ANÁLISIS
    // ==========================================

    const obtenerResumenDiario = useCallback(async (fecha) => {
        try {
            setLoading(true);
            setError(null);

            const [accionesDelDia, metricas] = await Promise.all([
                historialService.porFecha(fecha, 1000),
                fecha === new Date().toISOString().split('T')[0] 
                    ? historialService.metricasHoy() 
                    : null
            ]);

            const estadisticas = historialService.calcularEstadisticas(accionesDelDia);
            const agrupadas = historialService.agruparPorFecha(accionesDelDia);

            return {
                fecha,
                acciones: accionesDelDia,
                estadisticas,
                agrupadas,
                metricas,
                totalAcciones: accionesDelDia.length
            };

        } catch (err) {
            const message = err.message || 'Error obteniendo resumen diario';
            setError(message);
            console.error('Error en resumen diario:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const buscarEnHistorial = useCallback(async (criterios = {}) => {
        try {
            setLoading(true);
            setError(null);

            const { tipo, empleado, sector, fechaInicio, fechaFin, limite = 200 } = criterios;
            
            // Obtener acciones base
            let acciones = [];
            
            if (fechaInicio && fechaFin) {
                // Si hay rango de fechas, obtener por cada día y combinar
                const fechas = generarRangoFechas(fechaInicio, fechaFin);
                const promesas = fechas.map(fecha => historialService.porFecha(fecha, limite));
                const resultados = await Promise.all(promesas);
                acciones = resultados.flat();
            } else if (fechaInicio) {
                acciones = await historialService.porFecha(fechaInicio, limite);
            } else {
                acciones = await historialService.ultimas(limite);
            }

            // Aplicar filtros
            if (tipo) {
                acciones = historialService.filtrarPorTipo(acciones, tipo);
            }

            if (empleado) {
                acciones = acciones.filter(accion => 
                    (accion.empleadoNombre || '').toLowerCase().includes(empleado.toLowerCase()) ||
                    (accion.empleado?.nombreCompleto || '').toLowerCase().includes(empleado.toLowerCase())
                );
            }

            if (sector) {
                acciones = acciones.filter(accion => 
                    (accion.sectorNombre || '').toLowerCase().includes(sector.toLowerCase()) ||
                    (accion.sector?.nombre || '').toLowerCase().includes(sector.toLowerCase())
                );
            }

            const estadisticas = historialService.calcularEstadisticas(acciones);

            return {
                acciones,
                estadisticas,
                criterios,
                total: acciones.length
            };

        } catch (err) {
            const message = err.message || 'Error en búsqueda de historial';
            setError(message);
            console.error('Error en búsqueda:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Helper para generar rango de fechas
    const generarRangoFechas = (fechaInicio, fechaFin) => {
        const fechas = [];
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);
        
        for (let fecha = new Date(inicio); fecha <= fin; fecha.setDate(fecha.getDate() + 1)) {
            fechas.push(fecha.toISOString().split('T')[0]);
        }
        
        return fechas;
    };

    return {
        // Estado
        loading,
        error,

        // Métodos existentes
        ultimas,
        hoy,
        reciente,
        porTurnoId,
        porCodigo,
        legible,
        porFecha,
        compararFechas,
        redirecciones,
        cambiosEstado,
        trazabilidadDni,
        accionesEmpleado,
        auditoriaEmpleado,

        // Nuevos métodos
        historialCiudadano,
        metricasHoy,
        compararSectores,

        // Métodos de utilidad
        formatearHistorialLegible,
        agruparPorFecha,
        filtrarPorTipo,
        calcularEstadisticas,
        limpiarError,
        limpiarEstado,

        // Métodos avanzados
        obtenerResumenDiario,
        buscarEnHistorial,

        // Estados derivados
        hasError: !!error,
        isLoading: loading
    };
}
