import { useState, useEffect, useCallback, useRef } from 'react';
import turnosService from '../services/turnosService';

/**
 * Hook personalizado para manejar turnos en el sistema
 *
 * @param {Object} options - Opciones de configuración
 * @param {boolean} options.autoLoad - Si debe cargar automáticamente al montar (default: false)
 * @param {number} options.sectorId - ID del sector para carga automática
 * @param {Function} options.onError - Callback personalizado para errores
 * @param {Function} options.onSuccess - Callback para operaciones exitosas
 * @param {number} options.refreshInterval - Intervalo de refresco automático en ms
 *
 * @returns {Object} Estado y funciones del hook
 */
export const useTurnos = (options = {}) => {
  const {
    autoLoad = false,
    sectorId = null,
    onError = null,
    onSuccess = null,
    refreshInterval = null,
  } = options;

  // Estados principales
  const [turnos, setTurnos] = useState([]);
  const [turnoActual, setTurnoActual] = useState(null);
  const [colaEspera, setColaEspera] = useState([]);
  const [proximoTurno, setProximoTurno] = useState(null);
  const [turnosPendientes, setTurnosPendientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [operacionEnCurso, setOperacionEnCurso] = useState(null);

  // Mantener callbacks estables sin regenerar funciones
  const onErrorRef = useRef(onError);
  const onSuccessRef = useRef(onSuccess);
  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);
  useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);

  /**
   * Consultar turno por código
   */
  const consultarTurnoPorCodigo = useCallback(async (codigo, fecha = null) => {
    try {
      setLoading(true);
      setError(null);

      const turno = fecha
        ? await turnosService.consultarPorCodigoYFecha(codigo, fecha)
        : await turnosService.consultarPorCodigo(codigo);

      setTurnoActual(turno);
      return turno;
    } catch (err) {
      setError(err.message || 'Error consultando turno');
      onErrorRef.current && onErrorRef.current(err, 'consultar-turno');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Cargar turno por ID
   */
  const cargarTurno = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);

      const turno = await turnosService.obtenerPorId(id);
      setTurnoActual(turno);
      return turno;
    } catch (err) {
      setError(err.message || 'Error cargando turno');
      onErrorRef.current && onErrorRef.current(err, 'cargar-turno');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Cargar cola de espera de un sector
   */
  const cargarColaEspera = useCallback(async (sectorIdArg) => {
    try {
      setLoading(true);
      setError(null);

      const cola = await turnosService.obtenerColaEspera(sectorIdArg);
      setColaEspera(cola);
      return cola;
    } catch (err) {
      setError(err.message || 'Error cargando cola de espera');
      onErrorRef.current && onErrorRef.current(err, 'cargar-cola');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Cargar próximo turno de un sector
   */
  const cargarProximoTurno = useCallback(async (sectorIdArg) => {
    try {
      setError(null);

      const proximo = await turnosService.obtenerProximoTurno(sectorIdArg);
      setProximoTurno(proximo);
      return proximo;
    } catch (err) {
      setError(err.message || 'Error cargando próximo turno');
      onErrorRef.current && onErrorRef.current(err, 'cargar-proximo');
      throw err;
    }
  }, []);

  /**
   * Cargar turnos pendientes de un sector
   */
  const cargarTurnosPendientes = useCallback(async (sectorIdArg) => {
    try {
      setLoading(true);
      setError(null);

      const pendientes = await turnosService.obtenerTurnosPendientes(sectorIdArg);
      setTurnosPendientes(pendientes);
      return pendientes;
    } catch (err) {
      setError(err.message || 'Error cargando turnos pendientes');
      onErrorRef.current && onErrorRef.current(err, 'cargar-pendientes');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Cargar turnos de un ciudadano
   */
  const cargarTurnosCiudadano = useCallback(async (dni) => {
    try {
      setLoading(true);
      setError(null);

      const turnosCiudadano = await turnosService.obtenerTurnosCiudadano(dni);
      setTurnos(turnosCiudadano);
      return turnosCiudadano;
    } catch (err) {
      setError(err.message || 'Error cargando turnos del ciudadano');
      onErrorRef.current && onErrorRef.current(err, 'cargar-turnos-ciudadano');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Cargar turnos del día para un sector
   */
  const cargarTurnosDelDia = useCallback(async (sectorIdArg, fecha) => {
    try {
      setLoading(true);
      setError(null);

      const turnosDelDia = await turnosService.obtenerTurnosDelDia(sectorIdArg, fecha);
      setTurnos(turnosDelDia);
      return turnosDelDia;
    } catch (err) {
      setError(err.message || 'Error cargando turnos del día');
      onErrorRef.current && onErrorRef.current(err, 'cargar-turnos-dia');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Generar nuevo turno
   */
  const generarTurno = useCallback(
    async (datosGeneracion) => {
      try {
        setOperacionEnCurso('generar');
        setError(null);

        const turnoGenerado = await turnosService.generarTurno(datosGeneracion);

        // Actualizar estados relevantes
        if (turnoGenerado.sector?.id === sectorId) {
          setTurnos((prev) => [...prev, turnoGenerado]);
          setColaEspera((prev) => [...prev, turnoGenerado]);
          setTurnosPendientes((prev) => [...prev, turnoGenerado]);
        }

        onSuccessRef.current && onSuccessRef.current(turnoGenerado, 'generar');
        return turnoGenerado;
      } catch (err) {
        setError(err.message || 'Error generando turno');
        onErrorRef.current && onErrorRef.current(err, 'generar');
        throw err;
      } finally {
        setOperacionEnCurso(null);
      }
    },
    [sectorId]
  );

  /**
   * Llamar turno
   */
  const llamarTurno = useCallback(
    async (turnoId, observaciones = '') => {
      try {
        setOperacionEnCurso('llamar');
        setError(null);

        const turnoLlamado = await turnosService.llamarTurno(turnoId, { observaciones });

        const actualizarTurno = (lista) =>
          lista.map((turno) => (turno.id === turnoId ? turnoLlamado : turno));

        setTurnos(actualizarTurno);
        setColaEspera(actualizarTurno);
        setTurnosPendientes(actualizarTurno);

        if (turnoActual?.id === turnoId) {
          setTurnoActual(turnoLlamado);
        }

        onSuccessRef.current && onSuccessRef.current(turnoLlamado, 'llamar');
        return turnoLlamado;
      } catch (err) {
        setError(err.message || 'Error llamando turno');
        onErrorRef.current && onErrorRef.current(err, 'llamar');
        throw err;
      } finally {
        setOperacionEnCurso(null);
      }
    },
    [turnoActual]
  );

  /**
   * Iniciar atención
   */
  const iniciarAtencion = useCallback(
    async (turnoId) => {
      try {
        setOperacionEnCurso('iniciar-atencion');
        setError(null);

        const turnoEnAtencion = await turnosService.iniciarAtencion(turnoId);

        const actualizarTurno = (lista) =>
          lista.map((turno) => (turno.id === turnoId ? turnoEnAtencion : turno));

        setTurnos(actualizarTurno);
        setColaEspera(actualizarTurno);
        setTurnosPendientes((prev) => prev.filter((turno) => turno.id !== turnoId));

        if (turnoActual?.id === turnoId) {
          setTurnoActual(turnoEnAtencion);
        }

        onSuccessRef.current && onSuccessRef.current(turnoEnAtencion, 'iniciar-atencion');
        return turnoEnAtencion;
      } catch (err) {
        setError(err.message || 'Error iniciando atención');
        onErrorRef.current && onErrorRef.current(err, 'iniciar-atencion');
        throw err;
      } finally {
        setOperacionEnCurso(null);
      }
    },
    [turnoActual]
  );

  /**
   * Finalizar atención
   */
  const finalizarAtencion = useCallback(
    async (turnoId, observaciones = '') => {
      try {
        setOperacionEnCurso('finalizar');
        setError(null);

        const turnoFinalizado = await turnosService.finalizarAtencion(turnoId, observaciones);

        const actualizarTurno = (lista) =>
            lista.map((turno) => (turno.id === turnoId ? turnoFinalizado : turno));

        setTurnos(actualizarTurno);
        setColaEspera((prev) => prev.filter((turno) => turno.id !== turnoId));
        setTurnosPendientes((prev) => prev.filter((turno) => turno.id !== turnoId));

        if (turnoActual?.id === turnoId) {
          setTurnoActual(turnoFinalizado);
        }

        onSuccessRef.current && onSuccessRef.current(turnoFinalizado, 'finalizar');
        return turnoFinalizado;
      } catch (err) {
        setError(err.message || 'Error finalizando atención');
        onErrorRef.current && onErrorRef.current(err, 'finalizar');
        throw err;
      } finally {
        setOperacionEnCurso(null);
      }
    },
    [turnoActual]
  );

  /**
   * Marcar turno como ausente
   */
  const marcarAusente = useCallback(
    async (turnoId, observaciones = '') => {
      try {
        setOperacionEnCurso('marcar-ausente');
        setError(null);

        const turnoAusente = await turnosService.marcarAusente(turnoId, observaciones);

        const actualizarTurno = (lista) =>
          lista.map((turno) => (turno.id === turnoId ? turnoAusente : turno));

        setTurnos(actualizarTurno);
        setColaEspera((prev) => prev.filter((turno) => turno.id !== turnoId));
        setTurnosPendientes((prev) => prev.filter((turno) => turno.id !== turnoId));

        if (turnoActual?.id === turnoId) {
          setTurnoActual(turnoAusente);
        }

        onSuccessRef.current && onSuccessRef.current(turnoAusente, 'marcar-ausente');
        return turnoAusente;
      } catch (err) {
        setError(err.message || 'Error marcando como ausente');
        onErrorRef.current && onErrorRef.current(err, 'marcar-ausente');
        throw err;
      } finally {
        setOperacionEnCurso(null);
      }
    },
    [turnoActual]
  );

  /**
   * Redirigir turno
   */
  const redirigirTurno = useCallback(
    async (turnoId, nuevoSectorId, motivo, observaciones = '') => {
      try {
        setOperacionEnCurso('redirigir');
        setError(null);

        const turnoRedirigido = await turnosService.redirigirTurno(
          turnoId,
          nuevoSectorId,
          motivo,
          observaciones
        );

        const actualizarTurno = (lista) =>
          lista.map((turno) => (turno.id === turnoId ? turnoRedirigido : turno));

        setTurnos(actualizarTurno);

        if (turnoRedirigido.sector?.id !== sectorId) {
          setColaEspera((prev) => prev.filter((turno) => turno.id !== turnoId));
          setTurnosPendientes((prev) => prev.filter((turno) => turno.id !== turnoId));
        } else {
          setColaEspera(actualizarTurno);
          setTurnosPendientes(actualizarTurno);
        }

        if (turnoActual?.id === turnoId) {
          setTurnoActual(turnoRedirigido);
        }

        onSuccessRef.current && onSuccessRef.current(turnoRedirigido, 'redirigir');
        return turnoRedirigido;
      } catch (err) {
        setError(err.message || 'Error redirigiendo turno');
        onErrorRef.current && onErrorRef.current(err, 'redirigir');
        throw err;
      } finally {
        setOperacionEnCurso(null);
      }
    },
    [turnoActual, sectorId]
  );

  /**
   * Refrescar datos del sector (cola, próximo, pendientes)
   */
  // const refrescarDatosSector = useCallback(async (sectorIdArg) => {
  //   try {
  //     setError(null);

  //     const [cola, proximo, pendientes] = await Promise.all([
  //       turnosService.obtenerColaEspera(sectorIdArg),
  //       turnosService.obtenerProximoTurno(sectorIdArg),
  //       turnosService.obtenerTurnosPendientes(sectorIdArg),
  //     ]);

  //     setColaEspera(cola);
  //     setProximoTurno(proximo);
  //     setTurnosPendientes(pendientes);

  //     return { cola, proximo, pendientes };
  //   } catch (err) {
  //     setError(err.message || 'Error refrescando datos');
  //     onErrorRef.current && onErrorRef.current(err, 'refrescar');
  //     throw err;
  //   }
  // }, []);
  const refrescarDatosSector = useCallback(async (sectorIdArg) => {
    try {
      setError(null);

      const hoy = new Date();
      const fechaStr = [
        hoy.getFullYear(),
        String(hoy.getMonth() + 1).padStart(2, '0'),
        String(hoy.getDate()).padStart(2, '0'),
      ].join('-');

      const [cola, proximo, pendientes, delDia] = await Promise.all([
        turnosService.obtenerColaEspera(sectorIdArg),
        turnosService.obtenerProximoTurno(sectorIdArg),
        turnosService.obtenerTurnosPendientes(sectorIdArg), // hoy duplica la cola, pero lo dejamos
        turnosService.obtenerTurnosDelDia(sectorIdArg, fechaStr),
      ]);

      setColaEspera(cola);
      setProximoTurno(proximo);
      setTurnosPendientes(pendientes);
      setTurnos(delDia); // 👈 clave para estadísticas del día

      return { cola, proximo, pendientes, delDia };
    } catch (err) {
      setError(err.message || 'Error refrescando datos');
      onErrorRef.current && onErrorRef.current(err, 'refrescar');
      throw err;
    }
  }, []);

  /**
   * Limpiar estados
   */
  const limpiarEstados = useCallback(() => {
    setTurnos([]);
    setTurnoActual(null);
    setColaEspera([]);
    setProximoTurno(null);
    setTurnosPendientes([]);
    setError(null);
  }, []);

  /**
   * Limpiar errores
   */
  const limpiarError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Filtrar turnos según criterios
   */
  const filtrarTurnos = useCallback((listaTurnos, filtros = {}) => {
    const { estado, ciudadano, fechaDesde, fechaHasta } = filtros;

    return listaTurnos.filter((turno) => {
      if (estado && estado !== 'TODOS') {
        if (turno.estado !== estado) return false;
      }

      if (ciudadano && ciudadano.trim()) {
        const texto = ciudadano.toLowerCase();
        const coincide =
          turno.ciudadano?.dni?.includes(texto) ||
          turno.ciudadano?.nombreCompleto?.toLowerCase().includes(texto);
        if (!coincide) return false;
      }

      if (fechaDesde) {
        const fechaTurno = new Date(turno.fechaHoraCreacion).toDateString();
        const fechaDesdeObj = new Date(fechaDesde).toDateString();
        if (fechaTurno < fechaDesdeObj) return false;
      }

      if (fechaHasta) {
        const fechaTurno = new Date(turno.fechaHoraCreacion).toDateString();
        const fechaHastaObj = new Date(fechaHasta).toDateString();
        if (fechaTurno > fechaHastaObj) return false;
      }

      return true;
    });
  }, []);

  // Efecto para carga automática al montar / cambiar sector
  useEffect(() => {
    if (autoLoad && sectorId) {
      refrescarDatosSector(sectorId);
    }
    // Dependemos solo del id/flag; el callback es estable
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoLoad, sectorId]);

  // Efecto para refresco automático periódico
  useEffect(() => {
    if (refreshInterval && sectorId) {
      const interval = setInterval(() => {
        refrescarDatosSector(sectorId).catch(console.error);
      }, refreshInterval);

      return () => clearInterval(interval);
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshInterval, sectorId]);


  const enEsperaCola = colaEspera.filter(
    t => t && ['GENERADO', 'REDIRIGIDO'].includes(t.estado)
  ).length;

  const prioritariosEnCola = colaEspera.filter(t => t?.esPrioritario).length;

  // Estadísticas derivadas
  // const estadisticas = {
  //   totalTurnos: turnos.length,
  //   enEspera: turnos.filter((t) => t.estado === 'GENERADO').length,
  //   llamados: turnos.filter((t) => t.estado === 'LLAMADO').length,
  //   enAtencion: turnos.filter((t) => t.estado === 'EN_ATENCION').length,
  //   finalizados: turnos.filter((t) => t.estado === 'FINALIZADO').length,
  //   ausentes: turnos.filter((t) => t.estado === 'AUSENTE').length,
  //   redirigidos: turnos.filter((t) => t.estado === 'REDIRIGIDO').length,
  //   prioritarios: turnos.filter((t) => t.esPrioritario).length,
  //   colaActual: colaEspera.length, // ojo: en la UI usar este nombre o alinearlo
  //   pendientesTotal: turnosPendientes.length,
  // };
  const estadisticas = {
    // universo del día (delDia -> setTurnos)
    totalTurnos: turnos.length,
    llamados: turnos.filter(t => t.estado === 'LLAMADO').length,
    enAtencion: turnos.filter(t => t.estado === 'EN_ATENCION').length,
    finalizados: turnos.filter(t => t.estado === 'FINALIZADO').length,
    ausentes: turnos.filter(t => t.estado === 'AUSENTE').length,
    redirigidos: turnos.filter(t => t.estado === 'REDIRIGIDO').length,

    // universo de la cola (lo que hoy espera y ve el operador)
    colaActual: colaEspera.length,
    enEspera: enEsperaCola,
    prioritarios: prioritariosEnCola,

    // si quisieras mostrarlo en alguna parte
    pendientesTotal: turnosPendientes.length,
  };

  return {
    // Estados principales
    turnos,
    turnoActual,
    colaEspera,
    proximoTurno,
    turnosPendientes,
    loading,
    error,
    operacionEnCurso,

    // Acciones de consulta
    consultarTurnoPorCodigo,
    cargarTurno,
    cargarColaEspera,
    cargarProximoTurno,
    cargarTurnosPendientes,
    cargarTurnosCiudadano,
    cargarTurnosDelDia,

    // Acciones de operación
    generarTurno,
    llamarTurno,
    iniciarAtencion,
    finalizarAtencion,
    marcarAusente,
    redirigirTurno,

    // Utilidades
    refrescarDatosSector,
    filtrarTurnos,
    limpiarEstados,
    limpiarError,

    // Información del estado
    isLoading: loading,
    hasError: !!error,
    isEmpty: turnos.length === 0,
    isOperating: !!operacionEnCurso,
    hasProximoTurno: !!proximoTurno,
    hasColaEspera: colaEspera.length > 0,

    // Datos derivados
    estadisticas,
  };
};

export default useTurnos;
