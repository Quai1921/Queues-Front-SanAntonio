import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Warning, Home, ArrowBack } from '@mui/icons-material';

const Unauthorized = () => {
    const navigate = useNavigate();
    const { getUser, getRoleName } = useAuth();

    const user = getUser();

    const handleGoBack = () => {
        navigate(-1);
    };

    const handleGoHome = () => {
        navigate('/dashboard');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 text-center">

                {/* Icono de advertencia */}
                <div className="mx-auto h-24 w-24 bg-red-100 rounded-full flex items-center justify-center mb-8">
                    <Warning className="h-12 w-12 text-red-600" />
                </div>

                {/* Título y mensaje */}
                <div className="space-y-4">
                    <h1 className="text-4xl font-bold text-gray-900">403</h1>
                    <h2 className="text-2xl font-semibold text-gray-800">
                        Acceso Denegado
                    </h2>
                    <p className="text-gray-600 max-w-sm mx-auto">
                        No tienes permisos suficientes para acceder a esta página.
                    </p>
                </div>

                {/* Información del usuario actual */}
                {user && (
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-sm font-medium text-gray-900 mb-2">
                            Usuario actual
                        </h3>
                        <div className="space-y-1 text-sm text-gray-600">
                            <p><span className="font-medium">Nombre:</span> {user.nombreCompleto}</p>
                            <p><span className="font-medium">Usuario:</span> {user.username}</p>
                            <p><span className="font-medium">Rol:</span> {getRoleName()}</p>
                        </div>
                    </div>
                )}

                {/* Botones de acción */}
                <div className="space-y-3 pt-6">
                    <button
                        onClick={handleGoBack}
                        className="w-full inline-flex justify-center items-center px-4 py-3 border border-gray-300 shadow-sm bg-white text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                    >
                        <ArrowBack className="h-5 w-5 mr-2" />
                        Volver Atrás
                    </button>

                    <button
                        onClick={handleGoHome}
                        className="w-full inline-flex justify-center items-center px-4 py-3 border border-transparent shadow-sm bg-blue-600 text-sm font-medium rounded-lg text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                        <Home className="h-5 w-5 mr-2" />
                        Ir al Inicio
                    </button>
                </div>

                {/* Footer */}
                <div className="pt-8 text-xs text-gray-500">
                    <p>Si crees que esto es un error, contacta al administrador del sistema.</p>
                </div>
            </div>
        </div>
    );
};

export default Unauthorized;