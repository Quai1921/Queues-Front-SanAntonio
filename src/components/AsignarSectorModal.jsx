import React, { useState, useEffect } from 'react';
import {
    Close,
    Business,
    Save,
    Person,
    Assignment,
    Clear
} from '@mui/icons-material';
import sectoresService from '../services/sectoresService';

/**
 * Modal para asignar/desasignar sector a un empleado
 */
const AsignarSectorModal = ({ isOpen, onClose, onSubmit, empleado, loading = false }) => {
    const [formData, setFormData] = useState({
        sectorId: ''
    });

    const [sectores, setSectores] = useState([]);
    const [loadingSectores, setLoadingSectores] = useState(false);
    const [errors, setErrors] = useState({});

    // Cargar sectores y datos del empleado cuando se abre el modal
    useEffect(() => {
        if (isOpen && empleado) {
            cargarSectores();
            setFormData({
                sectorId: empleado.sectorResponsable?.id?.toString() || ''
            });
            setErrors({});
        }
    }, [isOpen, empleado]);

    const cargarSectores = async () => {
        setLoadingSectores(true);
        try {
            const data = await sectoresService.obtenerTodos();
            setSectores(data.filter(s => s.sector?.activo) || []);
        } catch (error) {
            console.error('Error cargando sectores:', error);
            setSectores([]);
        } finally {
            setLoadingSectores(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Limpiar error cuando cambia el valor
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Para responsables de sector, el sector es obligatorio
        if (empleado?.rol === 'RESPONSABLE_SECTOR' && !formData.sectorId) {
            newErrors.sectorId = 'Los responsables de sector deben tener un sector asignado';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        // Preparar datos para envío
        const sectorData = formData.sectorId
            ? { sectorId: parseInt(formData.sectorId) }
            : { sectorId: null }; // Para desasignar

        onSubmit(sectorData);
    };

    const handleDesasignar = () => {
        setFormData({ sectorId: '' });
    };

    const handleClose = () => {
        if (!loading) {
            onClose();
        }
    };

    const getSectorActual = () => {
        if (!empleado?.sectorResponsable) return null;
        return empleado.sectorResponsable;
    };

    const getRolColor = (rol) => {
        switch (rol) {
            case 'ADMIN':
                return 'bg-purple-100 text-purple-800';
            case 'RESPONSABLE_SECTOR':
                return 'bg-blue-100 text-blue-800';
            case 'OPERADOR':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-slate-100 text-slate-800';
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

    if (!isOpen) return null;

    const sectorActual = getSectorActual();
    const isResponsable = empleado?.rol === 'RESPONSABLE_SECTOR';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-slate-50">
                    <div className="flex items-center">
                        <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
                            <Assignment className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900">Asignar Sector</h2>
                            <p className="text-sm text-slate-600">
                                {empleado ? `Usuario: @${empleado.username}` : 'Cargando...'}
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

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-4">
                        {/* Información del empleado */}
                        <div className="bg-slate-50 p-4 rounded-lg">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center mr-3">
                                        <Person className="h-4 w-4 text-slate-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900">
                                            {empleado?.nombreCompleto}
                                        </p>
                                        <p className="text-sm text-slate-600">
                                            {empleado?.email || 'Sin email'}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRolColor(empleado?.rol)}`}>
                                        {getRolLabel(empleado?.rol)}
                                    </span>
                                    <p className="text-xs text-slate-500 mt-1">
                                        ID: #{empleado?.id}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Sector actual */}
                        {sectorActual && (
                            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-blue-900">Sector Actual</p>
                                        <p className="text-blue-800">
                                            <span className="font-mono text-sm">{sectorActual.codigo}</span>
                                            <span className="ml-2">{sectorActual.nombre}</span>
                                        </p>
                                        {sectorActual.descripcion && (
                                            <p className="text-blue-700 text-sm mt-1">
                                                {sectorActual.descripcion}
                                            </p>
                                        )}
                                    </div>
                                    <Business className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                        )}

                        {/* Selector de sector */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                {sectorActual ? 'Cambiar a Sector' : 'Asignar Sector'}
                                {isResponsable && <span className="text-red-500 ml-1">*</span>}
                            </label>

                            <div className="space-y-3">
                                {/* Opción para desasignar (solo si no es responsable) */}
                                {!isResponsable && (
                                    <label className="flex items-center p-3 border-2 border-slate-200 rounded-lg cursor-pointer hover:border-slate-300 transition-colors">
                                        <input
                                            type="radio"
                                            name="sectorId"
                                            value=""
                                            checked={formData.sectorId === ''}
                                            onChange={handleInputChange}
                                            className="hidden"
                                        />
                                        <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${formData.sectorId === ''
                                                ? 'border-slate-500 bg-slate-500'
                                                : 'border-slate-300'
                                            }`}>
                                            {formData.sectorId === '' && (
                                                <div className="w-2 h-2 bg-white rounded-full"></div>
                                            )}
                                        </div>
                                        <div className="flex items-center">
                                            <Clear className="h-4 w-4 text-slate-500 mr-2" />
                                            <span className="text-slate-700">Sin sector asignado</span>
                                        </div>
                                    </label>
                                )}

                                {/* Lista de sectores disponibles */}
                                {loadingSectores ? (
                                    <div className="flex items-center justify-center py-6">
                                        <div className="flex items-center space-x-2 text-slate-500">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-400"></div>
                                            <span className="text-sm">Cargando sectores...</span>
                                        </div>
                                    </div>
                                ) : sectores.length > 0 ? (
                                    <div className="max-h-60 overflow-y-auto space-y-2">
                                        {sectores.map((sectorItem) => (
                                            <label
                                                key={sectorItem.sector.id}
                                                className="flex items-center p-3 border-2 border-slate-200 rounded-lg cursor-pointer hover:border-[#224666] transition-colors"
                                            >
                                                <input
                                                    type="radio"
                                                    name="sectorId"
                                                    value={sectorItem.sector.id.toString()}
                                                    checked={formData.sectorId === sectorItem.sector.id.toString()}
                                                    onChange={handleInputChange}
                                                    className="hidden"
                                                />
                                                <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${formData.sectorId === sectorItem.sector.id.toString()
                                                        ? 'border-[#224666] bg-[#224666]'
                                                        : 'border-slate-300'
                                                    }`}>
                                                    {formData.sectorId === sectorItem.sector.id.toString() && (
                                                        <div className="w-2 h-2 bg-white rounded-full"></div>
                                                    )}
                                                </div>
                                                <div className="flex items-center justify-between flex-1">
                                                    <div className="flex items-center">
                                                        <div
                                                            className="w-4 h-4 rounded mr-3"
                                                            style={{ backgroundColor: sectorItem.sector.color || '#4F46E5' }}
                                                        ></div>
                                                        <div>
                                                            <div className="flex items-center">
                                                                <span className="font-mono text-sm font-medium text-slate-900">
                                                                    {sectorItem.sector.codigo}
                                                                </span>
                                                                <span className="ml-2 text-slate-900">
                                                                    {sectorItem.sector.nombre}
                                                                </span>
                                                            </div>
                                                            {sectorItem.sector.descripcion && (
                                                                <p className="text-xs text-slate-500 mt-1">
                                                                    {sectorItem.sector.descripcion}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Indicador si ya tiene responsable */}
                                                    {sectorItem.responsable && sectorItem.responsable.id !== empleado?.id && (
                                                        <div className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                                                            Tiene responsable
                                                        </div>
                                                    )}
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-6">
                                        <Business className="mx-auto h-8 w-8 text-slate-400" />
                                        <p className="mt-2 text-slate-500">No hay sectores disponibles</p>
                                    </div>
                                )}
                            </div>

                            {errors.sectorId && (
                                <p className="text-red-600 text-sm mt-2">{errors.sectorId}</p>
                            )}
                        </div>

                        {/* Advertencias */}
                        {isResponsable && (
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                                <div className="flex items-start">
                                    <div className="w-5 h-5 text-amber-600 mt-0.5">⚠️</div>
                                    <div className="ml-3 text-sm">
                                        <p className="text-amber-800 font-medium">Responsable de Sector</p>
                                        <p className="text-amber-700 mt-1">
                                            Los responsables de sector deben tener un sector asignado para poder
                                            gestionar turnos y horarios de atención.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Información sobre sectores con responsable */}
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                            <div className="flex items-start">
                                <div className="w-5 h-5 text-slate-600 mt-0.5">ℹ️</div>
                                <div className="ml-3 text-sm">
                                    <p className="text-slate-800 font-medium">Cambio de Asignación</p>
                                    <p className="text-slate-700 mt-1">
                                        Si asignas este empleado a un sector que ya tiene responsable,
                                        el responsable anterior será desasignado automáticamente.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

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

                        {/* Botón para desasignar rápidamente (solo si no es responsable y tiene sector) */}
                        {!isResponsable && sectorActual && formData.sectorId !== '' && (
                            <button
                                type="button"
                                onClick={handleDesasignar}
                                disabled={loading}
                                className="px-4 py-2 text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors disabled:opacity-50"
                            >
                                <Clear className="mr-2 h-4 w-4" />
                                Desasignar
                            </button>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Procesando...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    {formData.sectorId ? 'Asignar Sector' : 'Desasignar'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AsignarSectorModal;