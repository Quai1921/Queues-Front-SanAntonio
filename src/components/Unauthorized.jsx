import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Block,
    ArrowBack,
    Home,
    Security,
    Person
} from '@mui/icons-material';

const Unauthorized = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    // Obtener información del error desde el state de navegación
    const { reason, currentRole, from } = location.state || {};

    const handleGoBack = () => {
        // Si hay una ruta anterior, ir ahí, sino al dashboard
        if (window.history.length > 2) {
            navigate(-1);
        } else {
            navigate('/dashboard', { replace: true });
        }
    };

    const handleGoHome = () => {
        navigate('/dashboard', { replace: true });
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login', { replace: true });
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

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-4">
            <div className="w-full max-w-2xl">
                {/* Card Container */}
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">

                    {/* Header */}
                    <div className="px-8 py-10 bg-red-600 text-white">
                        <div className="flex justify-center items-center mb-6">
                            <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20">
                                <Block className="text-white" style={{ fontSize: '3rem' }} />
                            </div>
                        </div>

                        <div className="text-center">
                            <h1 className="text-3xl font-bold mb-2">Acceso Denegado</h1>
                            <p className="text-white/90 text-lg">
                                No tienes permisos para acceder a esta sección
                            </p>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="px-8 py-10">

                        {/* Error Details */}
                        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
                            <div className="flex items-start">
                                <Security className="text-red-600 mr-3 mt-1" />
                                <div className="flex-1">
                                    <h3 className="text-red-800 font-semibold mb-2">
                                        Detalles del Error
                                    </h3>
                                    <p className="text-red-700 mb-3">
                                        {reason || 'No tienes los permisos necesarios para acceder a esta página.'}
                                    </p>

                                    {currentRole && (
                                        <div className="text-sm text-red-600">
                                            <strong>Tu rol actual:</strong> {getRoleDisplayName(currentRole)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* User Info */}
                        {user && (
                            <div className="bg-slate-50 rounded-lg p-6 mb-8">
                                <div className="flex items-center mb-4">
                                    <Person className="text-[#224666] mr-3" />
                                    <h3 className="text-[#224666] font-semibold">Información de Usuario</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-slate-600 font-medium">Nombre:</span>
                                        <p className="text-slate-800">{user.nombreCompleto}</p>
                                    </div>
                                    <div>
                                        <span className="text-slate-600 font-medium">Usuario:</span>
                                        <p className="text-slate-800">{user.username}</p>
                                    </div>
                                    <div>
                                        <span className="text-slate-600 font-medium">Rol:</span>
                                        <p className="text-slate-800">{getRoleDisplayName(user.rol)}</p>
                                    </div>
                                    <div>
                                        <span className="text-slate-600 font-medium">Email:</span>
                                        <p className="text-slate-800">{user.email}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={handleGoBack}
                                className="flex items-center justify-center px-6 py-3 bg-[#5F78AD] hover:bg-[#4a6690] text-white font-medium rounded-lg transition-colors"
                            >
                                <ArrowBack className="mr-2" />
                                Volver Atrás
                            </button>

                            <button
                                onClick={handleGoHome}
                                className="flex items-center justify-center px-6 py-3 bg-[#224666] hover:bg-[#1a3a52] text-white font-medium rounded-lg transition-colors"
                            >
                                <Home className="mr-2" />
                                Ir al Dashboard
                            </button>

                            <button
                                onClick={handleLogout}
                                className="flex items-center justify-center px-6 py-3 border border-slate-300 hover:border-slate-400 text-slate-700 hover:text-slate-800 font-medium rounded-lg transition-colors"
                            >
                                Cambiar Usuario
                            </button>
                        </div>

                        {/* Additional Help */}
                        <div className="mt-8 pt-6 border-t border-slate-200">
                            <div className="text-center text-slate-600">
                                <h4 className="font-medium mb-2">¿Necesitas acceso a esta sección?</h4>
                                <p className="text-sm mb-4">
                                    Contacta al administrador del sistema para solicitar los permisos necesarios.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-8 text-sm text-slate-600">
                    <p>© {new Date().getFullYear()} Portal de Atención Municipal</p>
                    <p>Municipalidad de San Antonio de Arredondo</p>
                </div>
            </div>
        </div>
    );
};

export default Unauthorized;