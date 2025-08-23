import React, { useState } from 'react';
import { useSectores } from '../hooks/useSectores';
import {
    Business,
    Add,
    Edit,
    Delete,
    Search,
    FilterList,
    Refresh,
    CheckCircle,
    Cancel,
    Person,
    Public,
    Schedule,
    Visibility,
    VisibilityOff
} from '@mui/icons-material';
import CrearSectorModal from './CrearSectorModal';
import EditarSectorModal from './EditarSectorModal';

/**
 * Componente principal para la gestión de sectores en AdminPanel
 */
const SectoresSection = () => {
    const {
        sectores,
        loading,
        error,
        isOperating,
        operacionEnCurso,
        estadisticas,
        cargarSectores,
        activarSector,
        desactivarSector,
        crearSector,
        actualizarSector,
        filtrarSectores,
        limpiarError
    } = useSectores({
        onSuccess: (sector, operacion) => {
            console.log(`✅ ${operacion} completado:`, sector);
            // Aquí podrías mostrar notificaciones de éxito
        },
        onError: (error, operacion) => {
            console.error(`❌ Error en ${operacion}:`, error);
            // Aquí podrías mostrar notificaciones de error
        }
    });


    // Estados locales para filtros y modales
    const [filtros, setFiltros] = useState({
        busqueda: '',
        tipo: 'TODOS',
        activo: null
    });

    const [mostrarFiltros, setMostrarFiltros] = useState(false);
    const [sectorSeleccionado, setSectorSeleccionado] = useState(null);
    const [modalCrearAbierto, setModalCrearAbierto] = useState(false);
    const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
    const [loadingCrear, setLoadingCrear] = useState(false);
    const [loadingEditar, setLoadingEditar] = useState(false);
    const [notificacion, setNotificacion] = useState(null);

    const mostrarNotificacion = (mensaje, tipo = 'success') => {
        setNotificacion({ mensaje, tipo });
        setTimeout(() => setNotificacion(null), 5000);
    };

    const handleCrearSector = async (sectorData) => {
        try {
            setLoadingCrear(true);
            await crearSector(sectorData);
            setModalCrearAbierto(false);
            mostrarNotificacion('Sector creado correctamente', 'success');
        } catch (error) {
            mostrarNotificacion('Error al crear el sector: ' + error.message, 'error');
        } finally {
            setLoadingCrear(false);
        }
    };

    const abrirModalEditar = (sector) => {
        setSectorSeleccionado(sector);
        setModalEditarAbierto(true);
    };

    const handleEditarSector = async (codigo, sectorData) => {
        try {
            setLoadingEditar(true);
            await actualizarSector(codigo, sectorData);
            setModalEditarAbierto(false);
            setSectorSeleccionado(null);
            mostrarNotificacion('✅ Sector actualizado correctamente', 'success');
        } catch (error) {
            mostrarNotificacion('❌ Error al actualizar el sector: ' + error.message, 'error');
        } finally {
            setLoadingEditar(false);
        }
    };


    // Aplicar filtros a los sectores
    const sectoresFiltrados = React.useMemo(() => {
        const { busqueda, tipo, activo } = filtros;

        return sectores.filter(sector => {
            if (busqueda && busqueda.trim()) {
                const texto = busqueda.toLowerCase();
                const coincide =
                    (sector.sector?.nombre || sector.nombre)?.toLowerCase().includes(texto) ||
                    (sector.sector?.codigo || sector.codigo)?.toLowerCase().includes(texto) ||
                    (sector.sector?.descripcion && sector.sector?.descripcion.toLowerCase().includes(texto));

                if (!coincide) return false;
            }

            if (tipo && tipo !== 'TODOS') {
                if (sector.sector?.tipoSector !== tipo) return false;
            }

            if (activo !== undefined && activo !== null) {
                if (sector.sector?.activo !== activo) return false;
            }

            return true;
        });
    }, [sectores, filtros]);

    /**
     * Manejar cambios en los filtros
     */
    const handleFiltroChange = (campo, valor) => {
        setFiltros(prev => ({
            ...prev,
            [campo]: valor
        }));
    };

    /**
     * Limpiar todos los filtros
     */
    const limpiarFiltros = () => {
        setFiltros({
            busqueda: '',
            tipo: 'TODOS',
            activo: null
        });
    };

    /**
     * Manejar activar/desactivar sector
     */
    const handleToggleActivo = async (sector) => {
        try {
            if (sector.sector?.activo) {
                await desactivarSector(sector.sector.id);
            } else {
                await activarSector(sector.sector.id);
            }
        } catch (error) {
        }
    };

    /**
     * Abrir modal de edición
     */
    const handleEditar = (sector) => {
        setSectorSeleccionado(sector);
        setModalEditarAbierto(true);
    };






    /**
     * Render de la tabla de sectores
     */
    const renderTablaSectores = () => (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Sector
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Tipo
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Estado
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Responsable
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Configuración
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {sectoresFiltrados.map((sector) => (
                            <tr key={sector.sector?.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div
                                            className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold"
                                            style={{ backgroundColor: sector.sector?.color || '#6B7280' }}
                                        >
                                            {sector.sector?.codigo}
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-slate-900">
                                                {sector.sector?.codigo}
                                            </div>
                                            <div className="text-sm text-slate-500">
                                                {sector.sector?.nombre}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        {sector.sector?.tipoSector === 'ESPECIAL' ? (
                                            <Schedule className="h-4 w-4 text-slate-600 mr-2" />
                                        ) : (
                                            <Public className="h-4 w-4 text-slate-600 mr-2" />
                                        )}
                                        <span className="text-sm text-slate-900">
                                            {sector.sector?.tipoSector === 'ESPECIAL' ? 'Especial' : sector.sector?.tipoSector === 'NORMAL' ? 'Normal' : 'Público'}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span
                                        className={`w-16 inline-flex justify-center px-2 py-1 text-xs font-semibold rounded-full ${sector.sector?.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                                    >
                                        {sector.sector?.activo ? 'Activo' : 'Inactivo'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <Person className="h-4 w-4 text-slate-400 mr-2" />
                                        <span className="text-sm text-slate-900">
                                            {sector.sector?.responsable?.nombreCompleto || 'Sin asignar'}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-slate-900">
                                        <div>Cap: {sector.sector?.capacidadMaxima}</div>
                                        <div className="text-slate-500">{sector.sector?.tiempoEstimadoAtencion} min.</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex items-center justify-end space-x-2">
                                        <button
                                            onClick={() => abrirModalEditar(sector)}
                                            className="p-1 text-slate-600 transition-colors"
                                            title="Editar"
                                        >
                                            <div className='w-20 bg-blue-100 hover:bg-blue-200 py-1 text-xs font-semibold rounded-full transition-all duration-300'>
                                                Editar
                                            </div>
                                        </button>

                                        <button
                                            onClick={() => handleToggleActivo(sector)}
                                            disabled={isOperating && operacionEnCurso}
                                            className={`p-1 rounded transition-all duration-300 disabled:opacity-50 ${sector.sector?.activo ? 'text-red-600' : 'text-green-600 hover:text-green-900'}`}
                                            title={sector.sector?.activo ? 'Desactivar' : 'Activar'}
                                        >
                                            {sector.sector?.activo ? (
                                                <div className='w-20 bg-red-100 hover:bg-red-200 py-1 text-xs font-semibold rounded-full transition-all duration-300'>
                                                    Desactivar
                                                </div>
                                            ) : (
                                                <div className='w-20 bg-green-100 hover:bg-green-200 py-1 text-xs font-semibold rounded-full transition-all duration-300'>
                                                    Activar
                                                </div>
                                            )}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Estado vacío */}
            {sectoresFiltrados.length === 0 && !loading && (
                <div className="text-center py-12">
                    <Business className="mx-auto h-12 w-12 text-slate-400" />
                    <h3 className="mt-4 text-lg font-medium text-slate-900">
                        {sectores.length === 0 ? 'No hay sectores' : 'No se encontraron sectores'}
                    </h3>
                    <p className="mt-2 text-slate-600">
                        {sectores.length === 0
                            ? 'Comienza creando tu primer sector municipal'
                            : 'Intenta ajustar los filtros de búsqueda'
                        }
                    </p>
                </div>
            )}
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header con estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                    <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Business className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-slate-600">Total</p>
                            <p className="text-2xl font-semibold text-slate-900">{estadisticas.total}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                    <div className="flex items-center">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-slate-600">Activos</p>
                            <p className="text-2xl font-semibold text-slate-900">{estadisticas.activos}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                    <div className="flex items-center">
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                            <Schedule className="h-6 w-6 text-orange-600" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-slate-600">Especiales</p>
                            <p className="text-2xl font-semibold text-slate-900">{estadisticas.especiales}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                    <div className="flex items-center">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Person className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-slate-600">Con Responsable</p>
                            <p className="text-2xl font-semibold text-slate-900">{estadisticas.conResponsable}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Notificación */}
            {notificacion && (
                <div className={`fixed top-4 right-4 z-[60] p-4 rounded-lg shadow-lg border transition-all duration-300 ${notificacion.tipo === 'success'
                        ? 'bg-green-50 border-green-200 text-green-800'
                        : 'bg-red-50 border-red-200 text-red-800'
                    }`}>
                    <div className="flex items-center">
                        <span className="font-medium">{notificacion.mensaje}</span>
                        <button
                            onClick={() => setNotificacion(null)}
                            className="ml-3 text-sm opacity-70 hover:opacity-100"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}

            {/* Header con acciones */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-slate-900">Sectores de Atención</h3>
                    <p className="text-slate-600 text-sm">Administra sectores y responsables</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={cargarSectores}
                        disabled={loading}
                        className="flex items-center px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                    >
                        <Refresh className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        Actualizar
                    </button>
                    <button
                        onClick={() => setModalCrearAbierto(true)}
                        className="flex items-center px-4 py-2 bg-[#224666] text-white rounded-lg hover:bg-[#2c3e50] transition-colors"
                    >
                        <Add className="mr-2 h-4 w-4" />
                        Agregar Sector
                    </button>
                </div>
            </div>

            {/* Filtros y búsqueda */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Búsqueda */}
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                            <input
                                type="text"
                                placeholder="Buscar por código, nombre o descripción..."
                                value={filtros.busqueda}
                                onChange={(e) => handleFiltroChange('busqueda', e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    {/* Botón de filtros */}
                    <button
                        onClick={() => setMostrarFiltros(!mostrarFiltros)}
                        className="flex items-center px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                        <FilterList className="mr-2 h-4 w-4" />
                        Filtros {Object.values(filtros).some(v => v && v !== 'TODOS') && (
                            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                Aplicados
                            </span>
                        )}
                    </button>
                </div>

                {/* Filtros expandidos */}
                {mostrarFiltros && (
                    <div className="mt-4 pt-4 border-t border-slate-200">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {/* Filtro por tipo */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Tipo de Sector
                                </label>
                                <select
                                    value={filtros.tipo}
                                    onChange={(e) => handleFiltroChange('tipo', e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="TODOS">Todos los tipos</option>
                                    <option value="NORMAL">Normal</option>
                                    <option value="ESPECIAL">Especial</option>
                                </select>
                            </div>

                            {/* Filtro por estado */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Estado
                                </label>
                                <select
                                    value={filtros.activo === null ? 'TODOS' : filtros.activo ? 'ACTIVO' : 'INACTIVO'}
                                    onChange={(e) => {
                                        const valor = e.target.value === 'TODOS' ? null : e.target.value === 'ACTIVO';
                                        handleFiltroChange('activo', valor);
                                    }}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="TODOS">Todos los estados</option>
                                    <option value="ACTIVO">Activos</option>
                                    <option value="INACTIVO">Inactivos</option>
                                </select>
                            </div>

                            {/* Acciones de filtros */}
                            <div className="flex items-end">
                                <button
                                    onClick={limpiarFiltros}
                                    className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    Limpiar Filtros
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Error Alert */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                        <Cancel className="h-5 w-5 text-red-400 mr-2" />
                        <div>
                            <h3 className="text-sm font-medium text-red-800">Error</h3>
                            <p className="text-sm text-red-700 mt-1">{error}</p>
                        </div>
                        <button
                            onClick={limpiarError}
                            className="ml-auto text-red-400 hover:text-red-600"
                        >
                            <Cancel className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Loading */}
            {loading && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-slate-600">Cargando sectores...</p>
                    </div>
                </div>
            )}

            {/* Tabla de sectores */}
            {!loading && renderTablaSectores()}

            {/* Resumen de resultados */}
            {sectoresFiltrados.length > 0 && (
                <div className="text-sm text-slate-600 text-center">
                    Mostrando {sectoresFiltrados.length} de {sectores.length} sectores
                </div>
            )}


            {/* Modales */}
            <CrearSectorModal
                isOpen={modalCrearAbierto}
                onClose={() => setModalCrearAbierto(false)}
                onSubmit={handleCrearSector}
                loading={loadingCrear}
            />

            <EditarSectorModal
                isOpen={modalEditarAbierto}
                onClose={() => setModalEditarAbierto(false)}
                onSubmit={handleEditarSector}
                sector={sectorSeleccionado}
                loading={loadingEditar}
            />
        </div>
    );
};

export default SectoresSection;