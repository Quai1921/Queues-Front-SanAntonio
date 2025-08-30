import React, { useState, useEffect } from 'react';
import {
    Close,
    Palette,
    Save,
    Image as ImageIcon,
    Visibility,
    VisibilityOff
} from '@mui/icons-material';
import configuracionPantallaService from '../services/configuracionPantallaService';

/**
 * Modal para configurar la apariencia de una configuración específica
 */
const ConfigurarAparienciaModal = ({ isOpen, onClose, onSubmit, configuracion, loading = false }) => {
    const [formData, setFormData] = useState({
        tema: 'blue',
        mostrarLogo: true,
        rutaLogo: ''
    });

    const [errors, setErrors] = useState({});
    const [previewLogo, setPreviewLogo] = useState(null);

    // Obtener temas disponibles
    const temasDisponibles = configuracionPantallaService.obtenerTemasDisponibles();

    // Cargar datos de la configuración cuando se abre el modal
    useEffect(() => {
        if (isOpen && configuracion) {
            setFormData({
                tema: configuracion.temaColor || 'blue',
                mostrarLogo: configuracion.mostrarLogo !== undefined ? configuracion.mostrarLogo : true,
                rutaLogo: configuracion.rutaLogo || ''
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

        // Preview del logo si cambia la URL
        if (name === 'rutaLogo' && value) {
            validateImageUrl(value);
        }
    };

    const validateImageUrl = (url) => {
        if (!url) {
            setPreviewLogo(null);
            return;
        }

        const img = new Image();
        img.onload = () => {
            setPreviewLogo(url);
            setErrors(prev => ({
                ...prev,
                rutaLogo: null
            }));
        };
        img.onerror = () => {
            setPreviewLogo(null);
            setErrors(prev => ({
                ...prev,
                rutaLogo: 'No se pudo cargar la imagen. Verifica la URL.'
            }));
        };
        img.src = url;
    };

    const validateForm = () => {
        const newErrors = {};

        if (formData.rutaLogo && formData.rutaLogo.length > 200) {
            newErrors.rutaLogo = 'La URL del logo no puede exceder 200 caracteres';
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
            console.error('Error configurando apariencia:', error);
        }
    };

    const handleClose = () => {
        setPreviewLogo(null);
        setErrors({});
        onClose();
    };

    const getTemaSeleccionado = () => {
        return temasDisponibles.find(tema => tema.value === formData.tema) || temasDisponibles[0];
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto text-sm">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-200">
                    <div className="flex items-center">
                        <div className='w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center mr-3'>
                            <Palette className="h-6 w-6 text-slate-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900">Configurar Apariencia</h2>
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
                <form onSubmit={handleSubmit} className="p-4">
                    <div className="space-y-3">
                        {/* Tema de Color */}
                        <div>
                            <label className="block  font-medium text-slate-700 mb-3">
                                Color de Tema
                            </label>
                            <div className="grid grid-cols-4 gap-3">
                                {temasDisponibles.map((tema) => (
                                    <label
                                        key={tema.value}
                                        className={`relative cursor-pointer rounded-md border-2 p-1 transition-all duration-300 ${formData.tema === tema.value
                                                ? 'border-[#224666] bg-slate-50'
                                                : 'border-slate-200 hover:border-slate-300'
                                            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <input
                                            type="radio"
                                            name="tema"
                                            value={tema.value}
                                            checked={formData.tema === tema.value}
                                            onChange={handleInputChange}
                                            disabled={loading}
                                            className="sr-only"
                                        />
                                        <div className="flex items-center space-x-1">
                                            <div
                                                className="size-6 rounded-full border-2 border-white shadow-sm"
                                                style={{ backgroundColor: tema.color }}
                                            />
                                            <span className="text-xs font-medium text-slate-700">
                                                {tema.label}
                                            </span>
                                        </div>
                                    </label>
                                ))}
                            </div>

                            {/* Preview del tema seleccionado */}
                            <div className="mt-3 p-2 rounded-md border border-slate-200 bg-slate-50">
                                <div className="flex items-center justify-between">
                                    <span className=" font-medium text-slate-700">
                                        Tema seleccionado:
                                    </span>
                                    <div className="flex items-center space-x-2">
                                        <div
                                            className="w-4 h-4 rounded-full border border-slate-300"
                                            style={{ backgroundColor: getTemaSeleccionado().color }}
                                        />
                                        <span className=" font-medium text-slate-900">
                                            {getTemaSeleccionado().label}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Configuración de Logo */}
                        <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <input
                                    type="checkbox"
                                    name="mostrarLogo"
                                    checked={formData.mostrarLogo}
                                    onChange={handleInputChange}
                                    disabled={loading}
                                    className="w-4 h-4 text-[#224666] border-slate-300 rounded disabled:opacity-50"
                                />
                                <label className=" font-medium text-slate-700 flex items-center">
                                    Mostrar logo institucional
                                </label>
                            </div>

                            {formData.mostrarLogo && (
                                <div className="space-y-4">
                                    {/* URL del Logo */}
                                    <div>
                                        <label className="block  font-medium text-slate-700 mb-2">
                                            URL Logo
                                        </label>
                                        <input
                                            type="url"
                                            name="rutaLogo"
                                            value={formData.rutaLogo}
                                            onChange={handleInputChange}
                                            disabled={loading}
                                            className={`w-full px-3 h-8 border rounded-md transition-colors duration-300 ${errors.rutaLogo ? 'border-red-300' : 'border-slate-300'
                                                } disabled:opacity-50`}
                                            placeholder="https://ejemplo.com/logo.png"
                                        />
                                        {/* {errors.rutaLogo && (
                                            <p className="mt-1  text-red-600">{errors.rutaLogo}</p>
                                        )} */}
                                        <p className="mt-1 text-xs text-slate-500">
                                            Formatos recomendados: .png, .jpg, .svg (máx. 200 caracteres)
                                        </p>
                                    </div>

                                    {/* Preview del Logo */}
                                    {/* {formData.rutaLogo && (
                                        <div className="border border-slate-200 rounded-md p-4 bg-slate-50">
                                            <label className="block  font-medium text-slate-700 mb-3">
                                                Vista Previa del Logo
                                            </label>

                                            {previewLogo ? (
                                                <div className="flex items-center justify-center p-4 bg-white rounded border border-slate-200">
                                                    <img
                                                        src={previewLogo}
                                                        alt="Preview del logo"
                                                        className="max-h-20 max-w-32 object-contain"
                                                        onError={() => {
                                                            setPreviewLogo(null);
                                                            setErrors(prev => ({
                                                                ...prev,
                                                                rutaLogo: 'Error cargando la imagen'
                                                            }));
                                                        }}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center p-8 bg-white rounded border border-dashed border-slate-300">
                                                    <div className="text-center">
                                                        <ImageIcon className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                                                        <p className=" text-slate-500">
                                                            {formData.rutaLogo ? 'Cargando vista previa...' : 'Ingresa una URL válida'}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )} */}
                                </div>
                            )}

                            {/* {!formData.mostrarLogo && (
                                <div className="bg-slate-50 border border-slate-200 rounded-md p-4">
                                    <div className="flex items-center">
                                        <div>
                                            <p className=" font-medium text-slate-800">
                                                Logo oculto
                                            </p>
                                            <p className=" text-slate-600 mt-1">
                                                Las pantallas no mostrarán el logo institucional
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )} */}
                        </div>

                        {/* Preview de la configuración completa */}
                        {/* <div className="border border-slate-200 rounded-md p-4 bg-slate-50">
                            <label className="block  font-medium text-slate-700 mb-3">
                                Resumen de Configuración
                            </label>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between ">
                                    <span className="text-slate-600">Tema:</span>
                                    <div className="flex items-center space-x-2">
                                        <div
                                            className="w-3 h-3 rounded-full border border-slate-300"
                                            style={{ backgroundColor: getTemaSeleccionado().color }}
                                        />
                                        <span className="font-medium text-slate-900">
                                            {getTemaSeleccionado().label}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between ">
                                    <span className="text-slate-600">Logo:</span>
                                    <span className={`font-medium ${formData.mostrarLogo ? 'text-green-600' : 'text-slate-500'
                                        }`}>
                                        {formData.mostrarLogo ? 'Visible' : 'Oculto'}
                                    </span>
                                </div>

                                {formData.mostrarLogo && formData.rutaLogo && (
                                    <div className="flex items-center justify-between ">
                                        <span className="text-slate-600">Estado del logo:</span>
                                        <span className={`font-medium ${previewLogo ? 'text-green-600' : 'text-amber-600'
                                            }`}>
                                            {previewLogo ? 'Válido' : 'Verificando...'}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div> */}
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
                                    Configurando...
                                </>
                            ) : (
                                <>
                                    <Save sx={{ fontSize: '20px' }} className="mr-2" />
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

export default ConfigurarAparienciaModal;