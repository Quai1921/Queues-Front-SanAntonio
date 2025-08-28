import React from 'react';
import { Close, Warning, CheckCircle, Cancel } from '@mui/icons-material';

const ConfirmarAccionModal = ({ isOpen, onClose, onConfirm, loading = false, accion, elemento }) => {
    if (!isOpen) return null;

    const esActivar = accion === 'activar';
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                    <div className="flex items-center">
                        <div className={`p-2 rounded-lg mr-3 ${
                            esActivar ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                            {esActivar ? (
                                <CheckCircle className="h-6 w-6 text-green-600" />
                            ) : (
                                <Cancel className="h-6 w-6 text-red-600" />
                            )}
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900">
                            {esActivar ? 'Activar' : 'Desactivar'} Horario
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="text-slate-400 hover:text-slate-600 transition-colors p-2"
                    >
                        <Close className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-6">
                    <div className="flex items-start">
                        <div>
                            <p className="text-slate-900">
                                ¿Está seguro que desea <strong>{accion}</strong> este horario?
                            </p>
                            <p className="text-slate-600 text-sm mt-2">
                                {elemento}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end space-x-3 p-6 border-t border-slate-200">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="px-4 py-2 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={loading}
                        className={`flex items-center px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 ${
                            esActivar 
                                ? 'bg-green-600 hover:bg-green-700' 
                                : 'bg-red-600 hover:bg-red-700'
                        }`}
                    >
                        {loading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        ) : null}
                        {esActivar ? 'Activar' : 'Desactivar'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmarAccionModal;