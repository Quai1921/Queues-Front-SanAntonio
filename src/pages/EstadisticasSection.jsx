// src/sections/EstadisticasSection.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useEstadisticas } from '../hooks/useEstadisticas';
import { useSectores } from '../hooks/useSectores'; // para llenar combos de sectores
import {
    QueryStats, Today, DateRange, Timeline, Compare, AccessTime, Summarize, Autorenew, BarChart
} from '@mui/icons-material';
import GenerarReporteModal from '../components/GenerarReporteModal';

const number = (v) => (v ?? 0);
const fmtMin = (m) => (m != null ? `${m} min` : '—');

const EstadisticasSection = () => {
    const {
        loading, error, resumen, detalle, filtros, setFiltros,
        cargarResumenHoy, cargarResumenFecha,
        cargarSectorHoy, cargarSectorFecha, cargarSectorPeriodo, cargarGeneralPeriodo,
        compararSectores, calcularHoraPico,
        generarReporteResumen, generarReporteHoy, generarReporteFecha,
    } = useEstadisticas();

    const { sectores } = useSectores({}); // ya lo tenés en tu app

    // UI local
    const [showReporteModal, setShowReporteModal] = useState(false);
    const [notif, setNotif] = useState(null);

    useEffect(() => { cargarResumenHoy(); }, [cargarResumenHoy]);

    const handleAccion = async () => {
        const { modo, sectorId, sectorId2, fecha, fechaInicio, fechaFin } = filtros;
        if (modo === 'RESUMEN_HOY') return cargarResumenHoy();
        if (modo === 'RESUMEN_FECHA' && fecha) return cargarResumenFecha(fecha);
        if (modo === 'SECTOR_HOY' && sectorId) return cargarSectorHoy(sectorId);
        if (modo === 'SECTOR_FECHA' && sectorId && fecha) return cargarSectorFecha(sectorId, fecha);
        if (modo === 'SECTOR_PERIODO' && sectorId && fechaInicio && fechaFin) return cargarSectorPeriodo(sectorId, fechaInicio, fechaFin);
        if (modo === 'GENERAL_PERIODO' && fechaInicio && fechaFin) return cargarGeneralPeriodo(fechaInicio, fechaFin);
        if (modo === 'COMPARAR' && sectorId && sectorId2 && fechaInicio && fechaFin) return compararSectores(sectorId, sectorId2, fechaInicio, fechaFin);
    };

    const onGenerarReporte = async (fi, ff) => {
        try {
            await generarReporteResumen(fi, ff);
            setNotif({ tipo: 'success', msg: `Reporte generado para ${fi} a ${ff}` });
        } catch (e) {
            setNotif({ tipo: 'error', msg: e?.response?.data?.message || 'Error generando reporte' });
        } finally {
            setShowReporteModal(false);
            setTimeout(() => setNotif(null), 4000);
        }
    };

    const cards = useMemo(() => {
        const d = detalle?.estadistica || detalle || {}; // por si el wrapper cambia
        return [
            { icon: <QueryStats className="h-6 w-6 text-slate-600" />, label: 'Generados', value: number(d.turnosGenerados) },
            { icon: <BarChart className="h-6 w-6 text-green-600" />, label: 'Atendidos', value: number(d.turnosAtendidos) },
            { icon: <AccessTime className="h-6 w-6 text-amber-600" />, label: 'Espera Prom.', value: fmtMin(d.tiempoPromedioEspera) },
            { icon: <AccessTime className="h-6 w-6 text-purple-600" />, label: 'Atención Prom.', value: fmtMin(d.tiempoPromedioAtencion) },
        ];
    }, [detalle]);

    const sectoresOpts = useMemo(() =>
        sectores.map(s => ({ id: s.sector?.id, label: `${s.sector?.codigo} - ${s.sector?.nombre}` })).filter(x => x.id),
        [sectores]);

    return (
        <div>
            {/* Header de tarjetas */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                {cards.map((c, i) => (
                    <div key={i} className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                        <div className="flex items-center">
                            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">{c.icon}</div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-slate-600">{c.label}</p>
                                <p className="text-2xl font-semibold text-slate-900">{c.value ?? '—'}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Acciones rápidas */}
            <div className="flex items-center justify-between mt-4">
                <div>
                    <h3 className="text-lg font-semibold text-slate-900">Estadísticas</h3>
                    <p className="text-slate-600 text-sm">Consultas y reportes</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => setShowReporteModal(true)}
                        className="flex items-center px-4 py-2 bg-[#224666] text-white rounded-lg hover:bg-[#2c3e50]">
                        <Summarize className="mr-2 h-4 w-4" /> Generar reporte
                    </button>
                    <button onClick={() => generarReporteHoy()}
                        className="flex items-center px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg">
                        <Today className="mr-2 h-4 w-4" /> Reporte de hoy
                    </button>
                </div>
            </div>

            {/* Filtros */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mt-4">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Modo</label>
                        <select
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                            value={filtros.modo}
                            onChange={(e) => setFiltros(f => ({ ...f, modo: e.target.value }))}
                        >
                            <option value="RESUMEN_HOY">Resumen Hoy (todos)</option>
                            <option value="RESUMEN_FECHA">Resumen por Fecha (todos)</option>
                            <option value="SECTOR_HOY">Sector Hoy</option>
                            <option value="SECTOR_FECHA">Sector en Fecha</option>
                            <option value="SECTOR_PERIODO">Sector por Período</option>
                            <option value="GENERAL_PERIODO">General por Período</option>
                            <option value="COMPARAR">Comparar Sectores</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Sector</label>
                        <select
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                            value={filtros.sectorId ?? ''}
                            onChange={(e) => setFiltros(f => ({ ...f, sectorId: e.target.value ? Number(e.target.value) : null }))}
                        >
                            <option value="">—</option>
                            {sectoresOpts.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                        </select>
                    </div>

                    {filtros.modo === 'COMPARAR' && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Sector 2</label>
                            <select
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                value={filtros.sectorId2 ?? ''}
                                onChange={(e) => setFiltros(f => ({ ...f, sectorId2: e.target.value ? Number(e.target.value) : null }))}
                            >
                                <option value="">—</option>
                                {sectoresOpts.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                            </select>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Fecha</label>
                        <input type="date" className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                            value={filtros.fecha} onChange={(e) => setFiltros(f => ({ ...f, fecha: e.target.value }))} />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Desde</label>
                        <input type="date" className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                            value={filtros.fechaInicio} onChange={(e) => setFiltros(f => ({ ...f, fechaInicio: e.target.value }))} />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Hasta</label>
                        <input type="date" className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                            value={filtros.fechaFin} onChange={(e) => setFiltros(f => ({ ...f, fechaFin: e.target.value }))} />
                    </div>
                </div>

                <div className="mt-4 flex items-center gap-3">
                    <button
                        onClick={handleAccion}
                        className="flex items-center px-4 py-2 bg-[#224666] text-white rounded-lg hover:bg-[#2c3e50] disabled:opacity-50"
                        disabled={loading}
                    >
                        <Autorenew className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        Consultar
                    </button>

                    {filtros.modo.startsWith('SECTOR') && filtros.sectorId && filtros.fecha && (
                        <button
                            onClick={() => calcularHoraPico(filtros.sectorId, filtros.fecha)}
                            className="flex items-center px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                        >
                            <Timeline className="mr-2 h-4 w-4" /> Calcular Hora Pico
                        </button>
                    )}
                </div>
            </div>

            {/* Loading */}
            {loading && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600 mx-auto"></div>
                        <p className="mt-4 text-slate-600">Cargando…</p>
                    </div>
                </div>
            )}

            {/* Tabla (para listas) */}
            {!loading && Array.isArray(resumen) && resumen.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-4">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Fecha</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Sector</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Generados</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Atendidos</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Ausentes</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Cancelados</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Redirigidos</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Espera Prom.</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Atención Prom.</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Hora Pico</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {resumen.map((r, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50">
                                        <td className="px-6 py-3">{r.fecha || r.fechaEstadistica || '—'}</td>
                                        <td className="px-6 py-3">{r.sectorCodigo ? `${r.sectorCodigo} - ${r.sectorNombre ?? ''}` : (r.sector?.codigo || '—')}</td>
                                        <td className="px-6 py-3">{number(r.turnosGenerados)}</td>
                                        <td className="px-6 py-3">{number(r.turnosAtendidos)}</td>
                                        <td className="px-6 py-3">{number(r.turnosAusentes)}</td>
                                        <td className="px-6 py-3">{number(r.turnosCancelados)}</td>
                                        <td className="px-6 py-3">{number(r.turnosRedirigidos)}</td>
                                        <td className="px-6 py-3">{fmtMin(r.tiempoPromedioEspera)}</td>
                                        <td className="px-6 py-3">{fmtMin(r.tiempoPromedioAtencion)}</td>
                                        <td className="px-6 py-3">{r.horaPico ?? '—'} {r.cantidadPico ? `(${r.cantidadPico})` : ''}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Notificación */}
            {notif && (
                <div className={`fixed top-4 left-1/2 -translate-x-1/2  z-[60] px-4 py-6 rounded-lg shadow-lg border transition-all duration-300 ${notif.tipo === 'success'
                    ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                    <div className="flex items-center">
                        <span className="font-medium">{notif.msg}</span>
                        <button onClick={() => setNotif(null)} className="ml-3 text-sm opacity-70 hover:opacity-100">✕</button>
                    </div>
                </div>
            )}

            {/* Modal Reporte */}
            <GenerarReporteModal
                isOpen={showReporteModal}
                onClose={() => setShowReporteModal(false)}
                onSubmit={onGenerarReporte}
            />
        </div>
    );
};

export default EstadisticasSection;
