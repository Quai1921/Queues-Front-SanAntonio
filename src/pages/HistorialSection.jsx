// import React, { useEffect, useMemo, useState } from 'react';
// import {
//     History, Search, Refresh, Today, CompareArrows, SwapHoriz,
//     AssignmentInd, Badge, PersonSearch, Route
// } from '@mui/icons-material';
// import { useHistorial } from '../hooks/useHistorial';
// import dayjs from 'dayjs';

// const TABS = [
//     { key: 'ULTIMAS', label: 'Últimas', icon: <History /> },
//     { key: 'HOY', label: 'Hoy', icon: <Today /> },
//     { key: 'RECIENTE', label: '24 hs', icon: <Refresh /> },
//     { key: 'POR_TURNO', label: 'Por turno', icon: <Search /> },
//     { key: 'POR_FECHA', label: 'Por fecha', icon: <Search /> },
//     { key: 'COMPARAR', label: 'Comparar', icon: <CompareArrows /> },
//     { key: 'REDIRECCIONES', label: 'Redirecciones', icon: <SwapHoriz /> },
//     { key: 'CAMBIOS_ESTADO', label: 'Cambios de estado', icon: <AssignmentInd /> },
//     { key: 'TRAZA_DNI', label: 'Trazabilidad DNI', icon: <PersonSearch /> },
//     { key: 'AUDITORIA_EMP', label: 'Auditoría Empleado', icon: <Badge /> },
// ];

// function Empty({ title = 'Sin resultados', desc = 'No se encontraron registros.' }) {
//     return (
//         <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
//             <p className="text-lg font-medium text-slate-600">{title}</p>
//             <p className="text-slate-500 mt-1">{desc}</p>
//         </div>
//     );
// }

// function Loader() {
//     return (
//         <div className="py-12 text-center">
//             <div className="inline-block h-8 w-8 border-2 border-slate-300 border-b-transparent rounded-full animate-spin" />
//             <p className="text-slate-500 mt-2">Cargando…</p>
//         </div>
//     );
// }

// function ErrorBox({ message }) {
//     if (!message) return null;
//     return (
//         <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm mb-3">
//             {message}
//         </div>
//     );
// }

// function AccionesTable({ items }) {
//     if (!items?.length) return <Empty />;
//     return (
//         <div className="overflow-x-auto bg-white border border-slate-200 rounded-xl">
//             <table className="min-w-full text-sm">
//                 <thead className="bg-slate-50 text-slate-600">
//                     <tr>
//                         <th className="px-4 py-3 text-left">Fecha/Hora</th>
//                         <th className="px-4 py-3 text-left">Tipo</th>
//                         <th className="px-4 py-3 text-left">Detalle</th>
//                         <th className="px-4 py-3 text-left">Turno</th>
//                         <th className="px-4 py-3 text-left">Empleado</th>
//                         <th className="px-4 py-3 text-left">Sector</th>
//                     </tr>
//                 </thead>
//                 <tbody className="divide-y divide-slate-100">
//                     {items.map((row, i) => {
//                         // Fallbacks seguros por si cambia el DTO
//                         const fecha = row.fechaHora || row.fecha || row.fechaAccion;
//                         const tipo = row.tipoAccion || row.tipo || row.accion;
//                         const detalle = row.detalle || row.descripcion || row.mensaje || row.evento;
//                         const turno = row.turnoCodigo || row.turno?.codigo || row.codigoTurno;
//                         const empleado = row.empleadoNombre || row.empleado?.nombreCompleto || row.usernameEmpleado;
//                         const sector = row.sectorNombre || row.sector?.nombre || row.codigoSector || '-';
//                         return (
//                             <tr key={i} className="hover:bg-slate-50/60">
//                                 <td className="px-4 py-2 whitespace-nowrap">{fecha ? dayjs(fecha).format('DD/MM/YYYY HH:mm') : '-'}</td>
//                                 <td className="px-4 py-2">{tipo || '-'}</td>
//                                 <td className="px-4 py-2 max-w-xl truncate" title={detalle || ''}>{detalle || '-'}</td>
//                                 <td className="px-4 py-2">{turno || '-'}</td>
//                                 <td className="px-4 py-2">{empleado || '-'}</td>
//                                 <td className="px-4 py-2">{sector || '-'}</td>
//                             </tr>
//                         );
//                     })}
//                 </tbody>
//             </table>
//         </div>
//     );
// }

