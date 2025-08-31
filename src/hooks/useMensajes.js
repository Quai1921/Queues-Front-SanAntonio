import { useState, useCallback, useEffect } from 'react';
import mensajeInstitucionalService from '../services/mensajeInstitucionalService';

/**
 * Hook personalizado para gestión de mensajes institucionales
 * Maneja estado, operaciones CRUD y filtrado de mensajes
 */
export const useMensajes = ({ 
    configuracionId = null, 
    autoLoad = true, 
    onSuccess = null, 
    onError = null 
} = {}) => {
    
    // Estados principales
    const [mensajes, setMensajes] = useState([]);
    const [mensajeActual, setMensajeActual] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Estados de operaciones
    const [isOperating, setIsOperating] = useState({
        crear: false,
        activar: false,
        desactivar: false,
        eliminar: false,
        establecerVigencia: false
    });
    const [operacionEnCurso, setOperacionEnCurso] = useState(null);

    // Estadísticas derivadas
    const [estadisticas, setEstadisticas] = useState({
        total: 0,
        activos: 0,
        inactivos: 0,
        porTipo: { texto: 0, imagen: 0, video: 0 },
        vigentes: 0
    });

    // Auto-carga inicial
    useEffect(() => {
        if (autoLoad && configuracionId) {
            cargarMensajes();
        }
    }, [configuracionId, autoLoad]); // Removemos cargarMensajes de las dependencias

    // ==========================================
    // MÉTODOS DE CARGA DE DATOS
    // ==========================================

    /**
     * Cargar mensajes por configuración
     */
    const cargarMensajes = useCallback(async () => {
        if (!configuracionId) return;

        try {
            setLoading(true);
            setError(null);

            const data = await mensajeInstitucionalService.obtenerMensajesAdminPorConfiguracion(configuracionId);
            setMensajes(data || []);
            setEstadisticas(calcularEstadisticas(data || []));

        } catch (err) {
            const errorMessage = err.message || 'Error cargando mensajes';
            setError(errorMessage);

            if (onError) {
                onError(err, 'cargar');
            }
        } finally {
            setLoading(false);
        }
    }, [configuracionId]); // Solo configuracionId como dependencia

    /**
     * Cargar mensaje específico por ID
     */
    const cargarMensaje = useCallback(async (id) => {
        try {
            setLoading(true);
            setError(null);

            const data = await mensajeInstitucionalService.obtenerPorId(id);
            setMensajeActual(data);

            return data;
        } catch (err) {
            const errorMessage = err.message || 'Error cargando mensaje';
            setError(errorMessage);

            if (onError) {
                onError(err, 'cargar_detalle');
            }

            throw err;
        } finally {
            setLoading(false);
        }
    }, []); // Sin dependencias externas

    /**
     * Cargar mensajes vigentes (para pantallas públicas)
     */
    const cargarMensajesVigentes = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const data = await mensajeInstitucionalService.obtenerMensajesVigentes();
            return data || [];

        } catch (err) {
            const errorMessage = err.message || 'Error cargando mensajes vigentes';
            setError(errorMessage);

            if (onError) {
                onError(err, 'cargar_vigentes');
            }

            throw err;
        } finally {
            setLoading(false);
        }
    }, []); // Sin dependencias externas

    // ==========================================
    // MÉTODOS DE GESTIÓN CRUD
    // ==========================================

    /**
     * Crear nuevo mensaje
     */
    const crearMensaje = useCallback(async (mensajeData) => {
        if (!configuracionId) {
            throw new Error('ID de configuración requerido para crear mensaje');
        }

        try {
            setIsOperating(prev => ({ ...prev, crear: true }));
            setOperacionEnCurso('crear');
            setError(null);

            const nuevoMensaje = await mensajeInstitucionalService.crear(configuracionId, mensajeData);

            // Actualizar lista local
            setMensajes(prev => {
                const nuevaLista = [...prev, nuevoMensaje];
                setEstadisticas(calcularEstadisticas(nuevaLista));
                return nuevaLista;
            });

            if (onSuccess) {
                onSuccess(nuevoMensaje, 'crear');
            }

            return nuevoMensaje;

        } catch (err) {
            const errorMessage = err.message || 'Error creando mensaje';
            setError(errorMessage);

            if (onError) {
                onError(err, 'crear');
            }

            throw err;
        } finally {
            setIsOperating(prev => ({ ...prev, crear: false }));
            setOperacionEnCurso(null);
        }
    }, [configuracionId]); // Solo configuracionId como dependencia

    /**
     * Activar mensaje
     */
    const activarMensaje = useCallback(async (id) => {
        try {
            setIsOperating(prev => ({ ...prev, activar: true }));
            setOperacionEnCurso('activar');
            setError(null);

            const mensajeActualizado = await mensajeInstitucionalService.activar(id);

            // Actualizar en lista local
            setMensajes(prev => {
                const nuevaLista = prev.map(mensaje => 
                    mensaje.id === id ? mensajeActualizado : mensaje
                );
                setEstadisticas(calcularEstadisticas(nuevaLista));
                return nuevaLista;
            });

            if (onSuccess) {
                onSuccess(mensajeActualizado, 'activar');
            }

            return mensajeActualizado;

        } catch (err) {
            const errorMessage = err.message || 'Error activando mensaje';
            setError(errorMessage);

            if (onError) {
                onError(err, 'activar');
            }

            throw err;
        } finally {
            setIsOperating(prev => ({ ...prev, activar: false }));
            setOperacionEnCurso(null);
        }
    }, []); // Sin dependencias externas

    /**
     * Desactivar mensaje
     */
    const desactivarMensaje = useCallback(async (id) => {
        try {
            setIsOperating(prev => ({ ...prev, desactivar: true }));
            setOperacionEnCurso('desactivar');
            setError(null);

            const mensajeActualizado = await mensajeInstitucionalService.desactivar(id);

            // Actualizar en lista local
            setMensajes(prev => {
                const nuevaLista = prev.map(mensaje => 
                    mensaje.id === id ? mensajeActualizado : mensaje
                );
                setEstadisticas(calcularEstadisticas(nuevaLista));
                return nuevaLista;
            });

            if (onSuccess) {
                onSuccess(mensajeActualizado, 'desactivar');
            }

            return mensajeActualizado;

        } catch (err) {
            const errorMessage = err.message || 'Error desactivando mensaje';
            setError(errorMessage);

            if (onError) {
                onError(err, 'desactivar');
            }

            throw err;
        } finally {
            setIsOperating(prev => ({ ...prev, desactivar: false }));
            setOperacionEnCurso(null);
        }
    }, []); // Sin dependencias externas

    /**
     * Establecer vigencia de mensaje
     */
    const establecerVigencia = useCallback(async (id, vigenciaData) => {
        try {
            setIsOperating(prev => ({ ...prev, establecerVigencia: true }));
            setOperacionEnCurso('establecer_vigencia');
            setError(null);

            const mensajeActualizado = await mensajeInstitucionalService.establecerVigencia(id, vigenciaData);

            // Actualizar en lista local
            setMensajes(prev => {
                const nuevaLista = prev.map(mensaje => 
                    mensaje.id === id ? mensajeActualizado : mensaje
                );
                setEstadisticas(calcularEstadisticas(nuevaLista));
                return nuevaLista;
            });

            if (onSuccess) {
                onSuccess(mensajeActualizado, 'establecer_vigencia');
            }

            return mensajeActualizado;

        } catch (err) {
            const errorMessage = err.message || 'Error estableciendo vigencia';
            setError(errorMessage);

            if (onError) {
                onError(err, 'establecer_vigencia');
            }

            throw err;
        } finally {
            setIsOperating(prev => ({ ...prev, establecerVigencia: false }));
            setOperacionEnCurso(null);
        }
    }, []); // Sin dependencias externas

    /**
     * Eliminar mensaje
     */
    const eliminarMensaje = useCallback(async (id) => {
        try {
            setIsOperating(prev => ({ ...prev, eliminar: true }));
            setOperacionEnCurso('eliminar');
            setError(null);

            await mensajeInstitucionalService.eliminar(id);

            // Eliminar de lista local
            setMensajes(prev => {
                const nuevaLista = prev.filter(mensaje => mensaje.id !== id);
                setEstadisticas(calcularEstadisticas(nuevaLista));
                return nuevaLista;
            });

            if (onSuccess) {
                onSuccess(null, 'eliminar');
            }

        } catch (err) {
            const errorMessage = err.message || 'Error eliminando mensaje';
            setError(errorMessage);

            if (onError) {
                onError(err, 'eliminar');
            }

            throw err;
        } finally {
            setIsOperating(prev => ({ ...prev, eliminar: false }));
            setOperacionEnCurso(null);
        }
    }, []); // Sin dependencias externas

    // ==========================================
    // MÉTODOS DE UTILIDAD
    // ==========================================

    /**
     * Filtrar mensajes según criterios
     */
    const filtrarMensajes = useCallback((filtros) => {
        if (!mensajes || !Array.isArray(mensajes)) return [];

        return mensajes.filter(mensaje => {
            // Filtro por búsqueda (título o contenido)
            if (filtros.busqueda) {
                const busquedaLower = filtros.busqueda.toLowerCase();
                const titulo = (mensaje.titulo || '').toLowerCase();
                const contenido = (mensaje.contenido || '').toLowerCase();
                
                if (!titulo.includes(busquedaLower) && !contenido.includes(busquedaLower)) {
                    return false;
                }
            }

            // Filtro por estado
            if (filtros.estado && filtros.estado !== 'todos') {
                if (filtros.estado === 'activo' && !mensaje.activo) return false;
                if (filtros.estado === 'inactivo' && mensaje.activo) return false;
            }

            // Filtro por tipo
            if (filtros.tipo && filtros.tipo !== 'todos') {
                if (mensaje.tipo !== filtros.tipo.toUpperCase()) return false;
            }

            // Filtro por vigencia
            if (filtros.vigencia && filtros.vigencia !== 'todos') {
                const esVigente = mensajeInstitucionalService.esVigente(mensaje);
                if (filtros.vigencia === 'vigente' && !esVigente) return false;
                if (filtros.vigencia === 'no_vigente' && esVigente) return false;
            }

            return true;
        });
    }, [mensajes]);

    /**
     * Calcular estadísticas de mensajes
     */
    const calcularEstadisticas = useCallback((listaMensajes = []) => {
        const stats = {
            total: listaMensajes.length,
            activos: listaMensajes.filter(m => m.activo).length,
            inactivos: listaMensajes.filter(m => !m.activo).length,
            porTipo: {
                texto: listaMensajes.filter(m => m.tipo === 'TEXTO').length,
                imagen: listaMensajes.filter(m => m.tipo === 'IMAGEN').length,
                video: listaMensajes.filter(m => m.tipo === 'VIDEO').length
            },
            vigentes: listaMensajes.filter(m => mensajeInstitucionalService.esVigente(m)).length
        };

        return stats;
    }, []);

    /**
     * Limpiar error actual
     */
    const limpiarError = useCallback(() => {
        setError(null);
    }, []);

    /**
     * Resetear estado del hook
     */
    const resetearEstado = useCallback(() => {
        setMensajes([]);
        setMensajeActual(null);
        setError(null);
        setEstadisticas({
            total: 0,
            activos: 0,
            inactivos: 0,
            porTipo: { texto: 0, imagen: 0, video: 0 },
            vigentes: 0
        });
    }, []);

    // ==========================================
    // VALORES DE RETORNO
    // ==========================================

    return {
        // Estados principales
        mensajes,
        mensajeActual,
        loading,
        error,
        estadisticas,

        // Estados de operaciones
        isOperating,
        operacionEnCurso,

        // Métodos de carga
        cargarMensajes,
        cargarMensaje,
        cargarMensajesVigentes,

        // Métodos CRUD
        crearMensaje,
        activarMensaje,
        desactivarMensaje,
        establecerVigencia,
        eliminarMensaje,

        // Métodos de utilidad
        filtrarMensajes,
        limpiarError,
        resetearEstado,

        // Funciones del servicio expuestas
        validarMensaje: mensajeInstitucionalService.validarMensaje,
        esVigente: mensajeInstitucionalService.esVigente,
        getTipoLabel: mensajeInstitucionalService.getTipoLabel,
        getTipoColor: mensajeInstitucionalService.getTipoColor
    };
};