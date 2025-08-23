import { useState, useEffect, useCallback } from 'react';
import statisticsService from '../services/statisticsService';

/**
 * Hook personalizado para manejar estadísticas del dashboard
 * 
 * @param {Object} options - Opciones de configuración
 * @param {boolean} options.autoLoad - Si debe cargar automáticamente al montar (default: true)
 * @param {number} options.refreshInterval - Intervalo de actualización en ms (default: 30000 = 30s)
 * @param {Function} options.onError - Callback personalizado para errores
 * 
 * @returns {Object} Estado y funciones del hook
 */
export const useStatistics = (options = {}) => {
    const {
        autoLoad = true,
        refreshInterval = 30000,
        onError = null
    } = options;

    const stableOnError = useCallback(onError || (() => {}), []);

    // Estados principales
    const [statistics, setStatistics] = useState({
        turnos: {
            turnosPendientes: 0,
            turnosAtendidosHoy: 0,
            turnosGenerados: 0,
            tiempoPromedio: 0,
            eficiencia: 0
        },
        empleados: {
            total: 0,
            activos: 0,
            inactivos: 0,
            porcentajeActivos: 0
        },
        fechaActualizacion: null
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastRefresh, setLastRefresh] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    

    /**
     * Cargar estadísticas del dashboard
     */
    const loadStatistics = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const stats = await statisticsService.getDashboardStats();

            setStatistics(stats);
            setLastRefresh(new Date());

        } catch (err) {
            console.error('❌ Error cargando estadísticas:', err);
            setError(err.message || 'Error cargando estadísticas');

            // Ejecutar callback de error estable
            stableOnError(err);
        } finally {
            setLoading(false);
        }
    }, [stableOnError]);

    /**
     * Refrescar estadísticas manualmente
     */
    const refreshStatistics = useCallback(async () => {
        try {
            setRefreshing(true);
            setError(null);

            // Duración mínima de 2 segundos
            const startTime = Date.now();
            const minRefreshTime = 2000; // 2 segundos

            // Cargar estadísticas en paralelo con el tiempo mínimo
            const statsPromise = statisticsService.getDashboardStats();
            const minTimePromise = new Promise(resolve =>
                setTimeout(resolve, minRefreshTime)
            );

            // Esperar ambas: las estadísticas Y el tiempo mínimo
            const [stats] = await Promise.all([statsPromise, minTimePromise]);

            setStatistics(stats);
            setLastRefresh(new Date());

        } catch (err) {
            console.error('❌ Error refrescando estadísticas:', err);
            setError(err.message || 'Error refrescando estadísticas');

            if (onError) {
                onError(err);
            }
        } finally {
            setRefreshing(false);
        }
    }, [onError]);

    /**
     * Limpiar errores
     */
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Efecto para carga automática inicial
    useEffect(() => {
        if (autoLoad) {
            loadStatistics();
        }
    }, [autoLoad, loadStatistics]);

    // Efecto para actualización automática
    useEffect(() => {
        if (!refreshInterval || refreshInterval <= 0) {
            return;
        }

        const interval = setInterval(() => {
            // Usar una referencia estable para evitar dependencias
            statisticsService.getDashboardStats()
                .then(stats => {
                    setStatistics(stats);
                    setLastRefresh(new Date());
                    setError(null);
                })
                .catch(err => {
                    console.error('❌ Error en actualización automática:', err);
                    setError(err.message || 'Error cargando estadísticas');
                });
        }, refreshInterval);

        return () => {
            clearInterval(interval);
        };
    }, [refreshInterval]);

    // Funciones de utilidad para formatear datos
    const formatters = {
        /**
         * Formatear tiempo promedio
         * @param {number} minutos - Tiempo en minutos
         * @returns {string} - Tiempo formateado
         */
        formatTime: (minutos) => statisticsService.formatearTiempo(minutos),

        /**
         * Formatear porcentaje
         * @param {number} valor - Valor numérico
         * @returns {string} - Porcentaje formateado
         */
        formatPercentage: (valor) => `${valor || 0}%`,

        /**
         * Formatear número con separadores
         * @param {number} numero - Número a formatear
         * @returns {string} - Número formateado
         */
        formatNumber: (numero) => {
            if (numero === null || numero === undefined) return '0';
            return new Intl.NumberFormat('es-AR').format(numero);
        },

        /**
         * Obtener estado del tiempo promedio (bueno, regular, malo)
         * @param {number} minutos - Tiempo en minutos
         * @returns {string} - Estado ('good', 'warning', 'danger')
         */
        getTimeStatus: (minutos) => {
            if (!minutos || minutos === 0) return 'neutral';
            if (minutos <= 10) return 'good';
            if (minutos <= 20) return 'warning';
            return 'danger';
        },

        /**
         * Obtener estado de la eficiencia
         * @param {number} eficiencia - Porcentaje de eficiencia
         * @returns {string} - Estado ('good', 'warning', 'danger')
         */
        getEfficiencyStatus: (eficiencia) => {
            if (!eficiencia || eficiencia === 0) return 'neutral';
            if (eficiencia >= 80) return 'good';
            if (eficiencia >= 60) return 'warning';
            return 'danger';
        }
    };

    // Estadísticas derivadas y calculadas
    const derived = {
        /**
         * Indica si hay datos disponibles
         */
        hasData: statistics.fechaActualizacion !== null,

        /**
         * Tiempo desde la última actualización
         */
        timeSinceRefresh: lastRefresh ? Date.now() - lastRefresh.getTime() : null,

        /**
         * Indica si los datos están obsoletos (más de 5 minutos)
         */
        isDataStale: lastRefresh ? (Date.now() - lastRefresh.getTime()) > 300000 : true,

        /**
         * Total de turnos gestionados hoy
         */
        totalTurnosGestionados: statistics.turnos.turnosAtendidosHoy +
            statistics.turnos.turnosPendientes,

        /**
         * Porcentaje de empleados activos
         */
        porcentajeEmpleadosActivos: statistics.empleados.total > 0
            ? Math.round((statistics.empleados.activos / statistics.empleados.total) * 100)
            : 0
    };

    return {
        // Estados principales
        statistics,
        loading,
        error,
        lastRefresh,
        refreshing,

        // Acciones
        loadStatistics,
        refreshStatistics,
        clearError,

        // Utilidades
        formatters,
        derived,

        // Información del estado
        isLoading: loading || refreshing,
        hasError: !!error,
        isEmpty: !derived.hasData
    };
};

export default useStatistics;