// export default function HistorialSection() {
//     const { loading, error,
//         ultimas, hoy, reciente, porTurnoId, porCodigo, legible,
//         porFecha, compararFechas, redirecciones, cambiosEstado,
//         trazabilidadDni, accionesEmpleado, auditoriaEmpleado
//     } = useHistorial();

//     const [tab, setTab] = useState('ULTIMAS');
//     const [items, setItems] = useState([]);

//     // Filtros
//     const [limite, setLimite] = useState(50);
//     const [codigo, setCodigo] = useState('');
//     const [turnoId, setTurnoId] = useState('');
//     const [fecha, setFecha] = useState(dayjs().format('YYYY-MM-DD'));
//     const [fecha1, setFecha1] = useState(dayjs().format('YYYY-MM-DD'));
//     const [fecha2, setFecha2] = useState(dayjs().format('YYYY-MM-DD'));
//     const [dni, setDni] = useState('');
//     const [empleadoId, setEmpleadoId] = useState('');
//     const [fi, setFi] = useState(dayjs().startOf('month').format('YYYY-MM-DD'));
//     const [ff, setFf] = useState(dayjs().endOf('month').format('YYYY-MM-DD'));
//     const [legibleView, setLegibleView] = useState(null); // frame especial para “legible”

//     useEffect(() => {
//         // carga por defecto
//         (async () => {
//             const data = await ultimas(limite);
//             setItems(data || []);
//         })();
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, []);

//     const onRun = async () => {
//         setLegibleView(null);
//         let data = null;

//         switch (tab) {
//             case 'ULTIMAS':
//                 data = await ultimas(limite);
//                 break;
//             case 'HOY':
//                 data = await hoy();
//                 break;
//             case 'RECIENTE':
//                 data = await reciente();
//                 break;
//             case 'POR_TURNO':
//                 if (turnoId) {
//                     data = await porTurnoId(Number(turnoId));
//                     // Intento de “legible” si viene id
//                     const leg = await legible(Number(turnoId));
//                     setLegibleView(leg || null);
//                 } else if (codigo) {
//                     data = await porCodigo(codigo.trim());
//                 }
//                 break;
//             case 'POR_FECHA':
//                 if (fecha) data = await porFecha(fecha, limite);
//                 break;
//             case 'COMPARAR':
//                 if (fecha1 && fecha2) data = await compararFechas(fecha1, fecha2);
//                 break;
//             case 'REDIRECCIONES':
//                 data = await redirecciones(limite);
//                 break;
//             case 'CAMBIOS_ESTADO':
//                 data = await cambiosEstado(limite);
//                 break;
//             case 'TRAZA_DNI':
//                 if (dni) data = await trazabilidadDni(dni, 200);
//                 break;
//             case 'AUDITORIA_EMP':
//                 if (empleadoId && fi && ff) {
//                     // Traigo primero acciones (listado)
//                     data = await accionesEmpleado(Number(empleadoId), fi, ff);
//                     // Podés, si querés, disparar aparte el resumen de auditoría y mostrarlo como card
//                     // const resumen = await auditoriaEmpleado(Number(empleadoId), fi, ff);
//                     // setResumenAuditoria(resumen);
//                 }
//                 break;
//             default:
//                 break;
//         }
//         setItems(Array.isArray(data) ? data : (data ? [data] : []));
//     };

