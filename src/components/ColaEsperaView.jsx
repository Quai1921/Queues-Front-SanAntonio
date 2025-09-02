import React, { useState } from 'react';
import {
    Phone,
    PlayArrow,
    Stop,
    PersonOff,
    Redo,
    AccessTime,
    Person,
    Star,
    MoreVert,
    Refresh,
    Search,
    FilterList
} from '@mui/icons-material';

/**
 * Vista detallada de la cola de espera con todas las acciones
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
    const [filtros, setFiltros] = useState({
        busqueda: '',
        soloEspera: false,
        soloPrioritarios: false
    });
    const [turnoSeleccionado, setTurnoSeleccionado] = useState(null);
    const [mostrarAcciones, setMostrarAcciones] = useState(null);
    const [modalObservaciones, setModalObservaciones] = useState({ abierto: false, accion: '', turno: null });
    const [modalRedirigir, setModalRedirigir] = useState({ abierto: false, turno: null });

    // ============================================
    // FUNCIÓN HELPER PARA MOSTRAR NOMBRE CIUDADANO
    // ============================================
    const mostrarNombreCiudadano = (turno) => {
        if (!turno?.ciudadano) return 'Sin información del ciudadano';

        const ciudadano = turno.ciudadano;
        const nombre = ciudadano.nombreCompleto;

        // Verificar si el nombre está corrupto o vacío
        if (!nombre ||
            nombre === 'undefined undefined' ||
            nombre.includes('null') ||
            nombre.trim() === '' ||
            nombre === ', ') {
            // Fallback: usar DNI si está disponible
            if (ciudadano.dni && ciudadano.dni !== 'null') {
                return `Ciudadano DNI: ${ciudadano.dni}`;
            }
            return 'Datos no disponibles';
        }

        return nombre;
    };

    // ============================================
    // FUNCIÓN HELPER PARA MOSTRAR DNI CIUDADANO
    // ============================================
    const mostrarDniCiudadano = (turno) => {
        if (!turno?.ciudadano?.dni || turno.ciudadano.dni === 'null') {
            return 'No disponible';
        }
        return turno.ciudadano.dni;
    };

    // ============================================
    // FUNCIÓN HELPER MEJORADA PARA BÚSQUEDA
    // ============================================
    const coincideBusqueda = (turno, busqueda) => {
        const busquedaLower = busqueda.toLowerCase();

        // Buscar en código
        if (turno.codigo && turno.codigo.toLowerCase().includes(busquedaLower)) {
            return true;
        }

        // Buscar en DNI
        const dni = mostrarDniCiudadano(turno);
        if (dni !== 'No disponible' && dni.includes(busquedaLower)) {
            return true;
        }

        // Buscar en nombre (usando la función helper)
        const nombreCompleto = mostrarNombreCiudadano(turno);
        if (nombreCompleto && nombreCompleto.toLowerCase().includes(busquedaLower)) {
            return true;
        }

        // Buscar en campos individuales si están disponibles
        if (turno.ciudadano) {
            const nombre = turno.ciudadano.nombre;
            const apellido = turno.ciudadano.apellido;

            if (nombre && nombre !== 'null' && nombre.toLowerCase().includes(busquedaLower)) {
                return true;
            }
            if (apellido && apellido !== 'null' && apellido.toLowerCase().includes(busquedaLower)) {
                return true;
            }
        }

        return false;
    };

    // Filtrar turnos según criterios
    const turnosFiltrados = colaEspera.filter(turno => {
        // Filtro por búsqueda
        if (filtros.busqueda) {
            if (!coincideBusqueda(turno, filtros.busqueda)) {
                return false;
            }
        }

        // Filtro solo en espera
        if (filtros.soloEspera && turno.estado !== 'GENERADO') {
            return false;
        }

        // Filtro solo prioritarios
        if (filtros.soloPrioritarios && !turno.esPrioritario) {
            return false;
        }

        return true;
    });

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
            setMostrarAcciones(null);
            setModalObservaciones({ abierto: false, accion: '', turno: null });
            setModalRedirigir({ abierto: false, turno: null });
        } catch (error) {
            console.error('Error en acción:', error);
        }
    };

    const abrirModalObservaciones = (accion, turno) => {
        setModalObservaciones({ abierto: true, accion, turno });
        setMostrarAcciones(null);
    };

    const abrirModalRedirigir = (turno) => {
        setModalRedirigir({ abierto: true, turno });
        setMostrarAcciones(null);
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

    // Renderizar filtros
    const renderFiltros = () => (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 mb-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                        <input
                            type="text"
                            placeholder="Buscar por código, nombre o DNI..."
                            value={filtros.busqueda}
                            onChange={(e) => setFiltros(prev => ({ ...prev, busqueda: e.target.value }))}
                            className="pl-10 pr-4 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent w-64"
                        />
                    </div>

                    <div className="flex items-center space-x-2">
                        <label className="flex items-center space-x-2 text-sm">
                            <input
                                type="checkbox"
                                checked={filtros.soloEspera}
                                onChange={(e) => setFiltros(prev => ({ ...prev, soloEspera: e.target.checked }))}
                                className="rounded border-slate-300 text-slate-600 focus:ring-slate-500"
                            />
                            <span>Solo en espera</span>
                        </label>

                        <label className="flex items-center space-x-2 text-sm">
                            <input
                                type="checkbox"
                                checked={filtros.soloPrioritarios}
                                onChange={(e) => setFiltros(prev => ({ ...prev, soloPrioritarios: e.target.checked }))}
                                className="rounded border-slate-300 text-slate-600 focus:ring-slate-500"
                            />
                            <span>Solo prioritarios</span>
                        </label>
                    </div>
                </div>

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
    );

    // Renderizar próximo turno destacado
    const renderProximoTurno = () => {
        if (!proximoTurno) return null;

        return (
            <div className="bg-[#224666] rounded-lg shadow-lg p-6 mb-6 text-white">
                <h3 className="text-lg font-semibold mb-4">Próximo Turno a Atender</h3>
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                        <div>
                            <div className="text-4xl font-bold mb-1">{proximoTurno.codigo}</div>
                            {proximoTurno.esPrioritario && (
                                <div className="flex items-center text-yellow-200 text-sm">
                                    <Star className="h-4 w-4 mr-1" />
                                    <span>Prioritario</span>
                                </div>
                            )}
                        </div>
                        <div>
                            <div className="text-lg font-medium">
                                {mostrarNombreCiudadano(proximoTurno)}
                            </div>
                            <div className="text-blue-100 text-sm">
                                DNI: {mostrarDniCiudadano(proximoTurno)}
                            </div>
                            <div className="text-blue-100 text-sm">Espera: {getTiempoEspera(proximoTurno)}</div>
                        </div>
                    </div>

                    <div className="flex space-x-2">
                        {proximoTurno.puedeSerLlamado && (
                            <button
                                onClick={() => handleAccion('llamar', proximoTurno)}
                                className="bg-white text-slate-800 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center space-x-2"
                            >
                                <Phone className="h-5 w-5" />
                                <span>Llamar</span>
                            </button>
                        )}
                        {proximoTurno.puedeIniciarAtencion && (
                            <button
                                onClick={() => handleAccion('iniciar', proximoTurno)}
                                className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center space-x-2"
                            >
                                <PlayArrow className="h-5 w-5" />
                                <span>Iniciar Atención</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    // Renderizar tabla de turnos
    const renderTablaTurnos = () => (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-3 bg-slate-50 border-b border-slate-200">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-slate-900">
                        Cola de Espera ({turnosFiltrados.length} turnos)
                    </h3>
                    <FilterList className="h-5 w-5 text-slate-400" />
                </div>
            </div>

            {turnosFiltrados.length === 0 ? (
                <div className="p-12 text-center">
                    <div className="text-slate-400 mb-4">
                        <AccessTime className="h-12 w-12 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 mb-2">No hay turnos en cola</h3>
                    <p className="text-slate-600">
                        {filtros.busqueda || filtros.soloEspera || filtros.soloPrioritarios
                            ? 'No se encontraron turnos con los filtros aplicados'
                            : 'La cola está vacía en este momento'
                        }
                    </p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Turno
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Ciudadano
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Estado
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Tiempo de Espera
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Prioridad
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {turnosFiltrados.map((turno, index) => (
                                <tr key={turno.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="font-mono text-lg font-bold text-slate-900">
                                                {turno.codigo}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-slate-900">
                                                {mostrarNombreCiudadano(turno)}
                                            </div>
                                            <div className="text-sm text-slate-500">
                                                DNI: {mostrarDniCiudadano(turno)}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${turno.estadoColor}`}>
                                            {turno.estadoTexto}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                        {getTiempoEspera(turno)}
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
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="relative">
                                            <button
                                                onClick={() => setMostrarAcciones(mostrarAcciones === turno.id ? null : turno.id)}
                                                className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100"
                                            >
                                                <MoreVert className="h-5 w-5" />
                                            </button>

                                            {mostrarAcciones === turno.id && (
                                                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-lg shadow-lg z-10">
                                                    <div className="py-2">
                                                        {turno.puedeSerLlamado && (
                                                            <button
                                                                onClick={() => handleAccion('llamar', turno)}
                                                                className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                                                            >
                                                                <Phone className="h-4 w-4 mr-3 text-slate-600" />
                                                                Llamar Turno
                                                            </button>
                                                        )}
                                                        {turno.puedeIniciarAtencion && (
                                                            <button
                                                                onClick={() => handleAccion('iniciar', turno)}
                                                                className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                                                            >
                                                                <PlayArrow className="h-4 w-4 mr-3 text-green-600" />
                                                                Iniciar Atención
                                                            </button>
                                                        )}
                                                        {turno.puedeSerFinalizado && (
                                                            <button
                                                                onClick={() => abrirModalObservaciones('finalizar', turno)}
                                                                className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                                                            >
                                                                <Stop className="h-4 w-4 mr-3 text-gray-600" />
                                                                Finalizar Atención
                                                            </button>
                                                        )}
                                                        {turno.puedeSerRedirigido && (
                                                            <>
                                                                <button
                                                                    onClick={() => abrirModalRedirigir(turno)}
                                                                    className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                                                                >
                                                                    <Redo className="h-4 w-4 mr-3 text-purple-600" />
                                                                    Redirigir Turno
                                                                </button>
                                                                <button
                                                                    onClick={() => abrirModalObservaciones('ausente', turno)}
                                                                    className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                                                                >
                                                                    <PersonOff className="h-4 w-4 mr-3 text-red-600" />
                                                                    Marcar Ausente
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );

    // Modal para observaciones
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
                        <p className="text-sm text-slate-600 mt-1">
                            {mostrarNombreCiudadano(turno)}
                        </p>
                    </div>

                    <div className="px-6 py-4">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Observaciones {accion === 'ausente' ? '(requeridas)' : '(opcionales)'}
                        </label>
                        <textarea
                            value={observaciones}
                            onChange={(e) => setObservaciones(e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                            placeholder={accion === 'ausente' ? 'Motivo de la ausencia...' : 'Observaciones adicionales...'}
                        />
                    </div>

                    <div className="px-6 py-4 border-t border-slate-200 flex justify-end space-x-3">
                        <button
                            onClick={() => setModalObservaciones({ abierto: false, accion: '', turno: null })}
                            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={() => handleAccion(accion, turno, { observaciones })}
                            disabled={accion === 'ausente' && !observaciones.trim()}
                            className="px-4 py-2 text-sm font-medium text-white bg-slate-600 border border-transparent rounded-md hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {tituloAccion[accion]}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // Modal para redirigir turno
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
                        <p className="text-sm text-slate-600 mt-1">
                            {mostrarNombreCiudadano(turno)}
                        </p>
                    </div>

                    <div className="px-6 py-4 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Nuevo Sector *
                            </label>
                            <select
                                value={nuevoSectorId}
                                onChange={(e) => setNuevoSectorId(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500"
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
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500"
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
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500"
                                placeholder="Información adicional..."
                            />
                        </div>
                    </div>

                    <div className="px-6 py-4 border-t border-slate-200 flex justify-end space-x-3">
                        <button
                            onClick={() => setModalRedirigir({ abierto: false, turno: null })}
                            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={() => handleAccion('redirigir', turno, { nuevoSectorId: parseInt(nuevoSectorId), motivo, observaciones })}
                            disabled={!nuevoSectorId || !motivo.trim()}
                            className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
            {/* Filtros */}
            {renderFiltros()}

            {/* Próximo turno */}
            {renderProximoTurno()}

            {/* Tabla de turnos */}
            {renderTablaTurnos()}

            {/* Modales */}
            {renderModalObservaciones()}
            {renderModalRedirigir()}
        </div>
    );
};

export default ColaEsperaView;