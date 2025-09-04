import React, { useState, useMemo } from 'react';
import {
    AccessTime,
    Person,
    Star,
    Phone,
    PlayArrow,
    Stop,
    PersonOff,
    Redo,
    FilterList,
    Search,
    Refresh,
    Sort,
    Schedule,
    Assignment,
    Business
} from '@mui/icons-material';

/**
 * Vista de turnos pendientes con filtros y acciones
 */
const TurnosPendientesView = ({
    turnosPendientes = [],
    loading = false,
    onLlamarTurno,
    onIniciarAtencion,
    onFinalizarAtencion,
    onMarcarAusente,
    onRedirigirTurno,
    onRefresh,
    sectores = []
}) => {
    const [filtros, setFiltros] = useState({
        busqueda: '',
        estado: 'TODOS',
        prioridad: 'TODOS',
        ordenarPor: 'fecha', // 'fecha', 'prioridad', 'tiempo'
        ordenAscendente: false
    });
    const [mostrarFiltros, setMostrarFiltros] = useState(false);
    const [turnoSeleccionado, setTurnoSeleccionado] = useState(null);
    const [modalObservaciones, setModalObservaciones] = useState({ abierto: false, accion: '', turno: null });
    const [modalRedirigir, setModalRedirigir] = useState({ abierto: false, turno: null });

    // Filtrar y ordenar turnos
    const turnosFiltradosYOrdenados = useMemo(() => {
        let resultado = turnosPendientes.filter(turno => {
            // Filtro por búsqueda
            if (filtros.busqueda) {
                const busqueda = filtros.busqueda.toLowerCase();
                const coincide =
                    turno.codigo.toLowerCase().includes(busqueda) ||
                    turno.ciudadano?.nombreCompleto?.toLowerCase().includes(busqueda) ||
                    turno.ciudadano?.dni?.includes(busqueda);
                if (!coincide) return false;
            }

            // Filtro por estado
            if (filtros.estado !== 'TODOS' && turno.estado !== filtros.estado) {
                return false;
            }

            // Filtro por prioridad
            if (filtros.prioridad === 'PRIORITARIOS' && !turno.esPrioritario) {
                return false;
            } else if (filtros.prioridad === 'NORMALES' && turno.esPrioritario) {
                return false;
            }

            return true;
        });

        // Ordenamiento
        resultado.sort((a, b) => {
            let comparacion = 0;

            switch (filtros.ordenarPor) {
                case 'fecha':
                    comparacion = new Date(a.fechaHoraCreacion) - new Date(b.fechaHoraCreacion);
                    break;
                case 'prioridad':
                    // Prioritarios primero
                    if (a.esPrioritario && !b.esPrioritario) comparacion = -1;
                    else if (!a.esPrioritario && b.esPrioritario) comparacion = 1;
                    else comparacion = new Date(a.fechaHoraCreacion) - new Date(b.fechaHoraCreacion);
                    break;
                case 'tiempo':
                    const tiempoA = a.tiempoEspera || 0;
                    const tiempoB = b.tiempoEspera || 0;
                    comparacion = tiempoA - tiempoB;
                    break;
                default:
                    comparacion = 0;
            }

            return filtros.ordenAscendente ? comparacion : -comparacion;
        });

        return resultado;
    }, [turnosPendientes, filtros]);

    const handleAccion = async (accion, turno, datos = {}) => {
        try {
            switch (accion) {
                case 'llamar':
                    await onLlamarTurno(turno.id, datos.observaciones);
                    break;
                case 'iniciar':
                    await onIniciarAtencion(turno.id);
                    break;
                case 'finalizar':
                    await onFinalizarAtencion(turno.id, datos.observaciones);
                    break;
                case 'ausente':
                    await onMarcarAusente(turno.id, datos.observaciones);
                    break;
                case 'redirigir':
                    await onRedirigirTurno(turno.id, datos.nuevoSectorId, datos.motivo, datos.observaciones);
                    break;
            }
            cerrarModales();
        } catch (error) {
            console.error('Error en acción:', error);
        }
    };

    const cerrarModales = () => {
        setTurnoSeleccionado(null);
        setModalObservaciones({ abierto: false, accion: '', turno: null });
        setModalRedirigir({ abierto: false, turno: null });
    };

    const abrirModalObservaciones = (accion, turno) => {
        setModalObservaciones({ abierto: true, accion, turno });
    };

    const abrirModalRedirigir = (turno) => {
        setModalRedirigir({ abierto: true, turno });
    };

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

    const getColorTiempoEspera = (turno) => {
        const diff = Math.floor((new Date() - new Date(turno.fechaHoraCreacion)) / 1000 / 60);
        if (diff > 120) return 'text-red-600 font-semibold';
        if (diff > 60) return 'text-yellow-600 font-medium';
        return 'text-slate-600';
    };

    // Estadísticas rápidas
    const estadisticas = {
        total: turnosPendientes.length,
        enEspera: turnosPendientes.filter(t => t.estado === 'GENERADO').length,
        llamados: turnosPendientes.filter(t => t.estado === 'LLAMADO').length,
        enAtencion: turnosPendientes.filter(t => t.estado === 'EN_ATENCION').length,
        prioritarios: turnosPendientes.filter(t => t.esPrioritario).length,
        filtrados: turnosFiltradosYOrdenados.length
    };

    // Renderizar estadísticas
    const renderEstadisticas = () => (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 mb-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                    <div className="text-2xl font-bold text-slate-900">{estadisticas.total}</div>
                    <div className="text-xs text-slate-500">Total</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{estadisticas.enEspera}</div>
                    <div className="text-xs text-slate-500">En Espera</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{estadisticas.llamados}</div>
                    <div className="text-xs text-slate-500">Llamados</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{estadisticas.enAtencion}</div>
                    <div className="text-xs text-slate-500">En Atención</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{estadisticas.prioritarios}</div>
                    <div className="text-xs text-slate-500">Prioritarios</div>
                </div>
            </div>
        </div>
    );

    // Renderizar controles de filtros
    const renderControles = () => (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 mb-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-slate-900 flex items-center">
                    <Schedule className="h-5 w-5 mr-2 text-slate-600" />
                    Turnos Pendientes ({estadisticas.filtrados})
                </h3>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => setMostrarFiltros(!mostrarFiltros)}
                        className={`flex items-center space-x-2 px-3 py-2 text-sm border rounded-md transition-colors ${mostrarFiltros ? 'bg-slate-100 border-slate-300' : 'border-slate-300 hover:bg-slate-50'
                            }`}
                    >
                        <FilterList className="h-4 w-4" />
                        <span>Filtros</span>
                    </button>
                    <button
                        onClick={onRefresh}
                        disabled={loading}
                        className="flex items-center space-x-2 px-3 py-2 text-sm border border-slate-300 rounded-md hover:bg-slate-50 transition-colors disabled:opacity-50"
                    >
                        <Refresh className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        <span>Actualizar</span>
                    </button>
                </div>
            </div>

            {mostrarFiltros && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-200">
                    {/* Búsqueda */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Buscar</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                            <input
                                type="text"
                                placeholder="Código, nombre, DNI..."
                                value={filtros.busqueda}
                                onChange={(e) => setFiltros(prev => ({ ...prev, busqueda: e.target.value }))}
                                className="pl-10 pr-4 py-2 w-full border border-slate-300 rounded-md text-sm"
                            />
                        </div>
                    </div>

                    {/* Estado */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
                        <select
                            value={filtros.estado}
                            onChange={(e) => setFiltros(prev => ({ ...prev, estado: e.target.value }))}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                        >
                            <option value="TODOS">Todos los estados</option>
                            <option value="GENERADO">En Espera</option>
                            <option value="LLAMADO">Llamado</option>
                            <option value="EN_ATENCION">En Atención</option>
                        </select>
                    </div>

                    {/* Prioridad */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Prioridad</label>
                        <select
                            value={filtros.prioridad}
                            onChange={(e) => setFiltros(prev => ({ ...prev, prioridad: e.target.value }))}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                        >
                            <option value="TODOS">Todas las prioridades</option>
                            <option value="PRIORITARIOS">Solo prioritarios</option>
                            <option value="NORMALES">Solo normales</option>
                        </select>
                    </div>

                    {/* Ordenamiento */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Ordenar por</label>
                        <div className="flex space-x-1">
                            <select
                                value={filtros.ordenarPor}
                                onChange={(e) => setFiltros(prev => ({ ...prev, ordenarPor: e.target.value }))}
                                className="flex-1 px-3 py-2 border border-slate-300 rounded-l-md text-sm"
                            >
                                <option value="fecha">Fecha</option>
                                <option value="prioridad">Prioridad</option>
                                <option value="tiempo">Tiempo espera</option>
                            </select>
                            <button
                                onClick={() => setFiltros(prev => ({ ...prev, ordenAscendente: !prev.ordenAscendente }))}
                                className="px-2 py-2 border border-l-0 border-slate-300 rounded-r-md hover:bg-slate-50 text-slate-600"
                                title={filtros.ordenAscendente ? 'Ascendente' : 'Descendente'}
                            >
                                <Sort className={`h-4 w-4 transform ${filtros.ordenAscendente ? 'rotate-180' : ''}`} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    // Renderizar tabla de turnos pendientes
    const renderTablaTurnos = () => {
        if (turnosFiltradosYOrdenados.length === 0) {
            return (
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12">
                    <div className="text-center">
                        <AccessTime className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-900 mb-2">No hay turnos pendientes</h3>
                        <p className="text-slate-600">
                            {turnosPendientes.length === 0
                                ? 'No hay turnos pendientes en este sector'
                                : 'No se encontraron turnos con los filtros aplicados'
                            }
                        </p>
                    </div>
                </div>
            );
        }

        return (
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                                    Turno
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                                    Ciudadano
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                                    Estado
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                                    Tiempo de Espera
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                                    Prioridad
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">
                                    Acciones Rápidas
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {turnosFiltradosYOrdenados.map((turno, index) => (
                                <tr
                                    key={turno.id}
                                    className={`${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'} ${turno.esPrioritario ? 'border-l-4 border-l-yellow-400' : ''
                                        }`}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="font-mono text-lg font-bold text-slate-900">
                                            {turno.codigo}
                                        </div>
                                        {turno.tipoTurno === 'ESPECIAL' && (
                                            <div className="text-xs text-purple-600 font-medium">Especial</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-slate-900">
                                                {turno.ciudadano?.nombreCompleto}
                                            </div>
                                            <div className="text-sm text-slate-500">
                                                DNI: {turno.ciudadano?.dni}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${turno.estadoColor}`}>
                                            {turno.estadoTexto}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`text-sm ${getColorTiempoEspera(turno)}`}>
                                            {getTiempoEspera(turno)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {turno.esPrioritario ? (
                                            <div className="flex items-center text-yellow-600">
                                                <Star className="h-4 w-4 mr-1" />
                                                <span className="text-xs font-medium">Prioritario</span>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-slate-400">Normal</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center justify-center space-x-1">
                                            {turno.puedeSerLlamado && (
                                                <button
                                                    onClick={() => handleAccion('llamar', turno)}
                                                    className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                                    title="Llamar turno"
                                                >
                                                    <Phone className="h-4 w-4" />
                                                </button>
                                            )}
                                            {turno.puedeIniciarAtencion && (
                                                <button
                                                    onClick={() => handleAccion('iniciar', turno)}
                                                    className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors"
                                                    title="Iniciar atención"
                                                >
                                                    <PlayArrow className="h-4 w-4" />
                                                </button>
                                            )}
                                            {turno.puedeSerFinalizado && (
                                                <button
                                                    onClick={() => abrirModalObservaciones('finalizar', turno)}
                                                    className="p-1 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                                                    title="Finalizar atención"
                                                >
                                                    <Stop className="h-4 w-4" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => abrirModalRedirigir(turno)}
                                                className="p-1 text-purple-600 hover:bg-purple-100 rounded transition-colors"
                                                title="Redirigir turno"
                                            >
                                                <Redo className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => abrirModalObservaciones('ausente', turno)}
                                                className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                                                title="Marcar ausente"
                                            >
                                                <PersonOff className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    // Modal para observaciones (reutilizado de ColaEsperaView)
    const renderModalObservaciones = () => {
        if (!modalObservaciones.abierto) return null;

        const { accion, turno } = modalObservaciones;
        const [observaciones, setObservaciones] = useState('');

        const tituloAccion = {
            'finalizar': 'Finalizar Atención',
            'ausente': 'Marcar como Ausente'
        };

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                    <div className="px-6 py-4 border-b border-slate-200">
                        <h3 className="text-lg font-semibold text-slate-900">
                            {tituloAccion[accion]} - {turno?.codigo}
                        </h3>
                    </div>

                    <div className="px-6 py-4">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Observaciones {accion === 'ausente' ? '(requeridas)' : '(opcionales)'}
                        </label>
                        <textarea
                            value={observaciones}
                            onChange={(e) => setObservaciones(e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md"
                            placeholder={accion === 'ausente' ? 'Motivo de la ausencia...' : 'Observaciones adicionales...'}
                        />
                    </div>

                    <div className="px-6 py-4 border-t border-slate-200 flex justify-end space-x-3">
                        <button
                            onClick={cerrarModales}
                            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={() => handleAccion(accion, turno, { observaciones })}
                            disabled={accion === 'ausente' && !observaciones.trim()}
                            className="px-4 py-2 text-sm font-medium text-white bg-slate-600 rounded-md hover:bg-slate-700 disabled:opacity-50"
                        >
                            {tituloAccion[accion]}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // Modal para redirigir (reutilizado de ColaEsperaView)
    const renderModalRedirigir = () => {
        if (!modalRedirigir.abierto) return null;

        const { turno } = modalRedirigir;
        const [nuevoSectorId, setNuevoSectorId] = useState('');
        const [motivo, setMotivo] = useState('');
        const [observaciones, setObservaciones] = useState('');

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
                    <div className="px-6 py-4 border-b border-slate-200">
                        <h3 className="text-lg font-semibold text-slate-900">
                            Redirigir Turno - {turno?.codigo}
                        </h3>
                    </div>

                    <div className="px-6 py-4 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Nuevo Sector *
                            </label>
                            <select
                                value={nuevoSectorId}
                                onChange={(e) => setNuevoSectorId(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md"
                            >
                                <option value="">Seleccionar sector...</option>
                                {sectores.filter(s => s.id !== turno?.sector?.id).map(sector => (
                                    <option key={sector.id} value={sector.id}>
                                        {sector.codigo} - {sector.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Motivo de la redirección *
                            </label>
                            <input
                                type="text"
                                value={motivo}
                                onChange={(e) => setMotivo(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md"
                                placeholder="Ej: Trámite corresponde a otro sector"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Observaciones adicionales
                            </label>
                            <textarea
                                value={observaciones}
                                onChange={(e) => setObservaciones(e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md"
                                placeholder="Información adicional..."
                            />
                        </div>
                    </div>

                    <div className="px-6 py-4 border-t border-slate-200 flex justify-end space-x-3">
                        <button
                            onClick={cerrarModales}
                            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={() => handleAccion('redirigir', turno, { nuevoSectorId: parseInt(nuevoSectorId), motivo, observaciones })}
                            disabled={!nuevoSectorId || !motivo.trim()}
                            className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50"
                        >
                            Redirigir Turno
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Estadísticas */}
            {renderEstadisticas()}

            {/* Controles y filtros */}
            {renderControles()}

            {/* Tabla de turnos */}
            {renderTablaTurnos()}

            {/* Modales */}
            {renderModalObservaciones()}
            {renderModalRedirigir()}
        </div>
    );
};

export default TurnosPendientesView;