//     const accionesHeader = useMemo(() => {
//         switch (tab) {
//             case 'ULTIMAS': return 'Últimas acciones';
//             case 'HOY': return 'Acciones de hoy';
//             case 'RECIENTE': return 'Actividad reciente (24 hs)';
//             case 'POR_TURNO': return 'Historial por turno';
//             case 'POR_FECHA': return 'Historial por fecha';
//             case 'COMPARAR': return 'Comparar actividad entre fechas';
//             case 'REDIRECCIONES': return 'Redirecciones';
//             case 'CAMBIOS_ESTADO': return 'Cambios de estado';
//             case 'TRAZA_DNI': return 'Trazabilidad por DNI';
//             case 'AUDITORIA_EMP': return 'Auditoría por empleado';
//             default: return 'Historial';
//         }
//     }, [tab]);

//     return (
//         <section className="space-y-6">
//             {/* Tabs */}
//             <div className="flex flex-wrap gap-2">
//                 {TABS.map(t => (
//                     <button
//                         key={t.key}
//                         onClick={() => setTab(t.key)}
//                         className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition
//                 ${tab === t.key
//                                 ? 'bg-[#224666] text-white'
//                                 : 'bg-slate-50 text-slate-700 hover:bg-slate-100'}`}
//                         title={t.label}
//                     >
//                         {t.icon}<span>{t.label}</span>
//                     </button>
//                 ))}
//             </div>

//             {/* Filtros */}
//             <div className="bg-white border border-slate-200 rounded-xl p-4">
//                 <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-3 justify-center items-center">
//                     {tab === 'ULTIMAS' && (
//                         <div>
//                             <label className="text-xs text-slate-500">Límite</label>
//                             <input type="number" min={1} max={500} className="w-full px-3 py-2 border rounded-md"
//                                 value={limite} onChange={e => setLimite(Number(e.target.value || 50))} />
//                         </div>
//                     )}

//                     {tab === 'POR_TURNO' && (
//                         <>
//                             <div>
//                                 <label className="text-xs text-slate-500">Código de turno</label>
//                                 <input type="text" className="w-full px-3 py-2 border rounded-md"
//                                     value={codigo} onChange={e => setCodigo(e.target.value)} />
//                             </div>
//                         </>
//                     )}

//                     {tab === 'POR_FECHA' && (
//                         <>
//                             <div>
//                                 <label className="text-xs text-slate-500">Fecha</label>
//                                 <input type="date" className="w-full px-3 py-2 border rounded-md"
//                                     value={fecha} onChange={e => setFecha(e.target.value)} />
//                             </div>
//                             <div>
//                                 <label className="text-xs text-slate-500">Límite</label>
//                                 <input type="number" min={1} max={1000} className="w-full px-3 py-2 border rounded-md"
//                                     value={limite} onChange={e => setLimite(Number(e.target.value || 200))} />
//                             </div>
//                         </>
//                     )}

//                     {tab === 'COMPARAR' && (
//                         <>
//                             <div>
//                                 <label className="text-xs text-slate-500">Fecha 1</label>
//                                 <input type="date" className="w-full px-3 py-2 border rounded-md"
//                                     value={fecha1} onChange={e => setFecha1(e.target.value)} />
//                             </div>
//                             <div>
//                                 <label className="text-xs text-slate-500">Fecha 2</label>
//                                 <input type="date" className="w-full px-3 py-2 border rounded-md"
//                                     value={fecha2} onChange={e => setFecha2(e.target.value)} />
//                             </div>
//                         </>
//                     )}

//                     {tab === 'TRAZA_DNI' && (
//                         <div>
//                             <label className="text-xs text-slate-500">DNI</label>
//                             <input type="text" className="w-full px-3 py-2 border rounded-md"
//                                 value={dni} onChange={e => setDni(e.target.value)} />
//                         </div>
//                     )}

