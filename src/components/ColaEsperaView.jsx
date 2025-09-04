import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Phone, PlayArrow, Stop, PersonOff, Redo, AccessTime, Person, Star, MoreVert, Refresh, Search, FilterList, X } from '@mui/icons-material';
import { createPortal } from 'react-dom';

/**
 * Portal flotante para el menú de acciones de un turno.
 * Posiciona el menú en <body> para evitar clipping por overflow de contenedores.
 */
const ActionsMenuPortal = ({ anchorRect, onClose, children, width = 224 }) => {
    const [pos, setPos] = useState({ top: 0, left: 0, openUp: false });
    const panelRef = useRef(null);

    const computePosition = useCallback(() => {
        if (!anchorRect) return;
        const margin = 8;
        const w = width;
        const panelHeight = panelRef.current?.offsetHeight ?? 240;
        const spaceBelow = window.innerHeight - anchorRect.bottom;
        const openUp = spaceBelow < panelHeight + margin;
        const top = openUp
            ? Math.max(8, anchorRect.top - panelHeight - margin)
            : Math.min(window.innerHeight - panelHeight - 8, anchorRect.bottom + margin);
        const left = Math.min(
            Math.max(8, anchorRect.right - w),
            window.innerWidth - w - 8
        );
        setPos({ top, left, openUp });
    }, [anchorRect, width]);

    useEffect(() => { computePosition(); }, [computePosition]);
    useEffect(() => {
        const onScroll = () => computePosition();
        const onResize = () => computePosition();
        const onClickOutside = (e) => {
            if (!panelRef.current) return;
            if (!panelRef.current.contains(e.target)) onClose?.();
        };
        window.addEventListener('scroll', onScroll, true);
        window.addEventListener('resize', onResize);
        document.addEventListener('mousedown', onClickOutside);
        return () => {
            window.removeEventListener('scroll', onScroll, true);
            window.removeEventListener('resize', onResize);
            document.removeEventListener('mousedown', onClickOutside);
        };
    }, [computePosition, onClose]);

    if (!anchorRect) return null;
    return createPortal(
        <div ref={panelRef} style={{ position: 'fixed', top: pos.top, left: pos.left, width }} className="z-[1000]">
            <div className="w-56 bg-white border border-slate-200 rounded-lg shadow-xl">
                {children}
            </div>
        </div>,
        document.body
    );
};

/**
 * Modal simple para cargar observaciones antes de confirmar una acción (ausente/finalizar).
 */
const ObservacionesModal = ({ open, titulo = 'Observaciones', placeholder = 'Escriba un comentario (opcional)...', initialValue = '', onCancel, onConfirm }) => {
    const [texto, setTexto] = useState(initialValue || '');
    useEffect(() => { setTexto(initialValue || ''); }, [initialValue, open]);
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
            <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-md mx-4">
                <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                    <h3 className="text-base font-semibold text-slate-900">{titulo}</h3>
                    <button onClick={onCancel} className="p-1 rounded-md hover:bg-slate-100"><X className="h-5 w-5 text-slate-500" /></button>
                </div>
                <div className="p-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Comentario</label>
                    <textarea value={texto} onChange={(e) => setTexto(e.target.value)} rows={4} className="w-full border border-slate-300 rounded-md px-3 py-2" placeholder={placeholder} />
                    <p className="text-xs text-slate-500 mt-2">Podés dejarlo vacío si no querés agregar detalles.</p>
                </div>
                <div className="px-4 py-3 border-t border-slate-200 flex justify-end gap-2">
                    <button onClick={onCancel} className="px-3 py-2 text-sm border border-slate-300 rounded-md hover:bg-slate-50">Cancelar</button>
                    <button onClick={() => onConfirm(texto)} className="px-3 py-2 text-sm rounded-md text-white bg-[#224666] hover:bg-[#1b3754]">Confirmar</button>
                </div>
            </div>
        </div>
    );
};

/**
 * Modal para redirigir un turno a otro sector, con motivo y observaciones.
 */
