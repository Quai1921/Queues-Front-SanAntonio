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
    Badge
} from '@mui/icons-material';
import useCiudadano from '../hooks/useCiudadano'; // Usar el hook personalizado
import CrearCiudadanoModal from '../components/CrearCiudadanoModal';
import EstablecerPrioridadModal from '../components/EstablecerPrioridadModal';
import CiudadanoCard from '../components/CiudadanoCard';

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

        // Operaciones
        crearCiudadano,
        actualizarCiudadano,
        establecerPrioridad,
        limpiarFiltros,
        seleccionarCiudadano,
        limpiarSeleccion
    } = useCiudadano();

    console.log(ciudadanosFiltrados)

    // Estados locales para modales
    const [modalCrearAbierto, setModalCrearAbierto] = useState(false);
    const [modalPrioridadAbierto, setModalPrioridadAbierto] = useState(false);
    const [modoEdicion, setModoEdicion] = useState('crear');

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
     * Maneja ver historial de turnos (placeholder)
     */
    const handleVerHistorial = (ciudadano) => {
        console.log('Ver historial de:', ciudadano);
        // TODO: Implementar modal de historial
        // mostrarNotificacion('Funcionalidad de historial próximamente', 'info');
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

    // Configuración de filtros
    const filtros = [
        { id: 'todos', nombre: 'Todos', icono: Groups, color: 'bg-slate-100 text-slate-700' },
        { id: 'prioritarios', nombre: 'Prioritarios', icono: PriorityHigh, color: 'bg-red-100 text-red-700' },
        { id: 'conTurno', nombre: 'Con turno', icono: Schedule, color: 'bg-yellow-100 text-yellow-700' },
        { id: 'sinTurnos', nombre: 'Sin turnos', icono: Person, color: 'bg-blue-100 text-blue-700' }
    ];

    return (
        <div className="p-6 space-y-6">
            {/* Notificación */}
            {notificacion.visible && (
                <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg ${notificacion.tipo === 'error' ? 'bg-red-500 text-white' :
                        notificacion.tipo === 'info' ? 'bg-blue-500 text-white' :
                            'bg-green-500 text-white'
                    }`}>
                    {notificacion.mensaje}
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Gestión de Ciudadanos</h1>
                    <p className="text-slate-600 mt-1">
                        Administre la información de los ciudadanos registrados en el sistema
                    </p>
                </div>

                <button
                    onClick={() => setModalCrearAbierto(true)}
                    className="flex items-center px-4 py-2 bg-[#224666] text-white rounded-lg hover:bg-[#2c3e50] transition-colors"
                >
                    <PersonAdd className="h-5 w-5 mr-2" />
                    Nuevo Ciudadano
                </button>
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                            <p className="text-2xl font-bold text-red-600">{estadisticas.prioritarios}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex items-center">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <Warning className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-slate-600">Con turno</p>
                            <p className="text-2xl font-bold text-yellow-600">{estadisticas.conTurnoPendiente}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Badge className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-slate-600">Sin turnos</p>
                            <p className="text-2xl font-bold text-blue-600">{estadisticas.sinTurnos}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Barra de búsqueda y filtros */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                    {/* Búsqueda */}
                    <div className="flex-1 max-w-md">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Buscar por DNI, nombre o teléfono..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            {busqueda && (
                                <button
                                    onClick={() => setBusqueda('')}
                                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                                >
                                    <Clear className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Filtros */}
                    <div className="flex items-center space-x-2">
                        <FilterList className="h-5 w-5 text-slate-600" />
                        <div className="flex space-x-2">
                            {filtros.map(filtro => {
                                const IconoFiltro = filtro.icono;
                                const estaActivo = filtroActivo === filtro.id;

                                return (
                                    <button
                                        key={filtro.id}
                                        onClick={() => setFiltroActivo(filtro.id)}
                                        className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${estaActivo ? filtro.color : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                            }`}
                                    >
                                        <IconoFiltro className="h-4 w-4 mr-1" />
                                        {filtro.nombre}
                                    </button>
                                );
                            })}
                        </div>

                        {(busqueda || filtroActivo !== 'todos') && (
                            <button
                                onClick={limpiarFiltros}
                                className="px-3 py-2 text-sm text-slate-500 hover:text-slate-700 underline"
                            >
                                Limpiar
                            </button>
                        )}
                    </div>
                </div>

                {/* Contador de resultados */}
                <div className="mt-3 text-sm text-slate-600">
                    Mostrando {ciudadanosFiltrados.length} ciudadanos
                </div>
            </div>

            {/* Lista de ciudadanos */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : ciudadanosFiltrados.length === 0 ? (
                <div className="text-center py-12">
                    <Person className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">
                        {estadisticas.total === 0 ? 'No hay ciudadanos registrados' : 'No se encontraron ciudadanos'}
                    </h3>
                    <p className="text-slate-600 mb-6">
                        {estadisticas.total === 0
                            ? 'Comience agregando el primer ciudadano al sistema'
                            : 'Intente con otros términos de búsqueda o cambie los filtros'
                        }
                    </p>
                    {estadisticas.total === 0 && (
                        <button
                            onClick={() => setModalCrearAbierto(true)}
                            className="flex items-center px-4 py-2 bg-[#224666] text-white rounded-lg hover:bg-[#2c3e50] transition-colors mx-auto"
                        >
                            <PersonAdd className="h-5 w-5 mr-2" />
                            Crear Primer Ciudadano
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {ciudadanosFiltrados.map(ciudadano => (
                        <CiudadanoCard
                            key={ciudadano.id}
                            ciudadano={ciudadano}
                            onEditar={handleEditarCiudadano}
                            onCambiarPrioridad={handleCambiarPrioridad}
                            onVerHistorial={handleVerHistorial}
                            loading={loadingOperacion}
                        />
                    ))}
                </div>
            )}

            {/* Modal Crear/Editar Ciudadano */}
            <CrearCiudadanoModal
                isOpen={modalCrearAbierto}
                onClose={cerrarModales}
                onSubmit={modoEdicion === 'editar' ? handleActualizarCiudadano : handleCrearCiudadano}
                ciudadano={modoEdicion === 'editar' ? ciudadanoSeleccionado : null}
                modo={modoEdicion}
                loading={loadingOperacion}
            />

            {/* Modal Establecer Prioridad */}
            <EstablecerPrioridadModal
                isOpen={modalPrioridadAbierto}
                onClose={cerrarModales}
                onSubmit={handleEstablecerPrioridad}
                ciudadano={ciudadanoSeleccionado}
                loading={loadingOperacion}
            />
        </div>
    );
};

export default CiudadanosSection;