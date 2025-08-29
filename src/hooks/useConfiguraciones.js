import { useState, useEffect, useCallback } from 'react';
import configuracionPantallaService from '../services/configuracionPantallaService';

/**
 * Hook personalizado para manejar configuraciones de pantalla en el AdminPanel
 * 
 * @param {Object} options - Opciones de configuración
 * @param {boolean} options.autoLoad - Si debe cargar automáticamente al montar (default: true)
 * @param {Function} options.onError - Callback personalizado para errores
 * @param {Function} options.onSuccess - Callback para operaciones exitosas
 * 
 * @returns {Object} Estado y funciones del hook
 */
export const useConfiguraciones = (options = {}) => {
    const {
        autoLoad = true,
        onError = null,
        onSuccess = null
    } = options;

    // Estados principales
    const [configuraciones, setConfiguraciones] = useState([]);
    const [configuracionActual, setConfiguracionActual] = useState(null);
    const [configuracionActiva, setConfiguracionActiva] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [operacionEnCurso, setOperacionEnCurso] = useState(null);

    // Estado para tracking de operaciones específicas
    const [isOperating, setIsOperating] = useState({
        crear: false,
        actualizar: false,
        activar: false,
        configurarSonido: false,
        configurarApariencia: false
    });

    // Estadísticas computadas
    const [estadisticas, setEstadisticas] = useState({
        total: 0,
        activa: 0,
        inactivas: 0,
        conSonido: 0,
        sinSonido: 0
    });

    /**
     * Calcular estadísticas de una lista de configuraciones
     */
    const calcularEstadisticasDeConfiguraciones = (configuracionesList) => {
        if (!configuracionesList || configuracionesList.length === 0) {
            return {
                total: 0,
                activa: 0,
                inactivas: 0,
                conSonido: 0,
                sinSonido: 0
            };
        }

        return configuracionesList.reduce((acc, config) => {
            acc.total += 1;
            if (config.activo) acc.activa += 1;
            else acc.inactivas += 1;
            if (config.sonidoActivo) acc.conSonido += 1;
            else acc.sinSonido += 1;
            return acc;
        }, {
            total: 0,
            activa: 0,
            inactivas: 0,
            conSonido: 0,
            sinSonido: 0
        });
    };

    /**
     * Cargar todas las configuraciones
     */
    const cargarConfiguraciones = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const data = await configuracionPantallaService.obtenerTodas();
            
            setConfiguraciones(data);
            setEstadisticas(calcularEstadisticasDeConfiguraciones(data));

            // Obtener configuración activa
            const activa = data.find(config => config.activo);
            setConfiguracionActiva(activa || null);

        } catch (err) {
            const errorMessage = err.message || 'Error cargando configuraciones';
            setError(errorMessage);

            if (onError) {
                onError(err, 'cargar');
            }
        } finally {
            setLoading(false);
        }
    }, [onError]);

    /**
     * Cargar configuración específica por ID
     */
    const cargarConfiguracion = useCallback(async (id) => {
        try {
            setLoading(true);
            setError(null);

            const data = await configuracionPantallaService.obtenerPorId(id);
            setConfiguracionActual(data);

            return data;

        } catch (err) {
            const errorMessage = err.message || 'Error cargando configuración';
            setError(errorMessage);

            if (onError) {
                onError(err, 'cargar_detalle');
            }

            throw err;
        } finally {
            setLoading(false);
        }
    }, [onError]);

    /**
     * Crear nueva configuración
     */
    const crearConfiguracion = useCallback(async (configuracionData) => {
        try {
            setIsOperating(prev => ({ ...prev, crear: true }));
            setOperacionEnCurso('crear');
            setError(null);

            const nuevaConfiguracion = await configuracionPantallaService.crear(configuracionData);

            // Actualizar estado local
            setConfiguraciones(prev => {
                const nuevaLista = [...prev, nuevaConfiguracion];
                setEstadisticas(calcularEstadisticasDeConfiguraciones(nuevaLista));
                return nuevaLista;
            });

            if (onSuccess) {
                onSuccess(nuevaConfiguracion, 'crear');
            }

            return nuevaConfiguracion;

        } catch (err) {
            const errorMessage = err.message || 'Error creando configuración';
            setError(errorMessage);

            if (onError) {
                onError(err, 'crear');
            }

            throw err;
        } finally {
            setIsOperating(prev => ({ ...prev, crear: false }));
            setOperacionEnCurso(null);
        }
    }, [onError, onSuccess]);

    /**
     * Actualizar configuración existente
     */
    const actualizarConfiguracion = useCallback(async (id, configuracionData) => {
        try {
            setIsOperating(prev => ({ ...prev, actualizar: true }));
            setOperacionEnCurso('actualizar');
            setError(null);

            const configuracionActualizada = await configuracionPantallaService.actualizar(id, configuracionData);

            // Actualizar estado local
            setConfiguraciones(prev => {
                const nuevaLista = prev.map(config =>
                    config.id === id ? configuracionActualizada : config
                );
                setEstadisticas(calcularEstadisticasDeConfiguraciones(nuevaLista));
                return nuevaLista;
            });

            // Actualizar configuración actual si está cargada
            setConfiguracionActual(prev => 
                prev && prev.id === id ? configuracionActualizada : prev
            );

            // Actualizar configuración activa si es la misma
            setConfiguracionActiva(prev => 
                prev && prev.id === id ? configuracionActualizada : prev
            );

            if (onSuccess) {
                onSuccess(configuracionActualizada, 'actualizar');
            }

            return configuracionActualizada;

        } catch (err) {
            const errorMessage = err.message || 'Error actualizando configuración';
            setError(errorMessage);

            if (onError) {
                onError(err, 'actualizar');
            }

            throw err;
        } finally {
            setIsOperating(prev => ({ ...prev, actualizar: false }));
            setOperacionEnCurso(null);
        }
    }, [onError, onSuccess]);

    /**
     * Activar configuración específica
     */
    const activarConfiguracion = useCallback(async (id) => {
        try {
            setIsOperating(prev => ({ ...prev, activar: true }));
            setOperacionEnCurso('activar');
            setError(null);

            const configuracionActivada = await configuracionPantallaService.activar(id);

            // Actualizar estado local - todas las configuraciones se desactivan excepto la activada
            setConfiguraciones(prev => {
                const nuevaLista = prev.map(config => ({
                    ...config,
                    activo: config.id === id,
                    estadoLabel: config.id === id ? 'Activa' : 'Inactiva',
                    estadoColor: config.id === id ? 'text-green-600' : 'text-slate-600',
                    estadoBg: config.id === id ? 'bg-green-50' : 'bg-slate-50'
                }));
                setEstadisticas(calcularEstadisticasDeConfiguraciones(nuevaLista));
                return nuevaLista;
            });

            // Actualizar configuración activa
            setConfiguracionActiva(configuracionActivada);

            if (onSuccess) {
                onSuccess(configuracionActivada, 'activar');
            }

            return configuracionActivada;

        } catch (err) {
            const errorMessage = err.message || 'Error activando configuración';
            setError(errorMessage);

            if (onError) {
                onError(err, 'activar');
            }

            throw err;
        } finally {
            setIsOperating(prev => ({ ...prev, activar: false }));
            setOperacionEnCurso(null);
        }
    }, [onError, onSuccess]);

    /**
     * Configurar sonido de una configuración
     */
    const configurarSonido = useCallback(async (id, configuracionSonido) => {
        try {
            setIsOperating(prev => ({ ...prev, configurarSonido: true }));
            setOperacionEnCurso('configurar_sonido');
            setError(null);

            await configuracionPantallaService.configurarSonido(id, configuracionSonido);

            // Recargar configuraciones para obtener los datos actualizados
            await cargarConfiguraciones();

            if (onSuccess) {
                onSuccess(null, 'configurar_sonido');
            }

        } catch (err) {
            const errorMessage = err.message || 'Error configurando sonido';
            setError(errorMessage);

            if (onError) {
                onError(err, 'configurar_sonido');
            }

            throw err;
        } finally {
            setIsOperating(prev => ({ ...prev, configurarSonido: false }));
            setOperacionEnCurso(null);
        }
    }, [cargarConfiguraciones, onError, onSuccess]);

    /**
     * Configurar apariencia de una configuración
     */
    const configurarApariencia = useCallback(async (id, configuracionApariencia) => {
        try {
            setIsOperating(prev => ({ ...prev, configurarApariencia: true }));
            setOperacionEnCurso('configurar_apariencia');
            setError(null);

            await configuracionPantallaService.configurarApariencia(id, configuracionApariencia);

            // Recargar configuraciones para obtener los datos actualizados
            await cargarConfiguraciones();

            if (onSuccess) {
                onSuccess(null, 'configurar_apariencia');
            }

        } catch (err) {
            const errorMessage = err.message || 'Error configurando apariencia';
            setError(errorMessage);

            if (onError) {
                onError(err, 'configurar_apariencia');
            }

            throw err;
        } finally {
            setIsOperating(prev => ({ ...prev, configurarApariencia: false }));
            setOperacionEnCurso(null);
        }
    }, [cargarConfiguraciones, onError, onSuccess]);

    /**
     * Filtrar configuraciones
     */
    const filtrarConfiguraciones = useCallback((filtros) => {
        if (!configuraciones || !Array.isArray(configuraciones)) return [];

        return configuraciones.filter(config => {
            // Filtro por búsqueda (nombre)
            if (filtros.busqueda) {
                const busquedaLower = filtros.busqueda.toLowerCase();
                const coincide = config.nombre.toLowerCase().includes(busquedaLower) ||
                                (config.textoEncabezado && config.textoEncabezado.toLowerCase().includes(busquedaLower));
                if (!coincide) return false;
            }

            // Filtro por estado
            if (filtros.estado && filtros.estado !== 'TODOS') {
                if (filtros.estado === 'ACTIVA' && !config.activo) return false;
                if (filtros.estado === 'INACTIVA' && config.activo) return false;
            }

            // Filtro por sonido
            if (filtros.sonido && filtros.sonido !== 'TODOS') {
                if (filtros.sonido === 'CON_SONIDO' && !config.sonidoActivo) return false;
                if (filtros.sonido === 'SIN_SONIDO' && config.sonidoActivo) return false;
            }

            return true;
        });
    }, [configuraciones]);

    /**
     * Limpiar error
     */
    const limpiarError = useCallback(() => {
        setError(null);
    }, []);

    /**
     * Obtener configuración activa
     */
    const obtenerConfiguracionActiva = useCallback(async () => {
        try {
            const activa = await configuracionPantallaService.obtenerConfiguracionActiva();
            setConfiguracionActiva(activa);
            return activa;
        } catch (err) {
            console.error('Error obteniendo configuración activa:', err);
            return null;
        }
    }, []);

    // Cargar datos automáticamente al montar (sin dependencias problemáticas)
    useEffect(() => {
        let mounted = true;
        
        if (autoLoad && mounted) {
            cargarConfiguraciones().catch(console.error);
        }

        return () => {
            mounted = false;
        };
    }, [autoLoad]); // Solo depende de autoLoad

    return {
        // Estados
        configuraciones,
        configuracionActual,
        configuracionActiva,
        loading,
        error,
        isOperating,
        operacionEnCurso,
        estadisticas,

        // Funciones principales
        cargarConfiguraciones,
        cargarConfiguracion,
        crearConfiguracion,
        actualizarConfiguracion,
        activarConfiguracion,
        configurarSonido,
        configurarApariencia,
        filtrarConfiguraciones,
        limpiarError,
        obtenerConfiguracionActiva
    };
};