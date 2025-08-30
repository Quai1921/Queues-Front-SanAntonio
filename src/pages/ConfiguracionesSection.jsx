import React, { useState } from 'react';
import { useConfiguraciones } from '../hooks/useConfiguraciones';
import {
    Settings,
    Add,
    Search,
    FilterList,
    Refresh,
    EditDocument as Edit,
    VolumeUp,
    VolumeOff,
    Palette,
    CheckCircle,
    RadioButtonUnchecked,
    Timer,
    Clear,
    PlayArrow
} from '@mui/icons-material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CrearConfiguracionModal from '../components/CrearConfiguracionModal';
import EditarConfiguracionModal from '../components/EditarConfiguracionModal';
import ConfigurarSonidoModal from '../components/ConfigurarSonidoModal';
import ConfigurarAparienciaModal from '../components/ConfigurarAparienciaModal';
import ConfirmarAccionModal from '../components/ConfirmarAccionModal';

/**
 * Componente principal para la gestión de configuraciones de pantalla en AdminPanel
 */
const ConfiguracionesSection = () => {
    const {
        configuraciones,
        loading,
        error,
        isOperating,
        estadisticas,
        cargarConfiguraciones,
        crearConfiguracion,
        actualizarConfiguracion,
        activarConfiguracion,
        configurarSonido,
        configurarApariencia,
        filtrarConfiguraciones,
        limpiarError
    } = useConfiguraciones({
        onSuccess: (configuracion, operacion) => {
            const mensajes = {
                crear: 'Configuración creada exitosamente',
                actualizar: 'Configuración actualizada exitosamente',
                activar: 'Configuración activada exitosamente',
                configurar_sonido: 'Sonido configurado exitosamente',
                configurar_apariencia: 'Apariencia configurada exitosamente'
            };
            mostrarNotificacion(mensajes[operacion] || 'Operación completada');
        },
        onError: (error, operacion) => {
            mostrarNotificacion(error.message || 'Error en la operación', 'error');
        }
    });

    // Estados locales para filtros y modales
    const [filtros, setFiltros] = useState({
        busqueda: '',
        estado: 'TODOS',
        sonido: 'TODOS'
    });

    const [mostrarFiltros, setMostrarFiltros] = useState(false);
    const [configuracionSeleccionada, setConfiguracionSeleccionada] = useState(null);
    const [modalCrearAbierto, setModalCrearAbierto] = useState(false);
    const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
    const [modalSonidoAbierto, setModalSonidoAbierto] = useState(false);
    const [modalAparienciaAbierto, setModalAparienciaAbierto] = useState(false);

    const [loadingCrear, setLoadingCrear] = useState(false);
    const [loadingEditar, setLoadingEditar] = useState(false);
    const [loadingSonido, setLoadingSonido] = useState(false);
    const [loadingApariencia, setLoadingApariencia] = useState(false);

    const [modalConfirmarAbierto, setModalConfirmarAbierto] = useState(false);
    const [configuracionParaActivar, setConfiguracionParaActivar] = useState(null);
    const [loadingActivar, setLoadingActivar] = useState(false);

    const [notificacion, setNotificacion] = useState(null);

    const mostrarNotificacion = (mensaje, tipo = 'success') => {
        setNotificacion({ mensaje, tipo });
        setTimeout(() => setNotificacion(null), 5000);
    };

    // Aplicar filtros
    const configuracionesFiltradas = filtrarConfiguraciones(filtros);

    // console.log(configuracionesFiltradas.map(c => c.id));

    const handleCrearConfiguracion = async (configuracionData) => {
        try {
            setLoadingCrear(true);
            await crearConfiguracion(configuracionData);
        } finally {
            setLoadingCrear(false);
        }
    };

    const handleEditarConfiguracion = async (id, configuracionData) => {
        try {
            setLoadingEditar(true);
            await actualizarConfiguracion(id, configuracionData);
        } finally {
            setLoadingEditar(false);
        }
    };

    // const handleActivarConfiguracion = async (configuracion) => {
    //     try {
    //         await activarConfiguracion(configuracion.id);
    //     } catch (error) {
    //         console.error('Error activando configuración:', error);
    //     }
    // };
    const handleActivarConfiguracion = async (configuracion) => {
        setConfiguracionParaActivar(configuracion);
        setModalConfirmarAbierto(true);
    };

    const handleConfirmarActivacion = async () => {
        try {
            setLoadingActivar(true);
            await activarConfiguracion(configuracionParaActivar.id);
            setModalConfirmarAbierto(false);
            setConfiguracionParaActivar(null);
        } catch (error) {
            console.error('Error activando configuración:', error);
        } finally {
            setLoadingActivar(false);
        }
    };

    const handleCancelarActivacion = () => {
        setModalConfirmarAbierto(false);
        setConfiguracionParaActivar(null);
    };

    const handleConfigurarSonido = async (id, configuracionSonido) => {
        try {
            setLoadingSonido(true);
            console.log('=== DEBUG SONIDO ===');
            console.log('ID:', id);
            console.log('Configuración sonido:', configuracionSonido);

            await configurarSonido(id, configuracionSonido);

            // Mostrar éxito
            mostrarNotificacion('Sonido configurado correctamente', 'success');
        } catch (error) {
            console.error('Error configurando sonido:', error);
            mostrarNotificacion(`Error configurando sonido: ${error.message}`, 'error');
        } finally {
            setLoadingSonido(false);
        }
    };

    const handleConfigurarApariencia = async (id, configuracionApariencia) => {
        try {
            setLoadingApariencia(true);
            console.log('=== DEBUG APARIENCIA ===');
            console.log('ID:', id);
            console.log('Configuración apariencia:', configuracionApariencia);

            await configurarApariencia(id, configuracionApariencia);

            // Mostrar éxito
            mostrarNotificacion('Apariencia configurada correctamente', 'success');
        } catch (error) {
            console.error('Error configurando apariencia:', error);
            mostrarNotificacion(`Error configurando apariencia: ${error.message}`, 'error');
        } finally {
            setLoadingApariencia(false);
        }
    };

    const handleLimpiarFiltros = () => {
        setFiltros({
            busqueda: '',
            estado: 'TODOS',
            sonido: 'TODOS'
        });
    };

    const handleRefresh = () => {
        cargarConfiguraciones();
    };

    const handleFiltroChange = (key, value) => {
        setFiltros(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const renderEstadisticas = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center">
                    <div className="p-2 bg-slate-100 rounded-lg">
                        <Settings className="h-5 w-5 text-slate-600" />
                    </div>
                    <div className="ml-3">
                        <p className="text-sm font-medium text-slate-600">Total</p>
                        <p className="text-2xl font-semibold text-slate-900">{estadisticas.total}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="ml-3">
                        <p className="text-sm font-medium text-slate-600">Activa</p>
                        <p className="text-2xl font-semibold text-green-600">{estadisticas.activa}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center">
                    <div className="p-2 bg-slate-100 rounded-lg">
                        <RadioButtonUnchecked className="h-5 w-5 text-slate-600" />
                    </div>
                    <div className="ml-3">
                        <p className="text-sm font-medium text-slate-600">Inactivas</p>
                        <p className="text-2xl font-semibold text-slate-600">{estadisticas.inactivas}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <VolumeUp className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="ml-3">
                        <p className="text-sm font-medium text-slate-600">Con Sonido</p>
                        <p className="text-2xl font-semibold text-blue-600">{estadisticas.conSonido}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center">
                    <div className="p-2 bg-red-100 rounded-lg">
                        <VolumeOff className="h-5 w-5 text-red-600" />
                    </div>
                    <div className="ml-3">
                        <p className="text-sm font-medium text-slate-600">Sin Sonido</p>
                        <p className="text-2xl font-semibold text-red-600">{estadisticas.sinSonido}</p>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderControles = () => (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mt-4">
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                    {/* Búsqueda */}
                    <div className="relative">
                        <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar configuraciones..."
                            value={filtros.busqueda}
                            onChange={(e) => handleFiltroChange('busqueda', e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg"
                        />
                    </div>
                </div>

                {/* Filtros */}
                <button
                    onClick={() => setMostrarFiltros(!mostrarFiltros)}
                    className={`flex items-center px-4 py-2 border border-slate-300 rounded-lg transition-colors ${mostrarFiltros || filtros.estado !== 'TODOS' || filtros.sonido !== 'TODOS'
                        ? 'bg-[#224666] text-white border-[#224666]'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                        }`}
                >
                    <FilterList className="h-4 w-4 mr-1" />
                    Filtros
                </button>
            </div>

            {/* Panel de Filtros Expandible */}
            {mostrarFiltros && (
                <div className="mt-6 pt-6 border-t border-slate-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Estado</label>
                            <select
                                value={filtros.estado}
                                onChange={(e) => handleFiltroChange('estado', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                            >
                                <option value="TODOS">Todos los estados</option>
                                <option value="ACTIVA">Activa</option>
                                <option value="INACTIVA">Inactiva</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Sonido</label>
                            <select
                                value={filtros.sonido}
                                onChange={(e) => handleFiltroChange('sonido', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                            >
                                <option value="TODOS">Todos</option>
                                <option value="CON_SONIDO">Con sonido</option>
                                <option value="SIN_SONIDO">Sin sonido</option>
                            </select>
                        </div>

                        <div className="flex items-end">
                            <button
                                onClick={handleLimpiarFiltros}
                                className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                Limpiar Filtros
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    const renderTablaConfiguraciones = () => (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-slate-200 bg-slate-50">
                            <th className="text-left py-3 px-4 font-medium text-slate-900 w-[200px]">Configuración</th>
                            <th className="text-left py-3 px-4 font-medium text-slate-900 w-[225px]">Tiempos</th>
                            <th className="text-left py-3 px-4 font-medium text-slate-900">Estado</th>
                            <th className="text-left py-3 px-4 font-medium text-slate-900">Sonido</th>
                            <th className="text-left py-3 px-4 font-medium text-slate-900">Tema</th>
                            <th className="text-left py-3 px-4 font-medium text-slate-900 w-[150px]">Fecha</th>
                            <th className="text-center py-3 px-4 font-medium text-slate-900">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {configuracionesFiltradas.map((configuracion) => (
                            <tr key={configuracion.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors duration-300">
                                <td className="py-4 px-4">
                                    <div>
                                        <p className="font-medium text-slate-900">{configuracion.nombre}</p>
                                        {configuracion?.textoEncabezado && (
                                            <p className="text-sm text-slate-600 mt-1">{configuracion?.textoEncabezado}</p>
                                        )}
                                    </div>
                                </td>

                                <td className="py-4 px-4">
                                    <div className="flex items-center space-x-4 text-sm">
                                        <div className="flex items-center">
                                            <AccessTimeIcon className="h-4 w-4 text-slate-400 mr-1" />
                                            <span>Msg: {configuracion.tiempoMensaje}s</span>
                                        </div>
                                        <div className="flex items-center">
                                            <AccessTimeIcon className="h-4 w-4 text-slate-400 mr-1" />
                                            <span>Turno: {configuracion.tiempoTurno}s</span>
                                        </div>
                                    </div>
                                </td>

                                <td className="py-4 px-4">
                                    <button
                                        className={`inline-flex justify-center items-center px-2 py-1 rounded-full text-xs font-medium w-16 ${configuracion.activo
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-slate-100 text-slate-600'
                                            } disabled:opacity-50`}
                                    >
                                        {configuracion.estadoLabel}
                                    </button>
                                </td>
                                <td className="py-4 px-4">
                                    <button
                                        className={`inline-flex justify-center items-center px-2 py-1 w-24 rounded-full text-xs font-medium transition-colors duration-300 ${configuracion.sonidoActivo
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                            }`}
                                    >
                                        {configuracion.sonidoActivo ? 'Activado' : 'Desactivado'}
                                    </button>
                                </td>

                                <td className="py-4 px-4">
                                    <button
                                        className="inline-flex justify-center items-center px-2 py-1 rounded-full text-xs font-medium w-24 bg-slate-100 text-slate-800"
                                    >
                                        {configuracion.temaLabel}
                                    </button>
                                </td>

                                <td className="py-4 px-4">
                                    <div className="text-sm text-slate-600">
                                        <p>{configuracion.fechaCreacionFormateada}</p>
                                        {configuracion.fechaModificacionFormateada && (
                                            <p className="text-xs text-slate-500">
                                                Mod: {configuracion.fechaModificacionFormateada}
                                            </p>
                                        )}
                                    </div>
                                </td>

                                <td className="py-4 px-4">
                                    <div className="flex items-center justify-end space-x-2">
                                        {!configuracion.activo && (
                                            <button
                                                onClick={() => handleActivarConfiguracion(configuracion)}
                                                disabled={isOperating.activar}
                                                className="p-1 text-slate-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors duration-300 disabled:opacity-50"
                                                title="Activar configuración"
                                            >
                                                <PlayArrow className="h-4 w-4" />
                                            </button>
                                        )}

                                        <button
                                            onClick={() => {
                                                setConfiguracionSeleccionada(configuracion);
                                                setModalEditarAbierto(true);
                                            }}
                                            className="p-1 text-slate-600 hover:text-[#224666] hover:bg-slate-100 rounded transition-colors duration-300"
                                            title="Editar configuración"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </button>

                                        <button
                                            onClick={() => {
                                                setConfiguracionSeleccionada(configuracion);
                                                setModalSonidoAbierto(true);
                                            }}
                                            className="p-1 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors duration-300"
                                            title="Configurar sonido"
                                        >
                                            {configuracion.sonidoActivo ? (
                                                <VolumeUp className="h-4 w-4" />
                                            ) : (
                                                <VolumeOff className="h-4 w-4" />
                                            )}
                                        </button>

                                        <button
                                            onClick={() => {
                                                setConfiguracionSeleccionada(configuracion);
                                                setModalAparienciaAbierto(true);
                                            }}
                                            className="p-1 text-slate-600 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors duration-300"
                                            title="Configurar apariencia"
                                        >
                                            <Palette className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {configuracionesFiltradas.length === 0 && !loading && (
                    <div className="text-center py-12">
                        <Settings className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-900 mb-2">
                            {configuraciones.length === 0 ? 'No hay configuraciones' : 'No se encontraron configuraciones'}
                        </h3>
                        <p className="text-slate-600 mb-6">
                            {configuraciones.length === 0
                                ? 'Crea tu primera configuración de pantalla para comenzar.'
                                : 'Intenta ajustar los filtros para encontrar lo que buscas.'
                            }
                        </p>
                        {configuraciones.length === 0 && (
                            <button
                                onClick={() => setModalCrearAbierto(true)}
                                className="px-4 py-2 bg-[#224666] text-white rounded-lg hover:bg-[#2c3e50] transition-colors duration-300 flex items-center mx-auto"
                            >
                                <Add className="h-4 w-4 mr-2" />
                                Crear Primera Configuración
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="p-6">
            {/* Error */}
            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                    <div className="flex items-center justify-between">
                        <span className="font-medium">{error}</span>
                        <button
                            onClick={limpiarError}
                            className="text-red-600 hover:text-red-800"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}

            {/* Notificación */}
            {/* {notificacion && (
                <div className={`mb-6 px-4 py-3 rounded-lg border ${notificacion.tipo === 'success'
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
            )} */}
            {/* Notificación */}
            {notificacion && (
                <div className={`fixed top-4 left-1/2 -translate-x-1/2  z-[60] px-4 py-6 rounded-lg shadow-lg border transition-all duration-300 ${notificacion.tipo === 'success'
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

            {/* Estadísticas */}
            {renderEstadisticas()}

            {/* Controles */}
            <div className='flex justify-between items-center mb-6'>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <h2 className="text-lg font-semibold text-slate-900 flex items-center">
                        <Settings className="h-6 w-6 mr-2 text-[#224666]" />
                        Configuraciones de Pantalla
                    </h2>
                </div>

                <div className='flex justify-center items-center gap-4'>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleRefresh}
                            disabled={loading}
                            className="flex items-center px-4 py-2 bg-slate-50 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50"
                        >
                            <Refresh className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                            Actualizar
                        </button>
                    </div>

                    <div>
                        <button
                            onClick={() => setModalCrearAbierto(true)}
                            className="px-4 py-2 bg-[#224666] text-white rounded-lg hover:bg-[#2c3e50] transition-colors duration-300 flex items-center"
                        >
                            <Add className="h-4 w-4 mr-2" />
                            Nueva Configuración
                        </button>
                    </div>
                </div>
            </div>

            {/* Controles */}
            {renderControles()}

            {/* Loading */}
            {loading && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600 mx-auto"></div>
                        <p className="mt-4 text-slate-600">Cargando configuraciones...</p>
                    </div>
                </div>
            )}

            {/* Tabla de configuraciones */}
            {!loading && renderTablaConfiguraciones()}

            {/* Resumen de resultados */}
            {configuracionesFiltradas.length > 0 && (
                <div className="text-sm text-slate-600 text-center mt-4">
                    Mostrando {configuracionesFiltradas.length} de {configuraciones.length} configuraciones
                </div>
            )}

            {/* Modales */}
            <CrearConfiguracionModal
                isOpen={modalCrearAbierto}
                onClose={() => setModalCrearAbierto(false)}
                onSubmit={handleCrearConfiguracion}
                loading={loadingCrear}
            />

            <EditarConfiguracionModal
                isOpen={modalEditarAbierto}
                onClose={() => {
                    setModalEditarAbierto(false);
                    setConfiguracionSeleccionada(null);
                }}
                onSubmit={handleEditarConfiguracion}
                configuracion={configuracionSeleccionada}
                loading={loadingEditar}
            />

            <ConfigurarSonidoModal
                isOpen={modalSonidoAbierto}
                onClose={() => {
                    setModalSonidoAbierto(false);
                    setConfiguracionSeleccionada(null);
                }}
                onSubmit={handleConfigurarSonido}
                configuracion={configuracionSeleccionada}
                loading={loadingSonido}
            />

            <ConfigurarAparienciaModal
                isOpen={modalAparienciaAbierto}
                onClose={() => {
                    setModalAparienciaAbierto(false);
                    setConfiguracionSeleccionada(null);
                }}
                onSubmit={handleConfigurarApariencia}
                configuracion={configuracionSeleccionada}
                loading={loadingApariencia}
            />

            <ConfirmarAccionModal
                isOpen={modalConfirmarAbierto}
                onClose={handleCancelarActivacion}
                onConfirm={handleConfirmarActivacion}
                loading={loadingActivar}
                titulo="Activar Configuración"
                mensaje={`¿Estás seguro de que quieres activar la configuración "${configuracionParaActivar?.nombre}"?`}
                descripcion="Esta acción desactivará la configuración actual y activará la seleccionada. Las pantallas comenzarán a usar esta nueva configuración inmediatamente."
                textoConfirmar="Activar"
                textoCancel="Cancelar"
                tipoAccion="activar"
            />
        </div>
    );
};

export default ConfiguracionesSection;