import React from 'react';
import { 
    Close, 
    Warning, 
    CheckCircle, 
    Cancel, 
    PlayArrow,
    Stop,
    Delete,
    Edit
} from '@mui/icons-material';

const ConfirmarAccionModal = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    loading = false,
    titulo = "Confirmar Acción",
    mensaje = "¿Estás seguro de realizar esta acción?",
    descripcion = null,
    textoConfirmar = "Confirmar",
    textoCancel = "Cancelar",
    tipoAccion = "confirmar", // confirmar, activar, desactivar, eliminar, editar
    icono = null
}) => {
    if (!isOpen) return null;

    // Configuración por tipo de acción
    const configuracionesTipo = {
        confirmar: {
            color: 'bg-blue-600 hover:bg-blue-700',
            bgIcono: 'bg-blue-100',
            colorIcono: 'text-blue-600',
            iconoPorDefecto: <CheckCircle className="h-6 w-6" />
        },
        activar: {
            color: 'bg-green-600 hover:bg-green-700',
            bgIcono: 'bg-slate-100',
            colorIcono: 'text-slate-600',
            iconoPorDefecto: <PlayArrow className="h-6 w-6" />
        },
        desactivar: {
            color: 'bg-red-600 hover:bg-red-700',
            bgIcono: 'bg-red-100',
            colorIcono: 'text-red-600',
            iconoPorDefecto: <Stop className="h-6 w-6" />
        },
        eliminar: {
            color: 'bg-red-600 hover:bg-red-700',
            bgIcono: 'bg-red-100',
            colorIcono: 'text-red-600',
            iconoPorDefecto: <Delete className="h-6 w-6" />
        },
        editar: {
            color: 'bg-yellow-600 hover:bg-yellow-700',
            bgIcono: 'bg-yellow-100',
            colorIcono: 'text-yellow-600',
            iconoPorDefecto: <Edit className="h-6 w-6" />
        }
    };

    const config = configuracionesTipo[tipoAccion] || configuracionesTipo.confirmar;
    const iconoFinal = icono || config.iconoPorDefecto;
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md text-sm">
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                    <div className="flex items-center">
                        <div className={`p-2 rounded-md mr-3 ${config.bgIcono}`}>
                            <div className={config.colorIcono}>
                                {iconoFinal}
                            </div>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900">
                            {titulo}
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="text-slate-400 hover:text-slate-600 transition-colors p-2 disabled:opacity-50"
                    >
                        <Close className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-6">
                    <div className="flex items-start">
                        <div>
                            <p className="text-slate-900 mb-2">
                                {mensaje}
                            </p>
                            {descripcion && (
                                <p className="text-slate-600 text-sm">
                                    {descripcion}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end space-x-3 p-6 border-t border-slate-200">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="px-4 h-8 text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors disabled:opacity-50"
                    >
                        {textoCancel}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={loading}
                        className={`flex items-center px-4 h-8 text-white rounded-md transition-colors disabled:opacity-50 ${config.color}`}
                    >
                        {loading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        ) : null}
                        {textoConfirmar}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmarAccionModal;