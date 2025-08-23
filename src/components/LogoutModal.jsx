import React from 'react';
import {
    ExitToApp,
    Warning,
    Close,
    Check,
    Cancel
} from '@mui/icons-material';
import LoadingSpinner from './LoadingSpinner';

/**
 * Modal de confirmación para cerrar sesión
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Si el modal está abierto
 * @param {boolean} props.isLoading - Si está procesando el logout
 * @param {Function} props.onConfirm - Función a ejecutar al confirmar
 * @param {Function} props.onCancel - Función a ejecutar al cancelar
 * @param {string} props.userName - Nombre del usuario actual
 */
const LogoutModal = ({
    isOpen,
    isLoading,
    onConfirm,
    onCancel,
    userName = 'Usuario'
}) => {

    if (!isOpen) return null;

    // Si está cargando, mostrar spinner de pantalla completa
    if (isLoading) {
        return <LoadingSpinner message="Cerrando sesión..." />;
    }

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"
                onClick={onCancel}
            />

            {/* Modal Container */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">

                    {/* Close button */}
                    <button
                        onClick={onCancel}
                        className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <Close className="h-6 w-6" />
                    </button>

                    {/* Modal Content */}
                    <div className="p-8">

                        {/* Icon and Title */}
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                                <Warning className="h-8 w-8 text-red-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-slate-900 mb-2">
                                Cerrar sesión
                            </h3>
                            <p className="text-slate-600">
                                ¿Estás seguro que deseas salir del sistema?
                            </p>
                        </div>

                        {/* User Info */}
                        <div className="bg-slate-50 rounded-lg p-4 mb-6">
                            <div className="flex items-center">
                                <div className="w-10 h-10 bg-slate-300 rounded-full flex items-center justify-center mr-3">
                                    <ExitToApp className="h-5 w-5 text-slate-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-900">
                                        {userName}
                                    </p>
                                    <p className="text-xs text-slate-600">
                                        Se cerrará tu sesión actual
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Warning Message */}
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                            <div className="flex">
                                <Warning className="h-5 w-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-yellow-800">
                                    <p className="font-medium mb-1">Importante:</p>
                                    <ul className="list-disc list-inside space-y-1 text-xs">
                                        <li>Se cerrarán todas las ventanas del sistema</li>
                                        <li>Los datos no guardados se perderán</li>
                                        <li>Tendrás que iniciar sesión nuevamente</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row-reverse gap-3">
                            <button
                                onClick={onConfirm}
                                disabled={isLoading}
                                className="flex items-center justify-center px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium rounded-lg transition-colors disabled:cursor-not-allowed"
                            >
                                <ExitToApp className="mr-2 h-4 w-4" />
                                {isLoading ? 'Cerrando...' : 'Sí, Cerrar Sesión'}
                            </button>

                            <button
                                onClick={onCancel}
                                disabled={isLoading}
                                className="flex items-center justify-center px-6 py-3 border border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-700 hover:text-slate-900 font-medium rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <Cancel className="mr-2 h-4 w-4" />
                                Cancelar
                            </button>
                        </div>
                    </div>

                    {/* Additional Footer */}
                    <div className="bg-slate-50 px-8 py-4 border-t border-slate-200">
                        <p className="text-xs text-slate-500 text-center">
                            Tu sesión se mantendrá segura hasta que decidas volver a ingresar
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LogoutModal;