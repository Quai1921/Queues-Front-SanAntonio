import React, { useState, useEffect } from 'react';
import {
    Close,
    Person,
    Save,
    ContactPhone,
    Home,
    Badge,
    PriorityHigh,
    Notes,
    Warning,
    PersonAdd
} from '@mui/icons-material';
import useCiudadano from '../hooks/useCiudadano';

/**
 * Modal para crear o editar ciudadanos
 */
const CrearCiudadanoModal = ({
    isOpen,
    onClose,
    onSubmit,
    ciudadano = null,
    loading = false,
    modo = 'crear' // 'crear' o 'editar'
}) => {
    const [formData, setFormData] = useState({
        dni: '',
        nombre: '',
        apellido: '',
        telefono: '',
        direccion: '',
        esPrioritario: false,
        motivoPrioridad: '',
        observaciones: ''
    });

    const [errors, setErrors] = useState({});
    const [verificandoDni, setVerificandoDni] = useState(false);

    // Hook para acceder a funciones de utilidad
    const {
        verificarDniExistente,
        validarDatos,
        getMotivosPrioridadComunes
    } = useCiudadano();

    // Cargar datos del ciudadano cuando se abre en modo editar
    useEffect(() => {
        if (isOpen) {
            if (modo === 'editar' && ciudadano) {
                setFormData({
                    dni: ciudadano.dni || '',
                    nombre: ciudadano.nombre || '',
                    apellido: ciudadano.apellido || '',
                    telefono: ciudadano.telefono || '',
                    direccion: ciudadano.direccion || '',
                    esPrioritario: ciudadano.esPrioritario || false,
                    motivoPrioridad: ciudadano.motivoPrioridad || '',
                    observaciones: ciudadano.observaciones || ''
                });
            } else {
                // Limpiar formulario para crear nuevo
                setFormData({
                    dni: '',
                    nombre: '',
                    apellido: '',
                    telefono: '',
                    direccion: '',
                    esPrioritario: false,
                    motivoPrioridad: '',
                    observaciones: ''
                });
            }
            setErrors({});
        }
    }, [isOpen, modo, ciudadano]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Limpiar error del campo si existe
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }

        // Si desmarcan prioritario, limpiar motivo
        if (name === 'esPrioritario' && !checked) {
            setFormData(prev => ({
                ...prev,
                motivoPrioridad: ''
            }));
        }
    };

    // Verificar DNI existente solo en modo crear
    const verificarDniExistenteFn = async (dni) => {
        if (modo === 'editar' || !dni || dni.length < 7) return;

        try {
            setVerificandoDni(true);
            const existe = await verificarDniExistente(dni);

            if (existe) {
                setErrors(prev => ({
                    ...prev,
                    dni: 'Ya existe un ciudadano con este DNI'
                }));
            } else {
                setErrors(prev => ({
                    ...prev,
                    dni: null
                }));
            }
        } catch (error) {
            console.error('Error verificando DNI:', error);
        } finally {
            setVerificandoDni(false);
        }
    };

    const handleDniBlur = () => {
        if (formData.dni) {
            verificarDniExistenteFn(formData.dni);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validar datos
        const validation = validarDatos(formData);
        if (!validation.esValido) {
            setErrors(validation.errores);
            return;
        }

        try {
            await onSubmit(formData);
        } catch (error) {
            // Los errores se manejan en el componente padre
        }
    };

    if (!isOpen) return null;

    const motivosPrioridad = getMotivosPrioridadComunes();
    const titulo = modo === 'editar' ? 'Editar Ciudadano' : 'Crear Ciudadano';
    const subtitulo = modo === 'editar' && ciudadano ?
        `DNI: ${ciudadano.dni} - ${ciudadano.nombreCompleto}` :
        'Complete la información del ciudadano';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                    <div className="flex items-center">
                        <div className="p-2 bg-slate-200 rounded-lg mr-3">
                            <PersonAdd className="h-6 w-6 text-slate-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900">{titulo}</h3>
                            <p className="text-sm text-slate-600">{subtitulo}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                    >
                        <Close className="h-5 w-5" />
                    </button>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="px-6 pt-4 pb-6 space-y-6">
                    {/* DNI / Apellido / Nombre */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            <Badge className="inline h-4 w-4 mr-1" />
                            DNI *
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                name="dni"
                                value={formData.dni}
                                onChange={handleInputChange}
                                onBlur={handleDniBlur}
                                disabled={modo === 'editar'}
                                placeholder="Ej: 12345678"
                                maxLength="8"
                                className={`w-full px-3 py-2 border rounded-lg ${errors.dni ? 'border-red-300' : 'border-slate-300'
                                    } ${modo === 'editar' ? 'bg-slate-100' : ''}`}
                            />
                            {verificandoDni && (
                                <div className="absolute right-3 top-2">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                                </div>
                            )}
                        </div>
                        {errors.dni && (
                            <p className="mt-1 text-sm text-red-600">{errors.dni}</p>
                        )}
                    </div>

                    <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                <Person className="inline h-4 w-4 mr-1" />
                                Nombre *
                            </label>
                            <input
                                type="text"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleInputChange}
                                placeholder="Ej: Juan Carlos"
                                maxLength="100"
                                className={`w-full px-3 py-2 border rounded-lg ${errors.nombre ? 'border-red-300' : 'border-slate-300'
                                    }`}
                            />
                            {errors.nombre && (
                                <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Apellido *
                            </label>
                            <input
                                type="text"
                                name="apellido"
                                value={formData.apellido}
                                onChange={handleInputChange}
                                placeholder="Ej: González Pérez"
                                maxLength="100"
                                className={`w-full px-3 py-2 border rounded-lg ${errors.apellido ? 'border-red-300' : 'border-slate-300'
                                    }`}
                            />
                            {errors.apellido && (
                                <p className="mt-1 text-sm text-red-600">{errors.apellido}</p>
                            )}
                        </div>
                    </div>

                    {/* Contacto */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                <ContactPhone className="inline h-4 w-4 mr-1" />
                                Teléfono *
                            </label>
                            <input
                                type="tel"
                                name="telefono"
                                value={formData.telefono}
                                onChange={handleInputChange}
                                placeholder="Ej: 0351-1234567"
                                maxLength="20"
                                className={`w-full px-3 py-2 border rounded-lg ${errors.telefono ? 'border-red-300' : 'border-slate-300'
                                    }`}
                            />
                            {errors.telefono && (
                                <p className="mt-1 text-sm text-red-600">{errors.telefono}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                <Home className="inline h-4 w-4 mr-1" />
                                Dirección *
                            </label>
                            <input
                                type="text"
                                name="direccion"
                                value={formData.direccion}
                                onChange={handleInputChange}
                                placeholder="Ej: Av. Colón 1234"
                                maxLength="200"
                                className={`w-full px-3 py-2 border rounded-lg ${errors.direccion ? 'border-red-300' : 'border-slate-300'
                                    }`}
                            />
                            {errors.direccion && (
                                <p className="mt-1 text-sm text-red-600">{errors.direccion}</p>
                            )}
                        </div>
                    </div>

                    {/* Prioridad */}
                    <div className="space-y-4">
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="esPrioritario"
                                name="esPrioritario"
                                checked={formData.esPrioritario}
                                onChange={handleInputChange}
                                className="h-4 w-4 text-red-600 border-slate-300 rounded"
                            />
                            <label htmlFor="esPrioritario" className="ml-2 block text-sm text-slate-700">
                                {/* <PriorityHigh className="inline h-4 w-4 mr-1 text-red-500" /> */}
                                Ciudadano prioritario
                            </label>
                        </div>

                        {formData.esPrioritario && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Motivo de prioridad *
                                </label>
                                <select
                                    name="motivoPrioridad"
                                    value={formData.motivoPrioridad}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border rounded-lg ${errors.motivoPrioridad ? 'border-red-300' : 'border-slate-300'
                                        }`}
                                >
                                    <option value="">Seleccionar motivo</option>
                                    {motivosPrioridad.map(motivo => (
                                        <option key={motivo} value={motivo}>
                                            {motivo}
                                        </option>
                                    ))}
                                </select>
                                {errors.motivoPrioridad && (
                                    <p className="mt-1 text-sm text-red-600">{errors.motivoPrioridad}</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Observaciones */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            <Notes className="inline h-4 w-4 mr-1" />
                            Observaciones
                        </label>
                        <textarea
                            name="observaciones"
                            value={formData.observaciones}
                            onChange={handleInputChange}
                            placeholder="Información adicional sobre el ciudadano..."
                            rows="3"
                            maxLength="500"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg resize-none"
                        />
                        <div className="text-xs text-slate-500 mt-1">
                            {formData.observaciones.length}/500 caracteres
                        </div>
                    </div>

                    {/* Botones */}
                    <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading || verificandoDni}
                            className="px-4 py-2 text-sm font-medium bg-[#224666] text-white rounded-lg hover:bg-[#2c3e50] disabled:opacity-50 flex items-center"
                        >
                            {loading ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            ) : (
                                <Save className="h-4 w-4 mr-2" />
                            )}
                            {modo === 'editar' ? 'Actualizar' : 'Crear'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CrearCiudadanoModal;