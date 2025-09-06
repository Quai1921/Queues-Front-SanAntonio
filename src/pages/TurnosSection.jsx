import React, { useState, useEffect, useRef } from 'react';
import { useTurnos } from '../hooks/useTurnos';
import { useSectores } from '../hooks/useSectores';
import { useAuth } from '../context/AuthContext';
import {
    Assignment,
    Add,
    Search,
    Refresh,
    PlayArrow,
    Queue,
    Business,
    Phone
} from '@mui/icons-material';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import ColaEsperaView from '../components/ColaEsperaView';
import GenerarTurnoModal from '../components/GenerarTurnoModal';
import ConsultarTurnoView from '../components/ConsultarTurnoView';
// import TurnosPendientesView from '../components/TurnosPendientesView';
import { apiClient } from '../services/authService';

/**
 * Componente principal para la gestión de turnos
 */
const TurnosSection = () => {
    const { user, hasRole } = useAuth();
    const [vistaActiva, setVistaActiva] = useState('cola');
    const [sectorSeleccionado, setSectorSeleccionado] = useState(null);
    const [filtros, setFiltros] = useState({
        ciudadano: '',
        estado: 'TODOS',
        fechaDesde: '',
        fechaHasta: ''
    });

    const [modalGenerarAbierto, setModalGenerarAbierto] = useState(false);

    // Hooks
    const { sectores, cargarSectores } = useSectores({ autoLoad: true });

    const esRef = useRef(null);
    

    const {
        colaEspera,
        proximoTurno,
        turnosPendientes,
        loading,
        error,
        isOperating,
        estadisticas,
        refrescarDatosSector,
        llamarTurno,
        iniciarAtencion,
        finalizarAtencion,
        marcarAusente,
        redirigirTurno,
        generarTurno,
        consultarTurnoPorCodigo,
        cargarTurnosCiudadano,
        limpiarError
    } = useTurnos({
        autoLoad: false,
        sectorId: sectorSeleccionado?.id,
        refreshInterval: modalGenerarAbierto ? null : 0,
        onSuccess: (turno, operacion) => {
            // TODO: Mostrar notificación de éxito
            console.log(`${operacion} exitosa:`, turno);
        },
        onError: (error, operacion) => {
            console.error(`Error en ${operacion}:`, error);
        }
    });

    // console.log(proximoTurno)

    useEffect(() => {
        // cerrar anterior si existe
        if (esRef.current) {
            esRef.current.close();
            esRef.current = null;
        }
        if (!sectorSeleccionado?.id) return;

        const base = (apiClient.defaults.baseURL || '').replace(/\/+$/, '');
        const url = `${base}/sectores/${sectorSeleccionado.id}/stream`;

        const es = new EventSource(url);
        esRef.current = es;

        const onUpdate = async () => {
            try {
                await refrescarDatosSector(sectorSeleccionado.id);
            } catch (e) {
                console.error('Error refrescando tras SSE:', e);
            }
        };

        es.addEventListener('connected', () => {});
        es.addEventListener('cola_actualizada', onUpdate);
        es.onerror = () => {};

        return () => {
            es.close();
            esRef.current = null;
        };
    }, [sectorSeleccionado?.id, refrescarDatosSector]);

    // Cargar datos cuando cambie el sector seleccionado
    useEffect(() => {
        if (sectorSeleccionado?.id) {
            refrescarDatosSector(sectorSeleccionado.id);
        }
    }, [sectorSeleccionado, refrescarDatosSector]);

    // Configuración de vistas/tabs
    const vistas = [
        {
            id: 'generar',
            label: 'Generar Turno',
            icon: Add,
            visible: true
        },
        {
            id: 'cola',
            label: 'Cola Actual',
            icon: Queue,
            badge: colaEspera.length,
            visible: true
        },
        {
            id: 'consultar',
            label: 'Consultar',
            icon: Search,
            visible: true
        },
        // {
        //     id: 'pendientes',
        //     label: 'Pendientes',
        //     icon: AccessTime,
        //     badge: turnosPendientes.length,
        //     visible: true
        // }
    ];

    const handleGenerarTurno = async (datosGeneracion) => {
        try {
            const turno = await generarTurno(datosGeneracion);
            console.log('generar exitosa:', turno);
            return turno; // 👈 clave: el modal espera este return
        } catch (error) {
            console.error('Error generando turno:', error);
            throw error;
        }
    };

    const handleConsultarPorCodigo = async (codigo, fecha = null) => {
        try {
            return await consultarTurnoPorCodigo(codigo, fecha);
        } catch (error) {
            console.error('Error consultando por código:', error);
            throw error;
        }
    };

    const handleConsultarPorDni = async (dni) => {
        try {
            return await cargarTurnosCiudadano(dni);
        } catch (error) {
            console.error('Error consultando por DNI:', error);
            throw error;
        }
    };

    // Obtener sectores según el rol del usuario
    const sectoresDisponibles = sectores.filter(sector => {
        const sectorData = sector.sector || sector;

        // Admin ve todos los sectores activos
        if (hasRole('ADMIN')) {
            return sectorData.activo;
        }

        // Responsable de sector solo ve su sector
        if (hasRole('RESPONSABLE_SECTOR') && user?.sectorResponsable) {
            return sectorData.id === user.sectorResponsable.id;
        }

        // Operador ve sectores donde esté asignado
        if (hasRole('OPERADOR') && user?.sectoresAsignados) {
            return user.sectoresAsignados.some(s => s.id === sectorData.id);
        }

        return false;
    });

    // Seleccionar primer sector disponible por defecto
    useEffect(() => {
        if (sectoresDisponibles.length > 0 && !sectorSeleccionado) {
            setSectorSeleccionado(sectoresDisponibles[0].sector || sectoresDisponibles[0]);
        }
    }, [sectoresDisponibles, sectorSeleccionado]);

    const handleRefresh = async () => {
        if (sectorSeleccionado?.id) {
            await refrescarDatosSector(sectorSeleccionado.id);
        }
    };

    const handleLlamarTurno = async (turnoId) => {
        // Validación de entrada
        if (!turnoId || turnoId === undefined) {
            console.error('Error: ID de turno no válido:', turnoId);
            return;
        }

    try {
        await llamarTurno(turnoId, 'Turno llamado desde cola');
    } catch (error) {
        console.error('Error llamando turno:', error);
    }
};

    const handleIniciarAtencion = async (turnoId) => {
        try {
            await iniciarAtencion(turnoId);
        } catch (error) {
            console.error('Error iniciando atención:', error);
        }
    };

    const handleFinalizarAtencion = async (turnoId, observaciones) => {
        try {
            await finalizarAtencion(turnoId, observaciones);
        } catch (error) {
            console.error('Error finalizando atención:', error);
        }
    };

    const handleMarcarAusente = async (turnoId, payloadOrObs) => {
        try {
            const body =
                typeof payloadOrObs === 'string'
                    ? { observaciones: payloadOrObs }
                    : (payloadOrObs || { observaciones: '' });

            await marcarAusente(turnoId, body);
        } catch (error) {
            console.error('Error marcando ausente:', error);
        }
    };

    // useEffect(() => {
    //     console.log('Próximo Turno Debug:', {
    //         exists: !!proximoTurno,
    //         id: proximoTurno?.id,
    //         codigo: proximoTurno?.codigo,
    //         fullObject: proximoTurno
    //     });
    // }, [proximoTurno]);

    // Renderizar selector de sector
    const renderSelectorSector = () => (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className='bg-slate-200 flex justify-center items-center p-3 rounded-full'>
                        <Business sx={{ fontSize: '20px' }} className="text-slate-600" />
                    </div>
                    <div>
                        {/* <label className="block text-sm font-medium text-slate-700 mb-1">
                            Sector de trabajo
                        </label> */}
                        <select
                            value={sectorSeleccionado?.id || ''}
                            onChange={(e) => {
                                const sector = sectoresDisponibles.find(s =>
                                    (s.sector?.id || s.id) === parseInt(e.target.value)
                                );
                                setSectorSeleccionado(sector?.sector || sector);
                            }}
                            className="px-3 h-8 border border-slate-300 rounded-md text-sm min-w-48"
                        >
                            <option value="">Seleccionar sector...</option>
                            {sectoresDisponibles.map(sector => {
                                const sectorData = sector.sector || sector;
                                return (
                                    <option key={sectorData.id} value={sectorData.id}>
                                        {sectorData.codigo} - {sectorData.nombre}
                                    </option>
                                );
                            })}
                        </select>
                    </div>
                </div>

                {sectorSeleccionado && (
                    <div className="flex items-center space-x-4">
                        <div className="text-right">
                            <div className="flex items-center justify-center space-x-2 border-2 border-slate-200 rounded-md px-3 py-1">
                                <div
                                    className="size-3 rounded-full"
                                    style={{ backgroundColor: sectorSeleccionado.color }}
                                />
                                <span className="text-lg font-medium">{sectorSeleccionado.nombre}</span>
                            </div>
                        </div>
                        <button
                            onClick={handleRefresh}
                            disabled={loading}
                            className="flex items-center px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                        >
                            <Refresh className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            <span>Actualizar</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );

    // Renderizar estadísticas
    const renderEstadisticas = () => {
        if (!sectorSeleccionado) return null;
        return (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 bg-white rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-slate-500">En Cola</p>
                            <p className="text-2xl font-semibold">{estadisticas?.colaActual || 0}</p>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-white rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-slate-500">En Espera</p>
                            <p className="text-2xl font-semibold">{estadisticas.enEspera}</p>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-white rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-slate-500">Atendidos</p>
                            <p className="text-2xl font-semibold">{estadisticas?.finalizados || 0}</p>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-white rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-slate-500">Ausentes</p>
                            <p className="text-2xl font-semibold">{estadisticas.ausentes}</p>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-white rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-slate-500">Prioritarios</p>
                            <p className="text-2xl font-semibold">{estadisticas.prioritarios}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Renderizar próximo turno destacado
    const renderProximoTurno = () => {
        if (!proximoTurno || vistaActiva !== 'cola') return null;

        return (
            <div className="bg-[#224666] rounded-xl shadow-lg p-6 mb-6 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Próximo Turno</h3>
                        <div className="flex items-center space-x-6">
                            <div>
                                <p className="text-3xl font-bold">{proximoTurno.codigo}</p>
                                <div className="text-blue-100 text-sm">
                                    {proximoTurno.ciudadano?.nombreCompleto}
                                    <p>DNI: {proximoTurno.ciudadano?.dni}</p>
                                {proximoTurno.esPrioritario && (
                                    <p className="text-yellow-200">Prioritario</p>
                                )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                        {proximoTurno.puedeSerLlamado && proximoTurno.id && (
                            <button
                                onClick={() => handleLlamarTurno(proximoTurno.id)}
                                disabled={isOperating || !proximoTurno.id}
                                className="bg-white text-slate-800 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors disabled:opacity-50"
                            >
                                <Phone className="h-5 w-5 mr-2 inline" />
                                Llamar Turno
                            </button>
                        )}
                        {proximoTurno.puedeIniciarAtencion && (
                            <button
                                onClick={() => handleIniciarAtencion(proximoTurno.id)}
                                disabled={isOperating}
                                className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors disabled:opacity-50"
                            >
                                <PlayArrow className="h-5 w-5 mr-2 inline" />
                                Iniciar Atención
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    // Renderizar tabs de navegación
    const renderTabs = () => (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6">
            <div className="px-6 py-4 border-b border-slate-200">
                <nav className="flex space-x-8">
                    {vistas.filter(vista => vista.visible).map((vista) => {
                        const Icon = vista.icon;
                        const isActive = vistaActiva === vista.id;

                        return (
                            <button
                                key={vista.id}
                                onClick={() => setVistaActiva(vista.id)}
                                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${isActive
                                        ? 'border-slate-500 text-slate-900'
                                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                    }`}
                            >
                                <Icon className="h-5 w-5" />
                                <span>{vista.label}</span>
                                {vista.badge !== undefined && vista.badge > 0 && (
                                    <span className="flex justify-center items-center bg-red-100 text-red-900 text-xs font-medium size-6 rounded-full">
                                        {vista.badge}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </nav>
            </div>
        </div>
    );

    // Renderizar contenido según vista activa
    const renderContenido = () => {
        if (!sectorSeleccionado) {
            return (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12">
                    <div className="text-center">
                        <Business className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-900 mb-2">Seleccionar Sector</h3>
                        <p className="text-slate-600">Selecciona un sector para comenzar a gestionar turnos.</p>
                    </div>
                </div>
            );
        }

        switch (vistaActiva) {
            case 'generar':
                return (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                        <div className="text-center">
                            <EventAvailableIcon className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                            <h3 className="font-medium text-slate-900 mb-2">Generar Nuevo Turno</h3>
                            <p className="text-slate-600 mb-6 text-sm">Crea turnos para ciudadanos nuevos o existentes</p>
                            <button
                                onClick={() => setModalGenerarAbierto(true)}
                                className="bg-[#224666] hover:bg-[#2c3e50] text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center space-x-2 mx-auto"
                            >
                                <Add className="h-5 w-5" />
                                <span>Nuevo Turno</span>
                            </button>
                        </div>
                    </div>
                );

            case 'cola':
                return (
                    <ColaEsperaView
                        colaEspera={colaEspera}
                        proximoTurno={proximoTurno}
                        loading={loading}
                        onLlamarTurno={handleLlamarTurno}
                        onIniciarAtencion={handleIniciarAtencion}
                        onFinalizarAtencion={handleFinalizarAtencion}
                        onMarcarAusente={handleMarcarAusente}
                        onRedirigirTurno={redirigirTurno}
                        onRefresh={handleRefresh}
                        sectores={sectoresDisponibles.map(s => s.sector || s)}
                    />
                );

            case 'consultar':
                return (
                    <ConsultarTurnoView
                        onConsultarPorCodigo={handleConsultarPorCodigo}
                        onConsultarPorDni={handleConsultarPorDni}
                        loading={loading}
                    />
                );

            // case 'pendientes':
            //     return (
            //         <TurnosPendientesView
            //             turnosPendientes={turnosPendientes}
            //             loading={loading}
            //             onLlamarTurno={handleLlamarTurno}
            //             onIniciarAtencion={handleIniciarAtencion}
            //             onFinalizarAtencion={handleFinalizarAtencion}
            //             onMarcarAusente={handleMarcarAusente}
            //             onRedirigirTurno={redirigirTurno}
            //             onRefresh={handleRefresh}
            //             sectores={sectoresDisponibles.map(s => s.sector || s)}
            //         />
            //     );

            default:
                return (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                        <div className="text-center">
                            <Assignment className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-slate-900 mb-2">
                                Vista: {vistas.find(v => v.id === vistaActiva)?.label}
                            </h3>
                            <p className="text-slate-600">Contenido en desarrollo</p>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="w-full">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-lg font-bold text-slate-900">Gestión de Turnos</h1>
                    <p className="text-slate-600 mt-1 text-sm">
                        Administra la cola de atención y operaciones de turnos
                    </p>
                </div>

                {/* Selector de sector */}
                {renderSelectorSector()}

                {/* Estadísticas */}
                {renderEstadisticas()}

                {/* Próximo turno destacado */}
                {renderProximoTurno()}

                {/* Navegación por tabs */}
                {renderTabs()}

                {/* Contenido principal */}
                {renderContenido()}
            </div>

            {/* Modal Generar Turno */}
            <GenerarTurnoModal
                isOpen={modalGenerarAbierto}
                onClose={() => setModalGenerarAbierto(false)}
                onSubmit={handleGenerarTurno}
                sectores={sectoresDisponibles.map(s => s.sector || s)}
                // loading={loading}
            />
        </div>
    );
};

export default TurnosSection;