const RedirigirModal = ({ open, sectores = [], onCancel, onConfirm }) => {
    const [form, setForm] = useState({ nuevoSectorId: undefined, motivo: '', observaciones: '' });

    // Normaliza sectores a {id, nombre, codigo}
    const normalizados = useMemo(() => (Array.isArray(sectores) ? sectores : []).map(s => ({
        id: s?.sector?.id ?? s?.id,
        nombre: s?.sector?.nombre ?? s?.nombre,
        codigo: s?.sector?.codigo ?? s?.codigo,
    })).filter(s => s.id), [sectores]);

    // Al abrir (o cuando cambian los sectores) seteamos sólo el sector por defecto si no hay uno ya seleccionado.
    useEffect(() => {
        if (!open) return;
        setForm(prev => ({
            ...prev,
            nuevoSectorId: prev.nuevoSectorId ?? normalizados[0]?.id
        }));
        // ⚠️ No tocamos motivo/observaciones para no pisar la escritura del usuario.
    }, [open, normalizados]);

    if (!open) return null;

    const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    return (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
            <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-md mx-4">
                <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                    <h3 className="text-base font-semibold text-slate-900">Redirigir turno</h3>
                    <button onClick={onCancel} className="p-1 rounded-md hover:bg-slate-100"><X className="h-5 w-5 text-slate-500" /></button>
                </div>
                <div className="p-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Nuevo sector</label>
                        <select name="nuevoSectorId" value={form.nuevoSectorId ?? ''} onChange={handleChange} className="w-full border border-slate-300 rounded-md px-3 py-2">
                            {normalizados.map(s => (
                                <option key={s.id} value={s.id}>{s.codigo ? `${s.codigo} - ` : ''}{s.nombre}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Motivo</label>
                        <input name="motivo" value={form.motivo} onChange={handleChange} placeholder="Trámite corresponde a otro sector" className="w-full border border-slate-300 rounded-md px-3 py-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Observaciones (opcional)</label>
                        <textarea name="observaciones" value={form.observaciones} onChange={handleChange} rows={3} className="w-full border border-slate-300 rounded-md px-3 py-2" placeholder="Redirigido de Rentas a Contable" />
                    </div>
                </div>
                <div className="px-4 py-3 border-t border-slate-200 flex justify-end gap-2">
                    <button onClick={onCancel} className="px-3 py-2 text-sm border border-slate-300 rounded-md hover:bg-slate-50">Cancelar</button>
                    <button onClick={() => onConfirm({ ...form, nuevoSectorId: Number(form.nuevoSectorId) })} className="px-3 py-2 text-sm rounded-md text-white bg-[#224666] hover:bg-[#1b3754]">Confirmar</button>
                </div>
            </div>
        </div>
    );
};

/**
 * Vista detallada de la cola de espera
 */
const ColaEsperaView = ({
    colaEspera = [],
    proximoTurno = null,
    loading = false,
    onLlamarTurno,
    onIniciarAtencion,
    onFinalizarAtencion,
    onMarcarAusente,
    onRedirigirTurno,
    onRefresh,
    sectores = []
}) => {
    const [filtros, setFiltros] = useState({ busqueda: '', soloEspera: false, soloPrioritarios: false });
    const [mostrarAcciones, setMostrarAcciones] = useState(null); // turnoId abierto
    const [anchorRect, setAnchorRect] = useState(null); // rect del botón de acciones
    const actionBtnRefs = useRef({});

    // Notificación (mismo patrón que SectoresSection)
    const [notificacion, setNotificacion] = useState(null);
    const mostrarNotificacion = (mensaje, tipo = 'success') => {
        setNotificacion({ mensaje, tipo });
        setTimeout(() => setNotificacion(null), 5000);
    };

    // Estado para modal de observaciones (ausente/finalizar)
    const [obsOpen, setObsOpen] = useState(false);
    const [obsAccion, setObsAccion] = useState(null); // 'ausente' | 'finalizar'
    const [obsTurno, setObsTurno] = useState(null);

    // Estado para modal de redirección
    const [redirOpen, setRedirOpen] = useState(false);
    const [redirTurno, setRedirTurno] = useState(null);

    const abrirModalObservaciones = (accion, turno) => {
        setObsAccion(accion);
        setObsTurno(turno);
        setObsOpen(true);
        // cerrar dropdown
        setMostrarAcciones(null);
        setAnchorRect(null);
    };

    const confirmarObservaciones = async (texto) => {
        if (!obsAccion || !obsTurno) { setObsOpen(false); return; }
        const datos = { observaciones: (texto || '').trim() || undefined };
        await handleAccion(obsAccion, obsTurno, datos);
        setObsOpen(false);
        setObsAccion(null);
        setObsTurno(null);
    };

    const abrirModalRedirigir = (turno) => {
        setRedirTurno(turno);
        setRedirOpen(true);
        setMostrarAcciones(null);
        setAnchorRect(null);
    };

    const confirmarRedireccion = async (payload) => {
        if (!redirTurno) { setRedirOpen(false); return; }
        await handleAccion('redirigir', redirTurno, payload);
        setRedirOpen(false);
        setRedirTurno(null);
    };

    // ================= HELPERS CIUDADANO ================
    const mostrarNombreCiudadano = (turno) => {
        if (!turno?.ciudadano) return 'Sin información del ciudadano';
        const nombre = turno.ciudadano.nombreCompleto;
        if (!nombre || nombre === 'undefined undefined' || nombre.includes('null') || nombre.trim() === '' || nombre === ', ') {
            if (turno.ciudadano.dni && turno.ciudadano.dni !== 'null') return `Ciudadano DNI: ${turno.ciudadano.dni}`;
            return 'Datos no disponibles';
        }
        return nombre;
    };
    const mostrarDniCiudadano = (turno) => (!turno?.ciudadano?.dni || turno.ciudadano.dni === 'null') ? 'No disponible' : turno.ciudadano.dni;
    const coincideBusqueda = (turno, busqueda) => {
        const q = busqueda.toLowerCase();
        if (turno.codigo && turno.codigo.toLowerCase().includes(q)) return true;
        const dni = mostrarDniCiudadano(turno);
        if (dni !== 'No disponible' && dni.includes(q)) return true;
        const nombre = mostrarNombreCiudadano(turno);
        if (nombre && nombre.toLowerCase().includes(q)) return true;
        if (turno.ciudadano) {
            const { nombre: n, apellido } = turno.ciudadano;
            if (n && n !== 'null' && n.toLowerCase().includes(q)) return true;
            if (apellido && apellido !== 'null' && apellido.toLowerCase().includes(q)) return true;
        }
        return false;
    };

    const isEnEspera = (estado) => ['GENERADO', 'REDIRIGIDO'].includes(estado);

    const turnosFiltrados = useMemo(() => (
        colaEspera.filter(t => {
            if (filtros.busqueda && !coincideBusqueda(t, filtros.busqueda)) return false;
            if (filtros.soloEspera && !isEnEspera(t.estado)) return false; // GENERADO o REDIRIGIDO
            if (filtros.soloPrioritarios && !t.esPrioritario) return false;
            return true;
        })
    ), [colaEspera, filtros]);

    const getTiempoEspera = (turno) => {
        if (!turno.fechaHoraCreacion) return '-';
        const ahora = new Date();
        const creacion = new Date(turno.fechaHoraCreacion);
        const diff = Math.floor((ahora - creacion) / 1000 / 60);
        if (diff < 60) return `${diff}m`;
        const horas = Math.floor(diff / 60);
        const minutos = diff % 60;
        return `${horas}h ${minutos}m`;
    };

    const handleAccion = async (accion, turno, datos = {}) => {
        try {
            switch (accion) {
                case 'llamar':
                    await onLlamarTurno(turno.id, datos.observaciones);
                    mostrarNotificacion(`Turno ${turno.codigo} llamado correctamente`, 'success');
                    break;
                case 'iniciar':
                    await onIniciarAtencion(turno.id);
                    mostrarNotificacion('Atención iniciada correctamente', 'success');
                    break;
                case 'finalizar':
                    await onFinalizarAtencion(turno.id, datos.observaciones);
                    mostrarNotificacion('Atención finalizada correctamente', 'success');
                    break;
                case 'ausente':
                    await onMarcarAusente(turno.id, { observaciones: datos?.observaciones ?? '' });
                    mostrarNotificacion('Turno marcado como ausente correctamente', 'success');
                    break;
                case 'redirigir':
                    await onRedirigirTurno(turno.id, datos.nuevoSectorId, datos.motivo, datos.observaciones);
                    mostrarNotificacion('Turno redirigido correctamente', 'success');
                    break;
                default:
                    break;
            }
        } catch (e) {
            console.error('Error en acción:', e);
            mostrarNotificacion(e?.message || 'Error ejecutando la acción', 'error');
            throw e;
        } finally {
            setMostrarAcciones(null);
            setAnchorRect(null);
        }
    };

    // =================== FILTROS + PROXIMO ==================
    const renderFiltros = () => (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 mb-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                        <input type="text" placeholder="Buscar por código, nombre o DNI..." value={filtros.busqueda} onChange={(e) => setFiltros(p => ({ ...p, busqueda: e.target.value }))} className="pl-10 pr-4 py-2 border border-slate-300 rounded-md text-sm w-64" />
                    </div>
                    <div className="flex items-center space-x-2">
                        <label className="flex items-center space-x-2 text-sm"><input type="checkbox" checked={filtros.soloEspera} onChange={(e) => setFiltros(p => ({ ...p, soloEspera: e.target.checked }))} className="rounded border-slate-300 text-slate-600" /><span>Solo en espera</span></label>
                        <label className="flex items-center space-x-2 text-sm"><input type="checkbox" checked={filtros.soloPrioritarios} onChange={(e) => setFiltros(p => ({ ...p, soloPrioritarios: e.target.checked }))} className="rounded border-slate-300 text-slate-600" /><span>Solo prioritarios</span></label>
                    </div>
                </div>
                <button onClick={onRefresh} disabled={loading} className="flex items-center px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50">
                    <Refresh className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    <span>Actualizar</span>
                </button>
            </div>
        </div>
    );

    const renderProximoTurno = () => {
        if (!proximoTurno) return null;
        return (
            <div className="bg-[#224666] rounded-lg shadow-lg p-6 mb-6 text-white">
                <h3 className="text-lg font-semibold mb-4">Próximo Turno a Atender</h3>
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                        <div>
                            <div className="text-4xl font-bold mb-1">{proximoTurno.codigo}</div>
                            {proximoTurno.esPrioritario && (<div className="flex items-center text-yellow-200 text-sm"><Star className="h-4 w-4 mr-1" /><span>Prioritario</span></div>)}
                        </div>
                        <div>
                            <div className="text-lg font-medium">{mostrarNombreCiudadano(proximoTurno)}</div>
                            <div className="text-blue-100 text-sm">DNI: {mostrarDniCiudadano(proximoTurno)}</div>
                            <div className="text-blue-100 text-sm">Espera: {getTiempoEspera(proximoTurno)}</div>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        {proximoTurno.puedeSerLlamado && (
                            <button onClick={() => handleAccion('llamar', proximoTurno)} className="bg-white text-slate-800 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center space-x-2">
                                <Phone className="h-5 w-5" />
                                <span>Llamar</span>
                            </button>
                        )}
                        {proximoTurno.puedeIniciarAtencion && (
                            <button onClick={() => handleAccion('iniciar', proximoTurno)} className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center space-x-2">
                                <PlayArrow className="h-5 w-5" />
                                <span>Iniciar Atención</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    // =================== TABLA ==================
    const renderTablaTurnos = () => (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-3 bg-slate-50 border-b border-slate-200">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-slate-900">Cola de Espera ({turnosFiltrados.length} turnos)</h3>
                    <FilterList className="h-5 w-5 text-slate-400" />
                </div>
            </div>

            {turnosFiltrados.length === 0 ? (
                <div className="p-12 text-center">
                    <div className="text-slate-400 mb-4"><AccessTime className="h-12 w-12 mx-auto" /></div>
                    <h3 className="text-lg font-medium text-slate-900 mb-2">No hay turnos en cola</h3>
                    <p className="text-slate-600">{filtros.busqueda || filtros.soloEspera || filtros.soloPrioritarios ? 'No se encontraron turnos con los filtros aplicados' : 'La cola está vacía en este momento'}</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Turno</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Ciudadano</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tiempo de Espera</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Prioridad</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {turnosFiltrados.map((turno, index) => (
                                <tr key={`turno-${turno.id}-${index}`} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="font-mono text-lg font-bold text-slate-900">{turno.codigo}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-slate-900">{mostrarNombreCiudadano(turno)}</div>
                                            <div className="text-sm text-slate-500">DNI: {mostrarDniCiudadano(turno)}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${turno.estadoColor}`}>{turno.estadoTexto}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{getTiempoEspera(turno)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {turno.esPrioritario ? (
                                            <div className="flex items-center text-yellow-600"><Star className="h-4 w-4 mr-1" /><span className="text-xs font-medium">Prioritario</span></div>
                                        ) : (
                                            <span className="text-xs text-slate-400">Normal</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            ref={el => { if (el) actionBtnRefs.current[turno.id] = el; }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const alreadyOpen = mostrarAcciones === turno.id;
                                                if (alreadyOpen) {
                                                    setMostrarAcciones(null);
                                                    setAnchorRect(null);
                                                } else {
                                                    const rect = actionBtnRefs.current[turno.id]?.getBoundingClientRect();
                                                    setMostrarAcciones(turno.id);
                                                    setAnchorRect(rect || null);
                                                }
                                            }}
                                            className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100"
                                        >
                                            <MoreVert className="h-5 w-5" />
                                        </button>

                                        {/* Menú en portal */}
                                        {mostrarAcciones === turno.id && anchorRect && (
                                            <ActionsMenuPortal anchorRect={anchorRect} onClose={() => { setMostrarAcciones(null); setAnchorRect(null); }}>
                                                <div className="py-2">
                                                    {(turno.puedeSerLlamado || isEnEspera(turno.estado)) && (
                                                        <button onClick={() => handleAccion('llamar', turno)} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 flex items-center">
                                                            <Phone className="h-4 w-4 mr-2 text-slate-500" /> Llamar
                                                        </button>
                                                    )}
                                                    {turno.puedeIniciarAtencion && (
                                                        <button onClick={() => handleAccion('iniciar', turno)} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 flex items-center">
                                                            <PlayArrow className="h-4 w-4 mr-2 text-slate-500" /> Iniciar atención
                                                        </button>
                                                    )}
                                                    {/* Finalizar Atención: mostrar si el back lo permite o si el estado es EN_ATENCION */}
                                                    {(turno.puedeFinalizarAtencion || turno.estado === 'EN_ATENCION') && (
                                                        <button onClick={() => abrirModalObservaciones('finalizar', turno)} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 flex items-center">
                                                            <Stop className="h-4 w-4 mr-2 text-slate-500" /> Finalizar atención
                                                        </button>
                                                    )}
                                                    {/* Marcar Ausente sólo cuando el estado sea LLAMADO */}
                                                    {turno.estado === 'LLAMADO' && (
                                                        <button onClick={() => abrirModalObservaciones('ausente', turno)} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 flex items-center">
                                                            <PersonOff className="h-4 w-4 mr-2 text-red-600" /> Marcar Ausente
                                                        </button>
                                                    )}
                                                    {/* Redirigir sólo si está EN_ATENCION */}
                                                    {turno.estado === 'EN_ATENCION' && (
                                                        <button onClick={() => abrirModalRedirigir(turno)} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 flex items-center">
                                                            <Redo className="h-4 w-4 mr-2 text-slate-500" /> Redirigir
                                                        </button>
                                                    )}
                                                </div>
                                            </ActionsMenuPortal>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );

    return (
        <div>
            {renderFiltros()}
            {renderProximoTurno()}
            {renderTablaTurnos()}

            {/* Notificación (estilo SectoresSection) */}
            {notificacion && (
                <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[60] px-4 py-6 rounded-lg shadow-lg border transition-all duration-300 ${notificacion.tipo === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                    <div className="flex items-center">
                        <span className="font-medium">{notificacion.mensaje}</span>
                        <button onClick={() => setNotificacion(null)} className="ml-3 text-sm opacity-70 hover:opacity-100">✕</button>
                    </div>
                </div>
            )}

            {/* Modales */}
            <ObservacionesModal
                open={obsOpen}
                titulo={obsAccion === 'ausente' ? 'Marcar Ausente' : 'Finalizar Atención'}
                placeholder={obsAccion === 'ausente' ? 'Motivo de ausencia (opcional)...' : 'Observaciones de cierre (opcional)...'}
                onCancel={() => { setObsOpen(false); setObsAccion(null); setObsTurno(null); }}
                onConfirm={confirmarObservaciones}
            />

            <RedirigirModal
                open={redirOpen}
                sectores={sectores}
                onCancel={() => { setRedirOpen(false); setRedirTurno(null); }}
                onConfirm={confirmarRedireccion}
            />
        </div>
    );
};

export default ColaEsperaView;
