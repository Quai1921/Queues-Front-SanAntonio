
import React, { useState, useEffect } from 'react';
import {
    Add,
    Search,
    FilterList,
    Refresh,
    EditDocument as EditDocumentIcon,
    Key as KeyIcon,
    DomainAdd as DomainAddIcon,
    Group,
    Person,
    Business,
    AdminPanelSettings,
    SupportAgent,
    MoreVert,
    CheckCircle,
    Cancel,
    Lock,
    PersonAdd
} from '@mui/icons-material';
import CrearEmpleadoModal from '../components/CrearEmpleadoModal';
import EditarEmpleadoModal from '../components/EditarEmpleadoModal';
import CambiarPasswordModal from '../components/CambiarPasswordModal';
import AsignarSectorModal from '../components/AsignarSectorModal';
import empleadosService from '../services/empleadoService';

const EmpleadosSection = () => {
    // Estados principales
    const [empleados, setEmpleados] = useState([]);
    const [empleadosFiltrados, setEmpleadosFiltrados] = useState([]);
    const [loading, setLoading] = useState(false);
    const [estadisticas, setEstadisticas] = useState({
        total: 0,
        activos: 0,
        admins: 0,
        responsables: 0,
        operadores: 0
    });

    // console.log(estadisticas)
    // console.log(empleadosFiltrados);
    // console.log(empleados)

    // Estados de filtros
    const [filtros, setFiltros] = useState({
        busqueda: '',
        rol: 'TODOS',
        estado: 'TODOS'
    });

    // Estados de modales
    const [modalCrearAbierto, setModalCrearAbierto] = useState(false);
    const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
    const [modalPasswordAbierto, setModalPasswordAbierto] = useState(false);
    const [modalAsignarSectorAbierto, setModalAsignarSectorAbierto] = useState(false);
    const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);

    // Estados de carga
    const [loadingCrear, setLoadingCrear] = useState(false);
    const [loadingEditar, setLoadingEditar] = useState(false);
    const [loadingPassword, setLoadingPassword] = useState(false);
    const [loadingAsignar, setLoadingAsignar] = useState(false);

    // Estado de notificaciones
    const [notificacion, setNotificacion] = useState(null);

    // Cargar datos iniciales
    useEffect(() => {
        cargarEmpleados();
        cargarEstadisticas();
    }, []);

    // Filtrar empleados cuando cambian los filtros
    useEffect(() => {
        aplicarFiltros();
    }, [empleados, filtros]);

    const cargarEmpleados = async () => {
        setLoading(true);
        try {
            const data = await empleadosService.obtenerTodos();
            setEmpleados(data || []);
        } catch (error) {
            console.error('Error cargando empleados:', error);
            mostrarNotificacion('Error al cargar empleados', 'error');
            setEmpleados([]);
        } finally {
            setLoading(false);
        }
    };

    const cargarEstadisticas = async () => {
        try {
            const stats = await empleadosService.obtenerEstadisticas();
            setEstadisticas(stats);
        } catch (error) {
            console.error('Error cargando estadísticas:', error);
            setEstadisticas({
                total: 0,
                activos: 0,
                admins: 0,
                responsables: 0,
                operadores: 0
            });
        }
    };

    const aplicarFiltros = () => {
        let empleadosFiltrados = [...empleados];

        // Filtro por búsqueda
        if (filtros.busqueda.trim()) {
            const busqueda = filtros.busqueda.toLowerCase().trim();
            empleadosFiltrados = empleadosFiltrados.filter(empleado =>
                empleado.nombreCompleto?.toLowerCase().includes(busqueda) ||
                empleado.username?.toLowerCase().includes(busqueda) ||
                empleado.email?.toLowerCase().includes(busqueda) ||
                empleado.dni?.includes(busqueda)
            );
        }

        // Filtro por rol
        if (filtros.rol !== 'TODOS') {
            empleadosFiltrados = empleadosFiltrados.filter(empleado =>
                empleado.rol === filtros.rol
            );
        }

        // Filtro por estado
        if (filtros.estado !== 'TODOS') {
            const estadoActivo = filtros.estado === 'ACTIVO';
            empleadosFiltrados = empleadosFiltrados.filter(empleado =>
                empleado.activo === estadoActivo
            );
        }

        setEmpleadosFiltrados(empleadosFiltrados);
    };

    const handleFiltroChange = (campo, valor) => {
        setFiltros(prev => ({
            ...prev,
            [campo]: valor
        }));
    };

    const mostrarNotificacion = (mensaje, tipo = 'success') => {
        setNotificacion({ mensaje, tipo });
        setTimeout(() => setNotificacion(null), 5000);
    };

    const handleCrearEmpleado = async (datosEmpleado) => {
        setLoadingCrear(true);
        try {
            await empleadosService.crear(datosEmpleado);
            await cargarEmpleados();
            await cargarEstadisticas();
            setModalCrearAbierto(false);
            mostrarNotificacion('Empleado creado exitosamente');
        } catch (error) {
            console.error('Error creando empleado:', error);
            mostrarNotificacion(error.message || 'Error al crear empleado', 'error');
        } finally {
            setLoadingCrear(false);
        }
    };

    const handleEditarEmpleado = async (datosEmpleado) => {
        setLoadingEditar(true);
        try {
            await empleadosService.actualizar(empleadoSeleccionado.id, datosEmpleado);
            await cargarEmpleados();
            await cargarEstadisticas();
            setModalEditarAbierto(false);
            setEmpleadoSeleccionado(null);
            mostrarNotificacion('Empleado actualizado exitosamente');
        } catch (error) {
            console.error('Error actualizando empleado:', error);
            mostrarNotificacion(error.message || 'Error al actualizar empleado', 'error');
        } finally {
            setLoadingEditar(false);
        }
    };

    const handleCambiarPassword = async (passwordData) => {
        setLoadingPassword(true);
        try {
            await empleadosService.cambiarPassword(empleadoSeleccionado.id, passwordData);
            setModalPasswordAbierto(false);
            setEmpleadoSeleccionado(null);
            mostrarNotificacion('Contraseña actualizada exitosamente');
        } catch (error) {
            console.error('Error cambiando contraseña:', error);
            mostrarNotificacion(error.message || 'Error al cambiar contraseña', 'error');
        } finally {
            setLoadingPassword(false);
        }
    };

    const handleAsignarSector = async (sectorData) => {
        setLoadingAsignar(true);
        try {
            await empleadosService.asignarSector(empleadoSeleccionado.id, sectorData);
            await cargarEmpleados();
            setModalAsignarSectorAbierto(false);
            setEmpleadoSeleccionado(null);
            mostrarNotificacion('Sector asignado exitosamente');
        } catch (error) {
            console.error('Error asignando sector:', error);
            mostrarNotificacion(error.message || 'Error al asignar sector', 'error');
        } finally {
            setLoadingAsignar(false);
        }
    };

    const handleToggleEstado = async (empleado) => {
        try {
            if (empleado.activo) {
                await empleadosService.desactivar(empleado.id);
                mostrarNotificacion('Empleado desactivado exitosamente');
            } else {
                await empleadosService.activar(empleado.id);
                mostrarNotificacion('Empleado activado exitosamente');
            }
            await cargarEmpleados();
            await cargarEstadisticas();
        } catch (error) {
            console.error('Error cambiando estado:', error);
            mostrarNotificacion(error.message || 'Error al cambiar estado del empleado', 'error');
        }
    };

    const getRolLabel = (rol) => {
        switch (rol) {
            case 'ADMIN':
                return 'Administrador';
            case 'RESPONSABLE_SECTOR':
                return 'Resp. Sector';
            case 'OPERADOR':
                return 'Operador';
            default:
                return 'Sin rol';
        }
    };

    const getRolBadgeColor = (rol) => {
        switch (rol) {
            case 'ADMIN':
                return 'bg-purple-100 text-purple-800';
            case 'RESPONSABLE_SECTOR':
                return 'bg-blue-100 text-blue-800';
            case 'OPERADOR':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-slate-100 text-slate-800';
        }
    };

    const SectoresCell = ({ empleado }) => {
        const [expandido, setExpandido] = useState(false);

        const sectoresAMostrar = expandido
            ? [...empleado.sectoresVisibles, ...empleado.sectoresOcultos]
            : empleado.sectoresVisibles;

        return (
            <div className="flex flex-col">
                {sectoresAMostrar.map((sector, index) => (
                    <span
                        key={index}
                        className="text-sm text-slate-900 px-2"
                    >
                        {sector}
                    </span>
                ))}

                {empleado.sectoresOcultos.length > 0 && (
                    <button
                        onClick={() => setExpandido(!expandido)}
                        className="text-xs bg-slate-200 hover:bg-slate-100 text-center mt-1 py-1 rounded-full max-w-[100px]"
                    >
                        {expandido
                            ? '↑ Mostrar menos'
                            : `↓ Ver ${empleado.sectoresOcultos.length} más`
                        }
                    </button>
                )}
            </div>
        );
    };

    return (
        <div>
            {/* Header con estadísticas */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                    <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Group className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-slate-600">Total</p>
                            <p className="text-2xl font-semibold text-slate-900">{estadisticas.totalEmpleados}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                    <div className="flex items-center">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-slate-600">Activos</p>
                            <p className="text-2xl font-semibold text-slate-900">{estadisticas.empleadosActivos}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                    <div className="flex items-center">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <AdminPanelSettings className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-slate-600">Admins</p>
                            <p className="text-2xl font-semibold text-slate-900">{estadisticas.administradores}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                    <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Business className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-slate-600">Responsables</p>
                            <p className="text-2xl font-semibold text-slate-900">{estadisticas.responsables}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                    <div className="flex items-center">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <SupportAgent className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-slate-600">Operadores</p>
                            <p className="text-2xl font-semibold text-slate-900">{estadisticas.empleadosComunes}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Header con acciones */}
            <div className="flex items-center justify-between mt-4">
                <div>
                    <h3 className="text-lg font-semibold text-slate-900">Empleados del Sistema</h3>
                    <p className="text-slate-600 text-sm">Administra usuarios y sus permisos</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={cargarEmpleados}
                        disabled={loading}
                        className="flex items-center px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                    >
                        <Refresh className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        Actualizar
                    </button>
                    <button
                        onClick={() => setModalCrearAbierto(true)}
                        className="flex items-center px-4 py-2 bg-[#224666] text-white rounded-lg hover:bg-[#2c3e50] transition-colors"
                    >
                        <Add className="mr-2 h-4 w-4" />
                        Agregar Empleado
                    </button>
                </div>
            </div>

            {/* Filtros y búsqueda */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mt-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Búsqueda */}
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                            <input
                                type="text"
                                placeholder="Buscar por nombre, username, email o DNI..."
                                value={filtros.busqueda}
                                onChange={(e) => handleFiltroChange('busqueda', e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#224666] focus:border-[#224666] transition-colors"
                            />
                        </div>
                    </div>

                    {/* Filtro por rol */}
                    <select
                        value={filtros.rol}
                        onChange={(e) => handleFiltroChange('rol', e.target.value)}
                        className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#224666] focus:border-[#224666] transition-colors"
                    >
                        <option value="TODOS">Todos los roles</option>
                        <option value="ADMIN">Administradores</option>
                        <option value="RESPONSABLE_SECTOR">Responsables de Sector</option>
                        <option value="OPERADOR">Operadores</option>
                    </select>

                    {/* Filtro por estado */}
                    <select
                        value={filtros.estado}
                        onChange={(e) => handleFiltroChange('estado', e.target.value)}
                        className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#224666] focus:border-[#224666] transition-colors"
                    >
                        <option value="TODOS">Todos los estados</option>
                        <option value="ACTIVO">Activos</option>
                        <option value="INACTIVO">Inactivos</option>
                    </select>
                </div>
            </div>

            {/* Tabla de empleados */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-4">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="flex items-center space-x-2 text-slate-500">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#224666]"></div>
                            <span>Cargando empleados...</span>
                        </div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="text-left py-3 px-4 font-medium text-slate-600 text-sm">Empleado</th>
                                    <th className="text-left py-3 px-4 font-medium text-slate-600 text-sm">Contacto</th>
                                    <th className="text-left py-3 px-4 font-medium text-slate-600 text-sm">Rol</th>
                                    <th className="text-left py-3 px-4 font-medium text-slate-600 text-sm">Sector</th>
                                    <th className="text-left py-3 px-4 font-medium text-slate-600 text-sm">Estado</th>
                                    <th className="text-right py-3 px-4 font-medium text-slate-600 text-sm">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {empleadosFiltrados
                                    .toSorted((a, b) => a.rol.localeCompare(b.rol))
                                    .map((empleado) => (
                                        <tr key={empleado.id} className="hover:bg-slate-50">
                                            {/* Empleado */}
                                            <td className="py-4 px-4">
                                                <div className="flex items-center">
                                                    <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                                                        <Person className="h-4 w-4 text-slate-600" />
                                                    </div>
                                                    <div className="ml-3">
                                                        <p className="font-medium text-slate-900">
                                                            {empleado.nombreCompleto}
                                                        </p>
                                                        <p className="text-sm text-slate-500">
                                                            {empleado.username}
                                                            {empleado.dni && (
                                                                <span className="ml-2">• DNI: {empleado.dni}</span>
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Contacto */}
                                            <td className="py-4 px-4">
                                                <div className="text-sm">
                                                    {empleado.email && (
                                                        <p className="text-slate-900">{empleado.email}</p>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Rol */}
                                            <td className="py-4 px-4">
                                                <div className={`inline-flex w-28 items-center justify-center px-2 py-1 rounded-full text-xs font-medium ${getRolBadgeColor(empleado.rol)}`}>
                                                    <span className="ml-1">{getRolLabel(empleado.rol)}</span>
                                                </div>
                                            </td>

                                            {/* Sector */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <SectoresCell empleado={empleado} />
                                            </td>

                                            {/* Estado */}
                                            <td className="py-4 px-4">
                                                <span className={`inline-flex w-16 items-center justify-center px-2 py-1 rounded-full text-xs font-medium ${empleado.activo
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {empleado.activo ? (
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

                                            {/* Acciones */}
                                            <td className="py-4 px-4">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <button
                                                        onClick={() => {
                                                            setEmpleadoSeleccionado(empleado);
                                                            setModalAsignarSectorAbierto(true);
                                                        }}
                                                        className="p-1.5 text-slate-400 hover:text-neutral-800 transition-all duration-300"
                                                        title="Asignar sector"
                                                    >
                                                        {getRolLabel(empleado.rol) === 'Operador' ? (
                                                            <DomainAddIcon className="h-4 w-4" />
                                                        ) : (
                                                            ""
                                                        )}
                                                    </button>

                                                    <button
                                                        onClick={() => {
                                                            setEmpleadoSeleccionado(empleado);
                                                            setModalEditarAbierto(true);
                                                        }}
                                                        className="p-1.5 text-slate-400 hover:text-cyan-800 transition-all duration-300"
                                                        title="Editar empleado"
                                                    >
                                                        <EditDocumentIcon className="h-4 w-4" />
                                                    </button>

                                                    <button
                                                        onClick={() => {
                                                            setEmpleadoSeleccionado(empleado);
                                                            setModalPasswordAbierto(true);
                                                        }}
                                                        className="p-1.5 text-slate-400 hover:text-amber-800 transition-all duration-300"
                                                        title="Cambiar contraseña"
                                                    >
                                                        <KeyIcon className="h-4 w-4" />
                                                    </button>



                                                    <button
                                                        onClick={() => handleToggleEstado(empleado)}
                                                        className={`p-1.5 text-slate-400 transition-all duration-300 ${empleado.activo
                                                                ? 'hover:text-red-600'
                                                                : 'hover:text-green-600'
                                                            }`}
                                                        title={empleado.activo ? 'Desactivar empleado' : 'Activar empleado'}
                                                    >
                                                        {empleado.activo ? (
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

                {/* Estado vacío */}
                {empleadosFiltrados.length === 0 && !loading && (
                    <div className="text-center py-12">
                        <Group className="mx-auto h-12 w-12 text-slate-400" />
                        <h3 className="mt-4 text-lg font-medium text-slate-900">
                            {empleados.length === 0 ? 'No hay empleados' : 'No se encontraron empleados'}
                        </h3>
                        <p className="mt-2 text-slate-600">
                            {empleados.length === 0
                                ? 'Comienza creando tu primer empleado del sistema'
                                : 'Intenta ajustar los filtros de búsqueda'
                            }
                        </p>
                    </div>
                )}
            </div>

            {/* Resumen de resultados */}
            {empleadosFiltrados.length > 0 && (
                <div className="text-sm text-slate-600 text-center mt-4">
                    Mostrando {empleadosFiltrados.length} de {empleados.length} empleados
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


            {/* Modales */}
            <CrearEmpleadoModal
                isOpen={modalCrearAbierto}
                onClose={() => setModalCrearAbierto(false)}
                onSubmit={handleCrearEmpleado}
                loading={loadingCrear}
            />

            <EditarEmpleadoModal
                isOpen={modalEditarAbierto}
                onClose={() => {
                    setModalEditarAbierto(false);
                    setEmpleadoSeleccionado(null);
                }}
                onSubmit={handleEditarEmpleado}
                empleado={empleadoSeleccionado}
                loading={loadingEditar}
            />

            <CambiarPasswordModal
                isOpen={modalPasswordAbierto}
                onClose={() => {
                    setModalPasswordAbierto(false);
                    setEmpleadoSeleccionado(null);
                }}
                onSubmit={handleCambiarPassword}
                empleado={empleadoSeleccionado}
                loading={loadingPassword}
            />

            <AsignarSectorModal
                isOpen={modalAsignarSectorAbierto}
                onClose={() => {
                    setModalAsignarSectorAbierto(false);
                    setEmpleadoSeleccionado(null);
                }}
                onSubmit={handleAsignarSector}
                empleado={empleadoSeleccionado}
                loading={loadingAsignar}
            />
        </div>
    );
};

export default EmpleadosSection;