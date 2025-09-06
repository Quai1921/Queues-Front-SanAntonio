import { useState, useCallback, useMemo } from 'react';
import estadisticasService from '../services/estadisticasService';

export const useEstadisticas = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Datos crudos
    const [resumen, setResumen] = useState([]);   // listas (por sector o por fecha)
    const [detalle, setDetalle] = useState(null); // objeto (detalle sector)
    const [resumenPeriodoSector, setResumenPeriodoSector] = useState([]);
    const [acumSector, setAcumSector] = useState([]);

    // Filtros
    const [tab, setTab] = useState('HOY'); // HOY | FECHA | SECTOR | PERIODO
    const [fecha, setFecha] = useState('');
    const [sectorId, setSectorId] = useState('');
    const [desde, setDesde] = useState('');
    const [hasta, setHasta] = useState('');

    const run = async (fn) => {
        setLoading(true); setError(null);
        try { await fn(); } catch (e) { setError(e?.message || 'Error'); }
        finally { setLoading(false); }
    };

    // ---- Cargas ----
    const cargarResumenHoy = useCallback(() => run(async () => {
        const data = await estadisticasService.getDiario(); // lista por sector (hoy)
        setResumen(Array.isArray(data) ? data : []);
        setDetalle(null);
    }), []);

    const cargarResumenFecha = useCallback((f) => run(async () => {
        const data = await estadisticasService.getDiario({ fecha: f });
        setResumen(Array.isArray(data) ? data : []);
        setDetalle(null);
    }), []);

    const cargarSectorHoy = useCallback((sid) => run(async () => {
        const obj = await estadisticasService.getDiario({ sectorId: sid });
        setDetalle(obj || null);
        setResumen([]);
    }), []);

    const cargarSectorFecha = useCallback((sid, f) => run(async () => {
        const obj = await estadisticasService.getDiario({ sectorId: sid, fecha: f });
        setDetalle(obj || null);
        setResumen([]);
    }), []);

    const cargarEmpleadoFecha = useCallback((sid, eid, f) => run(async () => {
        const obj = await estadisticasService.getDiario({ sectorId: sid, empleadoId: eid, fecha: f });
        setDetalle(obj || null);
        setResumen([]);
    }), [])

    const cargarSectorPeriodo = useCallback((sid, d, h) => run(async () => {
        const arr = await estadisticasService.getPeriodo({ sectorId: sid, desde: d, hasta: h, groupBy: 'FECHA' });
        setResumen(arr || []);
        setDetalle(null);
    }), []);

    const cargarGeneralPeriodo = useCallback((d, h, groupBy = 'FECHA') => run(async () => {
        const arr = await estadisticasService.getPeriodo({ desde: d, hasta: h, groupBy });
        setResumen(arr || []);
        setDetalle(null);
    }), []);

    const cargarGeneralPeriodoSector = useCallback((desde, hasta) =>
        run(async () => {
            const arr = await estadisticasService.getPeriodo({ desde, hasta, groupBy: 'SECTOR' });
            setResumenPeriodoSector(arr || []);
        }), []);

    const cargarAcumuladosSector = useCallback((d, h) => run(async () => {
        // Permite configurar inicio desde .env (VITE_STATS_EPOCH). Fallback a 2000-01-01.
        const ACUM_EPOCH = (import.meta?.env?.VITE_STATS_EPOCH) || '2000-01-01';
        const desdeEf = d || ACUM_EPOCH;
        const hastaEf = h || new Date().toISOString().slice(0, 10);
        const arr = await estadisticasService.getPeriodo({ desde: desdeEf, hasta: hastaEf, groupBy: 'SECTOR' });
        setAcumSector(arr || []);
    }), []);

    // ---- KPIs (funcionan con lista o detalle) ----
    const kpis = useMemo(() => {
        if (detalle) {
            const g = detalle?.turnosGenerados ?? 0;
            const a = detalle?.turnosAtendidos ?? 0;
            const au = detalle?.turnosAusentes ?? 0;
            const ef = detalle?.porcentajeEficiencia ?? (g ? (a / g) * 100 : 0);
            return {
                generados: g,
                atendidos: a,
                ausentes: au,
                eficiencia: ef,
                esperaProm: detalle?.tiempoPromedioEspera ?? 0,
                atencionProm: detalle?.tiempoPromedioAtencion ?? 0,
            };
        }
        // agregar las filas para resumen
        const sum = (key) => (resumen || []).reduce((acc, r) => acc + (r?.[key] ?? 0), 0);
        const g = sum('turnosGenerados');
        const a = sum('turnosAtendidos');
        const au = sum('turnosAusentes');
        const ef = g ? (a / g) * 100 : 0;
        const esperaProm = Math.round(((resumen || []).reduce((acc, r) => acc + (r?.tiempoPromedioEspera ?? 0), 0) / Math.max(1, resumen.length)));
        const atencionProm = Math.round(((resumen || []).reduce((acc, r) => acc + (r?.tiempoPromedioAtencion ?? 0), 0) / Math.max(1, resumen.length)));
        return { generados: g, atendidos: a, ausentes: au, eficiencia: ef, esperaProm, atencionProm };
    }, [resumen, detalle]);

    // ---- Datasets para gráficos ----
    // 1) Serie temporal (cuando groupBy=FECHA o hay campo fecha)
    const serieTemporal = useMemo(() => {
        const rows = (resumen || []).filter(r => r?.fecha);
        if (!rows.length) return [];
        return rows.map(r => ({
            fecha: r.fecha,
            generados: r.turnosGenerados ?? 0,
            atendidos: r.turnosAtendidos ?? 0,
            ausentes: r.turnosAusentes ?? 0,
        }));
    }, [resumen]);

    // 2) Barras por sector (cuando hay sector en filas)
    const barrasSector = useMemo(() => {
        // a) lista (resumen)
        const rows = (resumen || []).filter(r => r?.sectorNombre || r?.sector);
        if (rows.length) {
            const abreviar = (str = '', max = 16) => {
                const s = String(str);
                return s.length > max ? s.slice(0, max - 1) + '…' : s;
            }
            return rows.map(r => {
                const sectorNombre = r.sectorNombre ?? r?.sector?.nombre ?? '—';
                const sectorCodigo = r.sectorCodigo ?? r?.sector?.codigo;
                return {
                    sectorFull: sectorNombre,
                    sectorLabel: sectorCodigo || abreviar(sectorNombre),
                    generados: r.turnosGenerados ?? 0,
                    atendidos: r.turnosAtendidos ?? 0,
                    ausentes: r.turnosAusentes ?? 0,
                    eficiencia: Math.round(r?.porcentajeEficiencia ?? 0),
                };
            });
        }

        // b) fallback: detalle (un solo sector)
        if (detalle) {
            const nombre = detalle?.sector?.nombre ?? detalle?.sectorNombre ?? 'Sector';
            const codigo = detalle?.sector?.codigo ?? detalle?.sectorCodigo ?? '—';
            return [{
                sectorFull: nombre,
                sectorLabel: codigo || nombre,
                generados: detalle?.turnosGenerados ?? 0,
                atendidos: detalle?.turnosAtendidos ?? 0,
                ausentes: detalle?.turnosAusentes ?? 0,
                eficiencia: Math.round(detalle?.porcentajeEficiencia ?? 0),
            }];
        }
        return [];
    }, [resumen, detalle]);

    // 3) Dona de distribución
    const donaDistribucion = useMemo(() => ([
        { name: 'Atendidos', value: kpis.atendidos },
        { name: 'Ausentes', value: kpis.ausentes },
        { name: 'Pendientes', value: Math.max(0, kpis.generados - kpis.atendidos - kpis.ausentes) },
    ]), [kpis]);

    return {
        // estado
        loading, error,
        // datos crudos
        resumen, detalle, resumenPeriodoSector, acumSector,
        // filtros
        tab, setTab, fecha, setFecha, sectorId, setSectorId, desde, setDesde, hasta, setHasta,
        // loaders
        cargarResumenHoy, cargarResumenFecha, cargarSectorHoy, cargarSectorFecha, cargarEmpleadoFecha, cargarSectorPeriodo, cargarGeneralPeriodo, cargarGeneralPeriodoSector, cargarAcumuladosSector,
        // derivados
        kpis, serieTemporal, barrasSector, donaDistribucion,
    };
};

export default useEstadisticas;
