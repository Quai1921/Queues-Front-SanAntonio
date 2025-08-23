import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    ManageAccounts,
    Business,
    Settings,
    Dashboard as DashboardIcon,
    Group,
    Add,
    Edit,
    Delete,
    Search,
    FilterList,
    ArrowBack,
    AdminPanelSettings,
    Security,
    Assignment,
    Schedule,
    Message,
    Assessment
} from '@mui/icons-material';

/**
 * Panel de administración principal - Solo para usuarios ADMIN
 */
const AdminPanel = () => {
    const { user, hasRole } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [activeSection, setActiveSection] = useState('dashboard');

    // Verificar que es admin (doble verificación)
    if (!hasRole('ADMIN')) {
        return <Navigate to="/unauthorized" replace />;
    }

    // Configuración del menú lateral
    const menuItems = [
        {
            id: 'dashboard',
            title: 'Resumen',
            icon: <DashboardIcon />,
            path: '/admin',
            description: 'Vista general del sistema'
        },
        {
            id: 'empleados',
            title: 'Empleados',
            icon: <ManageAccounts />,
            path: '/admin/empleados',
            description: 'Gestionar usuarios y permisos'
        },
        {
            id: 'sectores',
            title: 'Sectores',
            icon: <Business />,
            path: '/admin/sectores',
            description: 'Administrar sectores municipales'
        },
        {
            id: 'configuracion',
            title: 'Configuración',
            icon: <Settings />,
            path: '/admin/configuracion',
            description: 'Ajustes del sistema'
        }
    ];

    const handleMenuClick = (item) => {
        setActiveSection(item.id);
        navigate(item.path);
    };

    const getCurrentSection = () => {
        const path = location.pathname;
        if (path.includes('empleados')) return 'empleados';
        if (path.includes('sectores')) return 'sectores';
        if (path.includes('configuracion')) return 'configuracion';
        return 'dashboard';
    };

    return (
        <div className="min-h-screen bg-slate-50 flex">

            {/* Sidebar */}
            <div className="w-72 bg-white shadow-lg border-r border-slate-200 flex flex-col">

                {/* Header del sidebar */}
                <div className="p-6 border-b border-slate-200">
                    <div className="flex items-center mb-4">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="flex items-center text-slate-600 hover:text-[#224666] transition-colors mr-3"
                        >
                            <ArrowBack className="h-5 w-5" />
                        </button>
                        <div className="w-10 h-10 bg-[#224666] rounded-lg flex items-center justify-center">
                            <AdminPanelSettings className="text-white" />
                        </div>
                    </div>
                    <h1 className="text-xl font-bold text-[#224666]">Panel de Administración</h1>
                    <p className="text-sm text-slate-600 mt-1">Gestión completa del sistema</p>
                </div>

                {/* Navegación */}
                <nav className="flex-1 p-4">
                    <ul className="space-y-2">
                        {menuItems.map((item) => {
                            const isActive = getCurrentSection() === item.id;
                            return (
                                <li key={item.id}>
                                    <button
                                        onClick={() => handleMenuClick(item)}
                                        className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-all duration-200 ${isActive
                                                ? 'bg-[#224666] text-white shadow-md'
                                                : 'text-slate-700 hover:bg-slate-100 hover:text-[#224666]'
                                            }`}
                                    >
                                        <div className={`mr-3 ${isActive ? 'text-white' : 'text-slate-500'}`}>
                                            {item.icon}
                                        </div>
                                        <div>
                                            <div className="font-medium">{item.title}</div>
                                            <div className={`text-xs ${isActive ? 'text-white/80' : 'text-slate-500'}`}>
                                                {item.description}
                                            </div>
                                        </div>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* Usuario info */}
                <div className="p-4 border-t border-slate-200">
                    <div className="flex items-center">
                        <div className="w-8 h-8 bg-[#5F78AD] rounded-full flex items-center justify-center">
                            <Security className="text-white text-sm" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-slate-900">{user?.nombre}</p>
                            <p className="text-xs text-slate-600">Administrador</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contenido principal */}
            <div className="flex-1 flex flex-col">

                {/* Header del contenido */}
                <header className="bg-white shadow-sm border-b border-slate-200 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">
                                {menuItems.find(item => item.id === getCurrentSection())?.title || 'Administración'}
                            </h2>
                            <p className="text-slate-600 mt-1">
                                {menuItems.find(item => item.id === getCurrentSection())?.description}
                            </p>
                        </div>
                    </div>
                </header>

                {/* Contenido de las rutas */}
                <main className="flex-1 p-6">
                    <Routes>
                        <Route index element={<AdminDashboard />} />
                        <Route path="empleados" element={<EmpleadosSection />} />
                        <Route path="sectores" element={<SectoresSection />} />
                        <Route path="configuracion" element={<ConfiguracionSection />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
};

// Componente del Dashboard de administración
const AdminDashboard = () => {
    const statsCards = [
        {
            title: 'Total Empleados',
            value: '--',
            icon: <Group className="text-2xl" />,
            color: 'from-blue-500 to-blue-600'
        },
        {
            title: 'Sectores Activos',
            value: '--',
            icon: <Business className="text-2xl" />,
            color: 'from-green-500 to-green-600'
        },
        {
            title: 'Turnos Hoy',
            value: '--',
            icon: <Assignment className="text-2xl" />,
            color: 'from-purple-500 to-purple-600'
        },
        {
            title: 'Sistema',
            value: 'Online',
            icon: <Settings className="text-2xl" />,
            color: 'from-orange-500 to-orange-600'
        }
    ];

    const quickActions = [
        {
            title: 'Crear Empleado',
            description: 'Agregar nuevo usuario al sistema',
            icon: <Add className="text-xl" />,
            onClick: () => console.log('Crear empleado')
        },
        {
            title: 'Nuevo Sector',
            description: 'Configurar sector municipal',
            icon: <Business className="text-xl" />,
            onClick: () => console.log('Crear sector')
        },
        {
            title: 'Configurar Sistema',
            description: 'Ajustar parámetros generales',
            icon: <Settings className="text-xl" />,
            onClick: () => console.log('Configuración')
        }
    ];

    return (
        <div className="space-y-6">

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statsCards.map((card, index) => (
                    <div key={index} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-600 text-sm font-medium">{card.title}</p>
                                <p className="text-2xl font-bold text-slate-900 mt-1">{card.value}</p>
                            </div>
                            <div className={`w-12 h-12 bg-gradient-to-r ${card.color} rounded-lg flex items-center justify-center text-white`}>
                                {card.icon}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Acciones Rápidas</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {quickActions.map((action, index) => (
                        <button
                            key={index}
                            onClick={action.onClick}
                            className="p-4 border border-slate-200 rounded-lg hover:border-[#5F78AD] hover:bg-slate-50 transition-all duration-200 text-left"
                        >
                            <div className="flex items-center mb-2">
                                <div className="w-8 h-8 bg-[#224666] rounded-lg flex items-center justify-center text-white mr-3">
                                    {action.icon}
                                </div>
                                <h4 className="font-medium text-slate-900">{action.title}</h4>
                            </div>
                            <p className="text-sm text-slate-600">{action.description}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Actividad Reciente</h3>
                <div className="space-y-4">
                    <div className="flex items-center p-3 bg-slate-50 rounded-lg">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Group className="text-blue-600 text-sm" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-slate-900">Nuevo empleado registrado</p>
                            <p className="text-xs text-slate-600">Hace 2 horas</p>
                        </div>
                    </div>

                    <div className="flex items-center p-3 bg-slate-50 rounded-lg">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <Business className="text-green-600 text-sm" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-slate-900">Sector actualizado</p>
                            <p className="text-xs text-slate-600">Hace 4 horas</p>
                        </div>
                    </div>

                    <div className="flex items-center p-3 bg-slate-50 rounded-lg">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                            <Settings className="text-orange-600 text-sm" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-slate-900">Configuración modificada</p>
                            <p className="text-xs text-slate-600">Ayer</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Componente de gestión de empleados
const EmpleadosSection = () => {
    return (
        <div className="space-y-6">

            {/* Header con acciones */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-slate-900">Lista de Empleados</h3>
                    <p className="text-slate-600 text-sm">Gestiona usuarios y sus permisos</p>
                </div>
                <button className="flex items-center px-4 py-2 bg-[#224666] text-white rounded-lg hover:bg-[#1a3a52] transition-colors">
                    <Add className="mr-2 h-4 w-4" />
                    Nuevo Empleado
                </button>
            </div>

            {/* Filtros y búsqueda */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                            <input
                                type="text"
                                placeholder="Buscar empleados..."
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg"
                            />
                        </div>
                    </div>
                    <button className="flex items-center px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50">
                        <FilterList className="mr-2 h-4 w-4" />
                        Filtros
                    </button>
                </div>
            </div>

            {/* Tabla placeholder */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="text-center py-12">
                    <Group className="mx-auto h-12 w-12 text-slate-400" />
                    <h3 className="mt-4 text-lg font-medium text-slate-900">Lista de Empleados</h3>
                    <p className="mt-2 text-slate-600">
                        Aquí se mostrará la tabla con todos los empleados del sistema
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                        Implementación pendiente - Requiere integración con API /api/admin/empleados
                    </p>
                </div>
            </div>
        </div>
    );
};

// Componente de gestión de sectores
const SectoresSection = () => {
    return (
        <div className="space-y-6">

            {/* Header con acciones */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-slate-900">Sectores Municipales</h3>
                    <p className="text-slate-600 text-sm">Administra sectores y responsables</p>
                </div>
                <button className="flex items-center px-4 py-2 bg-[#224666] text-white rounded-lg hover:bg-[#1a3a52] transition-colors">
                    <Add className="mr-2 h-4 w-4" />
                    Nuevo Sector
                </button>
            </div>

            {/* Contenido placeholder */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="text-center py-12">
                    <Business className="mx-auto h-12 w-12 text-slate-400" />
                    <h3 className="mt-4 text-lg font-medium text-slate-900">Gestión de Sectores</h3>
                    <p className="mt-2 text-slate-600">
                        Aquí se mostrará la gestión completa de sectores municipales
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                        Implementación pendiente - Requiere integración con API /api/sectores
                    </p>
                </div>
            </div>
        </div>
    );
};

// Componente de configuración del sistema
const ConfiguracionSection = () => {
    return (
        <div className="space-y-6">

            {/* Header */}
            <div>
                <h3 className="text-lg font-semibold text-slate-900">Configuración del Sistema</h3>
                <p className="text-slate-600 text-sm">Ajusta parámetros generales y configuraciones</p>
            </div>

            {/* Contenido placeholder */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="text-center py-12">
                    <Settings className="mx-auto h-12 w-12 text-slate-400" />
                    <h3 className="mt-4 text-lg font-medium text-slate-900">Configuraciones</h3>
                    <p className="mt-2 text-slate-600">
                        Panel de configuración general del sistema de turnos
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                        Implementación pendiente - Requiere integración con API /api/configuracion
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;