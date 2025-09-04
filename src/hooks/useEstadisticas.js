// src/hooks/useEstadisticas.js
import { useCallback, useMemo, useState } from 'react';
import estadisticasService from '../services/estadisticasService';

export function useEstadisticas() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [resumen, setResumen] = useState([]);   // listas (resumen hoy/fecha, periodo, comparaciones)
    const [detalle, setDetalle] = useState(null); // objeto (sector hoy / por fecha / hora pico)
    const [filtros, setFiltros] = useState({
        modo: 'RESUMEN_HOY', // RESUMEN_HOY | RESUMEN_FECHA | SECTOR_HOY | SECTOR_FECHA | SECTOR_PERIODO | GENERAL_PERIODO | COMPARAR
        sectorId: null,
        sectorId2: null,
        empleadoId: null,
        fecha: '',
        fechaInicio: '',
        fechaFin: '',
    });

    const run = async (fn, onOk) => {
        try {
            setLoading(true); setError(null);
            const { data } = await fn();
            const payload = data?.data ?? data; // ApiResponseWrapper.data
            onOk?.(payload);
            return payload;
        } catch (e) {
            setError(e);
            throw e;
        } finally {
            setLoading(false);
        }
    };

    // Cargas rápidas
    const cargarResumenHoy = useCallback(() => run(() => estadisticasService.getResumenHoy(), setResumen), []);
    const cargarResumenFecha = useCallback((fecha) => run(() => estadisticasService.getResumenDiario(fecha), setResumen), []);

    const cargarSectorHoy = useCallback((sectorId) => run(() => estadisticasService.getSectorToday(sectorId), setDetalle), []);
    const cargarSectorFecha = useCallback((sectorId, fecha) => run(() => estadisticasService.getSectorByDate(sectorId, fecha), setDetalle), []);
    const cargarSectorPeriodo = useCallback((sectorId, fi, ff) => run(() => estadisticasService.getSectorPeriod(sectorId, fi, ff), setResumen), []);
    const cargarGeneralPeriodo = useCallback((fi, ff) => run(() => estadisticasService.getGeneralPeriod(fi, ff), setResumen), []);
    const compararSectores = useCallback((s1, s2, fi, ff) => run(() => estadisticasService.compararSectores(s1, s2, fi, ff), setResumen), []);

    const calcularHoraPico = useCallback((sectorId, fecha) => run(() => estadisticasService.calcularHoraPico(sectorId, fecha), setDetalle), []);
    const generarReporteResumen = useCallback((fi, ff) => run(() => estadisticasService.generarReporteResumen({ fechaInicio: fi, fechaFin: ff })), []);
    const generarReporteHoy = useCallback(() => run(() => estadisticasService.generarReporteHoy()), []);
    const generarReporteFecha = useCallback((fecha) => run(() => estadisticasService.generarReporteFecha(fecha)), []);

    const api = useMemo(() => ({
        loading, error, resumen, detalle, filtros, setFiltros,
        cargarResumenHoy, cargarResumenFecha,
        cargarSectorHoy, cargarSectorFecha, cargarSectorPeriodo, cargarGeneralPeriodo,
        compararSectores, calcularHoraPico,
        generarReporteResumen, generarReporteHoy, generarReporteFecha
    }), [loading, error, resumen, detalle, filtros]);

    return api;
}
