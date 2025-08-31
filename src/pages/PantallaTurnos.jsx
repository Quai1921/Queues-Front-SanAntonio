import React, { useState, useEffect, useRef } from 'react';
import { VolumeUp, VolumeOff, Business, Refresh, Settings } from '@mui/icons-material';
import configuracionPantallaService from '../services/configuracionPantallaService';
import mensajeInstitucionalService from '../services/mensajeInstitucionalService';

// Simulación de datos de turnos (hasta implementar el módulo de turnos)
const TURNOS_EJEMPLO = [
    { id: 1, codigo: 'A001', sector: 'Obras Públicas', ventanilla: 1, estado: 'LLAMANDO', timestamp: Date.now() },
    { id: 2, codigo: 'B023', sector: 'Rentas', ventanilla: 2, estado: 'EN_ATENCION', timestamp: Date.now() - 30000 },
    { id: 3, codigo: 'C015', sector: 'Tránsito', ventanilla: 3, estado: 'PENDIENTE', timestamp: Date.now() - 60000 },
    { id: 4, codigo: 'A002', sector: 'Obras Públicas', ventanilla: 1, estado: 'PENDIENTE', timestamp: Date.now() - 90000 },
    { id: 5, codigo: 'D008', sector: 'Mesa de Entradas', ventanilla: 4, estado: 'PENDIENTE', timestamp: Date.now() - 120000 }
];

// Configuración por defecto (fallback si no hay configuración activa)
const CONFIGURACION_FALLBACK = {
    id: 1,
    nombre: 'Configuración Por Defecto',
    textoEncabezado: 'SISTEMA DE TURNOS - MUNICIPALIDAD DE SAN ANTONIO',
    temaColor: 'blue',
    mostrarLogo: true,
    rutaLogo: null,
    sonidoActivo: true,
    volumenSonido: 70,
    archivoSonido: 'turno-llamado.mp3',
    animacionesActivas: true,
    tiempoMensaje: 8,
    tiempoTurno: 6
};

