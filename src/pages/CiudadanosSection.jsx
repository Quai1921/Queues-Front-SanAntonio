import React, { useState } from 'react';
import {
    PersonAdd,
    Search,
    FilterList,
    PriorityHigh,
    Person,
    Clear,
    Groups,
    Warning,
    Schedule,
    Badge,
    ViewList,
    ViewModule
} from '@mui/icons-material';
import useCiudadano from '../hooks/useCiudadano';
import CrearCiudadanoModal from '../components/CrearCiudadanoModal';
import EstablecerPrioridadModal from '../components/EstablecerPrioridadModal';
import CiudadanoTabla from '../components/CiudadanoTabla';

/**
 * Sección principal para la gestión de ciudadanos
 * Usa el hook personalizado useCiudadano para centralizar la lógica
 */
const CiudadanosSection = () => {
    // Hook personalizado que maneja toda la lógica de ciudadanos
    const {
        // Estados
        ciudadanosFiltrados,
        ciudadanoSeleccionado,
        busqueda,
        filtroActivo,
        loading,
        loadingOperacion,
        estadisticas,
        notificacion,

        // Setters
        setBusqueda,
        setFiltroActivo,
        setNotificacion,

        // Operaciones
        crearCiudadano,
        actualizarCiudadano,
        establecerPrioridad,
        limpiarFiltros,
        seleccionarCiudadano,
        limpiarSeleccion
    } = useCiudadano();

    // Estados locales para modales y vista
    const [modalCrearAbierto, setModalCrearAbierto] = useState(false);
    const [modalPrioridadAbierto, setModalPrioridadAbierto] = useState(false);
    const [modoEdicion, setModoEdicion] = useState('crear');
    const [vistaTabla, setVistaTabla] = useState(true);

    /**
     * Maneja la creación de un nuevo ciudadano
     */
    const handleCrearCiudadano = async (datosCiudadano) => {
        try {
            await crearCiudadano(datosCiudadano);
            setModalCrearAbierto(false);
        } catch (error) {
            // El error ya se maneja en el hook
        }
    };

    /**
     * Maneja la edición de un ciudadano
     */
    const handleEditarCiudadano = (ciudadano) => {
        seleccionarCiudadano(ciudadano);
        setModoEdicion('editar');
        setModalCrearAbierto(true);
    };

    /**
     * Maneja la actualización de un ciudadano
     */
    const handleActualizarCiudadano = async (datosActualizados) => {
        try {
            await actualizarCiudadano(ciudadanoSeleccionado.dni, datosActualizados);
            cerrarModales();
        } catch (error) {
            // El error ya se maneja en el hook
        }
    };

    /**
     * Abre modal para cambiar prioridad
     */
    const handleCambiarPrioridad = (ciudadano) => {
        seleccionarCiudadano(ciudadano);
        setModalPrioridadAbierto(true);
    };

    /**
     * Maneja el cambio de prioridad
     */
    const handleEstablecerPrioridad = async (esPrioritario, motivo) => {
        try {
            await establecerPrioridad(ciudadanoSeleccionado.dni, esPrioritario, motivo);
            cerrarModales();
        } catch (error) {
            // El error ya se maneja en el hook
        }
    };

    /**
     * Maneja ver historial de turnos
     */
    const handleVerHistorial = (ciudadano) => {
        console.log('Ver historial de:', ciudadano);
        // TODO: Implementar modal de historial
    };

    /**
     * Cierra modales y limpia selección
     */
    const cerrarModales = () => {
        setModalCrearAbierto(false);
        setModalPrioridadAbierto(false);
        limpiarSeleccion();
        setModoEdicion('crear');
    };

    // Opciones de filtro
    const opcionesFiltro = [
        { valor: '', etiqueta: 'Todos los ciudadanos' },
        { valor: 'prioritarios', etiqueta: 'Solo prioritarios' },
        { valor: 'normales', etiqueta: 'Solo normales' },
        { valor: 'con_turnos', etiqueta: 'Con turnos pendientes' }
    ];

    return (
        <div>
            {/* Notificación */}
            {notificacion && notificacion.visible && (
                <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[60] px-4 py-6 rounded-lg shadow-lg border transition-all duration-300 ${notificacion.tipo === 'success'
                        ? 'bg-green-50 border-green-200 text-green-800'
                        : notificacion.tipo === 'error'
                            ? 'bg-red-50 border-red-200 text-red-800'
                            : notificacion.tipo === 'info'
                                ? 'bg-blue-50 border-blue-200 text-blue-800'
                                : 'bg-gray-50 border-gray-200 text-gray-800'
                    }`}>
                    <div className="flex items-center">
                        <span className="font-medium">{notificacion.mensaje}</span>
                        <button
                            onClick={() => setNotificacion({ ...notificacion, visible: false })}
                            className="ml-3 text-sm opacity-70 hover:opacity-100"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div>
                    <h1 className="text-lg font-bold text-slate-900">Gestión de Ciudadanos</h1>
                    <p className="text-slate-600 mt-1 text-sm">
                        Administre la información de los ciudadanos registrados en el sistema
                    </p>
                </div>

                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => setModalCrearAbierto(true)}
                        className="flex items-center px-4 py-2 bg-[#224666] text-white rounded-lg hover:bg-[#2c3e50] transition-colors"
                    >
                        <PersonAdd className="h-5 w-5 mr-2" />
                        Nuevo Ciudadano
                    </button>
                </div>
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-2">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex items-center">
                        <div className="p-2 bg-slate-100 rounded-lg">
                            <Groups className="h-6 w-6 text-slate-600" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-slate-600">Total</p>
                            <p className="text-2xl font-bold text-slate-900">{estadisticas.total}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex items-center">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <PriorityHigh className="h-6 w-6 text-red-600" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-slate-600">Prioritarios</p>
                            <p className="text-2xl font-bold text-slate-900">{estadisticas.prioritarios}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex items-center">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <Warning className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-slate-600">Con Turnos</p>
                            <p className="text-2xl font-bold text-slate-900">{estadisticas.conTurnos}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Schedule className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-slate-600">Atendidos Hoy</p>
                            <p className="text-2xl font-bold text-slate-900">{estadisticas.atendidosHoy || 0}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Controles de búsqueda y filtros */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-4">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
                    {/* Búsqueda */}
                    <div className="flex-1 max-w-md">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Buscar por nombre, apellido o DNI..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg"
                            />
                        </div>
                    </div>

                    {/* Filtros */}
                    <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                            <FilterList className="h-5 w-5 text-slate-600" />
                            <select
                                value={filtroActivo}
                                onChange={(e) => setFiltroActivo(e.target.value)}
                                className="border border-slate-300 rounded-lg px-3 py-2"
                            >
                                {opcionesFiltro.map((opcion) => (
                                    <option key={opcion.valor} value={opcion.valor}>
                                        {opcion.etiqueta}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {(busqueda || filtroActivo) && (
                            <button
                                onClick={limpiarFiltros}
                                className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                Limpiar
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Contenido principal */}
            {loading ? (
                <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#224666]"></div>
                    <p className="mt-2 text-slate-600">Cargando ciudadanos...</p>
                </div>
            ) : ciudadanosFiltrados.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12">
                    <div className="text-center">
                        <Person className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                        <h3 className="text-lg font-medium text-slate-900 mb-2">
                            {estadisticas.total === 0
                                ? 'No hay ciudadanos registrados'
                                : 'No se encontraron ciudadanos'}
                        </h3>
                        <p className="text-slate-500 mb-6">
                            {estadisticas.total === 0
                                ? 'Comience agregando el primer ciudadano al sistema'
                                : 'Intente con otros términos de búsqueda o cambie los filtros'}
                        </p>
                        {estadisticas.total === 0 && (
                            <button
                                onClick={() => setModalCrearAbierto(true)}
                                className="inline-flex items-center px-4 py-2 bg-[#224666] text-white rounded-lg hover:bg-[#2c3e50] transition-colors"
                            >
                                <PersonAdd className="h-5 w-5 mr-2" />
                                Crear Primer Ciudadano
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                <CiudadanoTabla
                    ciudadanos={ciudadanosFiltrados}
                    onEditar={handleEditarCiudadano}
                    onCambiarPrioridad={handleCambiarPrioridad}
                    onVerHistorial={handleVerHistorial}
                    loading={loading}
                />
            )}

            {/* Modal Crear/Editar Ciudadano */}
            {modalCrearAbierto && (
                <CrearCiudadanoModal
                    isOpen={modalCrearAbierto}
                    onClose={cerrarModales}
                    onSubmit={modoEdicion === 'crear' ? handleCrearCiudadano : handleActualizarCiudadano}
                    ciudadano={modoEdicion === 'editar' ? ciudadanoSeleccionado : null}
                    modo={modoEdicion}
                    loading={loadingOperacion === 'crear' || loadingOperacion === ciudadanoSeleccionado?.dni}
                />
            )}

            {/* Modal Establecer Prioridad */}
            {modalPrioridadAbierto && ciudadanoSeleccionado && (
                <EstablecerPrioridadModal
                    isOpen={modalPrioridadAbierto}
                    onClose={cerrarModales}
                    onSubmit={handleEstablecerPrioridad}
                    ciudadano={ciudadanoSeleccionado}
                    loading={loadingOperacion === ciudadanoSeleccionado.dni}
                />
            )}
        </div>
    );
};

export default CiudadanosSection;