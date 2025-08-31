import React, { useState, useEffect } from 'react';
import {
    Close,
    Message,
    Save,
    TextSnippet,
    Image as ImageIcon,
    VideoFile,
    Schedule,
    CalendarMonth,
    Link,
    Title,
    Subject,
    Timer,
    LockClock
} from '@mui/icons-material';
import ListAltIcon from '@mui/icons-material/ListAlt';
import FileUploadComponent from './FileUploadComponent';


/**
 * Modal para crear un nuevo mensaje institucional
 * Adaptado para pantallas de máximo 600px de altura
 */
const CrearMensajeModal = ({ isOpen, onClose, onSubmit, loading = false }) => {
    const [formData, setFormData] = useState({
        tipo: 'TEXTO',
        titulo: '',
        contenido: '',
        rutaArchivo: '',
        duracion: 10,
        orden: 0,
        fechaInicio: '',
        fechaFin: ''
    });

    const [errors, setErrors] = useState({});
    const [mostrarVigencia, setMostrarVigencia] = useState(true);

    // Limpiar formulario cuando se abre/cierra el modal
    useEffect(() => {
        if (isOpen) {
            setErrors({});
        }
    }, [isOpen]);

    const tiposMensaje = [
        { value: 'TEXTO', label: 'Texto', icon: <TextSnippet />, descripcion: 'Mensaje de texto simple' },
        { value: 'IMAGEN', label: 'Imagen', icon: <ImageIcon />, descripcion: 'Imagen con texto opcional' },
        { value: 'VIDEO', label: 'Video', icon: <VideoFile />, descripcion: 'Archivo de video' }
    ];

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        const finalValue = type === 'checkbox' ? checked : value;

        setFormData(prev => ({
            ...prev,
            [name]: finalValue
        }));

        // Limpiar error específico
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Validar duración
        if (!formData.duracion || formData.duracion < 3 || formData.duracion > 60) {
            newErrors.duracion = 'La duración debe estar entre 3 y 60 segundos';
        }

        // Validar orden
        if (formData.orden < 0 || formData.orden > 100) {
            newErrors.orden = 'El orden debe estar entre 0 y 100';
        }

        // Validaciones específicas por tipo
        switch (formData.tipo) {
            case 'TEXTO':
                if (!formData.contenido.trim()) {
                    newErrors.contenido = 'El contenido es obligatorio para mensajes de texto';
                } else if (formData.contenido.length > 1000) {
                    newErrors.contenido = 'El contenido no puede exceder 1000 caracteres';
                }
                break;

            case 'IMAGEN':
            case 'VIDEO':
                if (!formData.titulo.trim()) {
                    newErrors.titulo = 'El título es obligatorio para este tipo de mensaje';
                } else if (formData.titulo.length > 200) {
                    newErrors.titulo = 'El título no puede exceder 200 caracteres';
                }

                if (!formData.rutaArchivo.trim()) {
                    newErrors.rutaArchivo = 'La ruta del archivo es obligatoria';
                } else if (formData.rutaArchivo.length > 300) {
                    newErrors.rutaArchivo = 'La ruta no puede exceder 300 caracteres';
                }

                if (formData.contenido && formData.contenido.length > 1000) {
                    newErrors.contenido = 'El contenido no puede exceder 1000 caracteres';
                }
                break;
        }

        // Validar fechas de vigencia si están establecidas
        if (mostrarVigencia) {
            if (formData.fechaInicio && formData.fechaFin) {
                const inicio = new Date(formData.fechaInicio);
                const fin = new Date(formData.fechaFin);

                if (fin <= inicio) {
                    newErrors.fechaFin = 'La fecha de fin debe ser posterior a la de inicio';
                }
            } else if (formData.fechaInicio && !formData.fechaFin) {
                newErrors.fechaFin = 'La fecha de fin es requerida si establece fecha de inicio';
            } else if (!formData.fechaInicio && formData.fechaFin) {
                newErrors.fechaInicio = 'La fecha de inicio es requerida si establece fecha de fin';
            }
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
            // Preparar datos para envío
            const mensajeData = {
                tipo: formData.tipo,
                titulo: formData.titulo.trim() || null,
                contenido: formData.contenido.trim() || null,
                rutaArchivo: formData.rutaArchivo.trim() || null,
                duracion: parseInt(formData.duracion),
                orden: parseInt(formData.orden),
                fechaInicio: mostrarVigencia && formData.fechaInicio ? formData.fechaInicio : null,
                fechaFin: mostrarVigencia && formData.fechaFin ? formData.fechaFin : null
            };

            await onSubmit(mensajeData);
            handleClose();
        } catch (error) {
            console.error('Error al crear mensaje:', error);
        }
    };

    const handleClose = () => {
        setFormData({
            tipo: 'TEXTO',
            titulo: '',
            contenido: '',
            rutaArchivo: '',
            duracion: 10,
            orden: 0,
            fechaInicio: '',
            fechaFin: ''
        });
        setErrors({});
        onClose();
    };

    const requiereArchivo = ['IMAGEN', 'VIDEO'].includes(formData.tipo);
    const requiereTitulo = ['TEXTO','IMAGEN', 'VIDEO'].includes(formData.tipo);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[98vh] overflow-y-auto text-sm">

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-200">
                    <div className="flex items-center">
                        <div className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center mr-3">
                            <Message className="h-6 w-6 text-slate-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Crear Mensaje Institucional</h2>
                            <p className="text-xs text-slate-600">Nuevo mensaje para mostrar en pantalla</p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-50"
                        disabled={loading}
                    >
                        <Close />
                    </button>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="px-4 pt-2 pb-2 space-y-2">

                    {/* Tipo de Mensaje */}
                    <div>
                        <label className="block font-medium text-slate-700 mb-1">
                            Tipo de Mensaje *
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {tiposMensaje.map((tipo) => (
                                <label
                                    key={tipo.value}
                                    className={`flex flex-col items-center p-2 border-2 rounded-lg cursor-pointer transition-all ${formData.tipo === tipo.value
                                            ? 'border-[#224666] bg-[#224666]/5'
                                            : 'border-slate-300 hover:border-slate-400'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="tipo"
                                        value={tipo.value}
                                        checked={formData.tipo === tipo.value}
                                        onChange={handleInputChange}
                                        className="sr-only"
                                        disabled={loading}
                                    />
                                    <div className={`mb-1 ${formData.tipo === tipo.value ? 'text-[#224666]' : 'text-slate-500'}`}>
                                        {tipo.icon}
                                    </div>
                                    <span className={`text-xs font-medium ${formData.tipo === tipo.value ? 'text-[#224666]' : 'text-slate-700'}`}>
                                        {tipo.label}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        {/* Título (condicional) */}
                        {requiereTitulo && (
                            <div className="col-span-2">
                                <label className="block font-medium text-slate-700 mb-1">
                                    <Title className="mr-1" />
                                    Título *
                                </label>
                                <input
                                    type="text"
                                    name="titulo"
                                    value={formData.titulo}
                                    onChange={handleInputChange}
                                    placeholder="Título del mensaje..."
                                    className={`w-full px-3 h-8 border rounded-md transition-colors ${errors.titulo ? 'border-red-300' : 'border-slate-300'
                                        }`}
                                    disabled={loading}
                                    maxLength={200}
                                />
                                {errors.titulo && (
                                    <p className="text-red-600 text-xs mt-1">{errors.titulo}</p>
                                )}
                                <p className="text-xs text-slate-500 mt-1">
                                    {formData.titulo.length}/200 caracteres
                                </p>
                            </div>
                        )}

                        {/* Contenido */}
                        <div className="col-span-2">
                            <label className="block font-medium text-slate-700 mb-1">
                                <Subject className="mr-1" />
                                {formData.tipo === 'TEXTO' ? 'Contenido *' : 'Contenido (opcional)'}
                            </label>
                            <textarea
                                name="contenido"
                                value={formData.contenido}
                                onChange={handleInputChange}
                                placeholder={formData.tipo === 'TEXTO'
                                    ? 'Escriba el mensaje que se mostrará...'
                                    : 'Descripción adicional (opcional)...'}
                                rows={3}
                                className={`w-full px-3 py-1.5 h-12 border rounded-md transition-colors resize-none ${errors.contenido ? 'border-red-300' : 'border-slate-300'
                                    }`}
                                disabled={loading}
                                maxLength={1000}
                            />
                            {errors.contenido && (
                                <p className="text-red-600 text-xs mt-1">{errors.contenido}</p>
                            )}
                            <p className="text-xs text-slate-500 mt-1">
                                {formData.contenido.length}/1000 caracteres
                            </p>
                        </div>

                        {/* Ruta de Archivo (condicional) */}
                        {/* {requiereArchivo && (
                            <div className="col-span-2">
                                <label className="block font-medium text-slate-700 mb-1">
                                    <Link className="mr-1" />
                                    URL del Archivo *
                                </label>
                                <input
                                    type="text"
                                    name="rutaArchivo"
                                    value={formData.rutaArchivo}
                                    onChange={handleInputChange}
                                    placeholder="https://ejemplo.com/archivo.jpg o /ruta/local/archivo"
                                    className={`w-full px-3 h-8 border rounded-md transition-colors ${errors.rutaArchivo ? 'border-red-300' : 'border-slate-300'
                                        }`}
                                    disabled={loading}
                                    maxLength={300}
                                />
                                {errors.rutaArchivo && (
                                    <p className="text-red-600 text-xs mt-1">{errors.rutaArchivo}</p>
                                )}
                                <p className="text-xs text-slate-500 mt-1">
                                    URL o ruta del archivo a mostrar
                                </p>
                            </div>
                        )} */}
                        {requiereArchivo && (
                            <div>
                                <label className="block font-medium text-slate-700 mb-1">
                                    Archivo {['IMAGEN', 'VIDEO'].includes(formData.tipo) ? '(Requerido)' : ''}
                                </label>
                                <FileUploadComponent
                                    onFileUploaded={(result) => {
                                        setFormData(prev => ({
                                            ...prev,
                                            rutaArchivo: result?.url || ''
                                        }));
                                    }}
                                    currentFileUrl={formData.rutaArchivo}
                                    folder="mensajes"
                                    acceptTypes={
                                        formData.tipo === 'IMAGEN' ? 'image/*' :
                                            formData.tipo === 'VIDEO' ? 'video/*' :
                                                'image/*,video/*'
                                    }
                                />
                            </div>
                        )}

                        <div className='col-span-2 grid grid-cols-1 md:grid-cols-4 gap-4'>
                            {/* Duración */}
                            <div>
                                <label className="block font-medium text-slate-700 mb-1">
                                    <Schedule className="mr-1" />
                                    Duración (seg) *
                                </label>
                                <input
                                    type="number"
                                    name="duracion"
                                    value={formData.duracion}
                                    onChange={handleInputChange}
                                    min={3}
                                    max={60}
                                    className={`w-full px-3 h-8 border rounded-md transition-colors ${errors.duracion ? 'border-red-300' : 'border-slate-300'
                                        }`}
                                    disabled={loading}
                                />
                                {errors.duracion && (
                                    <p className="text-red-600 text-xs mt-1">{errors.duracion}</p>
                                )}
                            </div>

                            {/* Orden */}
                            <div>
                                <label className="block font-medium text-slate-700 mb-1">
                                    <ListAltIcon className="mr-1" />
                                    Orden
                                </label>
                                <input
                                    type="number"
                                    name="orden"
                                    value={formData.orden}
                                    onChange={handleInputChange}
                                    min={0}
                                    max={100}
                                    className={`w-full px-3 h-8 border rounded-md transition-colors ${errors.orden ? 'border-red-300' : 'border-slate-300'
                                        }`}
                                    disabled={loading}
                                />
                                {errors.orden && (
                                    <p className="text-red-600 text-xs mt-1">{errors.orden}</p>
                                )}
                            </div>

                            {/* Configuración de Vigencia */}
                            <div className='col-span-2'>
                                {/* <label className="block font-medium text-slate-700 mb-1">
                                    <CalendarMonth className="mr-1" />
                                    Configurar Vigencia
                                </label> */}

                                {mostrarVigencia && (
                                <div className="flex gap-4">
                                    <div>
                                        <label className="block font-medium text-slate-700 mb-1">
                                            <CalendarMonth className="mr-1" />
                                            Fecha Inicio
                                        </label>
                                        <input
                                            type="date"
                                            name="fechaInicio"
                                            value={formData.fechaInicio}
                                            onChange={handleInputChange}
                                            className={`w-full px-2 py-1 border rounded-md ${errors.fechaInicio ? 'border-red-300' : 'border-slate-300'
                                                }`}
                                            disabled={loading}
                                        />
                                        {errors.fechaInicio && (
                                            <p className="text-red-600 text-xs mt-1">{errors.fechaInicio}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block font-medium text-slate-700 mb-1">
                                            <CalendarMonth className="mr-1" />
                                            Fecha Fin
                                        </label>
                                        <input
                                            type="date"
                                            name="fechaFin"
                                            value={formData.fechaFin}
                                            onChange={handleInputChange}
                                            className={`w-full px-2 py-1 border rounded-md ${errors.fechaFin ? 'border-red-300' : 'border-slate-300'
                                                }`}
                                            disabled={loading}
                                        />
                                        {errors.fechaFin && (
                                            <p className="text-red-600 text-xs mt-1">{errors.fechaFin}</p>
                                        )}
                                    </div>
                                </div>
                            )}
                                
                            </div>
                        </div>
                    </div>

                    {/* Botones */}
                    <div className="flex items-center justify-end space-x-3 pt-2 border-t border-slate-200">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 h-8 text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors disabled:opacity-50"
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center px-4 h-8 bg-[#224666] text-white rounded-md hover:bg-[#1a3a52] transition-colors disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Save sx={{ fontSize: '20px' }} className="mr-2" />
                            )}
                            {loading ? 'Creando...' : 'Crear Mensaje'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default CrearMensajeModal;