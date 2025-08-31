import React, { useState, useEffect } from 'react';
import {
    Close,
    Business,
    Save,
    Person,
    Assignment,
    Clear,
    Warning
} from '@mui/icons-material';

/**
 * Modal para desasignar sector de un empleado
 * La asignación se hace desde SectoresSection
 */
const AsignarSectorModal = ({ isOpen, onClose, onSubmit, empleado, loading = false }) => {
    const [errors, setErrors] = useState({});

    // Limpiar errores cuando se abre el modal
    useEffect(() => {
        if (isOpen) {
            setErrors({});
        }
    }, [isOpen]);

    const validateForm = () => {
        const newErrors = {};

        // Los responsables de sector NO pueden ser desasignados
        if (empleado?.rol === 'RESPONSABLE_SECTOR') {
            newErrors.general = 'Los responsables de sector no pueden ser desasignados desde aquí. Cámbielos a otro rol primero o asigne otro responsable al sector.';
        }

        // Los admins no necesitan sectores, así que siempre se pueden "desasignar"
        // Los operadores sin sector asignado no necesitan desasignación
        if (empleado?.rol === 'OPERADOR' && !empleado?.sectorCodigo) {
            newErrors.general = 'Este operador no tiene ningún sector asignado.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const sectorData = { sectorId: null };
        onSubmit(sectorData);
    };

    const handleClose = () => {
        if (!loading) {
            onClose();
        }
    };

    const getRolLabel = (rol) => {
        switch (rol) {
            case 'ADMIN':
                return 'Administrador';
            case 'RESPONSABLE_SECTOR':
                return 'Responsable de Sector';
            case 'OPERADOR':
                return 'Operador';
            default:
                return 'Sin rol';
        }
    };

    const getRolColor = (rol) => {
        switch (rol) {
            case 'ADMIN':
                return 'bg-purple-100 text-purple-800';
            case 'RESPONSABLE_SECTOR':
                return 'bg-slate-100 text-slate-800';
            case 'OPERADOR':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-slate-100 text-slate-800';
        }
    };

    if (!isOpen) return null;

    const puedeDesasignar = empleado?.rol !== 'RESPONSABLE_SECTOR' && empleado?.sectorCodigo;
    const tieneErrors = Object.keys(errors).length > 0;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-slate-50">
                    <div className="flex items-center">
                        <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center mr-3">
                            <Clear className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900">Desasignar Sector</h2>
                            <p className="text-sm text-slate-600">
                                {empleado ? `${empleado.nombreCompleto} - ${getRolLabel(empleado.rol)}` : ''}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        disabled={loading}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                    >
                        <Close className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-6">
                    {/* Información del empleado */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center mr-4">
                                    <Person className="h-6 w-6 text-slate-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-900">{empleado?.nombreCompleto}</p>
                                    <p className="text-sm text-slate-600">@{empleado?.username}</p>
                                    <div className="flex items-center mt-1">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRolColor(empleado?.rol)}`}>
                                            {getRolLabel(empleado?.rol)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sector actual */}
                    {empleado?.sectorCodigo ? (
                        <div className="mb-6">
                            <p className="text-sm font-medium text-slate-700 mb-2">Sector Actual:</p>
                            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-900">
                                            <span className="font-mono">{empleado.sectorCodigo}</span>
                                            <span className="ml-2">{empleado.sectorNombre}</span>
                                        </p>
                                    </div>
                                    <Business className="h-5 w-5 text-slate-600" />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="mb-6">
                            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-center">
                                <Business className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                                <p className="text-slate-600">Sin sector asignado</p>
                            </div>
                        </div>
                    )}

                    {/* Mensajes de error o información */}
                    {tieneErrors ? (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-start">
                                <Warning className="h-5 w-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-red-800 font-medium">No se puede desasignar</p>
                                    <p className="text-red-700 text-sm mt-1">{errors.general}</p>
                                </div>
                            </div>
                        </div>
                    ) : puedeDesasignar ? (
                        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                            <div className="flex items-start">
                                <Warning className="h-5 w-5 text-amber-600 mr-3 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-amber-800 font-medium">Confirmar desasignación</p>
                                    <p className="text-amber-700 text-sm mt-1">
                                        El empleado será removido del sector <strong>{empleado?.sectorCodigo}</strong> y quedará disponible para ser asignado a otro sector desde la gestión de sectores.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                            <div className="flex items-start">
                                <Assignment className="h-5 w-5 text-slate-600 mr-3 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-slate-800 font-medium">Para asignar sectores</p>
                                    <p className="text-slate-700 text-sm mt-1">
                                        Ve a <strong>Gestión de Sectores</strong> y utiliza los botones "Asignar Responsable" o "Asignar Operador" según corresponda.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Botones */}
                    <div className="flex items-center justify-end space-x-3 pt-6 mt-6 border-t border-slate-200">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={loading}
                            className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
                        >
                            Cancelar
                        </button>

                        {puedeDesasignar && (
                            <button
                                type="submit"
                                disabled={loading || tieneErrors}
                                className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Desasignando...
                                    </>
                                ) : (
                                    <>
                                        <Clear className="mr-2 h-4 w-4" />
                                        Desasignar del Sector
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AsignarSectorModal;