//                     {tab === 'REDIRECCIONES' && (
//                         <div>
//                             <label className="text-xs text-slate-500">Límite</label>
//                             <input type="number" min={1} max={500} className="w-full px-3 py-2 border rounded-md"
//                                 value={limite} onChange={e => setLimite(Number(e.target.value || 100))} />
//                         </div>
//                     )}

//                     {tab === 'CAMBIOS_ESTADO' && (
//                         <div>
//                             <label className="text-xs text-slate-500">Límite</label>
//                             <input type="number" min={1} max={500} className="w-full px-3 py-2 border rounded-md"
//                                 value={limite} onChange={e => setLimite(Number(e.target.value || 100))} />
//                         </div>
//                     )}

//                     {tab === 'AUDITORIA_EMP' && (
//                         <>
//                             <div>
//                                 <label className="text-xs text-slate-500">Empleado ID</label>
//                                 <input type="number" className="w-full px-3 py-2 border rounded-md"
//                                     value={empleadoId} onChange={e => setEmpleadoId(e.target.value)} />
//                             </div>
//                             <div>
//                                 <label className="text-xs text-slate-500">Desde</label>
//                                 <input type="date" className="w-full px-3 py-2 border rounded-md"
//                                     value={fi} onChange={e => setFi(e.target.value)} />
//                             </div>
//                             <div>
//                                 <label className="text-xs text-slate-500">Hasta</label>
//                                 <input type="date" className="w-full px-3 py-2 border rounded-md"
//                                     value={ff} onChange={e => setFf(e.target.value)} />
//                             </div>
//                             <p className="text-xs text-slate-500 pt-6">
//                                 * Máx. 3 meses
//                             </p>
//                         </>
//                     )}
//                 </div>

//                 <div className="mt-4 flex gap-2">
//                     <button
//                         onClick={onRun}
//                         className="px-4 h-8 rounded-lg bg-[#224666] text-white hover:bg-[#2c3e50]"
//                     >
//                         Consultar
//                     </button>
//                     <button
//                         onClick={() => { setItems([]); setLegibleView(null); }}
//                         className="px-4 h-8 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
//                     >
//                         Limpiar
//                     </button>
//                 </div>

//                 {tab === 'POR_TURNO' && legibleView && (
//                     <div className="mt-4 bg-slate-50 border border-slate-200 rounded-lg p-3">
//                         <p className="text-sm font-medium text-slate-700 mb-2">Historial legible</p>
//                         <pre className="whitespace-pre-wrap text-xs text-slate-600">
//                             {JSON.stringify(legibleView, null, 2)}
//                         </pre>
//                     </div>
//                 )}
//             </div>

//             <ErrorBox message={error} />
//             {loading ? <Loader /> : <AccionesTable items={items} />}
//         </section>
//     );
// }



import React, { useState, useEffect, useMemo } from 'react';
import dayjs from 'dayjs';
import useHistorial from '../hooks/useHistorial';
import useTurnos from '../hooks/useTurnos';

const TABS = [
    { key: 'TURNOS', label: 'Lista de Turnos', icon: '📋' },
    { key: 'ULTIMAS', label: 'Últimas Acciones', icon: '🕐' },
    { key: 'HOY', label: 'Hoy', icon: '📅' },
    { key: 'RECIENTE', label: 'Reciente 24h', icon: '⚡' },
    { key: 'POR_FECHA', label: 'Por Fecha', icon: '📆' },
    { key: 'METRICAS', label: 'Métricas', icon: '📊' },
    { key: 'CIUDADANO', label: 'Por Ciudadano', icon: '👤' },
];

