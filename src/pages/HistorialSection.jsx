import React, { useEffect, useMemo, useState } from 'react';
import {
    History, Search, Refresh, Today, CompareArrows, SwapHoriz,
    AssignmentInd, Badge, PersonSearch, Route
} from '@mui/icons-material';
import { useHistorial } from '../hooks/useHistorial';
import dayjs from 'dayjs';

const TABS = [
    { key: 'ULTIMAS', label: 'Últimas', icon: <History /> },
    { key: 'HOY', label: 'Hoy', icon: <Today /> },
    { key: 'RECIENTE', label: '24 hs', icon: <Refresh /> },
    { key: 'POR_TURNO', label: 'Por turno', icon: <Search /> },
    { key: 'POR_FECHA', label: 'Por fecha', icon: <Search /> },
    { key: 'COMPARAR', label: 'Comparar', icon: <CompareArrows /> },
    { key: 'REDIRECCIONES', label: 'Redirecciones', icon: <SwapHoriz /> },
    { key: 'CAMBIOS_ESTADO', label: 'Cambios de estado', icon: <AssignmentInd /> },
    { key: 'TRAZA_DNI', label: 'Trazabilidad DNI', icon: <PersonSearch /> },
    { key: 'AUDITORIA_EMP', label: 'Auditoría Empleado', icon: <Badge /> },
];

function Empty({ title = 'Sin resultados', desc = 'No se encontraron registros.' }) {
    return (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
            <p className="text-lg font-medium text-slate-600">{title}</p>
            <p className="text-slate-500 mt-1">{desc}</p>
        </div>
    );
}

function Loader() {
    return (
        <div className="py-12 text-center">
            <div className="inline-block h-8 w-8 border-2 border-slate-300 border-b-transparent rounded-full animate-spin" />
            <p className="text-slate-500 mt-2">Cargando…</p>
        </div>
    );
}

function ErrorBox({ message }) {
    if (!message) return null;
    return (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm mb-3">
            {message}
        </div>
    );
}

