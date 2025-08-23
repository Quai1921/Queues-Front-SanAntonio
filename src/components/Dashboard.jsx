import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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

/**
 * Dashboard principal del sistema - se adapta según el rol del usuario
 */
const Dashboard = () => {
    const { user, sector, logout, hasRole, hasAnyRole } = useAuth();
    const navigate = useNavigate();
    const [greeting, setGreeting] = useState('');

    useEffect(() => {
        setGreeting(getTimeBasedGreeting());
    }, []);

    const getTimeBasedGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Buenos días';
        if (hour < 18) return 'Buenas tardes';
        return 'Buenas noches';
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
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
                    title: 'Gestión de Sectores',
                    description: 'Crear y administrar sectores',
                    icon: <Business className="text-3xl" />,
                    color: 'from-indigo-500 to-indigo-600',
                    onClick: () => navigate('/admin/sectores'),
                    roles: ['ADMIN']
                }
            );
        }

        // Acciones para ADMIN y RESPONSABLE_SECTOR
        if (hasAnyRole(['ADMIN', 'RESPONSABLE_SECTOR'])) {
            actions.push(
                {
                    title: 'Estadísticas',
                    description: 'Ver reportes y métricas del sistema',
                    icon: <Analytics className="text-3xl" />,
                    color: 'from-green-500 to-green-600',
                    onClick: () => navigate('/estadisticas'),
                    roles: ['ADMIN', 'RESPONSABLE_SECTOR']
                },
                {
                    title: 'Horarios',
                    description: 'Gestionar horarios de atención',
                    icon: <Schedule className="text-3xl" />,
                    color: 'from-orange-500 to-orange-600',
                    onClick: () => navigate('/horarios'),
                    roles: ['ADMIN', 'RESPONSABLE_SECTOR']
                },
                {
                    title: 'Mensajes',
                    description: 'Administrar mensajes institucionales',
                    icon: <Message className="text-3xl" />,
                    color: 'from-teal-500 to-teal-600',
                    onClick: () => navigate('/mensajes'),
                    roles: ['ADMIN', 'RESPONSABLE_SECTOR']
                }
            );
        }

        // Acciones para todos los roles
        actions.push(
            {
                title: 'Atención de Turnos',
                description: 'Llamar y atender turnos de ciudadanos',
                icon: <Assignment className="text-3xl" />,
                color: 'from-[#224666] to-[#5F78AD]',
                onClick: () => navigate('/operador/turnos'),
                roles: ['ADMIN', 'RESPONSABLE_SECTOR', 'OPERADOR']
            },
            {
                title: 'Cola de Espera',
                description: 'Ver estado actual de la cola',
                icon: <Queue className="text-3xl" />,
                color: 'from-blue-500 to-blue-600',
                onClick: () => navigate('/operador/cola'),
                roles: ['ADMIN', 'RESPONSABLE_SECTOR', 'OPERADOR']
            },
            {
                title: 'Historial',
                description: 'Consultar turnos anteriores',
                icon: <History className="text-3xl" />,
                color: 'from-slate-500 to-slate-600',
                onClick: () => navigate('/historial'),
                roles: ['ADMIN', 'RESPONSABLE_SECTOR', 'OPERADOR']
            }
        );

        return actions;
    };

    return (
        <div className="min-h-screen bg-slate-50">

            {/* Header */}
            <header className="bg-white shadow-sm border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-24">

                        {/* Logo y título */}
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-[#224666] rounded-full flex items-center justify-center mr-3">
                                <img
                                    src="/SanAntonioArredondoWhite.avif"
                                    alt="San Antonio de Arredondo"
                                    className="w-6 h-6 object-contain"
                                />
                            </div>
                            <div>
                                <h1 className="text-sm md:text-xl font-bold text-[#224666]">Portal de Atención Municipal</h1>
                                <p className="text-xs md:text-sm text-slate-600">Municipalidad de San Antonio de Arredondo</p>
                            </div>
                        </div>

                        {/* User info y logout */}
                        <div className="flex items-center space-x-4">
                            <div className="text-right">
                                <p className="text-sm font-medium text-slate-900">{user?.nombreCompleto}</p>
                                <p className="text-xs text-slate-600">{getRoleDisplayName(user?.rol)}</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="flex items-center px-3 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
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
                    <div className="bg-gradient-to-r from-[#224666] to-[#5F78AD] rounded-2xl shadow-xl text-white p-8">
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
                                    <DashboardIcon style={{ fontSize: '3rem' }} className="text-white" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Stats - Solo para ADMIN y RESPONSABLE_SECTOR */}
                {hasAnyRole(['ADMIN', 'RESPONSABLE_SECTOR']) && (
                    <div className="mb-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <Queue className="text-blue-600" fontSize="large" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-2xl font-bold text-slate-900">--</p>
                                        <p className="text-slate-600 text-sm">Turnos Pendientes</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                        <Assignment className="text-green-600" fontSize="large" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-2xl font-bold text-slate-900">--</p>
                                        <p className="text-slate-600 text-sm">Turnos Atendidos Hoy</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <Group className="text-purple-600" fontSize="large" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-2xl font-bold text-slate-900">--</p>
                                        <p className="text-slate-600 text-sm">Operadores Activos</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                        <Assessment className="text-orange-600" fontSize="large" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-2xl font-bold text-slate-900">--</p>
                                        <p className="text-slate-600 text-sm">Tiempo Promedio</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Quick Actions */}
                <div className="mb-8">
                    <h3 className="text-2xl font-bold text-slate-900 mb-6">Acciones Rápidas</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {getQuickActions().map((action, index) => (
                            <div
                                key={index}
                                onClick={action.onClick}
                                className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-lg transition-all duration-200 cursor-pointer group"
                            >
                                <div className={`w-16 h-16 bg-gradient-to-r ${action.color} rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                                    {action.icon}
                                </div>
                                <h4 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-[#224666] transition-colors">
                                    {action.title}
                                </h4>
                                <p className="text-slate-600 text-sm">
                                    {action.description}
                                </p>
                                <div className="mt-4 text-xs text-slate-500">
                                    {action.roles.map(role => getRoleDisplayName(role)).join(', ')}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Additional Info */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                    <h3 className="text-xl font-semibold text-slate-900 mb-4">Información del Sistema</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-medium text-slate-700 mb-2">Tu Cuenta</h4>
                            <div className="space-y-1 text-sm text-slate-600">
                                <p><strong>Usuario:</strong> {user?.username}</p>
                                <p><strong>Email:</strong> {user?.email}</p>
                                <p><strong>Rol:</strong> {getRoleDisplayName(user?.rol)}</p>
                                {user?.ultimoAcceso && (
                                    <p><strong>Último acceso:</strong> {new Date(user.ultimoAcceso).toLocaleString()}</p>
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
        </div>
    );
};

export default Dashboard;