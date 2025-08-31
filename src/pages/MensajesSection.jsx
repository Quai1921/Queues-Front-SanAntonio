import React, { useState, useEffect } from 'react';
import { useMensajes } from '../hooks/useMensajes';
import { useConfiguraciones } from '../hooks/useConfiguraciones';
import {
    Message,
    Add,
    Search,
    FilterList,
    Refresh,
    PlayArrow,
    Pause,
    Delete,
    Edit,
    CalendarMonth,
    TextSnippet,
    Image as ImageIcon,
    VideoFile,
    CheckCircle as CheckCircleIcon,
    Cancel,
    Schedule,
    Visibility,
    Settings
} from '@mui/icons-material';
import CrearMensajeModal from '../components/CrearMensajeModal';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import ConfirmarAccionModal from '../components/ConfirmarAccionModal';

/**
 * Componente principal para la gestión de mensajes institucionales
 */
const MensajesSection = () => {
    // Estados principales
    const [configuracionSeleccionada, setConfiguracionSeleccionada] = useState(null);
    const [filtros, setFiltros] = useState({
        busqueda: '',
        estado: 'todos',
        tipo: 'todos',
        vigencia: 'todos'
    });
    const [modalCrear, setModalCrear] = useState(false);
    const [notificacion, setNotificacion] = useState(null);
    const [modalConfirmarAbierto, setModalConfirmarAbierto] = useState(false);
    const [mensajeParaAccion, setMensajeParaAccion] = useState(null);
    const [accionConfirmar, setAccionConfirmar] = useState(null);
    const [loadingAccion, setLoadingAccion] = useState(false);

    const mostrarNotificacion = (mensaje, tipo = 'success') => {
        setNotificacion({ mensaje, tipo });
        setTimeout(() => setNotificacion(null), 5000);
    };

    // Hooks
    const {
        configuraciones,
        loading: loadingConfig,
        cargarConfiguraciones
    } = useConfiguraciones({
        autoLoad: true,
        onError: (error) => console.error('Error cargando configuraciones:', error)
    });

    const {
        mensajes,
        loading,
        error,
        estadisticas,
        isOperating,
        cargarMensajes,
        crearMensaje,
        activarMensaje,
        desactivarMensaje,
        eliminarMensaje,
        filtrarMensajes,
        getTipoLabel,
        getTipoColor,
        esVigente
    } = useMensajes({
        configuracionId: configuracionSeleccionada,
        autoLoad: false,
        onSuccess: (mensaje, operacion) => {
            // console.log(`Operación ${operacion} exitosa:`, mensaje);
        },
        onError: (error, operacion) => {
            // console.error(`Error en ${operacion}:`, error);
        }
    });

    // Seleccionar configuración activa por defecto
    useEffect(() => {
        if (configuraciones.length > 0 && !configuracionSeleccionada) {
            const activa = configuraciones.find(c => c.activo);
            if (activa) {
                setConfiguracionSeleccionada(activa.id);
            } else {
                setConfiguracionSeleccionada(configuraciones[0].id);
            }
        }
    }, [configuraciones, configuracionSeleccionada]);

    // Cargar mensajes cuando cambia la configuración
    useEffect(() => {
        if (configuracionSeleccionada) {
            cargarMensajes();
        }
    }, [configuracionSeleccionada, cargarMensajes]);

    const handleFiltroChange = (campo, valor) => {
        setFiltros(prev => ({
            ...prev,
            [campo]: valor
        }));
    };

    const handleCrearMensaje = async (mensajeData) => {
        try {
            await crearMensaje(mensajeData);
            setModalCrear(false);
            mostrarNotificacion('Mensaje creado correctamente', 'success');
        } catch (error) {
            mostrarNotificacion(`Error al crear el mensaje: ${error.message}`, 'error');
        }
    };

    const handleToggleEstado = (mensaje) => {
        setMensajeParaAccion(mensaje);
        setAccionConfirmar(mensaje.activo ? 'desactivar' : 'activar');
        setModalConfirmarAbierto(true);
    };

    const confirmarAccion = async () => {
        if (!mensajeParaAccion || !accionConfirmar) return;

        try {
            setLoadingAccion(true);

            if (accionConfirmar === 'activar') {
                await activarMensaje(mensajeParaAccion.id);
                mostrarNotificacion('Mensaje activado correctamente', 'success');
            } else if (accionConfirmar === 'desactivar') {
                await desactivarMensaje(mensajeParaAccion.id);
                mostrarNotificacion('Mensaje desactivado correctamente', 'success');
            }

            // Cerrar modal
            setModalConfirmarAbierto(false);
            setMensajeParaAccion(null);
            setAccionConfirmar(null);

        } catch (error) {
            const textoAccion = accionConfirmar === 'activar' ? 'activar' : 'desactivar';
            mostrarNotificacion(`Error al ${textoAccion} el mensaje: ${error.message}`, 'error');
        } finally {
            setLoadingAccion(false);
        }
    };

    const handleEliminar = async (mensaje) => {
        if (window.confirm(`¿Está seguro de eliminar el mensaje "${mensaje.titulo || 'Sin título'}"?`)) {
            try {
                await eliminarMensaje(mensaje.id);
                mostrarNotificacion('Mensaje eliminado correctamente', 'success');
            } catch (error) {
                mostrarNotificacion(`Error al eliminar el mensaje: ${error.message}`, 'error');
            }
        }
    };

    const mensajesFiltrados = filtrarMensajes(filtros);
    const configuracionActual = configuraciones.find(c => c.id === configuracionSeleccionada);

    const getIconoTipo = (tipo) => {
        switch (tipo) {
            case 'TEXTO': return <TextSnippet sx={{ fontSize: '20px' }} className="text-sm" />;
            case 'IMAGEN': return <ImageIcon sx={{ fontSize: '20px' }} className="text-sm" />;
            case 'VIDEO': return <VideoFile  sx={{ fontSize: '20px' }} className="text-sm" />;
            default: return <Message sx={{ fontSize: '20px' }} className="text-sm" />;
        }
    };

    return (
        <div className="">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        Mensajes Institucionales
                    </h1>
                    <p className="text-sm text-slate-600">
                        Gestión de mensajes para mostrar en pantallas públicas
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => cargarMensajes()}
                        disabled={loading || !configuracionSeleccionada}
                        className="flex items-center px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                    >
                        <Refresh className={loading ? 'animate-spin' : ''} />
                        Actualizar
                    </button>
                    <button
                        onClick={() => setModalCrear(true)}
                        disabled={!configuracionSeleccionada}
                        className="px-4 py-2 bg-[#224666] text-white rounded-lg hover:bg-[#1a3852] transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        <Add />
                        Crear Mensaje
                    </button>
                </div>
            </div>

            {/* Selector de Configuración */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 mt-2">
                <div className="flex items-center gap-4">
                    <Settings className="text-slate-500" />
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Configuración de Pantalla
                        </label>
                        <select
                            value={configuracionSeleccionada || ''}
                            onChange={(e) => setConfiguracionSeleccionada(parseInt(e.target.value))}
                            disabled={loadingConfig}
                            className="w-full max-w-md px-3 py-2 border border-slate-300 rounded-lg"
                        >
                            <option value="">Seleccione una configuración...</option>
                            {configuraciones.map(config => (
                                <option key={config.id} value={config.id}>
                                    {config.nombre} {config.activo ? '(Activa)' : ''}
                                </option>
                            ))}
                        </select>
                    </div>
                    {configuracionActual && (
                        <div className="text-right">
                            <p className="text-sm text-slate-600">Configuración actual:</p>
                            <p className="font-medium text-slate-900">{configuracionActual.nombre}</p>
                            <p className={`text-center text-xs w-16 px-2 py-0.5 rounded-full inline-block ${configuracionActual.activo ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'
                                }`}>
                                {configuracionActual.estadoLabel}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Estadísticas */}
            {configuracionSeleccionada && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-2">
                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                        <div className="flex items-center">
                            <Message className="text-[#224666] mr-2" />
                            <div>
                                <p className="text-2xl font-bold text-slate-900">{estadisticas.total}</p>
                                <p className="text-sm text-slate-600">Total</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                        <div className="flex items-center">
                            <PlayArrow className="text-green-600 mr-2" />
                            <div>
                                <p className="text-2xl font-bold text-slate-900">{estadisticas.activos}</p>
                                <p className="text-sm text-slate-600">Activos</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                        <div className="flex items-center">
                            <Visibility className="text-blue-600 mr-2" />
                            <div>
                                <p className="text-2xl font-bold text-slate-900">{estadisticas.vigentes}</p>
                                <p className="text-sm text-slate-600">Vigentes</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                        <div className="flex items-center">
                            <TextSnippet className="text-blue-800 mr-2" />
                            <div>
                                <p className="text-2xl font-bold text-slate-900">{estadisticas.porTipo.texto}</p>
                                <p className="text-sm text-slate-600">Texto</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                        <div className="flex items-center">
                            <ImageIcon className="text-green-800 mr-2" />
                            <div>
                                <p className="text-2xl font-bold text-slate-900">{estadisticas.porTipo.imagen}</p>
                                <p className="text-sm text-slate-600">Imagen</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Notificación */}
            {notificacion && (
                <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[60] px-4 py-6 rounded-lg shadow-lg border transition-all duration-300 ${notificacion.tipo === 'success'
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

            {/* Filtros y Búsqueda */}
            {configuracionSeleccionada && (
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 mt-2">
                    <div className="flex flex-wrap items-center gap-4">
                        {/* Búsqueda */}
                        <div className="flex-1 min-w-64">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar por título o contenido..."
                                    value={filtros.busqueda}
                                    onChange={(e) => handleFiltroChange('busqueda', e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg"
                                />
                            </div>
                        </div>

                        {/* Filtros */}
                        <div className="flex items-center gap-3">
                            <FilterList className="text-slate-500" />

                            <select
                                value={filtros.estado}
                                onChange={(e) => handleFiltroChange('estado', e.target.value)}
                                className="px-3 py-2 border border-slate-300 rounded-lg"
                            >
                                <option value="todos">Todos los estados</option>
                                <option value="activo">Solo activos</option>
                                <option value="inactivo">Solo inactivos</option>
                            </select>

                            <select
                                value={filtros.tipo}
                                onChange={(e) => handleFiltroChange('tipo', e.target.value)}
                                className="px-3 py-2 border border-slate-300 rounded-lg"
                            >
                                <option value="todos">Todos los tipos</option>
                                <option value="texto">Texto</option>
                                <option value="imagen">Imagen</option>
                                <option value="video">Video</option>
                            </select>

                            <select
                                value={filtros.vigencia}
                                onChange={(e) => handleFiltroChange('vigencia', e.target.value)}
                                className="px-3 py-2 border border-slate-300 rounded-lg"
                            >
                                <option value="todos">Toda vigencia</option>
                                <option value="vigente">Solo vigentes</option>
                                <option value="no_vigente">No vigentes</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {/* Contenido Principal */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200">
                {!configuracionSeleccionada ? (
                    <div className="p-8 text-center">
                        <Settings className="text-6xl text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-900 mb-2">
                            Seleccione una Configuración
                        </h3>
                        <p className="text-slate-600">
                            Debe seleccionar una configuración de pantalla para gestionar sus mensajes
                        </p>
                    </div>
                ) : loading ? (
                    <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#224666] mx-auto mb-4"></div>
                        <p className="text-slate-600">Cargando mensajes...</p>
                    </div>
                ) : error ? (
                    <div className="p-8 text-center">
                        <Cancel className="text-6xl text-red-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-red-900 mb-2">Error al cargar mensajes</h3>
                        <p className="text-red-600 mb-4">{error}</p>
                        <button
                            onClick={() => cargarMensajes()}
                            className="px-4 py-2 bg-[#224666] text-white rounded-lg hover:bg-[#1a3852] transition-colors"
                        >
                            Intentar nuevamente
                        </button>
                    </div>
                ) : mensajesFiltrados.length === 0 ? (
                    <div className="p-8 text-center">
                        <Message className="text-6xl text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-900 mb-2">
                            {mensajes.length === 0 ? 'No hay mensajes' : 'No se encontraron mensajes'}
                        </h3>
                        <p className="text-slate-600 mb-4">
                            {mensajes.length === 0
                                ? 'Aún no se han creado mensajes para esta configuración'
                                : 'No hay mensajes que coincidan con los filtros aplicados'
                            }
                        </p>
                        {mensajes.length === 0 && (
                            <button
                                onClick={() => setModalCrear(true)}
                                className="px-4 py-2 bg-[#224666] text-white rounded-lg hover:bg-[#1a3852] transition-colors flex items-center gap-2 mx-auto"
                            >
                                <Add />
                                Crear Primer Mensaje
                            </button>
                        )}
                    </div>
                ) : (
                    /* Lista de Mensajes */
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Mensaje
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Tipo
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Estado
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Vigencia
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Config.
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {mensajesFiltrados.map((mensaje) => (
                                    <tr key={mensaje.id} className="hover:bg-slate-50 transition-colors">
                                        {/* Información del Mensaje */}
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="font-medium text-slate-900">
                                                    {mensaje.titulo || 'Sin título'}
                                                </div>
                                                {mensaje.contenido && (
                                                    <div className="text-sm text-slate-600 mt-1 max-w-md truncate">
                                                        {mensaje.contenido}
                                                    </div>
                                                )}
                                                {mensaje.rutaArchivo && (
                                                    <div className="text-xs text-slate-500 mt-1 max-w-md truncate">
                                                        📎 {mensaje.rutaArchivo}
                                                    </div>
                                                )}
                                            </div>
                                        </td>

                                        {/* Tipo */}
                                        <td className="px-6 py-4">
                                            <span className={`flex items-center justify-center w-[90px] gap-1 px-2 py-1 rounded-full text-xs font-medium ${mensaje.tipo === 'TEXTO' ? 'bg-slate-100 text-slate-800' :
                                                    mensaje.tipo === 'IMAGEN' ? 'bg-amber-100 text-amber-800' :
                                                        'bg-cyan-100 text-cyan-800'
                                                }`}>
                                                {getIconoTipo(mensaje.tipo)}
                                                {getTipoLabel(mensaje.tipo)}
                                            </span>
                                        </td>

                                        {/* Estado */}
                                        <td className="px-6 py-4">
                                            <span className={`flex justify-center items-center px-2 w-16 py-0.5 rounded-full text-xs font-medium ${mensaje.activo
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                                }`}>
                                                {mensaje.estadoLabel}
                                            </span>
                                        </td>

                                        {/* Vigencia */}
                                        <td className="px-6 py-4">
                                            {mensaje.tieneFechas ? (
                                                <div className="text-sm">
                                                    <div className={`font-medium ${esVigente(mensaje) ? 'text-green-700' : 'text-red-700'}`}>
                                                        {esVigente(mensaje) ? 'Vigente' : 'No vigente'}
                                                    </div>
                                                    <div className="text-xs text-slate-600">
                                                        {mensaje.fechaInicioFormateada} - {mensaje.fechaFinFormateada}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-slate-600">Sin restricción</span>
                                            )}
                                        </td>

                                        {/* Configuración */}
                                        <td className="px-6 py-4 text-sm">
                                            <div>
                                                <div className="text-slate-900">Orden: {mensaje.orden}</div>
                                                <div className="text-slate-600">Duración: {mensaje.duracionFormateada}</div>
                                            </div>
                                        </td>

                                        {/* Acciones */}
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleToggleEstado(mensaje)}
                                                    // disabled={isOperating.activar || isOperating.desactivar}
                                                    disabled={isOperating.activar || isOperating.desactivar || loadingAccion}
                                                    className={`p-1 transition-all duration-300 text-gray-400 ${mensaje.activo
                                                            ? 'hover:text-red-600'
                                                            : 'hover:text-green-500'
                                                        } disabled:opacity-50`}
                                                    title={mensaje.activo ? 'Desactivar' : 'Activar'}
                                                >
                                                    {mensaje.activo ? <Pause /> : <CheckCircleIcon />}
                                                </button>

                                                <button
                                                    onClick={() => handleEliminar(mensaje)}
                                                    disabled={isOperating.eliminar}
                                                    className="p-1 transition-all duration-300 text-gray-400 hover:text-red-600"
                                                    title="Eliminar"
                                                >
                                                    <HighlightOffIcon />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal Crear Mensaje */}
            <CrearMensajeModal
                isOpen={modalCrear}
                onClose={() => setModalCrear(false)}
                onSubmit={handleCrearMensaje}
                loading={isOperating.crear}
            />

            <ConfirmarAccionModal
                isOpen={modalConfirmarAbierto}
                onClose={() => {
                    setModalConfirmarAbierto(false);
                    setMensajeParaAccion(null);
                    setAccionConfirmar(null);
                }}
                onConfirm={confirmarAccion}
                loading={loadingAccion}
                titulo={accionConfirmar === 'activar' ? 'Activar Mensaje' : 'Desactivar Mensaje'}
                mensaje={`¿Está seguro que desea ${accionConfirmar} este mensaje?`}
                descripcion={mensajeParaAccion ?
                    `"${mensajeParaAccion.titulo || 'Sin título'}" - ${mensajeParaAccion.tipo}` :
                    ''
                }
                textoConfirmar={accionConfirmar === 'activar' ? 'Activar' : 'Desactivar'}
                textoCancel="Cancelar"
                tipoAccion={accionConfirmar}
            />
        </div>
    );
};

export default MensajesSection;