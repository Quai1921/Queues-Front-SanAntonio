import React, { useState, useEffect } from 'react';
import { useConfiguraciones } from '../hooks/useConfiguraciones';
import {
    Settings,
    Add,
    Search,
    FilterList,
    CheckCircle,
    Refresh,
    EditDocument as Edit,
    VolumeUp,
    VolumeOff,
    Palette,
    CheckCircle as CheckCircleIcon,
    RadioButtonUnchecked,
    Timer,
    Clear,
    PlayArrow,
    FirstPage,
    LastPage,
    KeyboardArrowLeft,
    KeyboardArrowRight
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
            if (operacion === 'cargar') return;
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

    const [paginaActual, setPaginaActual] = useState(1);
    const [elementosPorPagina] = useState(10);

    useEffect(() => {
        // Resetear a página 1 cuando cambien los filtros
        setPaginaActual(1);
    }, [filtros.busqueda, filtros.estado, filtros.sonido]);

    const mostrarNotificacion = (mensaje, tipo = 'success') => {
        setNotificacion({ mensaje, tipo });
        setTimeout(() => setNotificacion(null), 5000);
    };

    // Aplicar filtros
    const configuracionesFiltradas = filtrarConfiguraciones(filtros);

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


    const handleAbrirEditar = (configuracion) => {
        setConfiguracionSeleccionada(configuracion);
        setModalEditarAbierto(true);
    };

    const handleAbrirSonido = (configuracion) => {
        setConfiguracionSeleccionada(configuracion);
        setModalSonidoAbierto(true);
    };

    const handleAbrirApariencia = (configuracion) => {
        setConfiguracionSeleccionada(configuracion);
        setModalAparienciaAbierto(true);
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

    const getThemeClasses = (temaColor) => {
        const themeMap = {
            'verde': 'bg-green-100 text-green-800',
            'green': 'bg-green-100 text-green-800',
            'azul': 'bg-blue-100 text-blue-800',
            'blue': 'bg-blue-100 text-blue-800',
            'rojo': 'bg-red-100 text-red-800',
            'red': 'bg-red-100 text-red-800',
            'amarillo': 'bg-yellow-100 text-yellow-800',
            'yellow': 'bg-yellow-100 text-yellow-800',
            'morado': 'bg-purple-100 text-purple-800',
            'purple': 'bg-purple-100 text-purple-800',
            'naranja': 'bg-orange-100 text-orange-800',
            'orange': 'bg-orange-200 text-orange-800',
            'gris': 'bg-gray-100 text-gray-800',
            'gray': 'bg-gray-100 text-gray-800',
            'rosa': 'bg-pink-100 text-pink-800',
            'pink': 'bg-pink-100 text-pink-800',
            'indigo': 'bg-indigo-100 text-indigo-800',
            'teal': 'bg-teal-100 text-teal-800',
            'cyan': 'bg-cyan-100 text-cyan-800',
            'lime': 'bg-lime-100 text-lime-800',
            'emerald': 'bg-emerald-100 text-emerald-800',
            'sky': 'bg-sky-100 text-sky-800',
            'dark': 'bg-gray-800 text-gray-100',
            'violet': 'bg-violet-100 text-violet-800',
            'fuchsia': 'bg-fuchsia-100 text-fuchsia-800',
            'default': 'bg-slate-100 text-slate-800'
        };

        // Buscar el tema, si no se encuentra usar default
        const normalizedTheme = temaColor?.toLowerCase() || 'default';
        return themeMap[normalizedTheme] || themeMap['default'];
    };

    const irAPagina = (numeroPagina) => {
        const totalPaginas = Math.ceil(configuracionesFiltradas.length / elementosPorPagina);
        if (numeroPagina >= 1 && numeroPagina <= totalPaginas) {
            setPaginaActual(numeroPagina);
        }
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

    const renderTablaConfiguraciones = () => {

        const totalElementos = configuracionesFiltradas.length;
        const totalPaginas = Math.ceil(totalElementos / elementosPorPagina);
        const indiceInicio = (paginaActual - 1) * elementosPorPagina;
        const indiceFin = indiceInicio + elementosPorPagina;
        const configuracionesPaginadas = configuracionesFiltradas.slice(indiceInicio, indiceFin);

        return (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50">
                                <th className="text-left py-3 px-4 font-medium text-slate-900 w-[250px]">Configuración</th>
                                <th className="text-left py-3 px-4 font-medium text-slate-900 w-[250px]">Tiempos</th>
                                <th className="text-left py-3 px-4 font-medium text-slate-900">Estado</th>
                                <th className="text-left py-3 px-4 font-medium text-slate-900">Sonido</th>
                                <th className="text-left py-3 px-4 font-medium text-slate-900">Tema</th>
                                {/* <th className="text-left py-3 px-4 font-medium text-slate-900 w-[200px]">Fecha</th> */}
                                <th className="text-center py-3 px-4 font-medium text-slate-900">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {configuracionesPaginadas.map((configuracion, index) => (
                                // CAMBIO: Usar combinación de id y index para key única
                                <tr key={`configuracion-${configuracion.id}-${index}`} className="border-b border-slate-100 hover:bg-slate-50 transition-colors duration-300">
                                    <td className="py-4 px-4">
                                        <div>
                                            <p className="font-medium text-sm text-slate-900">{configuracion.nombre}</p>
                                            {configuracion?.textoEncabezado && (
                                                <p className="text-xs text-slate-600 mt-1">{configuracion?.textoEncabezado}</p>
                                            )}
                                        </div>
                                    </td>

                                    <td className="py-4 px-4">
                                        <div className="flex items-center space-x-4 text-xs">
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
                                            className={`inline-flex justify-center items-center px-2 py-1 w-16 rounded-full text-xs font-medium transition-colors duration-300 ${configuracion.sonidoActivo
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                                }`}
                                        >
                                            {configuracion.sonidoActivo ? 'Activo' : 'Inactivo'}
                                        </button>
                                    </td>

                                    {/* SOLUCIÓN 4: Botón de tema dinámico según el color */}
                                    <td className="py-4 px-4">
                                        <button
                                            className={`inline-flex justify-center items-center px-2 py-1 rounded-full text-xs font-medium w-24 ${getThemeClasses(configuracion.temaColor)}`}
                                        >
                                            {configuracion.temaLabel}
                                        </button>
                                    </td>

                                    {/* <td className="py-4 px-4 text-sm text-slate-600">
                                        {configuracion.fechaCreacion ?
                                            new Date(configuracion.fechaCreacion).toLocaleDateString() :
                                            'No disponible'
                                        }
                                    </td> */}

                                    <td className="py-4 px-4">
                                        <div className="flex justify-end">
                                            {/* Botones de acción */}
                                            {!configuracion.activo && (
                                                <button
                                                    onClick={() => handleActivarConfiguracion(configuracion)}
                                                    // disabled={isOperating}
                                                    disabled={isOperating.crear || isOperating.actualizar}
                                                    className="p-1 transition-all duration-300 text-gray-400 hover:text-green-500 cursor-pointer"
                                                    title="Activar configuración"
                                                >
                                                    <CheckCircleIcon className="h-4 w-4" />
                                                </button>
                                            )}

                                            <button
                                                onClick={() => handleAbrirEditar(configuracion)}
                                                // disabled={isOperating}
                                                disabled={isOperating.crear || isOperating.actualizar}
                                                className="p-1 transition-all duration-300 text-gray-400 hover:text-cyan-800 cursor-pointer"
                                                title="Editar configuración"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>

                                            <button
                                                onClick={() => handleAbrirSonido(configuracion)}
                                                // disabled={isOperating}
                                                disabled={isOperating.crear || isOperating.actualizar}
                                                className="p-1 transition-all duration-300 text-gray-400 hover:text-neutral-800 cursor-pointer"
                                                title="Configurar sonido"
                                            >
                                                {configuracion.sonidoActivo ? <VolumeUp className="h-4 w-4" /> : <VolumeOff className="h-4 w-4" />}
                                            </button>

                                            <button
                                                onClick={() => handleAbrirApariencia(configuracion)}
                                                // disabled={isOperating}
                                                disabled={isOperating.crear || isOperating.actualizar}
                                                className="p-1 transition-all duration-300 text-gray-400 hover:text-neutral-800 cursor-pointer"
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

                    {totalPaginas > 1 && (
                        <div className="px-6 py-4 border-t border-slate-200 bg-white">
                            <div className="flex items-center justify-end">
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => irAPagina(1)}
                                        disabled={paginaActual === 1}
                                        className={`p-2 rounded-lg ${paginaActual === 1
                                                ? 'text-slate-300 cursor-not-allowed'
                                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                            }`}
                                        title="Primera página"
                                    >
                                        <FirstPage className="h-4 w-4" />
                                    </button>

                                    <button
                                        onClick={() => irAPagina(paginaActual - 1)}
                                        disabled={paginaActual === 1}
                                        className={`p-2 rounded-lg ${paginaActual === 1
                                                ? 'text-slate-300 cursor-not-allowed'
                                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                            }`}
                                        title="Página anterior"
                                    >
                                        <KeyboardArrowLeft className="h-4 w-4" />
                                    </button>

                                    <div className="flex items-center space-x-1">
                                        {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                                            let pageNum;
                                            if (totalPaginas <= 5) {
                                                pageNum = i + 1;
                                            } else if (paginaActual <= 3) {
                                                pageNum = i + 1;
                                            } else if (paginaActual >= totalPaginas - 2) {
                                                pageNum = totalPaginas - 4 + i;
                                            } else {
                                                pageNum = paginaActual - 2 + i;
                                            }

                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => irAPagina(pageNum)}
                                                    className={`flex justify-center items-center size-6 text-sm rounded-full ${paginaActual === pageNum
                                                            ? 'bg-[#224666] text-white'
                                                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                                        }`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <button
                                        onClick={() => irAPagina(paginaActual + 1)}
                                        disabled={paginaActual === totalPaginas}
                                        className={`p-2 rounded-lg ${paginaActual === totalPaginas
                                                ? 'text-slate-300 cursor-not-allowed'
                                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                            }`}
                                        title="Página siguiente"
                                    >
                                        <KeyboardArrowRight className="h-4 w-4" />
                                    </button>

                                    <button
                                        onClick={() => irAPagina(totalPaginas)}
                                        disabled={paginaActual === totalPaginas}
                                        className={`p-2 rounded-lg ${paginaActual === totalPaginas
                                                ? 'text-slate-300 cursor-not-allowed'
                                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                            }`}
                                        title="Última página"
                                    >
                                        <LastPage className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

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
        )
    };

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