import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LogoutModal from './LogoutModal';
import {
    Dashboard as DashboardIcon,
    AdminPanelSettings,
    ManageAccounts,
    Assignment,
    Queue,
    Analytics,
    Settings,
    Schedule,
    Message,
    History,
    ExitToApp,
    Person,
    Business,
    Notifications,
    Group,
    Assessment
} from '@mui/icons-material';
import { useStatistics } from '../hooks/useStatistics';

/**
 * Dashboard principal del sistema - se adapta según el rol del usuario
 */
const Dashboard = () => {
    const { user, sector, logout, hasRole, hasAnyRole, isLoading } = useAuth();
    const navigate = useNavigate();
    const [greeting, setGreeting] = useState('');

    // Estados para el modal de logout
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const {
        statistics,
        loading: statsLoading,
        refreshing: refreshing,
        error: statsError,
        refreshStatistics,
        formatters,
        derived
    } = useStatistics({
        autoLoad: true,
        refreshInterval: 30000, // 30 segundos
        onError: (error) => console.error('Error en estadísticas:', error)
    });

    useEffect(() => {
        setGreeting(getTimeBasedGreeting());
    }, []);

    const getTimeBasedGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Buenos días';
        if (hour < 18) return 'Buenas tardes';
        return 'Buenas noches';
    };

    // Función para mostrar el modal de confirmación
    const handleLogoutClick = () => {
        setShowLogoutModal(true);
    };

    // Función para cancelar el logout
    const handleLogoutCancel = () => {
        setShowLogoutModal(false);
        setIsLoggingOut(false);
    };

    // Función para confirmar el logout
    const handleLogoutConfirm = async () => {
        try {
            setIsLoggingOut(true);

            // Pequeña demora para mostrar el loading
            await new Promise(resolve => setTimeout(resolve, 800));

            await logout();

            // Cerrar modal antes de navegar
            setShowLogoutModal(false);
            setIsLoggingOut(false);

            // Navegar al login
            navigate('/login', { replace: true });
        } catch (error) {
            console.error('Error durante logout:', error);
            setIsLoggingOut(false);
            // El modal se mantiene abierto para que el usuario pueda reintentar
        }
    };

    const getRoleDisplayName = (role) => {
        switch (role) {
            case 'ADMIN':
                return 'Administrador';
            case 'RESPONSABLE_SECTOR':
                return 'Responsable de Sector';
            case 'OPERADOR':
                return 'Operador';
            default:
                return role;
        }
    };

    // Configuración de tarjetas por rol
    const getQuickActions = () => {
        const actions = [];

        // Acciones para ADMIN
        if (hasRole('ADMIN')) {
            actions.push(
                {
                    title: 'Gestión de Empleados',
                    description: 'Administrar usuarios y permisos',
                    icon: <ManageAccounts className="text-3xl" />,
                    color: 'from-purple-500 to-purple-600',
                    onClick: () => navigate('/admin/empleados'),
                    roles: ['ADMIN']
                },
                {
                    title: 'Configuración del Sistema',
                    description: 'Ajustes generales y parámetros',
                    icon: <Settings className="text-3xl" />,
                    color: 'from-gray-500 to-gray-600',
                    onClick: () => navigate('/admin/configuracion'),
                    roles: ['ADMIN']
                },
                {
                    title: 'Panel de Administración',
                    description: 'Acceso completo al sistema',
                    icon: <AdminPanelSettings className="text-3xl" />,
                    color: 'from-red-500 to-red-600',
                    onClick: () => navigate('/admin'),
                    roles: ['ADMIN']
                },
                {
                    title: 'Gestión de Sectores',
                    description: 'Administrar sectores y áreas',
                    icon: <AdminPanelSettings className="text-3xl" />,
                    color: 'from-red-500 to-red-600',
                    onClick: () => navigate('/admin/sectores'),
                    roles: ['ADMIN']
                }
            );
        }

        // Acciones para RESPONSABLE_SECTOR
        if (hasAnyRole(['ADMIN', 'RESPONSABLE_SECTOR'])) {
            actions.push(
                {
                    title: 'Gestión de Turnos',
                    description: 'Administrar turnos del sector',
                    icon: <Queue className="text-3xl" />,
                    color: 'from-blue-500 to-blue-600',
                    onClick: () => navigate('/responsable/turnos'),
                    roles: ['ADMIN', 'RESPONSABLE_SECTOR']
                },
                {
                    title: 'Reportes y Estadísticas',
                    description: 'Ver métricas y reportes',
                    icon: <Assessment className="text-3xl" />,
                    color: 'from-green-500 to-green-600',
                    onClick: () => navigate('/responsable/reportes'),
                    roles: ['ADMIN', 'RESPONSABLE_SECTOR']
                },
                {
                    title: 'Horarios y Personal',
                    description: 'Gestionar horarios de atención',
                    icon: <Schedule className="text-3xl" />,
                    color: 'from-yellow-500 to-yellow-600',
                    onClick: () => navigate('/responsable/horarios'),
                    roles: ['ADMIN', 'RESPONSABLE_SECTOR']
                }
            );
        }

        // Acciones para todos los usuarios autenticados
        actions.push(
            {
                title: 'Mi Perfil',
                description: 'Ver y editar información personal',
                icon: <Person className="text-3xl" />,
                color: 'from-indigo-500 to-indigo-600',
                onClick: () => navigate('/perfil'),
                roles: ['ADMIN', 'RESPONSABLE_SECTOR', 'OPERADOR']
            },
            {
                title: 'Atender Turnos',
                description: 'Llamar y gestionar turnos',
                icon: <Assignment className="text-3xl" />,
                color: 'from-teal-500 to-teal-600',
                onClick: () => navigate('/operador/turnos'),
                roles: ['ADMIN', 'RESPONSABLE_SECTOR', 'OPERADOR']
            },
            {
                title: 'Historial',
                description: 'Ver turnos atendidos',
                icon: <History className="text-3xl" />,
                color: 'from-pink-500 to-pink-600',
                onClick: () => navigate('/historial'),
                roles: ['ADMIN', 'RESPONSABLE_SECTOR', 'OPERADOR']
            }
        );

        return actions;
    };

    const quickActions = getQuickActions();

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">

                        {/* Logo and Title */}
                        <div className="flex items-center">
                            <img
                                src="/SanAntonioArredondoBlue.avif"
                                alt="San Antonio de Arredondo"
                                className="w-8 h-10 mr-3"
                            />
                            <div>
                                <h1 className="text-xl font-semibold text-slate-900">
                                    Portal de Atención
                                </h1>
                                <p className="text-xs text-slate-600">
                                    Municipalidad de San Antonio de Arredondo
                                </p>
                            </div>
                        </div>

                        {/* User Menu */}
                        <div className="flex items-center space-x-4">
                            {/* User Info */}
                            <div className="hidden md:block text-right">
                                <p className="text-sm font-medium text-slate-900">
                                    {user?.nombreCompleto || user?.nombre}
                                </p>
                                <p className="text-xs text-slate-600">
                                    {getRoleDisplayName(user?.rol)}
                                </p>
                            </div>

                            {/* Logout Button */}
                            <button
                                onClick={handleLogoutClick}
                                disabled={isLoading || isLoggingOut}
                                className="flex items-center px-3 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ExitToApp className="mr-2 h-4 w-4" />
                                Salir
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Welcome Section */}
                <div className="mb-8">
                    <div className="bg-gradient-to-r from-[#224666] to-[#5F78AD] rounded-xl shadow-xl text-white p-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-3xl font-bold mb-2">
                                    {greeting}, {user?.nombre}
                                </h2>
                                <p className="text-white/90 text-lg mb-1">
                                    Bienvenido al panel de {getRoleDisplayName(user?.rol)}
                                </p>
                                {sector && (
                                    <p className="text-white/80 text-sm">
                                        Sector: {sector.nombre} ({sector.codigo})
                                    </p>
                                )}
                            </div>
                            <div className="hidden md:block">
                                <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center">
                                    <DashboardIcon sx={{ fontSize: '50px' }} className="text-white" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Stats - Solo para ADMIN y RESPONSABLE_SECTOR */}
                {hasAnyRole(['ADMIN', 'RESPONSABLE_SECTOR']) && (
                    <div className="mb-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                {
                                    title: 'Turnos Pendientes',
                                    value: statsLoading ? '...' : formatters.formatNumber(statistics.turnos.turnosPendientes),
                                    color: 'text-blue-600',
                                    bg: 'bg-blue-50',
                                    loading: statsLoading
                                },
                                {
                                    title: 'Turnos Atendidos Hoy',
                                    value: statsLoading ? '...' : formatters.formatNumber(statistics.turnos.turnosAtendidosHoy),
                                    color: 'text-green-600',
                                    bg: 'bg-green-50',
                                    loading: statsLoading
                                },
                                {
                                    title: 'Empleados Activos',
                                    value: statsLoading ? '...' : `${statistics.empleados.activos}/${statistics.empleados.total}`,
                                    color: 'text-purple-600',
                                    bg: 'bg-purple-50',
                                    loading: statsLoading
                                },
                                {
                                    title: 'Tiempo Promedio',
                                    value: statsLoading ? '...' : formatters.formatTime(statistics.turnos.tiempoPromedio),
                                    color: 'text-orange-600',
                                    bg: 'bg-orange-50',
                                    loading: statsLoading
                                }
                            ].map((stat, index) => (
                                <div key={index} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                                    <div className={`w-12 h-12 ${stat.bg} rounded-lg flex items-center justify-center mb-4`}>
                                        <Analytics className={`h-6 w-6 ${stat.color}`} />
                                    </div>
                                    <h3 className={`text-2xl font-bold text-slate-900 mb-1 ${stat.loading ? 'animate-pulse' : ''}`}>{stat.value}</h3>
                                    <p className="text-sm text-slate-600">{stat.title}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Quick Actions */}
                <div className="mb-8">
                    <h3 className="text-xl font-semibold text-slate-900 mb-6">Acciones Rápidas</h3>

                    {/* Header con botón de refresh para estadísticas */}
                    {hasAnyRole(['ADMIN', 'RESPONSABLE_SECTOR']) && (
                        <div className="mb-8 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-semibold text-slate-900">Estadísticas de Hoy</h3>
                                {derived.hasData && (
                                    <p className="text-sm text-slate-500">
                                        Última actualización: {statistics.fechaActualizacion ?
                                            new Date(statistics.fechaActualizacion).toLocaleTimeString('es-AR') : 'Nunca'}
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={refreshStatistics}
                                disabled={statsLoading || refreshing}
                                className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                            >
                                <svg className={`w-4 h-4 mr-2 ${(statsLoading || refreshing) ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                {refreshing ? 'Actualizando...' : statsLoading ? 'Cargando...' : 'Actualizar'}
                            </button>
                        </div>
                    )}



                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {quickActions.map((action, index) => (
                            <div
                                key={index}
                                onClick={action.onClick}
                                className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 cursor-pointer hover:shadow-md transition-all duration-200 hover:-translate-y-1 group"
                            >
                                <div className={`w-14 h-14 bg-gradient-to-r ${action.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                                    <div className="text-white">
                                        {action.icon}
                                    </div>
                                </div>
                                <h4 className="text-lg font-semibold text-slate-900 mb-2">
                                    {action.title}
                                </h4>
                                <p className="text-sm text-slate-600 mb-4">
                                    {action.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Additional Info */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">Información del Sistema</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <div className="space-y-1 text-sm text-slate-600">
                                <p><strong>Usuario:</strong> {user?.username}</p>
                                <p><strong>Email:</strong> {user?.email}</p>
                                <p><strong>Rol:</strong> {getRoleDisplayName(user?.rol)}</p>
                                {user?.ultimoAcceso && (
                                    <p>
                                        <strong>Último acceso:</strong>{" "}
                                        {new Date(user.ultimoAcceso).toLocaleString("es-AR", {
                                            day: "2-digit",
                                            month: "2-digit",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            second: "2-digit",
                                            hour12: false,
                                        })}{" "}
                                        hs
                                    </p>
                                )}
                            </div>
                        </div>

                        {sector && (
                            <div>
                                <h4 className="font-medium text-slate-700 mb-2">Sector Asignado</h4>
                                <div className="space-y-1 text-sm text-slate-600">
                                    <p><strong>Nombre:</strong> {sector.nombre}</p>
                                    <p><strong>Código:</strong> {sector.codigo}</p>
                                    <p><strong>Tipo:</strong> {sector.tipo}</p>
                                    {sector.esResponsable && (
                                        <p className="text-green-600 font-medium">✓ Eres responsable de este sector</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Modal de confirmación de logout */}
            <LogoutModal
                isOpen={showLogoutModal}
                isLoading={isLoggingOut}
                onConfirm={handleLogoutConfirm}
                onCancel={handleLogoutCancel}
                userName={user?.nombreCompleto || user?.nombre || 'Usuario'}
            />
        </div>
    );
};

export default Dashboard;