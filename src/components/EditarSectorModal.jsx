import React, { useState, useEffect } from 'react';
import {
    Close,
    Business,
    Save,
    Public,
    Lock,
    Schedule,
    People,
    ColorLens,
    Edit
} from '@mui/icons-material';

/**
 * Modal para editar un sector existente
 */
const EditarSectorModal = ({ isOpen, onClose, onSubmit, sector, loading = false }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        tipoSector: 'NORMAL',
        requiereCitaPrevia: false,
        capacidadMaxima: 1,
        tiempoEstimadoAtencion: 15,
        color: '#4F46E5'
    });

    const [errors, setErrors] = useState({});

    // Colores predefinidos (mismos que en crear)
    const coloresPredefinidos = [
        '#4F46E5', // Indigo
        '#059669', // Emerald
        '#DC2626', // Red
        '#D97706', // Amber
        '#7C3AED', // Purple
        '#0891B2', // Cyan
        '#EA580C', // Orange
        '#BE185D'  // Pink
    ];

    // Cargar datos del sector cuando se abre el modal
    useEffect(() => {
        if (isOpen && sector) {
            setFormData({
                nombre: sector.sector?.nombre || '',
                descripcion: sector.sector?.descripcion || '',
                tipoSector: sector.sector?.tipoSector || 'NORMAL',
                requiereCitaPrevia: sector.sector?.requiereCitaPrevia || false,
                capacidadMaxima: sector.sector?.capacidadMaxima || 1,
                tiempoEstimadoAtencion: sector.sector?.tiempoEstimadoAtencion || 15,
                color: sector.sector?.color || '#4F46E5'
            });
            setErrors({});
        }
    }, [isOpen, sector]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        const finalValue = type === 'checkbox' ? checked : value;

        setFormData(prev => ({
            ...prev,
            [name]: finalValue
        }));

        // Limpiar error específico cuando el usuario empieza a escribir
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Validaciones requeridas
        if (!formData.nombre.trim()) {
            newErrors.nombre = 'El nombre es requerido';
        } else if (formData.nombre.length > 100) {
            newErrors.nombre = 'El nombre no puede tener más de 100 caracteres';
        }

        if (formData.descripcion && formData.descripcion.length > 500) {
            newErrors.descripcion = 'La descripción no puede tener más de 500 caracteres';
        }

        if (formData.capacidadMaxima < 1 || formData.capacidadMaxima > 99) {
            newErrors.capacidadMaxima = 'La capacidad debe estar entre 1 y 99';
        }

        if (formData.tiempoEstimadoAtencion < 1 || formData.tiempoEstimadoAtencion > 180) {
            newErrors.tiempoEstimadoAtencion = 'El tiempo debe estar entre 1 y 180 minutos';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            await onSubmit(sector.sector?.codigo, formData);
            handleClose();
        } catch (error) {
            console.error('Error al actualizar sector:', error);
        }
    };

    const handleClose = () => {
        setErrors({});
        onClose();
    };

    if (!isOpen || !sector) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                    <div className="flex items-center">
                        <div className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center mr-3">
                            <Edit className="h-6 w-6 text-slate-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-slate-900">Editar Sector</h2>
                            <p className="text-sm text-slate-600">
                                Código: <span className="text-lg font-mono font-semibold text-slate-900">{sector.sector?.codigo}</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between gap-8">
                        <div className="text-right">
                            <p className="text-sm font-medium text-slate-700 pr-2">Estado</p>
                            <span className={`w-16 inline-flex justify-center items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${sector.sector?.activo
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                                }`}>
                                {sector.sector?.activo ? 'Activo' : 'Inactivo'}
                            </span>
                        </div>

                        <button
                            onClick={handleClose}
                            disabled={loading}
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                        >
                            <Close className="h-5 w-5" />
                        </button>
                    </div>
                    
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-3">
                        {/* Nombre */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Nombre *
                            </label>
                            <input
                                type="text"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleInputChange}
                                placeholder="Ej: Rentas Municipales"
                                className={`w-full px-3 py-2 border rounded-lg transition-colors ${errors.nombre ? 'border-red-300' : 'border-slate-300'
                                    }`}
                                disabled={loading}
                                maxLength={100}
                            />
                            {errors.nombre && (
                                <p className="text-red-600 text-sm mt-1">{errors.nombre}</p>
                            )}
                        </div>

                        {/* Descripción */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Descripción
                            </label>
                            <textarea
                                name="descripcion"
                                value={formData.descripcion}
                                onChange={handleInputChange}
                                placeholder="Descripción del sector y servicios que ofrece..."
                                rows={3}
                                className={`w-full px-3 py-2 border rounded-lg transition-colors resize-none ${errors.descripcion ? 'border-red-300' : 'border-slate-300'
                                    }`}
                                disabled={loading}
                                maxLength={500}
                            />
                            {errors.descripcion && (
                                <p className="text-red-600 text-sm mt-1">{errors.descripcion}</p>
                            )}
                            <p className="text-xs text-slate-500 mt-1">
                                {formData.descripcion.length}/500 caracteres
                            </p>
                        </div>

                        {/* Tipo de Sector */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Tipo de Sector *
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {/* OPCIÓN NORMAL - ESTA FALTABA */}
                                <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${formData.tipoSector === 'NORMAL'
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-slate-200 hover:border-slate-300'
                                    }`}>
                                    <input
                                        type="radio"
                                        name="tipoSector"
                                        value="NORMAL"
                                        checked={formData.tipoSector === 'NORMAL'}
                                        onChange={handleInputChange}
                                        disabled={loading}
                                        className="sr-only"
                                    />
                                    <div className="flex items-center">
                                        <Public className="h-5 w-5 text-slate-600 mr-3" />
                                        <div>
                                            <p className="font-medium text-slate-900">Normal</p>
                                            <p className="text-sm text-slate-600">Acceso general sin turno previo</p>
                                        </div>
                                    </div>
                                </label>

                                {/* OPCIÓN ESPECIAL - ESTA YA ESTABA */}
                                <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${formData.tipoSector === 'ESPECIAL'
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-slate-200 hover:border-slate-300'
                                    }`}>
                                    <input
                                        type="radio"
                                        name="tipoSector"
                                        value="ESPECIAL"
                                        checked={formData.tipoSector === 'ESPECIAL'}
                                        onChange={handleInputChange}
                                        disabled={loading}
                                        className="sr-only"
                                    />
                                    <div className="flex items-center">
                                        <Lock className="h-5 w-5 text-slate-600 mr-3" />
                                        <div>
                                            <p className="font-medium text-slate-900">Especial</p>
                                            <p className="text-sm text-slate-600">Requiere turno previo</p>
                                        </div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Cita Previa - Solo visible para sectores especiales */}
                        {formData.tipoSector === 'ESPECIAL' && (
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="requiereCitaPrevia"
                                        checked={formData.requiereCitaPrevia}
                                        onChange={handleInputChange}
                                        disabled={loading}
                                        className="w-4 h-4 text-slate-600 border-slate-300 rounded"
                                    />
                                    <span className="ml-2 text-sm font-medium text-slate-700">
                                        Requiere turno previo
                                    </span>
                                </label>
                            </div>
                        )}

                        {/* Configuración Operativa */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    <People className="h-4 w-4 inline mr-1" />
                                    Capacidad Máxima *
                                </label>
                                <input
                                    type="number"
                                    name="capacidadMaxima"
                                    value={formData.capacidadMaxima}
                                    onChange={handleInputChange}
                                    min="1"
                                    max="99"
                                    className={`w-full px-3 py-2 border rounded-lg transition-colors ${errors.capacidadMaxima ? 'border-red-300' : 'border-slate-300'
                                        }`}
                                    disabled={loading}
                                />
                                {errors.capacidadMaxima && (
                                    <p className="text-red-600 text-sm mt-1">{errors.capacidadMaxima}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    <Schedule className="h-4 w-4 inline mr-1" />
                                    Tiempo Estimado (min) *
                                </label>
                                <input
                                    type="number"
                                    name="tiempoEstimadoAtencion"
                                    value={formData.tiempoEstimadoAtencion}
                                    onChange={handleInputChange}
                                    min="1"
                                    max="180"
                                    className={`w-full px-3 py-2 border rounded-lg transition-colors ${errors.tiempoEstimadoAtencion ? 'border-red-300' : 'border-slate-300'
                                        }`}
                                    disabled={loading}
                                />
                                {errors.tiempoEstimadoAtencion && (
                                    <p className="text-red-600 text-sm mt-1">{errors.tiempoEstimadoAtencion}</p>
                                )}
                            </div>
                        </div>

                        {/* Color */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                <ColorLens className="h-4 w-4 inline mr-1" />
                                Color identificativo del Sector
                            </label>
                            <div className="flex items-center space-x-3">
                                <div className="flex space-x-2">
                                    {coloresPredefinidos.map((color) => (
                                        <button
                                            key={color}
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, color }))}
                                            disabled={loading}
                                            className={`w-8 h-8 rounded-full border-2 transition-all ${formData.color === color
                                                    ? 'border-slate-800 scale-110'
                                                    : 'border-slate-300 hover:border-slate-400'
                                                }`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                                <input
                                    type="color"
                                    name="color"
                                    value={formData.color}
                                    onChange={handleInputChange}
                                    disabled={loading}
                                    className="w-8 h-8 border border-slate-300 rounded cursor-pointer disabled:opacity-50"
                                />
                                <span className="text-sm text-slate-600 font-mono">{formData.color}</span>
                            </div>
                        </div>

                        {/* Información adicional del sector */}
                        {sector.sector?.empleadoResponsable && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h4 className="text-sm font-medium text-blue-800 mb-2">Responsable Asignado</h4>
                                <p className="text-sm text-blue-700">
                                    {sector.sector.responsableNombre || `${sector.sector.empleadoResponsable.nombre} ${sector.sector.empleadoResponsable.apellido}`}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end space-x-3 mt-8 pt-6 border-t border-slate-200">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={loading}
                            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors duration-300 disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 text-sm font-medium text-white bg-[#224666] border border-transparent rounded-lg hover:bg-[#2c3e50] transition-colors duration-300 disabled:opacity-50 flex items-center"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Guardar Cambios
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditarSectorModal;