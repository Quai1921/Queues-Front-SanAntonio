import React, { useEffect, useMemo, useState } from 'react';
import { useEstadisticas } from '../hooks/useEstadisticas';
import { apiClient } from '../services/authService';
import empleadosService from '../services/empleadoService';
import {
    ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
    BarChart, Bar, Legend, PieChart, Pie, Cell
} from 'recharts';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

const Tabs = ['HOY', 'FECHA', 'SECTOR', 'EMPLEADO', 'PERIODO'];
const PIE_COLORS = ['#4caf50', '#ef4444', '#9ca3af'];
const SERIES_COLORS = {
    generados: '#224666',
    atendidos: '#4caf50',
    ausentes: '#ef4444',
};

export default function EstadisticasSection() {
    const {
        loading, error,
        resumen, detalle, resumenPeriodoSector, acumSector,
        tab, setTab,
        fecha, setFecha, sectorId, setSectorId, desde, setDesde, hasta, setHasta,
        cargarResumenHoy, cargarResumenFecha, cargarSectorHoy, cargarSectorFecha, cargarEmpleadoFecha, cargarSectorPeriodo, cargarGeneralPeriodo, cargarGeneralPeriodoSector, cargarAcumuladosSector,
        kpis, serieTemporal, barrasSector, donaDistribucion,
    } = useEstadisticas();

    const [sectores, setSectores] = useState([]);
    const [empleadoId, setEmpleadoId] = useState('');
    const [empleados, setEmpleados] = useState([]);

    // console.log(empleados)

    // Cargar sectores (activos -> todos)
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                // llamar únicamente a /sectores (tu back sí debería tenerlo)
                const res = await apiClient.get('/sectores');

                // unwrap tolerante: puede venir como { data: [...] } o directo [...]
                let list = res?.data?.data ?? res?.data ?? [];
                if (!Array.isArray(list)) list = [];

                // normalización de claves por si el back anida
                list = list
                    .map(s => ({
                        id: s.id,
                        codigo: s.codigo ?? s.sector?.codigo ?? '',
                        nombre: s.nombre ?? s.sector?.nombre ?? '',
                        nombreCompleto:
                            s.nombreCompleto ??
                            s.sector?.nombreCompleto ??
                            [s.codigo, s.nombre].filter(Boolean).join(' - '),
                        activo: s.activo ?? s.sector?.activo ?? true,
                    }))
                    .filter(s => s.id);

                if (mounted) setSectores(list);
            } catch (err) {
                if (mounted) setSectores([]);
                // no spameamos la consola con 400; dejamos la UI vacía y lista para reintentar
                console.warn('No pude cargar /sectores.', err?.response?.status, err?.response?.data);
            }
        })();
        return () => { mounted = false; };
    }, []);

    useEffect(() => {
        // Carga histórica (desde VITE_STATS_EPOCH o 2000-01-01 hasta hoy)
        cargarAcumuladosSector();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        let alive = true;
        (async () => {
            // El select aplica solo en la pestaña EMPLEADO y con sector elegido
            if (tab !== 'EMPLEADO' || !sectorId) { setEmpleados([]); return; }

            try {
                const sid = Number(sectorId);

                // 1) Todos (para admins y para detectar multi-sector)
                const todos = await empleadosService.obtenerTodos(); // mapea a UI (incluye sectoresResponsable)
                const admins = (todos || []).filter(e => e.rol === 'ADMIN');

                // 2) Personal declarado del sector (si tu backend lo expone)
                let delSector = [];
                try {
                    const personal = await empleadosService.obtenerPersonalPorSector(sid);
                    if (personal) {
                        delSector = [
                            personal.responsable,
                            ...(Array.isArray(personal.operadores) ? personal.operadores : [])
                        ].filter(Boolean);
                    }
                } catch { /* si no existe el endpoint, seguimos */ }

                // 3) Fallback: por-sector
                if (delSector.length === 0) {
                    try {
                        delSector = await empleadosService.obtenerPorSector(sid);
                    } catch { /* noop */ }
                }

                // 4) Multi-sector detectados desde "todos"
                const multiDesdeTodos = (todos || []).filter(e =>
                    Array.isArray(e.sectoresResponsable) &&
                    e.sectoresResponsable.some(s => String(s.id) === String(sid))
                );

                // 5) Unir + deduplicar + ordenar
                const byId = new Map();
                [...admins, ...delSector, ...multiDesdeTodos].forEach(e => { if (e) byId.set(e.id, e); });
                const list = Array.from(byId.values())
                    .sort((a, b) => (a.nombreCompleto || '').localeCompare(b.nombreCompleto || '', 'es'));

                if (alive) setEmpleados(list);
                // si cambiás el sector, reseteo empleado
                setEmpleadoId('');
            } catch {
                if (alive) setEmpleados([]);
            }
        })();
        return () => { alive = false; };
    }, [tab, sectorId]);

    // Autofetch por pestaña
    useEffect(() => {
        if (tab === 'HOY') cargarResumenHoy();
        if (tab === 'FECHA' && fecha) cargarResumenFecha(fecha);
        if (tab === 'SECTOR' && sectorId) {
            if (fecha) cargarSectorFecha(Number(sectorId), fecha);
            else cargarSectorHoy(Number(sectorId));
        }
        if (tab === 'EMPLEADO' && sectorId && empleadoId && fecha) {
            cargarEmpleadoFecha(Number(sectorId), Number(empleadoId), fecha);
        }
        if (tab === 'PERIODO' && desde && hasta) {
            // Para gráficos mostramos línea FECHA; luego se puede alternar a SECTOR desde UI
            cargarGeneralPeriodo(desde, hasta, 'FECHA');
            // y aparte traigo por SECTOR, para calcular insights por sector:
            cargarGeneralPeriodoSector(desde, hasta);
        }
    }, [tab, fecha, sectorId, empleadoId, desde, hasta,
        cargarResumenHoy, cargarResumenFecha, cargarSectorHoy, cargarSectorFecha, cargarEmpleadoFecha, cargarGeneralPeriodo]);

    // Tabla y CSV
    const tableRows = useMemo(() => {
        if (!Array.isArray(resumen)) return [];
        return resumen.map((r, i) => ({
            id: `${r.sectorCodigo || r?.sector?.codigo || 'GEN'}-${r.fecha || i}`,
            fecha: r.fecha ?? '—',
            sector: r.sectorNombre ?? r?.sector?.nombre ?? '—',
            generados: r.turnosGenerados ?? 0,
            atendidos: r.turnosAtendidos ?? 0,
            ausentes: r.turnosAusentes ?? 0,
            eficiencia: Math.round(r?.porcentajeEficiencia ?? 0),
            espera: r?.tiempoPromedioEspera ?? 0,
        }));
    }, [resumen]);

    const exportCsv = () => {
        const headers = ['fecha', 'sector', 'generados', 'atendidos', 'ausentes', 'eficiencia', 'espera'];
        const rows = tableRows.map(r => [r.fecha, safe(r.sector), r.generados, r.atendidos, r.ausentes, r.eficiencia, r.espera]);
        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `estadisticas_${tab.toLowerCase()}.csv`; a.click();
        URL.revokeObjectURL(url);
    };
























    // ---------- INSIGHTS helpers ----------
    const sectorList = useMemo(
        () => (Array.isArray(acumSector) ? acumSector : []),
        [acumSector]
    );

    const getSecName = (r) => r?.sectorNombre ?? r?.sector?.nombre ?? '—';
    const getSecCode = (r) => r?.sectorCodigo ?? r?.sector?.codigo ?? '—';

    const pickMax = (arr, key) =>
        (arr || []).reduce((best, cur) => {
            const v = Number(cur?.[key]);
            const bv = Number(best?.[key]);
            return (best == null || v > bv) ? cur : best;
        }, null);
    const pickMin = (arr, key, { preferPositives = true } = {}) => {
        const base = (arr || []).filter(r => Number.isFinite(Number(r?.[key])));
        if (!base.length) return null;
        // 1) si hay positivos, elegimos el mínimo positivo
        if (preferPositives) {
            const pos = base.filter(r => Number(r?.[key]) > 0);
            if (pos.length) {
                return pos.reduce((b, c) => (Number(c[key]) < Number(b[key]) ? c : b));
            }
        }
        // 2) si no, mínimo sobre todos (incluye 0)
        return base.reduce((b, c) => (Number(c[key]) < Number(b[key]) ? c : b));
    };

    const insightSectorMasTurnos = useMemo(() => {
        if (!sectorList.length) return { title: 'Sector con más turnos', value: '—', kpi: 0 };
        const x = pickMax(sectorList, 'turnosGenerados');
        return { title: 'Sector con más turnos', value: `${getSecCode(x)} - ${getSecName(x)}`, kpi: x?.turnosGenerados ?? 0 };
    }, [sectorList]);

    const insightSectorMasEfic = useMemo(() => {
        if (!sectorList.length) return { title: 'Sector más eficiente', value: '—', kpi: '0%' };
        const x = pickMax(sectorList, 'porcentajeEficiencia');
        const v = Math.round(x?.porcentajeEficiencia ?? 0);
        return { title: 'Sector más eficiente', value: `${getSecCode(x)} - ${getSecName(x)}`, kpi: `${v}%` };
    }, [sectorList]);

    const insightSectorMinEspera = useMemo(() => {
        if (!sectorList.length) return { title: 'Menor espera prom.', value: '—', kpi: '0 min' };
        const x = pickMin(sectorList, 'tiempoPromedioEspera');
        if (!x) return { title: 'Menor espera prom.', value: '—', kpi: '0 min' };
        return { title: 'Menor espera prom.', value: `${getSecCode(x)} - ${getSecName(x)}`, kpi: `${x?.tiempoPromedioEspera ?? 0} min` };
    }, [sectorList]);

    const insightSectorMinAtencion = useMemo(() => {
        if (!sectorList.length) return { title: 'Menor atención prom.', value: '—', kpi: '0 min' };
        const x = pickMin(sectorList, 'tiempoPromedioAtencion');
        if (!x) return { title: 'Menor atención prom.', value: '—', kpi: '0 min' };
        return { title: 'Menor atención prom.', value: `${getSecCode(x)} - ${getSecName(x)}`, kpi: `${x?.tiempoPromedioAtencion ?? 0} min` };
    }, [sectorList]);

    // Empleado más eficiente (se calcula a demanda)
    const [topEmpleado, setTopEmpleado] = useState(null);
    const [rankLoading, setRankLoading] = useState(false);

    const calcularTopEmpleado = async () => {
        if (!(tab === 'EMPLEADO' && sectorId && fecha && empleados?.length)) return;
        setRankLoading(true);
        try {
            const sid = Number(sectorId);
            const results = await Promise.all(
                empleados.map(async (e) => {
                    try {
                        const d = await estadisticasService.getDiario({ sectorId: sid, empleadoId: e.id, fecha });
                        const g = d?.turnosGenerados ?? 0;
                        const a = d?.turnosAtendidos ?? 0;
                        const ef = g ? (a / g) * 100 : 0;
                        return { emp: e, g, a, ef };
                    } catch {
                        return null;
                    }
                })
            );
            const cleaned = results.filter(Boolean);
            const best = cleaned.reduce((b, c) => (b == null || (c.ef > b.ef) ? c : b), null);
            setTopEmpleado(best ? { nombre: best.emp?.nombreCompleto, kpi: `${Math.round(best.ef)}%`, extra: `${best.a}/${best.g} atendidos` } : null);
        } finally {
            setRankLoading(false);
        }
    };

    // Hora pico (del detalle cuando estás en SECTOR o EMPLEADO)
    const insightHoraPico = useMemo(() => {
        const hp = detalle?.horaPico, cant = detalle?.cantidadPico;
        if (!hp) return null;
        return { title: 'Hora pico', value: hp, kpi: `${cant ?? 0} turnos` };
    }, [detalle]);

    const insights = useMemo(() => {
        const base = [
            insightSectorMasTurnos,
            insightSectorMasEfic,
            insightSectorMinEspera,
            insightSectorMinAtencion,
        ]
        if (insightHoraPico) base.push(insightHoraPico);
        if (topEmpleado) base.push({ title: 'Empleado más eficiente', value: topEmpleado.nombre ?? '—', kpi: topEmpleado.kpi, hint: topEmpleado.extra });

        return base;
    }, [insightSectorMasTurnos, insightSectorMasEfic, insightSectorMinEspera, insightSectorMinAtencion, insightHoraPico, topEmpleado]);


    return (
        <div>
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h1 className="text-lg font-semibold tracking-[-0.01em]">Estadísticas</h1>
                    <p className="text-slate-600 text-sm">Estadísiticas por fechas y sectores</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={exportCsv} className="flex items-center px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50">
                        <FileDownloadIcon sx={{ fontSize: '20px' }} className='mr-2' />

                        Exportar CSV
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mt-4">
                {Tabs.map(t => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`px-3 h-10 rounded-lg border transition ${tab === t ? 'bg-[#224666] text-white shadow-sm mb-3'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'}`}
                    >
                        {t === 'HOY'
                            ? 'Hoy'
                            : t === 'FECHA'
                                ? 'Por fecha'
                                : t === 'SECTOR'
                                    ? 'Por sector'
                                    : t === 'EMPLEADO'
                                        ? 'Por empleado'
                                        : 'Período'}
                    </button>
                ))}
            </div>

            {/* Filtros */}
            <div className="sticky top-0 z-10 bg-white/80 backdrop-blur rounded-xl border border-slate-200 p-3 grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                {tab === 'FECHA' && (
                    <Field label="Fecha">
                        <input type="date" className="px-3 py-2 border border-slate-300 rounded-lg transition-colors" value={fecha} onChange={e => setFecha(e.target.value)} />
                    </Field>
                )}
                {tab === 'SECTOR' && (
                    <>
                        <Field label="Sector" span={2}>
                            <SectorSelectDropdown sectores={sectores} value={sectorId} onChange={setSectorId} />
                        </Field>
                        <Field label="Fecha (opcional)">
                            <input type="date" className="px-3 py-2 border border-slate-300 rounded-lg transition-colors" value={fecha} onChange={e => setFecha(e.target.value)} />
                        </Field>
                    </>
                )}
                {tab === 'PERIODO' && (
                    <>
                        <Field label="Desde"><input type="date" className="px-3 py-2 border border-slate-300 rounded-lg transition-colors" value={desde} onChange={e => setDesde(e.target.value)} /></Field>
                        <Field label="Hasta"><input type="date" className="px-3 py-2 border border-slate-300 rounded-lg transition-colors" value={hasta} onChange={e => setHasta(e.target.value)} /></Field>
                        <Field label="Sector (opcional)" span={2}>
                            <SectorSelectDropdown sectores={sectores} value={sectorId} onChange={setSectorId} includeAll />
                        </Field>
                    </>
                )}
                {tab === 'EMPLEADO' && (
                    <>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Sector</label>
                            <SectorSelectDropdown sectores={sectores} value={sectorId} onChange={setSectorId} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Empleado</label>
                            <EmpleadoSelectDropdown
                                empleados={empleados}
                                value={empleadoId}
                                onChange={setEmpleadoId}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Fecha</label>
                            <input type="date" value={fecha} onChange={e => setFecha(e.target.value)}
                                className="px-3 py-[6.5px] border border-slate-300 rounded-lg transition-colors" />
                        </div>
                    </>
                )}
            </div>

            {/* Loading / Error */}
            {loading && <SkeletonDashboard />}
            {error && <div className="text-red-600 text-sm">{error}</div>}

            {/* Contenido */}
            {!loading && !error && (
                <>
                    {/* KPIs */}
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-3">
                        <Kpi title="Generados" value={formatNum(kpis.generados)} />
                        <Kpi title="Atendidos" value={formatNum(kpis.atendidos)} />
                        <Kpi title="Ausentes" value={formatNum(kpis.ausentes)} />
                        <Kpi title="Eficiencia" value={`${Math.round(kpis.eficiencia)}%`} />
                        <Kpi title="Espera prom." value={`${kpis.esperaProm} min`} />
                        <Kpi title="Atención prom." value={`${kpis.atencionProm} min`} />
                    </div>

                    {/* INSIGHTS */}
                    <div className="flex items-center justify-between mt-1 mb-2">
                        <h3 className="text-sm font-semibold text-slate-700">Resumen</h3>
                        {tab === 'EMPLEADO' && sectorId && fecha && (
                            <button
                                onClick={calcularTopEmpleado}
                                className="text-xs px-2 py-1 rounded-md border border-slate-300 hover:bg-slate-50"
                                disabled={rankLoading || !empleados?.length}
                                title={!empleados?.length ? 'Elegí un sector con empleados' : 'Calcula sobre todos los empleados del sector para esa fecha'}
                            >
                                {rankLoading ? 'Calculando…' : 'Top empleado (eficiencia)'}
                            </button>
                        )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                        {insights.length === 0 ? (
                            <div className="text-sm text-slate-500">Sin datos suficientes para insights en esta vista.</div>
                        ) : insights.map((it, idx) => (
                            <InsightCard key={idx} title={it.title} value={it.value} kpi={it.kpi} hint={it.hint} />
                        ))}
                    </div>

                    {/* Gráficos */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-3">
                        {/* Serie temporal */}
                        <Card title="Evolución (Período)">
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={serieTemporal}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="fecha" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend iconType="circle" iconSize={10}/>
                                        <Line type="monotone" dataKey="generados" name="Generados" stroke={SERIES_COLORS.generados} />
                                        <Line type="monotone" dataKey="atendidos" name="Atendidos" stroke={SERIES_COLORS.atendidos} />
                                        <Line type="monotone" dataKey="ausentes" name="Ausentes" stroke={SERIES_COLORS.ausentes} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>

                        {/* Barras por sector */}
                        <Card title="Rendimiento por sector">
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={barrasSector}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="sectorLabel"
                                            interval={0}
                                            angle={-20}
                                            textAnchor="end"
                                            height={60}
                                        />
                                        <YAxis />
                                        <Tooltip
                                            formatter={(value, name) => [value, name]}
                                            labelFormatter={(label, payload) => {
                                                const p = payload && payload[0];
                                                return p && p.payload ? (p.payload.sectorFull || label) : label;
                                            }}
                                        />
                                        <Legend iconType="circle" iconSize={10}/>
                                        <Bar dataKey="generados" name="Generados" fill={SERIES_COLORS.generados} />
                                        <Bar dataKey="atendidos" name="Atendidos" fill={SERIES_COLORS.atendidos} />
                                        <Bar dataKey="ausentes" name="Ausentes" fill={SERIES_COLORS.ausentes} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>

                        {/* Dona distribución */}
                        <Card title="Distribución de estados">
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={donaDistribucion} dataKey="value" nameKey="name" outerRadius={90} label>
                                            {donaDistribucion.map((entry, index) => <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                                        </Pie>
                                        <Tooltip />
                                        <Legend iconType="circle" iconSize={10}/>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    </div>

                    {/* Tabla */}
                    {tableRows.length > 0 && (
                        <Card title="Detalle">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-200">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            {['Fecha', 'Sector', 'Generados', 'Atendidos', 'Ausentes', 'Eficiencia', 'Espera (min)'].map(h => (
                                                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {tableRows.map(r => (
                                            <tr key={r.id}>
                                                <td className="px-4 py-2">{r.fecha}</td>
                                                <td className="px-4 py-2">{r.sector}</td>
                                                <td className="px-4 py-2">{r.generados}</td>
                                                <td className="px-4 py-2">{r.atendidos}</td>
                                                <td className="px-4 py-2">{r.ausentes}</td>
                                                <td className="px-4 py-2">{r.eficiencia}%</td>
                                                <td className="px-4 py-2">{r.espera}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    )}

                    {/* Cards (detalle) */}
                    {detalle && !Array.isArray(resumen) && (
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <StatCard label="Generados" value={detalle.turnosGenerados} />
                            <StatCard label="Atendidos" value={detalle.turnosAtendidos} />
                            <StatCard label="Ausentes" value={detalle.turnosAusentes} />
                            <StatCard label="Redirigidos" value={detalle.turnosRedirigidos} />
                            <StatCard label="Cancelados" value={detalle.turnosCancelados} />
                            <StatCard label="Eficiencia" value={(detalle.porcentajeEficiencia ?? 0) + '%'} />
                            <StatCard label="Espera (prom.)" value={(detalle.tiempoPromedioEspera ?? 0) + ' min'} />
                            <StatCard label="Atención (prom.)" value={(detalle.tiempoPromedioAtencion ?? 0) + ' min'} />
                            <StatCard label="Atención (total)" value={(detalle.tiempoTotalAtencion ?? 0) + ' min'} />
                            {detalle?.horaPico && <StatCard label="Hora pico" value={detalle.horaPico} />}
                            {Number.isFinite(detalle?.cantidadPico) && <StatCard label="Pico (cant.)" value={detalle.cantidadPico} />}
                        </div>
                    )}

                    {/* Tabla detalle (sector/empleado) */}
                    {detalle && (
                        <div className="mt-4 overflow-x-auto bg-white rounded-xl border border-slate-200">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        {['Concepto', 'Valor'].map(h => (
                                            <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-sm">
                                    <tr><td className="px-6 py-3">Generados</td><td className="px-6 py-3">{detalle.turnosGenerados ?? 0}</td></tr>
                                    <tr><td className="px-6 py-3">Atendidos</td><td className="px-6 py-3">{detalle.turnosAtendidos ?? 0}</td></tr>
                                    <tr><td className="px-6 py-3">Ausentes</td><td className="px-6 py-3">{detalle.turnosAusentes ?? 0}</td></tr>
                                    <tr><td className="px-6 py-3">Redirigidos</td><td className="px-6 py-3">{detalle.turnosRedirigidos ?? 0}</td></tr>
                                    <tr><td className="px-6 py-3">Cancelados</td><td className="px-6 py-3">{detalle.turnosCancelados ?? 0}</td></tr>
                                    <tr><td className="px-6 py-3">Eficiencia</td><td className="px-6 py-3">{Math.round(detalle.porcentajeEficiencia ?? 0)}%</td></tr>
                                    <tr><td className="px-6 py-3">Espera (prom.)</td><td className="px-6 py-3">{detalle.tiempoPromedioEspera ?? 0} min</td></tr>
                                    <tr><td className="px-6 py-3">Atención (prom.)</td><td className="px-6 py-3">{detalle.tiempoPromedioAtencion ?? 0} min</td></tr>
                                    {Number.isFinite(detalle?.tiempoMinimoEspera) && (
                                        <tr><td className="px-6 py-3">Espera (mín./máx.)</td><td className="px-6 py-3">{detalle.tiempoMinimoEspera} / {detalle.tiempoMaximoEspera} min</td></tr>
                                    )}
                                    {detalle?.horaPico && (
                                        <tr><td className="px-6 py-3">Hora pico</td><td className="px-6 py-3">{detalle.horaPico} ({detalle.cantidadPico ?? 0} turnos)</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

/* ---------- UI helpers ---------- */
function Field({ label, children, span = 1 }) {
    return (
        <div className={`md:col-span-${span}`}>
            <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
            {children}
        </div>
    );
}
const safe = (v) => String(v ?? '').replace(/\n/g, ' ').replace(/,/g, ' ');
const formatNum = (n) => new Intl.NumberFormat('es-AR').format(Number(n || 0));

function Kpi({ title, value }) {
    return (
        <div className="p-4 bg-white rounded-xl border border-slate-200">
            <div className="text-xs text-slate-500">{title}</div>
            <div className="text-2xl font-semibold">{value}</div>
        </div>
    );
}

function Card({ title, children }) {
    return (
        <div className="bg-white rounded-xl border border-slate-200">
            <div className="px-4 py-3 border-b border-slate-100 text-sm font-medium">{title}</div>
            <div className="p-3">{children}</div>
        </div>
    );
}

function SkeletonDashboard() {
    return (
        <div className="animate-pulse space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-16 bg-slate-100 rounded-xl" />)}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-72 bg-slate-100 rounded-xl" />)}
            </div>
            <div className="h-72 bg-slate-100 rounded-xl" />
        </div>
    );
}

function EmptyState() {
    return (
        <div className="text-center text-slate-500 p-8">
            Sin datos para los filtros seleccionados.
        </div>
    );
}

function SectorSelectDropdown({ sectores, value, onChange, includeAll = false }) {
    const val = value == null ? '' : String(value);

    const options = useMemo(() => {
        return (sectores || []).map(s => ({
            value: String(s.id),
            label: `${s.codigo || '—'} - ${s.nombre || s.nombreCompleto || ''}`.trim(),
        }));
    }, [sectores]);

    const placeholder = includeAll ? 'Todos los sectores' : 'Seleccioná un sector';

    return (
        <select
            className="px-3 py-2 border border-slate-300 rounded-lg transition-colors"
            value={val}
            onChange={(e) => onChange(e.target.value)}
        >
            {/* En SECTOR (includeAll=false): placeholder deshabilitado.
          En PERIODO (includeAll=true): opción activa para “Todos”. */}
            <option value="" disabled={!includeAll}>
                {placeholder}
            </option>

            {options.map(opt => (
                <option key={opt.value} value={opt.value}>
                    {opt.label}
                </option>
            ))}
        </select>
    );
}

function EmpleadoSelectDropdown({ empleados, value, onChange }) {
    const val = value == null ? '' : String(value);

    const options = useMemo(() => {
        return (empleados || []).map(e => ({
            value: String(e.id),
            // mostrás nombre completo; si viene username, lo agregás
            label: [e.nombreCompleto, e.username ? `(${e.username})` : ''].filter(Boolean).join(' ')
        }));
    }, [empleados]);

    return (
        <select
            className="px-3 py-2 border border-slate-300 rounded-lg transition-colors"
            value={val}
            onChange={(e) => onChange(e.target.value)}
            disabled={!options.length}
        >
            <option value="" disabled>Seleccioná un empleado</option>
            {options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
        </select>
    );
}

function InsightCard({ title, value, kpi, hint }) {
    return (
        <div className="p-4 bg-white rounded-xl border border-slate-200">
            <div className="text-[11px] uppercase tracking-wide text-slate-500">{title}</div>
            <div className="mt-1 text-sm text-slate-800">{value}</div>
            <div className="mt-2 text-2xl font-semibold">{kpi}</div>
            {hint && <div className="mt-1 text-xs text-slate-500">{hint}</div>}
        </div>
    );
}

