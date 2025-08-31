import React, { useState, useEffect } from 'react';
import {
    Close,
    Settings,
    Save,
    VolumeUp,
    VolumeOff,
    Palette,
    Timer,
    TextFields,
    Image as ImageIcon
} from '@mui/icons-material';

/**
 * Modal para editar una configuración de pantalla existente
 */
const EditarConfiguracionModal = ({ isOpen, onClose, onSubmit, configuracion, loading = false }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        tiempoMensaje: 8,
        tiempoTurno: 6,
        textoEncabezado: '',
        sonidoActivo: true,
        archivoSonido: '',
        volumenSonido: 70,
    });

    const [errors, setErrors] = useState({});

    // Cargar datos de la configuración cuando se abre el modal
    useEffect(() => {
        if (isOpen && configuracion) {
            setFormData({
                nombre: configuracion.nombre || '',
                tiempoMensaje: configuracion.tiempoMensaje || 8,
                tiempoTurno: configuracion.tiempoTurno || 6,
                textoEncabezado: configuracion.textoEncabezado || '',
                sonidoActivo: configuracion.sonidoActivo !== undefined ? configuracion.sonidoActivo : true,
                archivoSonido: configuracion.archivoSonido || '',
                volumenSonido: configuracion.volumenSonido || 70,
            });
            setErrors({});
        }
    }, [isOpen, configuracion]);

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

        if (!formData.nombre.trim()) {
            newErrors.nombre = 'El nombre es obligatorio';
        }

        if (!formData.tiempoMensaje || formData.tiempoMensaje < 3 || formData.tiempoMensaje > 60) {
            newErrors.tiempoMensaje = 'El tiempo debe estar entre 3 y 60 segundos';
        }

        if (!formData.tiempoTurno || formData.tiempoTurno < 3 || formData.tiempoTurno > 30) {
            newErrors.tiempoTurno = 'El tiempo debe estar entre 3 y 30 segundos';
        }

        // NUEVA VALIDACIÓN: Logo institucional
        // if (formData.mostrarLogo && !formData.rutaLogo.trim()) {
        //     newErrors.rutaLogo = 'La URL del logo es obligatoria cuando se activa mostrar logo';
        // }

        // NUEVA VALIDACIÓN: Sonido
        if (formData.sonidoActivo && !formData.archivoSonido.trim()) {
            newErrors.archivoSonido = 'La URL del archivo de sonido es obligatoria cuando se activa el sonido';
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
            await onSubmit(configuracion.id, formData);
            handleClose();
        } catch (error) {
            console.error('Error actualizando configuración:', error);
        }
    };

    const handleClose = () => {
        setErrors({});
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[95vh] overflow-y-auto text-sm">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-200">
                    <div className="flex items-center">
                        <div className='w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center mr-3'>
                            <Settings className="h-6 w-6 text-slate-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900">Editar Configuración</h2>
                            <p className=" text-slate-600 mt-1">{configuracion?.nombre}</p>
                        </div>
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
                <form onSubmit={handleSubmit} className="px-6 pt-3 pb-4">
                    <div className="space-y-4">
                        {/* Información General */}
                        <div className="space-y-2 border-b pb-3">
                            <h3 className="font-medium text-slate-900 flex items-center">
                                <TextFields className="h-5 w-5 mr-2 text-slate-600" />
                                Información General / Configuración de Tiempo
                            </h3>

                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                {/* Nombre */}
                                <div>
                                    <label className="block  font-medium text-slate-700 mb-2">
                                        Nombre Configiguración *
                                    </label>
                                    <input
                                        type="text"
                                        name="nombre"
                                        value={formData.nombre}
                                        onChange={handleInputChange}
                                        disabled={loading}
                                        className={`w-full px-3 h-8 border rounded-md transition-colors duration-300 ${errors.nombre ? 'border-red-300' : 'border-slate-300'
                                            } disabled:opacity-50`}
                                        placeholder="Ej: Configuración Principal"
                                    />
                                    {errors.nombre && (
                                        <p className="mt-1  text-red-600">{errors.nombre}</p>
                                    )}
                                </div>

                                {/* Texto Encabezado */}
                                <div>
                                    <label className="block  font-medium text-slate-700 mb-2">
                                        Texto del Encabezado
                                    </label>
                                    <input
                                        type="text"
                                        name="textoEncabezado"
                                        value={formData.textoEncabezado}
                                        onChange={handleInputChange}
                                        disabled={loading}
                                        className={`w-full px-3 h-8 border rounded-md transition-colors duration-300 ${errors.textoEncabezado ? 'border-red-300' : 'border-slate-300'
                                            } disabled:opacity-50`}
                                        placeholder="Ej: Portal de Atención - Municipalidad de San Antonio de Arredondo"
                                    />
                                    {errors.textoEncabezado && (
                                        <p className="mt-1  text-red-600">{errors.textoEncabezado}</p>
                                    )}
                                </div>

                                {/* Tiempo Mensaje */}
                                <div>
                                    <label className="block  font-medium text-slate-700 mb-2">
                                        Tiempo Mensajes (segundos) *
                                    </label>
                                    <input
                                        type="number"
                                        name="tiempoMensaje"
                                        value={formData.tiempoMensaje}
                                        onChange={handleInputChange}
                                        disabled={loading}
                                        min="3"
                                        max="60"
                                        className={`w-full px-3 h-8 border rounded-md transition-colors duration-300 ${errors.tiempoMensaje ? 'border-red-300' : 'border-slate-300'
                                            } disabled:opacity-50`}
                                    />
                                    {errors.tiempoMensaje && (
                                        <p className="mt-1  text-red-600">{errors.tiempoMensaje}</p>
                                    )}
                                </div>

                                {/* Tiempo Turno */}
                                <div>
                                    <label className="block  font-medium text-slate-700 mb-2">
                                        Tiempo Turnos (segundos) *
                                    </label>
                                    <input
                                        type="number"
                                        name="tiempoTurno"
                                        value={formData.tiempoTurno}
                                        onChange={handleInputChange}
                                        disabled={loading}
                                        min="3"
                                        max="30"
                                        className={`w-full px-3 h-8 border rounded-md transition-colors duration-300 ${errors.tiempoTurno ? 'border-red-300' : 'border-slate-300'
                                            } disabled:opacity-50`}
                                    />
                                    {errors.tiempoTurno && (
                                        <p className="mt-1  text-red-600">{errors.tiempoTurno}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Configuración de Sonido */}
                        <div className="flex items-start gap-4">
                            <div>
                                {/* Sonido Activo */}
                                <div className="flex items-center space-x-1 pt-1">
                                    <input
                                        type="checkbox"
                                        name="sonidoActivo"
                                        checked={formData.sonidoActivo}
                                        onChange={handleInputChange}
                                        disabled={loading}
                                        className="w-4 h-4 text-[#224666] border-slate-300 rounded disabled:opacity-50"
                                    />
                                </div>
                            </div>

                            <h3 className="font-medium text-slate-900 flex items-center">
                                {formData.sonidoActivo ? (
                                    <>
                                        <VolumeUp className="h-5 w-5 mr-2 text-slate-600" />
                                        Agregar sonido
                                    </>
                                ) : (
                                    <>
                                        <VolumeOff className="h-5 w-5 mr-2 text-slate-600" />
                                        Sin sonido
                                    </>
                                )}
                            </h3>
                        </div>

                        {formData.sonidoActivo && (
                                <div className="flex flex-col justify-center gap-4">
                                    {/* Archivo de Sonido */}
                                    <div className='flex justify-center items-center'>
                                        <label className="w-28 font-medium text-slate-700 pt-0.5">
                                            URL Sonido
                                        </label>
                                        <input
                                            type="url"
                                            name="archivoSonido"
                                            value={formData.archivoSonido}
                                            onChange={handleInputChange}
                                            disabled={loading}
                                            className={`w-full px-3 h-8 border rounded-md transition-colors duration-300 ${errors.archivoSonido ? 'border-red-300' : 'border-slate-300'
                                                } disabled:opacity-50`}
                                            placeholder="https://ejemplo.com/sonido.wav"
                                        />
                                        {errors.archivoSonido && (
                                            <p className="mt-1  text-red-600">{errors.archivoSonido}</p>
                                        )}
                                    </div>

                                    {/* Volumen */}
                                    <div>
                                        <label className="block font-medium text-slate-700">
                                            Volumen ({formData.volumenSonido}%)
                                        </label>
                                        <input
                                            type="range"
                                            name="volumenSonido"
                                            value={formData.volumenSonido}
                                            onChange={handleInputChange}
                                            disabled={loading}
                                            min="0"
                                            max="100"
                                            step="5"
                                            className="w-full h-2 bg-slate-200 rounded-md appearance-none cursor-pointer slider disabled:opacity-50"
                                        />
                                        {errors.volumenSonido && (
                                            <p className="mt-1  text-red-600">{errors.volumenSonido}</p>
                                        )}
                                    </div>
                                </div>
                            )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end space-x-3 mt-8 pt-6 border-t border-slate-200">
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
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <Save sx={{ fontSize: '20px' }} className="mr-2" />
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

export default EditarConfiguracionModal;