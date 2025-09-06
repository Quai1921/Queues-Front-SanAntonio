import { useState, useEffect, useCallback } from 'react';
import { useEstadisticas } from './useEstadisticas';
import statisticsService from '../services/statisticsService';

export default function useDashboard() {
    const { resumen, cargarResumenHoy, loading: loadingTurnos, error: errorTurnos } = useEstadisticas();
    const [empleados, setEmpleados] = useState({ total: 0, activos: 0, inactivos: 0, porcentajeActivos: 0 });
    const [loadingEmp, setLoadingEmp] = useState(false);
    const [errorEmp, setErrorEmp] = useState(null);

    const load = useCallback(async () => {
        await cargarResumenHoy(); // turnos de hoy
        setLoadingEmp(true); setErrorEmp(null);
        try {
            const e = await statisticsService.getEmpleadosStats();
            const total = e.totalEmpleados ?? e.total ?? 0;
            const activos = e.empleadosActivos ?? e.activos ?? 0;
            const inactivos = e.empleadosInactivos ?? e.inactivos ?? Math.max(0, total - activos);
            const porcentaje = e.porcentajeActivos ?? (total ? Math.round((activos / total) * 100) : 0);
            setEmpleados({ total, activos, inactivos, porcentajeActivos: porcentaje });
        } catch (err) {
            setErrorEmp(err.message || 'Error empleados');
        } finally {
            setLoadingEmp(false);
        }
    }, [cargarResumenHoy]);

    useEffect(() => { load(); }, [load]);

    const turnos = aggregateResumen(resumen);

    return {
        loading: loadingTurnos || loadingEmp,
        error: errorTurnos || errorEmp,
        turnos,     // { generados, atendidos, pendientes, ausentes, redirigidos, tiempoPromedio, eficiencia }
        empleados,  // { total, activos, inactivos, porcentajeActivos }
    };
}

function aggregateResumen(list = []) {
    const acc = { generados: 0, atendidos: 0, ausentes: 0, redirigidos: 0, pendientes: 0, tiempoPromedio: 0, eficiencia: 0 };
    let sumaAt = 0, atendidosConTiempo = 0;
    list.forEach(r => {
        const g = r.turnosGenerados || 0, a = r.turnosAtendidos || 0, au = r.turnosAusentes || 0, c = r.turnosCancelados || 0, rd = r.turnosRedirigidos || 0;
        acc.generados += g;
        acc.atendidos += a;
        acc.ausentes += au;
        acc.redirigidos += rd;
        acc.pendientes += Math.max(0, g - a - au - c);
        if ((r.tiempoPromedioAtencion || 0) > 0 && a > 0) {
            sumaAt += r.tiempoPromedioAtencion * a;
            atendidosConTiempo += a;
        }
    });
    acc.tiempoPromedio = atendidosConTiempo ? Math.round(sumaAt / atendidosConTiempo) : 0;
    acc.eficiencia = acc.generados ? Math.round((acc.atendidos / acc.generados) * 100) : 0;
    return acc;
}