function TablaTurnos({ turnos, onClickTurno, turnoSeleccionado }) {
    if (!turnos?.length) {
        return (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
                <p className="text-lg font-medium text-slate-600">No hay turnos para mostrar</p>
                <p className="text-slate-500 mt-1">Ajusta los filtros para ver resultados</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto bg-white border border-slate-200 rounded-xl">
            <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-slate-600">
                    <tr>
                        <th className="px-4 py-3 text-left">Código</th>
                        <th className="px-4 py-3 text-left">Número</th>
                        <th className="px-4 py-3 text-left">Fecha/Hora</th>
                        <th className="px-4 py-3 text-left">Ciudadano</th>
                        <th className="px-4 py-3 text-left">Sector</th>
                        <th className="px-4 py-3 text-left">Estado</th>
                        <th className="px-4 py-3 text-left">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {turnos.map((turno) => (
                        <tr 
                            key={turno.id} 
                            className={`hover:bg-slate-50/60 cursor-pointer transition-colors ${
                                turnoSeleccionado?.id === turno.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                            }`}
                            onClick={() => onClickTurno(turno)}
                        >
                            <td className="px-4 py-2 font-mono text-sm font-medium">
                                {turno.codigo || '-'}
                            </td>
                            <td className="px-4 py-2">
                                {turno.numero || '-'}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap">
                                {turno.fechaHoraGeneracion ? 
                                    dayjs(turno.fechaHoraGeneracion).format('DD/MM/YYYY HH:mm') : '-'}
                            </td>
                            <td className="px-4 py-2">
                                {turno.ciudadanoNombre || turno.ciudadano?.nombreCompleto || '-'}
                            </td>
                            <td className="px-4 py-2">
                                <span className="inline-flex items-center gap-1">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                    {turno.sector?.codigo || '-'}
                                </span>
                            </td>
                            <td className="px-4 py-2">
                                <EstadoBadge estado={turno.estado} />
                            </td>
                            <td className="px-4 py-2">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onClickTurno(turno);
                                    }}
                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                >
                                    Ver Historial
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function EstadoBadge({ estado }) {
    const estilos = {
        'GENERADO': 'bg-yellow-100 text-yellow-800',
        'LLAMADO': 'bg-blue-100 text-blue-800',
        'EN_ATENCION': 'bg-green-100 text-green-800',
        'FINALIZADO': 'bg-gray-100 text-gray-800',
        'AUSENTE': 'bg-red-100 text-red-800',
        'CANCELADO': 'bg-red-100 text-red-800',
        'REDIRIGIDO': 'bg-purple-100 text-purple-800'
    };

    return (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
            estilos[estado] || 'bg-gray-100 text-gray-800'
        }`}>
            {estado || 'DESCONOCIDO'}
        </span>
    );
}

function HistorialSection({ turno, historialLegible, onCerrar }) {
    if (!turno) return null;

    return (
        <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">
                    Historial Detallado - {turno.codigo}
                </h3>
                <button
                    onClick={onCerrar}
                    className="text-slate-400 hover:text-slate-600 p-1"
                >
                    ✕
                </button>
            </div>

            {/* Información del turno */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-slate-50 rounded-lg">
                <div>
                    <p className="text-xs text-slate-500">Ciudadano</p>
                    <p className="font-medium">{turno.ciudadanoNombre || turno.ciudadano?.nombreCompleto || 'Sin información'}</p>
                </div>
                <div>
                    <p className="text-xs text-slate-500">Sector</p>
                    <p className="font-medium">{turno.sector?.codigo || '-'}</p>
                </div>
                <div>
                    <p className="text-xs text-slate-500">Estado Actual</p>
                    <EstadoBadge estado={turno.estado} />
                </div>
                <div>
                    <p className="text-xs text-slate-500">Tipo</p>
                    <p className="font-medium">{turno.tipo || 'NORMAL'}</p>
                </div>
            </div>

            {/* Historial legible */}
            {historialLegible ? (
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-slate-900">
                            Línea de Tiempo ({historialLegible.totalAcciones} acciones)
                        </h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                            historialLegible.completado ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                            {historialLegible.completado ? 'Completado' : 'En proceso'}
                        </span>
                    </div>

                    <div className="space-y-3">
                        {(historialLegible.historialLegible || []).map((accion, index) => (
                            <div key={index} className="flex gap-4 p-3 bg-slate-50 rounded-lg">
                                <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                <div className="flex-1">
                                    <p className="text-sm text-slate-900">{accion}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {historialLegible.resumen && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-900">{historialLegible.resumen}</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="py-8 text-center text-slate-500">
                    <p>Cargando historial detallado...</p>
                </div>
            )}
        </div>
    );
}

function TablaAcciones({ items }) {
    if (!items?.length) {
        return (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
                <p className="text-lg font-medium text-slate-600">No hay acciones para mostrar</p>
                <p className="text-slate-500 mt-1">Ajusta los filtros para ver resultados</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto bg-white border border-slate-200 rounded-xl">
            <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-slate-600">
                    <tr>
                        <th className="px-4 py-3 text-left">Fecha/Hora</th>
                        <th className="px-4 py-3 text-left">Tipo</th>
                        <th className="px-4 py-3 text-left">Detalle</th>
                        <th className="px-4 py-3 text-left">Turno</th>
                        <th className="px-4 py-3 text-left">Empleado</th>
                        <th className="px-4 py-3 text-left">Sector</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {items.map((row, i) => {
                        const fecha = row.fechaHora || row.fecha || row.fechaAccion;
                        const tipo = row.tipoAccion || row.tipo || row.accion;
                        const detalle = row.detalle || row.descripcion || row.mensaje || row.evento;
                        const turno = row.turnoCodigo || row.turno?.codigo || row.codigoTurno;
                        const empleado = row.empleadoNombre || row.empleado?.nombreCompleto || row.usernameEmpleado;
                        const sector = row.sectorNombre || row.sector?.nombre || row.codigoSector || '-';
                        
                        return (
                            <tr key={i} className="hover:bg-slate-50/60">
                                <td className="px-4 py-2 whitespace-nowrap">
                                    {fecha ? dayjs(fecha).format('DD/MM/YYYY HH:mm') : '-'}
                                </td>
                                <td className="px-4 py-2">{tipo || '-'}</td>
                                <td className="px-4 py-2 max-w-xl truncate" title={detalle || ''}>
                                    {detalle || '-'}
                                </td>
                                <td className="px-4 py-2 font-mono text-sm">{turno || '-'}</td>
                                <td className="px-4 py-2">{empleado || '-'}</td>
                                <td className="px-4 py-2">{sector}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

function PanelFiltros({ tab, onFiltrarTurnos, onFiltrarAcciones }) {
    const [filtros, setFiltros] = useState({
        limite: 50,
        fecha: dayjs().format('YYYY-MM-DD'),
        sectorId: '',
        dni: '',
        empleadoId: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (tab === 'TURNOS') {
            onFiltrarTurnos(filtros);
        } else {
            onFiltrarAcciones(filtros);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {tab === 'TURNOS' && (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Fecha
                            </label>
                            <input
                                type="date"
                                value={filtros.fecha}
                                onChange={(e) => setFiltros({...filtros, fecha: e.target.value})}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Sector ID
                            </label>
                            <input
                                type="number"
                                value={filtros.sectorId}
                                onChange={(e) => setFiltros({...filtros, sectorId: e.target.value})}
                                placeholder="Ej: 1"
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                            />
                        </div>
                    </>
                )}
                
                {tab === 'CIUDADANO' && (
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            DNI
                        </label>
                        <input
                            type="text"
                            value={filtros.dni}
                            onChange={(e) => setFiltros({...filtros, dni: e.target.value})}
                            placeholder="Ej: 12345678"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                        />
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Límite
                    </label>
                    <select
                        value={filtros.limite}
                        onChange={(e) => setFiltros({...filtros, limite: Number(e.target.value)})}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    >
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                        <option value={200}>200</option>
                    </select>
                </div>
                
                <div className="flex items-end">
                    <button
                        type="submit"
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                    >
                        Aplicar Filtros
                    </button>
                </div>
            </div>
        </form>
    );
}

export default HistorialSection