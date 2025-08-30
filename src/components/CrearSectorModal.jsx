import React, { useState } from 'react';
import {
    Close,
    Business,
    Save,
    Public,
    Lock,
    Schedule,
    People,
    ColorLens
} from '@mui/icons-material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessAlarmIcon from '@mui/icons-material/AccessAlarm';

/**
 * Modal para crear un nuevo sector
 */
const CrearSectorModal = ({ isOpen, onClose, onSubmit, loading = false }) => {
    const [formData, setFormData] = useState({
        codigo: '',
        nombre: '',
        descripcion: '',
        tipoSector: 'NORMAL',
        requiereCitaPrevia: false,
        capacidadMaxima: 1,
        tiempoEstimadoAtencion: 15,
        color: '#4F46E5'
    });

    const [errors, setErrors] = useState({});

    // Colores predefinidos
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

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        const finalValue = type === 'checkbox' ? checked : value;

        setFormData(prev => {
            const newData = {
                ...prev,
                [name]: finalValue
            };

            // CAMBIO: Sincronizar requiereCitaPrevia cuando cambia tipoSector
            if (name === 'tipoSector') {
                if (value === 'NORMAL') {
                    newData.requiereCitaPrevia = false;
                } else if (value === 'ESPECIAL') {
                    newData.requiereCitaPrevia = true;
                }
            }

            return newData;
        });

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
        if (!formData.codigo.trim()) {
            newErrors.codigo = 'El código es requerido';
        } else if (formData.codigo.length > 10) {
            newErrors.codigo = 'El código no puede tener más de 10 caracteres';
        } else if (!/^[A-Z0-9]+$/.test(formData.codigo)) {
            newErrors.codigo = 'El código solo puede contener letras mayúsculas y números';
        }

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
            await onSubmit(formData);
            handleClose();
        } catch (error) {
            console.error('Error al crear sector:', error);
        }
    };

    const handleClose = () => {
        setFormData({
            codigo: '',
            nombre: '',
            descripcion: '',
            tipoSector: 'NORMAL',
            requiereCitaPrevia: false,
            capacidadMaxima: 1,
            tiempoEstimadoAtencion: 15,
            color: '#4F46E5'
        });
        setErrors({});
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[98vh] overflow-y-auto text-sm">

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-200">
                    <div className="flex items-center">
                        <div className="w-10 h-10 bg-slate-200 rounded-md flex items-center justify-center mr-3">
                            <Business className="h-6 w-6 text-slate-600" />
                        </div>
                        <h2 className="text-lg font-semibold text-slate-900">Crear Nuevo Sector</h2>
                    </div>
                    <button
                        onClick={handleClose}
                        disabled={loading}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-50"
                    >
                        <Close className="h-5 w-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-4">
                    <div className="space-y-2">

                        {/* Código y Nombre - Fila */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block font-medium text-slate-700 mb-2">
                                    Código *
                                </label>
                                <input
                                    type="text"
                                    name="codigo"
                                    value={formData.codigo}
                                    onChange={handleInputChange}
                                    placeholder="Ej: REN, INT, CON"
                                    className={`w-full px-3 h-8 border rounded-md transition-colors ${errors.codigo ? 'border-red-300' : 'border-slate-300'
                                        }`}
                                    disabled={loading}
                                    maxLength={10}
                                />
                                {errors.codigo && (
                                    <p className="text-red-600 mt-1">{errors.codigo}</p>
                                )}
                            </div>

                            <div>
                                <label className="block font-medium text-slate-700 mb-2">
                                    Nombre *
                                </label>
                                <input
                                    type="text"
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={handleInputChange}
                                    placeholder="Ej: Rentas Municipales"
                                    className={`w-full px-3 h-8 border rounded-md transition-colors ${errors.nombre ? 'border-red-300' : 'border-slate-300'
                                        }`}
                                    disabled={loading}
                                    maxLength={100}
                                />
                                {errors.nombre && (
                                    <p className="text-red-600 mt-1">{errors.nombre}</p>
                                )}
                            </div>
                        </div>

                        {/* Descripción */}
                        <div>
                            <label className="block font-medium text-slate-700 mb-2">
                                Descripción
                            </label>
                            <textarea
                                name="descripcion"
                                value={formData.descripcion}
                                onChange={handleInputChange}
                                placeholder="OPCIONAL: Descripción del sector y servicios que ofrece"
                                rows={3}
                                className={`w-full px-3 p-2 h-10 border rounded-md transition-colors resize-none ${errors.descripcion ? 'border-red-300' : 'border-slate-300'
                                    }`}
                                disabled={loading}
                                maxLength={500}
                            />
                            {errors.descripcion && (
                                <p className="text-red-600 mt-1">{errors.descripcion}</p>
                            )}
                        </div>

                        {/* Tipo de Sector */}
                        <div>
                            <label className="block font-medium text-slate-700 mb-2">
                                Tipo de Sector *
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <label className={`flex items-center p-2 border-2 rounded-md cursor-pointer transition-colors ${formData.tipoSector === 'NORMAL'
                                        ? 'border-slate-500 bg-slate-50'
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
                                        <AccessAlarmIcon className="h-5 w-5 text-slate-600 mr-3" />
                                        <div>
                                            <p className="font-medium text-slate-900">Normal</p>
                                            <p className="text-slate-600">Acceso general sin turno previo</p>
                                        </div>
                                    </div>
                                </label>

                                <label className={`flex items-center p-2 border-2 rounded-md cursor-pointer transition-colors ${formData.tipoSector === 'ESPECIAL'
                                        ? 'border-slate-500 bg-slate-50'
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
                                        <CalendarMonthIcon className="h-5 w-5 text-slate-600 mr-3" />
                                        <div>
                                            <p className="font-medium text-slate-900">Especial</p>
                                            <p className="text-slate-600">Requiere cita previa</p>
                                        </div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Cita Previa - Solo visible para sectores especiales */}
                        {formData.tipoSector === 'ESPECIAL' && (
                            <div className="bg-orange-50 border border-orange-200 rounded-md p-4">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="requiereCitaPrevia"
                                        checked={formData.requiereCitaPrevia}
                                        onChange={handleInputChange}
                                        disabled={loading}
                                        className="w-4 h-4 text-slate-600 border-slate-300 rounded"
                                    />
                                    <span className="ml-2 font-medium text-slate-700">
                                        Requiere cita previa
                                    </span>
                                </label>
                            </div>
                        )}

                        {/* Configuración Operativa */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block font-medium text-slate-700 mb-2">
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
                                    className={`w-full px-3 h-8 border rounded-md transition-colors ${errors.capacidadMaxima ? 'border-red-300' : 'border-slate-300'
                                        }`}
                                    disabled={loading}
                                />
                                {errors.capacidadMaxima && (
                                    <p className="text-red-600 mt-1">{errors.capacidadMaxima}</p>
                                )}
                            </div>

                            <div>
                                <label className="block font-medium text-slate-700 mb-2">
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
                                    className={`w-full px-3 h-8 border rounded-md transition-colors ${errors.tiempoEstimadoAtencion ? 'border-red-300' : 'border-slate-300'
                                        }`}
                                    disabled={loading}
                                />
                                {errors.tiempoEstimadoAtencion && (
                                    <p className="text-red-600 mt-1">{errors.tiempoEstimadoAtencion}</p>
                                )}
                            </div>
                        </div>

                        {/* Color */}
                        <div>
                            <label className="block font-medium text-slate-700">
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
                                            className={`size-6 rounded-full border-2 transition-all ${formData.color === color
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
                                <span className="text-slate-600 font-mono">{formData.color}</span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end space-x-3 mt-2 pt-2 border-t border-slate-200">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={loading}
                            className="px-4 h-8 font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors duration-300 disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 h-8 font-medium text-white bg-[#224666] border border-transparent rounded-md hover:bg-[#2c3e50] transition-colors duration-300 disabled:opacity-50 flex items-center"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                    Creando...
                                </>
                            ) : (
                                <>
                                    <Save sx={{ fontSize: '20px' }} className="mr-2" />
                                    Crear Sector
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CrearSectorModal;