const PantallaTurnos = () => {
    // Estados principales
    const [configuracion, setConfiguracion] = useState(CONFIGURACION_FALLBACK);
    const [mensajes, setMensajes] = useState([]);
    const [turnos, setTurnos] = useState(TURNOS_EJEMPLO);
    const [mensajeActual, setMensajeActual] = useState(0);
    const [horaActual, setHoraActual] = useState(new Date());
    const [turnoLlamando, setTurnoLlamando] = useState(null);
    const [sonidoHabilitado, setSonidoHabilitado] = useState(true);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdate, setLastUpdate] = useState(new Date());

    const audioRef = useRef(null);
    const intervalMensajesRef = useRef(null);
    const intervalTurnosRef = useRef(null);
    const intervalRefreshRef = useRef(null);

    // Cargar configuración activa al montar
    useEffect(() => {
        const cargarConfiguracion = async () => {
            try {
                setLoading(true);
                setError(null);

                // Obtener configuración activa
                const configResponse = await configuracionPantallaService.obtenerConfiguracionActiva();

                if (configResponse) {
                    setConfiguracion(configResponse);

                    // Cargar mensajes para esta configuración
                    try {
                        const mensajesResponse = await mensajeInstitucionalService.obtenerMensajesPorConfiguracion(configResponse.id);
                        setMensajes(mensajesResponse || []);
                    } catch (mensajesError) {
                        console.warn('Error cargando mensajes, usando mensajes vigentes:', mensajesError);
                        // Fallback: intentar obtener mensajes vigentes
                        try {
                            const mensajesVigentes = await mensajeInstitucionalService.obtenerMensajesVigentes();
                            setMensajes(mensajesVigentes || []);
                        } catch (vigentesError) {
                            console.warn('No se pudieron cargar mensajes:', vigentesError);
                            setMensajes([]);
                        }
                    }
                } else {
                    console.warn('No hay configuración activa, usando configuración por defecto');
                    setConfiguracion(CONFIGURACION_FALLBACK);
                }

                setLastUpdate(new Date());

            } catch (configError) {
                console.error('Error cargando configuración:', configError);
                setError('Error cargando configuración de pantalla');
                setConfiguracion(CONFIGURACION_FALLBACK);
            } finally {
                setLoading(false);
            }
        };

        cargarConfiguracion();
    }, []);

    // Auto-refresh periódico (cada 5 minutos)
    useEffect(() => {
        intervalRefreshRef.current = setInterval(async () => {
            try {
                const configResponse = await configuracionPantallaService.obtenerConfiguracionActiva();

                if (configResponse) {
                    setConfiguracion(configResponse);

                    const mensajesResponse = await mensajeInstitucionalService.obtenerMensajesPorConfiguracion(configResponse.id);
                    setMensajes(mensajesResponse || []);
                }

                setLastUpdate(new Date());
            } catch (error) {
                console.warn('Error en auto-refresh:', error);
            }
        }, 5 * 60 * 1000); // 5 minutos

        return () => {
            if (intervalRefreshRef.current) {
                clearInterval(intervalRefreshRef.current);
            }
        };
    }, []);

    // Actualizar hora cada segundo
    useEffect(() => {
        const timer = setInterval(() => {
            setHoraActual(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Rotación de mensajes basada en configuración real
    useEffect(() => {
        if (mensajes.length > 0 && configuracion.tiempoMensaje) {
            if (intervalMensajesRef.current) {
                clearInterval(intervalMensajesRef.current);
            }

            intervalMensajesRef.current = setInterval(() => {
                setMensajeActual(prev => (prev + 1) % mensajes.length);
            }, configuracion.tiempoMensaje * 1000);

            return () => {
                if (intervalMensajesRef.current) {
                    clearInterval(intervalMensajesRef.current);
                }
            };
        }
    }, [mensajes, configuracion.tiempoMensaje]);

    // Simulación de llamadas de turnos con configuración real
    useEffect(() => {
        if (configuracion.tiempoTurno) {
            if (intervalTurnosRef.current) {
                clearInterval(intervalTurnosRef.current);
            }

            intervalTurnosRef.current = setInterval(() => {
                const turnosDisponibles = turnos.filter(t => t.estado === 'PENDIENTE');
                if (turnosDisponibles.length > 0) {
                    const turnoAleatorio = turnosDisponibles[Math.floor(Math.random() * turnosDisponibles.length)];
                    llamarTurno(turnoAleatorio);
                }
            }, configuracion.tiempoTurno * 1000 + Math.random() * 5000);

            return () => {
                if (intervalTurnosRef.current) {
                    clearInterval(intervalTurnosRef.current);
                }
            };
        }
    }, [turnos, configuracion.tiempoTurno]);

    const llamarTurno = (turno) => {
        setTurnoLlamando(turno);

        // Actualizar estado del turno
        setTurnos(prev => prev.map(t =>
            t.id === turno.id ? { ...t, estado: 'LLAMANDO' } : t
        ));

        // Reproducir sonido si está habilitado en la configuración
        if (configuracion.sonidoActivo && sonidoHabilitado && audioRef.current) {
            audioRef.current.volume = (configuracion.volumenSonido || 70) / 100;
            audioRef.current.play().catch(error => {
                console.warn('No se pudo reproducir el sonido:', error);
            });
        }

        // Limpiar animación después del tiempo configurado
        setTimeout(() => {
            setTurnoLlamando(null);
            setTurnos(prev => prev.map(t =>
                t.id === turno.id ? { ...t, estado: 'EN_ATENCION' } : t
            ));
        }, (configuracion.tiempoTurno || 6) * 1000);
    };

    const handleRefresh = async () => {
        try {
            setLoading(true);
            const configResponse = await configuracionPantallaService.obtenerConfiguracionActiva();

            if (configResponse) {
                setConfiguracion(configResponse);
                const mensajesResponse = await mensajeInstitucionalService.obtenerMensajesPorConfiguracion(configResponse.id);
                setMensajes(mensajesResponse || []);
            }

            setLastUpdate(new Date());
        } catch (error) {
            console.error('Error al refrescar:', error);
            setError('Error actualizando datos');
        } finally {
            setLoading(false);
        }
    };

    const obtenerClasesTema = () => {
        const tema = configuracion.temaColor || 'blue';
        const temas = {
            'default': 'bg-gradient-to-br from-slate-800 to-slate-900',
            'blue': 'bg-gradient-to-br from-blue-800 to-blue-900',
            'green': 'bg-gradient-to-br from-green-800 to-green-900',
            'red': 'bg-gradient-to-br from-red-800 to-red-900',
            'purple': 'bg-gradient-to-br from-purple-800 to-purple-900',
            'orange': 'bg-gradient-to-br from-orange-800 to-orange-900',
            'dark': 'bg-gradient-to-br from-gray-900 to-black',
            'light': 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-800'
        };
        return temas[tema] || temas['blue'];
    };

    const obtenerColorTurno = (estado) => {
        switch (estado) {
            case 'LLAMANDO':
                return 'bg-red-500 text-white animate-pulse';
            case 'EN_ATENCION':
                return 'bg-green-500 text-white';
            case 'PENDIENTE':
                return 'bg-blue-500 text-white';
            default:
                return 'bg-gray-500 text-white';
        }
    };

    const obtenerTextoEstado = (estado) => {
        switch (estado) {
            case 'LLAMANDO':
                return 'LLAMANDO';
            case 'EN_ATENCION':
                return 'EN ATENCIÓN';
            case 'PENDIENTE':
                return 'PENDIENTE';
            default:
                return 'DESCONOCIDO';
        }
    };

    const esTemaClaroText = configuracion.temaColor === 'light';

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <div className="text-center text-white">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
                    <p className="text-xl">Cargando Sistema de Turnos...</p>
                    <p className="text-sm opacity-75 mt-2">Configuración: {configuracion.nombre}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${esTemaClaroText ? 'text-gray-800' : 'text-white'} ${obtenerClasesTema()} ${configuracion.animacionesActivas ? 'transition-all duration-500' : ''}`}>
            {/* Audio para sonidos configurados */}
            <audio ref={audioRef} preload="auto">
                <source src={configuracion.archivoSonido ? `/sounds/${configuracion.archivoSonido}` : "/sounds/turno-llamado.mp3"} type="audio/mpeg" />
                <source src="/sounds/turno-llamado.wav" type="audio/wav" />
            </audio>

            {/* Header con configuración real */}
            <header className={`${esTemaClaroText ? 'bg-white' : 'bg-black'} bg-opacity-20 backdrop-blur-sm p-6`}>
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        {configuracion.mostrarLogo && (
                            <div className="flex items-center space-x-3">
                                {configuracion.rutaLogo ? (
                                    <img
                                        src={configuracion.rutaLogo}
                                        alt="Logo"
                                        className="h-16 w-16 object-contain"
                                        onError={(e) => {
                                            // Fallback si la imagen no carga
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <Business className="text-4xl" />
                                )}
                                <div className={`h-12 w-12 ${esTemaClaroText ? 'bg-gray-800' : 'bg-white'} bg-opacity-20 rounded-full flex items-center justify-center`}>
                                    <span className="text-xl font-bold">SA</span>
                                </div>
                            </div>
                        )}
                        <div>
                            <h1 className="text-3xl font-bold tracking-wide">
                                {configuracion.textoEncabezado}
                            </h1>
                            <p className="text-lg opacity-90 mt-1">
                                Portal de Atención
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-6">
                        {/* Control de sonido según configuración */}
                        <button
                            onClick={() => setSonidoHabilitado(!sonidoHabilitado)}
                            disabled={!configuracion.sonidoActivo}
                            className={`flex items-center space-x-2 ${esTemaClaroText ? 'bg-gray-800' : 'bg-white'} bg-opacity-20 px-4 py-2 rounded-lg hover:bg-opacity-30 transition-all ${!configuracion.sonidoActivo ? 'opacity-50 cursor-not-allowed' : ''}`}
                            title={!configuracion.sonidoActivo ? 'Sonido deshabilitado en configuración' : ''}
                        >
                            {sonidoHabilitado && configuracion.sonidoActivo ? <VolumeUp /> : <VolumeOff />}
                            <span className="hidden sm:inline">
                                {sonidoHabilitado && configuracion.sonidoActivo ? 'Sonido ON' : 'Sonido OFF'}
                            </span>
                        </button>

                        {/* Botón de refresh */}
                        <button
                            onClick={handleRefresh}
                            disabled={loading}
                            className={`flex items-center space-x-2 ${esTemaClaroText ? 'bg-gray-800' : 'bg-white'} bg-opacity-20 px-4 py-2 rounded-lg hover:bg-opacity-30 transition-all`}
                            title="Actualizar configuración"
                        >
                            <Refresh className={loading ? 'animate-spin' : ''} />
                            <span className="hidden sm:inline">Actualizar</span>
                        </button>

                        {/* Hora actual */}
                        <div className="text-right">
                            <div className="text-2xl font-mono font-bold">
                                {horaActual.toLocaleTimeString('es-AR', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit'
                                })}
                            </div>
                            <div className="text-sm opacity-75">
                                {horaActual.toLocaleDateString('es-AR', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mensaje de error si existe */}
            {error && (
                <div className="max-w-7xl mx-auto px-6 pt-4">
                    <div className="bg-red-500 bg-opacity-20 border border-red-500 rounded-lg p-4 mb-4">
                        <p className="text-red-200 font-medium">⚠️ {error}</p>
                        <button
                            onClick={() => setError(null)}
                            className="text-red-300 hover:text-red-100 text-sm mt-2 underline"
                        >
                            Ocultar
                        </button>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Columna izquierda: Turno actual llamando */}
                    <div className="lg:col-span-2">
                        <div className={`${esTemaClaroText ? 'bg-gray-800' : 'bg-white'} bg-opacity-10 backdrop-blur-sm rounded-2xl p-8 mb-8`}>
                            <h2 className="text-2xl font-bold mb-6 text-center">
                                🔊 TURNO SIENDO LLAMADO
                            </h2>

                            {turnoLlamando ? (
                                <div className="text-center">
                                    <div className="bg-red-500 text-white rounded-xl p-8 mb-4 animate-pulse shadow-2xl">
                                        <div className="text-6xl font-bold mb-2">
                                            {turnoLlamando.codigo}
                                        </div>
                                        <div className="text-2xl mb-2">
                                            {turnoLlamando.sector}
                                        </div>
                                        <div className="text-xl">
                                            Ventanilla {turnoLlamando.ventanilla}
                                        </div>
                                    </div>
                                    <p className="text-lg opacity-90">
                                        Por favor diríjase a la ventanilla indicada
                                    </p>
                                </div>
                            ) : (
                                <div className="text-center py-12 opacity-60">
                                    <div className="text-4xl mb-4">⏳</div>
                                    <p className="text-xl">
                                        Esperando próximo turno...
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Lista de turnos pendientes y en atención */}
                        <div className={`${esTemaClaroText ? 'bg-gray-800' : 'bg-white'} bg-opacity-10 backdrop-blur-sm rounded-2xl p-6`}>
                            <h3 className="text-xl font-bold mb-6 flex items-center">
                                📋 Estado de Turnos
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {turnos.slice(0, 6).map((turno) => (
                                    <div
                                        key={turno.id}
                                        className={`p-4 rounded-xl transition-all duration-500 ${obtenerColorTurno(turno.estado)} ${turno.estado === 'LLAMANDO' && configuracion.animacionesActivas ? 'transform scale-105 shadow-2xl' : 'shadow-lg'
                                            }`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <div className="text-2xl font-bold">{turno.codigo}</div>
                                                <div className="text-sm opacity-90">{turno.sector}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-semibold">
                                                    {obtenerTextoEstado(turno.estado)}
                                                </div>
                                                <div className="text-sm opacity-75">
                                                    Ventanilla {turno.ventanilla}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Columna derecha: Mensajes institucionales reales */}
                    <div className="space-y-6">
                        {/* Mensajes rotativos desde la configuración */}
                        <div className={`${esTemaClaroText ? 'bg-gray-800' : 'bg-white'} bg-opacity-10 backdrop-blur-sm rounded-2xl p-6`}>
                            <h3 className="text-xl font-bold mb-4 flex items-center">
                                📢 Información
                            </h3>

                            {mensajes.length > 0 ? (
                                <div className={`transition-all duration-1000 ${configuracion.animacionesActivas ? 'animate-fade-in' : ''}`}>
                                    <div className={`${esTemaClaroText ? 'bg-gray-800' : 'bg-white'} bg-opacity-20 rounded-xl p-4`}>
                                        <h4 className="font-semibold text-lg mb-2">
                                            {mensajes[mensajeActual].titulo || 'Mensaje Institucional'}
                                        </h4>
                                        <p className="text-sm leading-relaxed opacity-90">
                                            {mensajes[mensajeActual].contenido || 'Contenido del mensaje'}
                                        </p>
                                        {mensajes[mensajeActual].tipo === 'IMAGEN' && mensajes[mensajeActual].rutaArchivo && (
                                            <img
                                                src={mensajes[mensajeActual].rutaArchivo}
                                                alt={mensajes[mensajeActual].titulo}
                                                className="mt-3 max-w-full h-32 object-cover rounded"
                                                onError={(e) => e.target.style.display = 'none'}
                                            />
                                        )}
                                    </div>

                                    {mensajes.length > 1 && (
                                        <div className="flex justify-center mt-4 space-x-2">
                                            {mensajes.map((_, index) => (
                                                <div
                                                    key={index}
                                                    className={`w-2 h-2 rounded-full transition-all ${index === mensajeActual ?
                                                            (esTemaClaroText ? 'bg-gray-800' : 'bg-white') :
                                                            `${esTemaClaroText ? 'bg-gray-800' : 'bg-white'} bg-opacity-30`
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-8 opacity-60">
                                    <p className="text-lg">No hay mensajes configurados</p>
                                    <p className="text-sm">Configure mensajes en el panel administrativo</p>
                                </div>
                            )}
                        </div>

                        {/* Información de configuración */}
                        <div className={`${esTemaClaroText ? 'bg-gray-800' : 'bg-white'} bg-opacity-10 backdrop-blur-sm rounded-2xl p-6`}>
                            <h3 className="text-xl font-bold mb-4">⚙️ Configuración Actual</h3>

                            <div className="space-y-3 text-sm">
                                <div className="flex items-center justify-between py-2 border-b border-current border-opacity-20">
                                    <span>Nombre:</span>
                                    <span className="font-bold text-right max-w-32 truncate" title={configuracion.nombre}>
                                        {configuracion.nombre}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between py-2 border-b border-current border-opacity-20">
                                    <span>Tema:</span>
                                    <span className="font-bold capitalize">
                                        {configuracionPantallaService.getTemaLabel(configuracion.temaColor)}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between py-2 border-b border-current border-opacity-20">
                                    <span>Sonido:</span>
                                    <span className={`font-bold ${configuracion.sonidoActivo ? 'text-green-400' : 'text-red-400'}`}>
                                        {configuracion.sonidoActivo ? 'Activado' : 'Desactivado'}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between py-2">
                                    <span>Mensajes:</span>
                                    <span className="font-bold text-blue-400">
                                        {mensajes.length}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Información adicional */}
                        <div className={`${esTemaClaroText ? 'bg-gray-800' : 'bg-white'} bg-opacity-10 backdrop-blur-sm rounded-2xl p-6`}>
                            <h3 className="text-xl font-bold mb-4">ℹ️ Estado del Sistema</h3>

                            <div className="space-y-4 text-sm">
                                <div className="flex items-center justify-between py-2 border-b border-current border-opacity-20">
                                    <span>Turnos Pendientes:</span>
                                    <span className="font-bold text-blue-300">
                                        {turnos.filter(t => t.estado === 'PENDIENTE').length}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between py-2 border-b border-current border-opacity-20">
                                    <span>En Atención:</span>
                                    <span className="font-bold text-green-300">
                                        {turnos.filter(t => t.estado === 'EN_ATENCION').length}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between py-2 border-b border-current border-opacity-20">
                                    <span>Ventanillas Activas:</span>
                                    <span className="font-bold text-yellow-300">
                                        {new Set(turnos.filter(t => t.estado !== 'PENDIENTE').map(t => t.ventanilla)).size}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between py-2">
                                    <span>Última Actualización:</span>
                                    <span className="font-bold text-gray-400 text-xs">
                                        {lastUpdate.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Leyenda de estados */}
                        <div className={`${esTemaClaroText ? 'bg-gray-800' : 'bg-white'} bg-opacity-10 backdrop-blur-sm rounded-2xl p-6`}>
                            <h3 className="text-xl font-bold mb-4">🏷️ Estados</h3>

                            <div className="space-y-3 text-sm">
                                <div className="flex items-center space-x-3">
                                    <div className="w-4 h-4 bg-red-500 rounded animate-pulse"></div>
                                    <span>Llamando</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                                    <span>En Atención</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                                    <span>Pendiente</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer con información de configuración */}
            <footer className={`${esTemaClaroText ? 'bg-white' : 'bg-black'} bg-opacity-20 backdrop-blur-sm mt-12 p-4`}>
                <div className="max-w-7xl mx-auto text-center text-sm opacity-75">
                    <p>
                        Municipalidad de San Antonio - Sistema de Gestión de Turnos
                        {' '} | {' '}
                        Configuración: {configuracion.nombre}
                        {' '} | {' '}
                        Tema: {configuracionPantallaService.getTemaLabel(configuracion.temaColor)}
                        {configuracion.sonidoActivo && ` | Sonido: ${configuracion.volumenSonido}%`}
                    </p>
                </div>
            </footer>

            {/* Estilos adicionales para animaciones */}
            <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
        </div>
    );
};

export default PantallaTurnos;