function AccionesTable({ items }) {
    if (!items?.length) return <Empty />;
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
                        // Fallbacks seguros por si cambia el DTO
                        const fecha = row.fechaHora || row.fecha || row.fechaAccion;
                        const tipo = row.tipoAccion || row.tipo || row.accion;
                        const detalle = row.detalle || row.descripcion || row.mensaje || row.evento;
                        const turno = row.turnoCodigo || row.turno?.codigo || row.codigoTurno;
                        const empleado = row.empleadoNombre || row.empleado?.nombreCompleto || row.usernameEmpleado;
                        const sector = row.sectorNombre || row.sector?.nombre || row.codigoSector || '-';
                        return (
                            <tr key={i} className="hover:bg-slate-50/60">
                                <td className="px-4 py-2 whitespace-nowrap">{fecha ? dayjs(fecha).format('DD/MM/YYYY HH:mm') : '-'}</td>
                                <td className="px-4 py-2">{tipo || '-'}</td>
                                <td className="px-4 py-2 max-w-xl truncate" title={detalle || ''}>{detalle || '-'}</td>
                                <td className="px-4 py-2">{turno || '-'}</td>
                                <td className="px-4 py-2">{empleado || '-'}</td>
                                <td className="px-4 py-2">{sector || '-'}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

export default function HistorialSection() {
    const { loading, error,
        ultimas, hoy, reciente, porTurnoId, porCodigo, legible,
        porFecha, compararFechas, redirecciones, cambiosEstado,
        trazabilidadDni, accionesEmpleado, auditoriaEmpleado
    } = useHistorial();

    const [tab, setTab] = useState('ULTIMAS');
    const [items, setItems] = useState([]);

    // Filtros
    const [limite, setLimite] = useState(50);
    const [codigo, setCodigo] = useState('');
    const [turnoId, setTurnoId] = useState('');
    const [fecha, setFecha] = useState(dayjs().format('YYYY-MM-DD'));
    const [fecha1, setFecha1] = useState(dayjs().format('YYYY-MM-DD'));
    const [fecha2, setFecha2] = useState(dayjs().format('YYYY-MM-DD'));
    const [dni, setDni] = useState('');
    const [empleadoId, setEmpleadoId] = useState('');
    const [fi, setFi] = useState(dayjs().startOf('month').format('YYYY-MM-DD'));
    const [ff, setFf] = useState(dayjs().endOf('month').format('YYYY-MM-DD'));
    const [legibleView, setLegibleView] = useState(null); // frame especial para “legible”

    useEffect(() => {
        // carga por defecto
        (async () => {
            const data = await ultimas(limite);
            setItems(data || []);
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onRun = async () => {
        setLegibleView(null);
        let data = null;

        switch (tab) {
            case 'ULTIMAS':
                data = await ultimas(limite);
                break;
            case 'HOY':
                data = await hoy();
                break;
            case 'RECIENTE':
                data = await reciente();
                break;
            case 'POR_TURNO':
                if (turnoId) {
                    data = await porTurnoId(Number(turnoId));
                    // Intento de “legible” si viene id
                    const leg = await legible(Number(turnoId));
                    setLegibleView(leg || null);
                } else if (codigo) {
                    data = await porCodigo(codigo.trim());
                }
                break;
            case 'POR_FECHA':
                if (fecha) data = await porFecha(fecha, limite);
                break;
            case 'COMPARAR':
                if (fecha1 && fecha2) data = await compararFechas(fecha1, fecha2);
                break;
            case 'REDIRECCIONES':
                data = await redirecciones(limite);
                break;
            case 'CAMBIOS_ESTADO':
                data = await cambiosEstado(limite);
                break;
            case 'TRAZA_DNI':
                if (dni) data = await trazabilidadDni(dni, 200);
                break;
            case 'AUDITORIA_EMP':
                if (empleadoId && fi && ff) {
                    // Traigo primero acciones (listado)
                    data = await accionesEmpleado(Number(empleadoId), fi, ff);
                    // Podés, si querés, disparar aparte el resumen de auditoría y mostrarlo como card
                    // const resumen = await auditoriaEmpleado(Number(empleadoId), fi, ff);
                    // setResumenAuditoria(resumen);
                }
                break;
            default:
                break;
        }
        setItems(Array.isArray(data) ? data : (data ? [data] : []));
    };

    const accionesHeader = useMemo(() => {
        switch (tab) {
            case 'ULTIMAS': return 'Últimas acciones';
            case 'HOY': return 'Acciones de hoy';
            case 'RECIENTE': return 'Actividad reciente (24 hs)';
            case 'POR_TURNO': return 'Historial por turno';
            case 'POR_FECHA': return 'Historial por fecha';
            case 'COMPARAR': return 'Comparar actividad entre fechas';
            case 'REDIRECCIONES': return 'Redirecciones';
            case 'CAMBIOS_ESTADO': return 'Cambios de estado';
            case 'TRAZA_DNI': return 'Trazabilidad por DNI';
            case 'AUDITORIA_EMP': return 'Auditoría por empleado';
            default: return 'Historial';
        }
    }, [tab]);

    return (
        <section className="space-y-6">
            {/* Tabs */}
            <div className="flex flex-wrap gap-2">
                {TABS.map(t => (
                    <button
                        key={t.key}
                        onClick={() => setTab(t.key)}
                        className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition
                ${tab === t.key
                                ? 'bg-[#224666] text-white'
                                : 'bg-slate-50 text-slate-700 hover:bg-slate-100'}`}
                        title={t.label}
                    >
                        {t.icon}<span>{t.label}</span>
                    </button>
                ))}
            </div>

            {/* Filtros */}
            <div className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-3 justify-center items-center">
                    {tab === 'ULTIMAS' && (
                        <div>
                            <label className="text-xs text-slate-500">Límite</label>
                            <input type="number" min={1} max={500} className="w-full px-3 py-2 border rounded-md"
                                value={limite} onChange={e => setLimite(Number(e.target.value || 50))} />
                        </div>
                    )}

                    {tab === 'POR_TURNO' && (
                        <>
                            <div>
                                <label className="text-xs text-slate-500">Código de turno</label>
                                <input type="text" className="w-full px-3 py-2 border rounded-md"
                                    value={codigo} onChange={e => setCodigo(e.target.value)} />
                            </div>
                        </>
                    )}

                    {tab === 'POR_FECHA' && (
                        <>
                            <div>
                                <label className="text-xs text-slate-500">Fecha</label>
                                <input type="date" className="w-full px-3 py-2 border rounded-md"
                                    value={fecha} onChange={e => setFecha(e.target.value)} />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500">Límite</label>
                                <input type="number" min={1} max={1000} className="w-full px-3 py-2 border rounded-md"
                                    value={limite} onChange={e => setLimite(Number(e.target.value || 200))} />
                            </div>
                        </>
                    )}

                    {tab === 'COMPARAR' && (
                        <>
                            <div>
                                <label className="text-xs text-slate-500">Fecha 1</label>
                                <input type="date" className="w-full px-3 py-2 border rounded-md"
                                    value={fecha1} onChange={e => setFecha1(e.target.value)} />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500">Fecha 2</label>
                                <input type="date" className="w-full px-3 py-2 border rounded-md"
                                    value={fecha2} onChange={e => setFecha2(e.target.value)} />
                            </div>
                        </>
                    )}

                    {tab === 'TRAZA_DNI' && (
                        <div>
                            <label className="text-xs text-slate-500">DNI</label>
                            <input type="text" className="w-full px-3 py-2 border rounded-md"
                                value={dni} onChange={e => setDni(e.target.value)} />
                        </div>
                    )}

                    {tab === 'REDIRECCIONES' && (
                        <div>
                            <label className="text-xs text-slate-500">Límite</label>
                            <input type="number" min={1} max={500} className="w-full px-3 py-2 border rounded-md"
                                value={limite} onChange={e => setLimite(Number(e.target.value || 100))} />
                        </div>
                    )}

                    {tab === 'CAMBIOS_ESTADO' && (
                        <div>
                            <label className="text-xs text-slate-500">Límite</label>
                            <input type="number" min={1} max={500} className="w-full px-3 py-2 border rounded-md"
                                value={limite} onChange={e => setLimite(Number(e.target.value || 100))} />
                        </div>
                    )}

                    {tab === 'AUDITORIA_EMP' && (
                        <>
                            <div>
                                <label className="text-xs text-slate-500">Empleado ID</label>
                                <input type="number" className="w-full px-3 py-2 border rounded-md"
                                    value={empleadoId} onChange={e => setEmpleadoId(e.target.value)} />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500">Desde</label>
                                <input type="date" className="w-full px-3 py-2 border rounded-md"
                                    value={fi} onChange={e => setFi(e.target.value)} />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500">Hasta</label>
                                <input type="date" className="w-full px-3 py-2 border rounded-md"
                                    value={ff} onChange={e => setFf(e.target.value)} />
                            </div>
                            <p className="text-xs text-slate-500 pt-6">
                                * Máx. 3 meses
                            </p>
                        </>
                    )}
                </div>

                <div className="mt-4 flex gap-2">
                    <button
                        onClick={onRun}
                        className="px-4 h-8 rounded-lg bg-[#224666] text-white hover:bg-[#2c3e50]"
                    >
                        Consultar
                    </button>
                    <button
                        onClick={() => { setItems([]); setLegibleView(null); }}
                        className="px-4 h-8 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        Limpiar
                    </button>
                </div>

                {tab === 'POR_TURNO' && legibleView && (
                    <div className="mt-4 bg-slate-50 border border-slate-200 rounded-lg p-3">
                        <p className="text-sm font-medium text-slate-700 mb-2">Historial legible</p>
                        <pre className="whitespace-pre-wrap text-xs text-slate-600">
                            {JSON.stringify(legibleView, null, 2)}
                        </pre>
                    </div>
                )}
            </div>

            <ErrorBox message={error} />
            {loading ? <Loader /> : <AccionesTable items={items} />}
        </section>
    );
}
