import React, { useState, useEffect, useCallback } from 'react';
import {
    Schedule,
    Add,
    Search,
    FilterList,
    Refresh,
    Business,
    AccessTime,
    CalendarMonth,
    CheckCircle,
    Cancel,
    Edit,
    Delete,
    Clear,
    Warning,
    Info
} from '@mui/icons-material';
import EditDocumentIcon from '@mui/icons-material/EditDocument';
import CrearHorarioModal from '../components/CrearHorarioModal';
import EditarHorarioModal from '../components/EditarHorarioModal';
import horariosService from '../services/horarioService';
import sectoresService from '../services/sectoresService';
import ConfirmarAccionModal from '../components/ConfirmarAccionModal';

/**
 * Componente principal para la gestión de horarios de sectores especiales en AdminPanel
 */
const HorariosSection = () => {
    // Estados principales
    const [sectores, setSectores] = useState([]);
    const [sectorSeleccionado, setSectorSeleccionado] = useState(null);
    const [horarios, setHorarios] = useState([]);
    const [horariosFiltrados, setHorariosFiltrados] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingSectores, setLoadingSectores] = useState(false);
    const [estadisticas, setEstadisticas] = useState({
        totalHorarios: 0,
        horariosActivos: 0,
        horariosInactivos: 0,
        diasCubiertos: 0
    });

    const [modalConfirmarAbierto, setModalConfirmarAbierto] = useState(false);
    const [accionConfirmar, setAccionConfirmar] = useState(null);
    const [horarioParaAccion, setHorarioParaAccion] = useState(null);
    const [loadingAccion, setLoadingAccion] = useState(false);


    // Estados de filtros
    const [filtros, setFiltros] = useState({
        busqueda: '',
        dia: 'TODOS',
        estado: 'TODOS'
    });

    // Estados de modales
    const [modalCrearAbierto, setModalCrearAbierto] = useState(false);
    const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
    const [horarioSeleccionado, setHorarioSeleccionado] = useState(null);

    // Estados de carga
    const [loadingCrear, setLoadingCrear] = useState(false);
    const [loadingEditar, setLoadingEditar] = useState(false);

    // Estado de notificaciones
    const [notificacion, setNotificacion] = useState(null);

    // Cargar datos iniciales
    useEffect(() => {
        cargarSectoresEspeciales();
    }, []);

    const cargarSectoresEspeciales = async () => {
        try {
            setLoadingSectores(true);
            const sectoresEspeciales = await sectoresService.obtenerEspeciales();

            // Verificar que efectivamente sean especiales
            const sectoresFiltrados = sectoresEspeciales.filter(sector => {
                const esEspecial = sector.tipoSector === 'ESPECIAL' || sector.requiereCitaPrevia === true;
                return esEspecial;
            });

            setSectores(sectoresFiltrados);

        } catch (error) {
            console.error('Error cargando sectores especiales:', error);
            mostrarNotificacion('Error al cargar sectores especiales', 'error');
        } finally {
            setLoadingSectores(false);
        }
    };

    const actualizarSectores = async () => {
        await cargarSectoresEspeciales();
        // Si el sector seleccionado ya no es especial, deseleccionarlo
        if (sectorSeleccionado) {
            const sectorActualizado = sectores.find(s => s.id === sectorSeleccionado.id);
            if (!sectorActualizado) {
                setSectorSeleccionado(null);
                setHorarios([]);
                setHorariosFiltrados([]);
            }
        }
    };

    const cargarHorarios = async (sectorId) => {
        try {
            setLoading(true);
            const horariosData = await horariosService.listarPorSector(sectorId);

            const horariosFormateados = horariosData.map(horario =>
                horariosService.formatearParaUI(horario)
            );

            setHorarios(horariosFormateados);
            calcularEstadisticas(horariosFormateados);

        } catch (error) {
            console.error('Error cargando horarios:', error);
            mostrarNotificacion('Error al cargar horarios', 'error');
        } finally {
            setLoading(false);
        }
    };

    const calcularEstadisticas = (horarios) => {
        const horariosActivos = horarios.filter(h => h.activo);
        const diasUnicos = [...new Set(horarios.map(h => h.diaSemana))];

        setEstadisticas({
            totalHorarios: horarios.length,
            horariosActivos: horariosActivos.length,
            horariosInactivos: horarios.length - horariosActivos.length,
            diasCubiertos: diasUnicos.length
        });
    };

    const aplicarFiltros = useCallback(() => {
        if (horarios.length === 0) {
            setHorariosFiltrados([]);
            return;
        }

        let horariosFilt = [...horarios];

        // Filtro por búsqueda
        if (filtros.busqueda) {
            const busqueda = filtros.busqueda.toLowerCase();
            horariosFilt = horariosFilt.filter(horario =>
                getDiaLabel(horario.diaSemana).toLowerCase().includes(busqueda) ||
                horario.horaInicio.includes(busqueda) ||
                horario.horaFin.includes(busqueda) ||
                (horario.observaciones && horario.observaciones.toLowerCase().includes(busqueda))
            );
        }

        // Filtro por día
        if (filtros.dia !== 'TODOS') {
            horariosFilt = horariosFilt.filter(horario => horario.diaSemana === filtros.dia);
        }

        // Filtro por estado
        if (filtros.estado !== 'TODOS') {
            horariosFilt = horariosFilt.filter(horario => {
                if (filtros.estado === 'ACTIVO') {
                    return horario.activo === true;
                } else if (filtros.estado === 'INACTIVO') {
                    return horario.activo === false;
                }
                return true;
            });
        }

        setHorariosFiltrados(horariosFilt);
    }, [horarios, filtros]); // Mantener las dependencias

    // Aplicar filtros cuando cambian
    useEffect(() => {
        aplicarFiltros();
    }, [aplicarFiltros]);

    const handleSelectorSector = (sector) => {
        setSectorSeleccionado(sector);
        if (sector) {
            cargarHorarios(sector.id);
        } else {
            setHorarios([]);
            setHorariosFiltrados([]);
        }
    };

    const handleCrearHorario = async (datosHorario) => {
        try {
            setLoadingCrear(true);
            await horariosService.crear(sectorSeleccionado.id, datosHorario);
            await cargarHorarios(sectorSeleccionado.id);
            setModalCrearAbierto(false);
            mostrarNotificacion('Horario creado exitosamente');
        } catch (error) {
            console.error('Error creando horario:', error);
            mostrarNotificacion(error.message || 'Error al crear horario', 'error');
        } finally {
            setLoadingCrear(false);
        }
    };

    const handleEditarHorario = (horario) => {
        setHorarioSeleccionado(horario);
        setModalEditarAbierto(true);
    };

    const handleActualizarHorario = async (datosActualizados) => {
        try {
            setLoadingEditar(true);
            await horariosService.actualizar(sectorSeleccionado.id, horarioSeleccionado.id, datosActualizados);
            await cargarHorarios(sectorSeleccionado.id);
            setModalEditarAbierto(false);
            setHorarioSeleccionado(null);
            mostrarNotificacion('Horario actualizado exitosamente');
        } catch (error) {
            console.error('Error actualizando horario:', error);
            mostrarNotificacion(error.message || 'Error al actualizar horario', 'error');
        } finally {
            setLoadingEditar(false);
        }
    };

    const handleCambiarEstado = (horario) => {
        setHorarioParaAccion(horario);
        setAccionConfirmar(horario.activo ? 'desactivar' : 'activar');
        setModalConfirmarAbierto(true);
    };

    const confirmarAccion = async () => {
        if (!horarioParaAccion || !accionConfirmar) return;

        try {
            setLoadingAccion(true);
            if (accionConfirmar === 'desactivar') {
                await horariosService.desactivar(sectorSeleccionado.id, horarioParaAccion.id);
                mostrarNotificacion('Horario desactivado exitosamente');
            } else {
                await horariosService.activar(sectorSeleccionado.id, horarioParaAccion.id);
                mostrarNotificacion('Horario activado exitosamente');
            }
            await cargarHorarios(sectorSeleccionado.id);
            setModalConfirmarAbierto(false);
        } catch (error) {
            console.error('Error cambiando estado:', error);
            mostrarNotificacion(error.message || 'Error al cambiar estado del horario', 'error');
        } finally {
            setLoadingAccion(false);
            setHorarioParaAccion(null);
            setAccionConfirmar(null);
        }
    };

    const mostrarNotificacion = (mensaje, tipo = 'success') => {
        setNotificacion({ mensaje, tipo });
        setTimeout(() => setNotificacion(null), 4000);
    };

    const getDiaLabel = (dia) => {
        const dias = {
            'MONDAY': 'Lunes',
            'TUESDAY': 'Martes',
            'WEDNESDAY': 'Miércoles',
            'THURSDAY': 'Jueves',
            'FRIDAY': 'Viernes',
            'SATURDAY': 'Sábado',
            'SUNDAY': 'Domingo'
        };
        return dias[dia] || dia;
    };

    const formatearHora = (hora) => {
        return hora.substring(0, 5); // HH:MM
    };

    return (
        <div>
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

            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div>
                    <h3 className="text-lg font-semibold text-slate-900">Gestión de Horarios</h3>
                    <p className="text-slate-600 text-sm">
                        Administra horarios de atención para sectores especiales
                    </p>
                </div>
                <button
                    onClick={actualizarSectores}
                    disabled={loadingSectores}
                    className="flex items-center px-4 py-2 bg-slate-50 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50"
                >
                    <Refresh className="mr-2 h-4 w-4" />
                    Actualizar
                </button>
            </div>

            {/* Selector de Sector */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-3">
                <div className="flex items-center mb-4">
                    <Business className="h-5 w-5 text-slate-600 mr-2" />
                    <h4 className="text-md font-medium text-slate-900">Seleccionar Sector</h4>
                </div>

                {loadingSectores ? (
                    <div className="text-center py-4">
                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#224666]"></div>
                        <p className="text-slate-600 mt-2">Cargando sectores...</p>
                    </div>
                ) : sectores.length === 0 ? (
                    <div className="text-center py-8">
                        <Business className="mx-auto h-12 w-12 text-slate-400" />
                        <h3 className="mt-4 text-lg font-medium text-slate-900">No hay sectores especiales</h3>
                        <p className="mt-2 text-slate-600">
                            No se encontraron sectores con tipo de turno ESPECIAL
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                        {sectores.map((sector) => (
                            <button
                                key={sector.id}
                                onClick={() => handleSelectorSector(sector)}
                                className={`text-left p-4 border rounded-lg transition-all duration-200 ${sectorSeleccionado?.id === sector.id
                                        ? 'border-[#224666] bg-[#224666]/5 shadow-md'
                                        : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-mono text-sm font-semibold text-slate-900">
                                        {sector.codigo}
                                    </span>
                                    <p className={`text-xs px-2 py-0.5 flex justify-center items-center rounded-full ${sector.activo ? 'bg-green-200 text-green-700' : 'bg-red-200 text-red-800'}`}>{sector.activo ? 'Activo' : 'Inactivo'}</p>
                                </div>
                                <h5 className="font-medium text-slate-900 mb-1">{sector.nombre}</h5>
                                <p className="text-xs text-slate-600">{sector.descripcion}</p>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Contenido principal - Solo visible si hay sector seleccionado */}
            {sectorSeleccionado && (
                <>
                    {/* Estadísticas */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-3">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <div className="flex items-center">
                                <div className="p-2 bg-slate-100 rounded-lg">
                                    <Schedule className="h-6 w-6 text-slate-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-2xl font-bold text-slate-900">{estadisticas.totalHorarios}</p>
                                    <p className="text-slate-600 text-sm">Total Horarios</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <div className="flex items-center">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <CheckCircle className="h-6 w-6 text-green-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-2xl font-bold text-slate-900">{estadisticas.horariosActivos}</p>
                                    <p className="text-slate-600 text-sm">Activos</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <div className="flex items-center">
                                <div className="p-2 bg-red-100 rounded-lg">
                                    <Cancel className="h-6 w-6 text-red-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-2xl font-bold text-slate-900">{estadisticas.horariosInactivos}</p>
                                    <p className="text-slate-600 text-sm">Inactivos</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <div className="flex items-center">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <CalendarMonth className="h-6 w-6 text-purple-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-2xl font-bold text-slate-900">{estadisticas.diasCubiertos}</p>
                                    <p className="text-slate-600 text-sm">Días Cubiertos</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Header con acciones */}
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <h4 className="text-lg font-semibold text-slate-900">
                                Horarios de {sectorSeleccionado.codigo}
                            </h4>
                            <p className="text-slate-600 text-sm">
                                Gestiona los horarios de atención del sector
                            </p>
                        </div>
                        <button
                            onClick={() => setModalCrearAbierto(true)}
                            className="flex items-center px-4 py-2 bg-[#224666] text-white rounded-lg hover:bg-[#1a3a52] transition-colors"
                        >
                            <Add className="mr-2 h-4 w-4" />
                            Nuevo Horario
                        </button>
                    </div>

                    {/* Filtros y búsqueda */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-3">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                                    <input
                                        type="text"
                                        placeholder="Buscar horarios..."
                                        value={filtros.busqueda}
                                        onChange={(e) => setFiltros({ ...filtros, busqueda: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg"
                                    />
                                </div>
                            </div>

                            <select
                                value={filtros.dia}
                                onChange={(e) => setFiltros({ ...filtros, dia: e.target.value })}
                                className="px-4 py-2 border border-slate-300 rounded-lg"
                            >
                                <option value="TODOS">Todos los días</option>
                                <option value="MONDAY">Lunes</option>
                                <option value="TUESDAY">Martes</option>
                                <option value="WEDNESDAY">Miércoles</option>
                                <option value="THURSDAY">Jueves</option>
                                <option value="FRIDAY">Viernes</option>
                                <option value="SATURDAY">Sábado</option>
                                <option value="SUNDAY">Domingo</option>
                            </select>

                            <select
                                value={filtros.estado}
                                onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
                                className="px-4 py-2 border border-slate-300 rounded-lg"
                            >
                                <option value="TODOS">Todos</option>
                                <option value="ACTIVO">Activos</option>
                                <option value="INACTIVO">Inactivos</option>
                            </select>

                            {(filtros.busqueda || filtros.dia !== 'TODOS' || filtros.estado !== 'TODOS') && (
                                <button
                                    onClick={() => setFiltros({ busqueda: '', dia: 'TODOS', estado: 'TODOS' })}
                                    className="flex items-center px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                                >
                                    <Clear className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Tabla de horarios */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        {loading ? (
                            <div className="text-center py-12">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#224666]"></div>
                                <p className="text-slate-600 mt-4">Cargando horarios...</p>
                            </div>
                        ) : horariosFiltrados.length === 0 ? (
                            <div className="text-center py-12">
                                <Schedule className="mx-auto h-12 w-12 text-slate-400" />
                                <h3 className="mt-4 text-lg font-medium text-slate-900">
                                    {horarios.length === 0 ? 'Sin horarios configurados' : 'Sin resultados'}
                                </h3>
                                <p className="mt-2 text-slate-600">
                                    {horarios.length === 0
                                        ? 'Este sector no tiene horarios de atención configurados'
                                        : 'No se encontraron horarios que coincidan con los filtros'
                                    }
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-200">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                Día
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                Horario
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                Intervalo
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                Capacidad
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                Estado
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                Observaciones
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                Acciones
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-slate-200">
                                        {horariosFiltrados.map((horario) => (
                                            <tr key={horario.id} className="hover:bg-slate-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm font-medium text-slate-900">
                                                        {getDiaLabel(horario.diaSemana)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <AccessTime className="h-4 w-4 text-slate-400 mr-2" />
                                                        <span className="text-sm text-slate-900">
                                                            {formatearHora(horario.horaInicio)} - {formatearHora(horario.horaFin)}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm text-slate-900">
                                                        {horario.intervaloCitas} min
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm text-slate-900">
                                                        {horario.capacidadMaxima}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`flex items-center justify-center w-16 px-2.5 py-1 rounded-full text-xs font-medium ${horario.activo
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-red-100 text-red-800'
                                                        }`}>
                                                        {horario.activo ? (
                                                            <>
                                                                Activo
                                                            </>
                                                        ) : (
                                                            <>
                                                                Inactivo
                                                            </>
                                                        )}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-slate-600">
                                                        {horario.observaciones || '-'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex items-center justify-end space-x-2">
                                                        <button
                                                            onClick={() => handleEditarHorario(horario)}
                                                            className="p-1.5 text-slate-400 hover:text-cyan-800 transition-all duration-300"
                                                            title="Editar horario"
                                                        >
                                                            <EditDocumentIcon className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleCambiarEstado(horario)}
                                                            className={`p-1.5 text-slate-400 transition-all duration-300 ${horario.activo
                                                                    ? 'hover:text-red-600'
                                                                    : 'hover:text-green-600'
                                                                }`}
                                                            title={horario.activo ? 'Desactivar horario' : 'Activar horario'}
                                                        >
                                                            {horario.activo ? (
                                                                <Cancel className="h-4 w-4" />
                                                            ) : (
                                                                <CheckCircle className="h-4 w-4" />
                                                            )}
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
                </>
            )}

            {/* Modales */}
            <CrearHorarioModal
                isOpen={modalCrearAbierto}
                onClose={() => setModalCrearAbierto(false)}
                onSubmit={handleCrearHorario}
                sector={sectorSeleccionado}
                loading={loadingCrear}
            />

            <EditarHorarioModal
                isOpen={modalEditarAbierto}
                onClose={() => {
                    setModalEditarAbierto(false);
                    setHorarioSeleccionado(null);
                }}
                onSubmit={handleActualizarHorario}
                horario={horarioSeleccionado}
                sector={sectorSeleccionado}
                loading={loadingEditar}
            />

            <ConfirmarAccionModal
                isOpen={modalConfirmarAbierto}
                onClose={() => {
                    setModalConfirmarAbierto(false);
                    setHorarioParaAccion(null);
                    setAccionConfirmar(null);
                }}
                onConfirm={confirmarAccion}
                loading={loadingAccion}
                titulo={accionConfirmar === 'activar' ? 'Activar Horario' : 'Desactivar Horario'}
                mensaje={`¿Está seguro que desea ${accionConfirmar} este horario?`}
                descripcion={horarioParaAccion ? `${getDiaLabel(horarioParaAccion.diaSemana)} de ${formatearHora(horarioParaAccion.horaInicio)} a ${formatearHora(horarioParaAccion.horaFin)}` : ''}
                textoConfirmar={accionConfirmar === 'activar' ? 'Activar' : 'Desactivar'}
                textoCancel="Cancelar"
                tipoAccion={accionConfirmar}
            />
        </div>
    );
};

export default HorariosSection;