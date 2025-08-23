import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
    Group,
    Settings,
    Assignment,
    ExitToApp,
    Person,
    Business
} from '@mui/icons-material';

const Dashboard = () => {
    const navigate = useNavigate();
    const { getUser, logout, getRoleName } = useAuth();

    const user = getUser();

    const handleLogout = () => {
        if (window.confirm('¿Estás seguro que deseas cerrar sesión?')) {
            logout();
        }
    };

    // Configurar opciones del menú según el rol
    const getMenuOptions = () => {
        if (!user) return [];

        const options = [];

        // Opción de operador - disponible para todos
        options.push({
            title: 'Panel de Operador',
            description: 'Gestionar turnos y atención al público',
            icon: Assignment,
            color: 'bg-green-500',
            hoverColor: 'hover:bg-green-600',
            action: () => navigate('/operador'),
            available: true
        });

        // Opción de responsable - para ADMIN y RESPONSABLE_SECTOR
        if (user.hasRole('ADMIN') || user.hasRole('RESPONSABLE_SECTOR')) {
            options.push({
                title: 'Panel de Responsable',
                description: 'Supervisar sectores y generar reportes',
                icon: Group,
                color: 'bg-blue-500',
                hoverColor: 'hover:bg-blue-600',
                action: () => navigate('/responsable'),
                available: true
            });
        }

        // Opción de administrador - solo para ADMIN
        if (user.hasRole('ADMIN')) {
            options.push({
                title: 'Panel de Administración',
                description: 'Configurar sistema y gestionar usuarios',
                icon: Settings,
                color: 'bg-purple-500',
                hoverColor: 'hover:bg-purple-600',
                action: () => navigate('/admin'),
                available: true
            });
        }

        return options;
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const menuOptions = getMenuOptions();

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                <Business className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-semibold text-gray-900">
                                    Sistema de Turnos
                                </h1>
                                <p className="text-sm text-gray-600">San Antonio</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            {/* Información del usuario */}
                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">{user.nombreCompleto}</p>
                                <p className="text-xs text-gray-600">{getRoleName()}</p>
                            </div>

                            {/* Avatar */}
                            <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                                <Person className="h-6 w-6 text-gray-600" />
                            </div>

                            {/* Botón logout */}
                            <button
                                onClick={handleLogout}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Cerrar sesión"
                            >
                                <ExitToApp className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Contenido principal */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Bienvenida */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        ¡Bienvenido, {user.nombre}!
                    </h2>
                    <p className="text-gray-600">
                        Selecciona el panel que deseas utilizar según tus permisos de {getRoleName()}.
                    </p>
                </div>

                {/* Información del usuario */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Información de la Sesión</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <p className="text-sm text-gray-600">Usuario</p>
                            <p className="font-medium text-gray-900">{user.username}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Rol</p>
                            <p className="font-medium text-gray-900">{getRoleName()}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Email</p>
                            <p className="font-medium text-gray-900">{user.email || 'No especificado'}</p>
                        </div>
                        {user.sector && (
                            <div>
                                <p className="text-sm text-gray-600">Sector Asignado</p>
                                <p className="font-medium text-gray-900">
                                    {user.sector.codigo} - {user.sector.nombre}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Paneles disponibles */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {menuOptions.map((option, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 cursor-pointer transform hover:scale-[1.02]"
                            onClick={option.action}
                        >
                            <div className="flex items-center space-x-4 mb-4">
                                <div className={`p-3 rounded-lg ${option.color}`}>
                                    <option.icon className="h-6 w-6 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-medium text-gray-900">
                                        {option.title}
                                    </h3>
                                </div>
                            </div>
                            <p className="text-gray-600 mb-4">
                                {option.description}
                            </p>
                            <div className="flex justify-end">
                                <button className={`px-4 py-2 text-sm font-medium text-white rounded-lg ${option.color} ${option.hoverColor} transition-colors`}>
                                    Acceder
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="mt-12 text-center text-sm text-gray-500">
                    <p>Sistema de Gestión de Turnos - Municipalidad de San Antonio</p>
                    <p className="mt-1">
                        Última conexión: {user.ultimoAcceso ? new Date(user.ultimoAcceso).toLocaleString() : 'Primera vez'}
                    </p>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;