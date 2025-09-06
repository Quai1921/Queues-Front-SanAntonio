import { useCallback, useMemo, useRef, useState } from 'react';
import historialService from '../services/historialService';

export function useHistorial() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const abortRef = useRef(null);

    const cancelPending = () => {
        if (abortRef.current) {
            abortRef.current.abort();
            abortRef.current = null;
        }
    };

    const run = useCallback(async (fn) => {
        setLoading(true);
        setError(null);
        cancelPending();
        abortRef.current = new AbortController();
        try {
            const resp = await fn({ signal: abortRef.current.signal });
            return resp?.data?.data ?? resp?.data; // ApiResponseWrapper.success(data, msg)
        } catch (e) {
            setError(e?.response?.data?.message || e.message);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    // Exponemos funciones enfocadas (evitamos sobrecargar el componente)
    const api = useMemo(() => ({
        porTurnoId: (id) => run(() => historialService.obtenerPorTurnoId(id)),
        porCodigo: (codigo) => run(() => historialService.obtenerPorCodigo(codigo)),
        legible: (id) => run(() => historialService.obtenerLegible(id)),

        ultimas: (limite) => run(() => historialService.ultimasAcciones(limite)),
        hoy: () => run(() => historialService.accionesHoy()),
        reciente: () => run(() => historialService.actividadReciente()),

        porFecha: (fechaISO, limite) => run(() => historialService.porFecha(fechaISO, limite)),
        compararFechas: (f1, f2) => run(() => historialService.compararFechas(f1, f2)),

        redirecciones: (limite) => run(() => historialService.redirecciones(limite)),
        cambiosEstado: (limite) => run(() => historialService.cambiosEstado(limite)),

        trazabilidadDni: (dni, limite) => run(() => historialService.trazabilidadCiudadano(dni, limite)),

        accionesEmpleado: (empleadoId, fi, ff) => run(() => historialService.accionesEmpleadoPeriodo(empleadoId, fi, ff)),
        auditoriaEmpleado: (empleadoId, fi, ff) => run(() => historialService.auditoriaEmpleado(empleadoId, fi, ff)),
        cancelPending,
    }), [run]);

    return { loading, error, ...api };
}
