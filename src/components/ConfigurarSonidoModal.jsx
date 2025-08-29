import React, { useState, useEffect } from 'react';
import {
    Close,
    VolumeUp,
    VolumeOff,
    Save,
    PlayArrow,
    Stop
} from '@mui/icons-material';

/**
 * Modal para configurar el sonido de una configuración específica
 */
const ConfigurarSonidoModal = ({ isOpen, onClose, onSubmit, configuracion, loading = false }) => {
    const [formData, setFormData] = useState({
        activo: true,
        archivo: '',
        volumen: 70
    });

    const [errors, setErrors] = useState({});
    const [isPlaying, setIsPlaying] = useState(false);
    const [audio, setAudio] = useState(null);

    // Cargar datos de la configuración cuando se abre el modal
    useEffect(() => {
        if (isOpen && configuracion) {
            setFormData({
                activo: configuracion.sonidoActivo !== undefined ? configuracion.sonidoActivo : true,
                archivo: configuracion.archivoSonido || '',
                volumen: configuracion.volumenSonido || 70
            });
            setErrors({});
        }
    }, [isOpen, configuracion]);

    // Limpiar audio al cerrar modal
    useEffect(() => {
        if (!isOpen && audio) {
            audio.pause();
            setIsPlaying(false);
            setAudio(null);
        }
    }, [isOpen, audio]);

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

        if (formData.activo && formData.archivo && formData.archivo.length > 200) {
            newErrors.archivo = 'La URL del archivo no puede exceder 200 caracteres';
        }

        if (formData.volumen < 0 || formData.volumen > 100) {
            newErrors.volumen = 'El volumen debe estar entre 0 y 100';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handlePlaySound = () => {
        if (!formData.archivo) return;

        if (isPlaying && audio) {
            audio.pause();
            setIsPlaying(false);
            setAudio(null);
        } else {
            try {
                const newAudio = new Audio(formData.archivo);
                newAudio.volume = formData.volumen / 100;

                newAudio.onended = () => {
                    setIsPlaying(false);
                    setAudio(null);
                };

                newAudio.onerror = () => {
                    setErrors(prev => ({
                        ...prev,
                        archivo: 'No se pudo reproducir el archivo de audio. Verifica la URL.'
                    }));
                    setIsPlaying(false);
                    setAudio(null);
                };

                newAudio.play();
                setAudio(newAudio);
                setIsPlaying(true);
            } catch (error) {
                setErrors(prev => ({
                    ...prev,
                    archivo: 'URL de audio inválida'
                }));
            }
        }
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
            console.error('Error configurando sonido:', error);
        }
    };

    const handleClose = () => {
        if (audio) {
            audio.pause();
            setIsPlaying(false);
            setAudio(null);
        }
        setErrors({});
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                    <div className="flex items-center">
                        {formData.activo ? (
                            <VolumeUp className="h-6 w-6 text-[#224666] mr-3" />
                        ) : (
                            <VolumeOff className="h-6 w-6 text-slate-400 mr-3" />
                        )}
                        <div>
                            <h2 className="text-xl font-semibold text-slate-900">Configurar Sonido</h2>
                            <p className="text-sm text-slate-600 mt-1">{configuracion?.nombre}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        disabled={loading}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors duration-300 disabled:opacity-50"
                    >
                        <Close className="h-5 w-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-6">
                        {/* Activar/Desactivar Sonido */}
                        <div className="flex items-center space-x-3">
                            <input
                                type="checkbox"
                                name="activo"
                                checked={formData.activo}
                                onChange={handleInputChange}
                                disabled={loading}
                                className="w-4 h-4 text-[#224666] border-slate-300 rounded focus:ring-[#224666] disabled:opacity-50"
                            />
                            <label className="text-sm font-medium text-slate-700">
                                Activar sonido de notificaciones
                            </label>
                        </div>

                        {/* Configuración de sonido activo */}
                        {formData.activo && (
                            <div className="space-y-4">
                                {/* Archivo de Sonido */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Archivo de Sonido (URL)
                                    </label>
                                    <div className="flex space-x-2">
                                        <input
                                            type="url"
                                            name="archivo"
                                            value={formData.archivo}
                                            onChange={handleInputChange}
                                            disabled={loading}
                                            className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#224666] focus:border-transparent transition-colors duration-300 ${errors.archivo ? 'border-red-300' : 'border-slate-300'
                                                } disabled:opacity-50`}
                                            placeholder="https://ejemplo.com/sonido.wav"
                                        />
                                        <button
                                            type="button"
                                            onClick={handlePlaySound}
                                            disabled={loading || !formData.archivo}
                                            className="px-3 py-2 bg-slate-100 text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-200 transition-colors duration-300 disabled:opacity-50 flex items-center"
                                        >
                                            {isPlaying ? (
                                                <Stop className="h-4 w-4" />
                                            ) : (
                                                <PlayArrow className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                    {errors.archivo && (
                                        <p className="mt-1 text-sm text-red-600">{errors.archivo}</p>
                                    )}
                                    <p className="mt-1 text-xs text-slate-500">
                                        Formatos compatibles: .wav, .mp3, .ogg
                                    </p>
                                </div>

                                {/* Volumen */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Volumen ({formData.volumen}%)
                                    </label>
                                    <div className="flex items-center space-x-3">
                                        <VolumeOff className="h-4 w-4 text-slate-400" />
                                        <input
                                            type="range"
                                            name="volumen"
                                            value={formData.volumen}
                                            onChange={handleInputChange}
                                            disabled={loading}
                                            min="0"
                                            max="100"
                                            step="5"
                                            className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider disabled:opacity-50"
                                        />
                                        <VolumeUp className="h-4 w-4 text-slate-600" />
                                    </div>
                                    {errors.volumen && (
                                        <p className="mt-1 text-sm text-red-600">{errors.volumen}</p>
                                    )}
                                </div>

                                {/* Preview del volumen */}
                                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-600">Nivel de volumen:</span>
                                        <div className="flex items-center space-x-2">
                                            <div className="w-20 bg-slate-200 rounded-full h-2">
                                                <div
                                                    className="h-2 bg-[#224666] rounded-full transition-all duration-300"
                                                    style={{ width: `${formData.volumen}%` }}
                                                />
                                            </div>
                                            <span className="font-medium text-[#224666]">
                                                {formData.volumen}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {!formData.activo && (
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                <div className="flex items-center">
                                    <VolumeOff className="h-5 w-5 text-amber-600 mr-2" />
                                    <div>
                                        <p className="text-sm font-medium text-amber-800">
                                            Sonido desactivado
                                        </p>
                                        <p className="text-sm text-amber-700 mt-1">
                                            Las pantallas no reproducirán sonidos de notificación
                                        </p>
                                    </div>
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
                                    Configurando...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Guardar Configuración
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ConfigurarSonidoModal;