import React, { useState, useEffect } from 'react';
import {
    Close,
    Person,
    Business,
    Star,
    Event,
    AccessTime,
    Save,
    Search,
    Add
} from '@mui/icons-material';

/**
 * Modal para generar un nuevo turno
 * Maneja tres tipos de generación:
 * 1. Ciudadano nuevo
 * 2. Ciudadano existente
 * 3. Turno especial con fecha/hora
 */
const GenerarTurnoModal = ({
    isOpen,
    onClose,
    onSubmit,
    sectores = [],
    loading = false
}) => {
    const [tipoGeneracion, setTipoGeneracion] = useState('existente'); // 'nuevo', 'existente', 'especial'
    const [formData, setFormData] = useState({
        sectorId: '',
        dni: '',
        nombre: '',
        apellido: '',
        telefono: '',
        direccion: '',
        esPrioritario: false,
        motivoPrioridad: '',
        fechaCita: '',
        horaCita: '',
        motivoCita: '',
        observaciones: ''
    });
    const [errors, setErrors] = useState({});
    const [buscandoCiudadano, setBuscandoCiudadano] = useState(false);
    const [ciudadanoEncontrado, setCiudadanoEncontrado] = useState(null);

    // Limpiar formulario cuando se abre/cierra
    useEffect(() => {
        if (isOpen) {
            resetFormulario();
        }
    }, [isOpen]);

    const resetFormulario = () => {
        setFormData({
            sectorId: '',
            dni: '',
            nombre: '',
            apellido: '',
            telefono: '',
            direccion: '',
            esPrioritario: false,
            motivoPrioridad: '',
            fechaCita: '',
            horaCita: '',
            motivoCita: '',
            observaciones: ''
        });
        setErrors({});
        setCiudadanoEncontrado(null);
        setTipoGeneracion('existente');
    };

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

        // Si cambió el DNI y es ciudadano existente, limpiar búsqueda anterior
        if (name === 'dni' && tipoGeneracion === 'existente') {
            setCiudadanoEncontrado(null);
        }
    };

    const buscarCiudadano = async () => {
        if (!formData.dni || formData.dni.length < 7) {
            setErrors(prev => ({ ...prev, dni: 'DNI debe tener al menos 7 dígitos' }));
            return;
        }

        try {
            setBuscandoCiudadano(true);
            // TODO: Implementar búsqueda real con servicio

            // Simulación de búsqueda
            setTimeout(() => {
                // Simular ciudadano encontrado
                const ciudadanoMock = {
                    dni: formData.dni,
                    nombre: 'Juan Carlos',
                    apellido: 'Pérez',
                    telefono: '0351-1234567',
                    direccion: 'Av. Córdoba 123',
                    esPrioritario: false
                };

                setCiudadanoEncontrado(ciudadanoMock);
                setFormData(prev => ({
                    ...prev,
                    nombre: ciudadanoMock.nombre,
                    apellido: ciudadanoMock.apellido,
                    telefono: ciudadanoMock.telefono,
                    direccion: ciudadanoMock.direccion,
                    esPrioritario: ciudadanoMock.esPrioritario
                }));
                setBuscandoCiudadano(false);
            }, 1000);

        } catch (error) {
            setBuscandoCiudadano(false);
            setErrors(prev => ({ ...prev, dni: 'Error buscando ciudadano' }));
            setCiudadanoEncontrado(null);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Validaciones comunes
        if (!formData.sectorId) {
            newErrors.sectorId = 'Debe seleccionar un sector';
        }

        if (!formData.dni || formData.dni.length < 7 || formData.dni.length > 8) {
            newErrors.dni = 'DNI debe tener entre 7 y 8 dígitos';
        }

        // Validaciones según tipo
        if (tipoGeneracion === 'nuevo') {
            if (!formData.nombre.trim()) {
                newErrors.nombre = 'Nombre es requerido';
            }
            if (!formData.apellido.trim()) {
                newErrors.apellido = 'Apellido es requerido';
            }
        }

        if (tipoGeneracion === 'existente' && !ciudadanoEncontrado) {
            newErrors.dni = 'Debe buscar y encontrar al ciudadano';
        }

        if (tipoGeneracion === 'especial') {
            if (!formData.fechaCita) {
                newErrors.fechaCita = 'Fecha de cita es requerida';
            }
            if (!formData.horaCita) {
                newErrors.horaCita = 'Hora de cita es requerida';
            }
            if (!formData.motivoCita.trim()) {
                newErrors.motivoCita = 'Motivo de cita es requerido';
            }
        }

        if (formData.esPrioritario && !formData.motivoPrioridad.trim()) {
            newErrors.motivoPrioridad = 'Debe especificar motivo de prioridad';
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
            let datosGeneracion = {
                sectorId: parseInt(formData.sectorId),
                dni: formData.dni,
                observaciones: formData.observaciones
            };

            // Agregar datos según el tipo
            if (tipoGeneracion === 'nuevo') {
                datosGeneracion = {
                    ...datosGeneracion,
                    nombre: formData.nombre,
                    apellido: formData.apellido,
                    esPrioritario: formData.esPrioritario,
                    motivoPrioridad: formData.motivoPrioridad,
                    telefono: formData.telefono,
                    direccion: formData.direccion
                };
            } else if (tipoGeneracion === 'existente' && formData.esPrioritario) {
                datosGeneracion = {
                    ...datosGeneracion,
                    esPrioritario: formData.esPrioritario,
                    motivoPrioridad: formData.motivoPrioridad
                };
            } else if (tipoGeneracion === 'especial') {
                datosGeneracion = {
                    ...datosGeneracion,
                    fechaCita: formData.fechaCita,
                    horaCita: formData.horaCita,
                    motivoCita: formData.motivoCita
                };
            }

            await onSubmit(datosGeneracion);
            onClose();
            resetFormulario();

        } catch (error) {
            console.error('Error generando turno:', error);
        }
    };

    if (!isOpen) return null;

    // Obtener fecha mínima (hoy)
    const fechaMinima = new Date().toISOString().split('T')[0];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-slate-900 flex items-center">
                        <Add className="h-6 w-6 mr-2 text-slate-600" />
                        Generar Nuevo Turno
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <Close className="h-6 w-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="px-6 py-4 space-y-6">

                        {/* Tipo de generación */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-3">
                                Tipo de Turno
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setTipoGeneracion('existente')}
                                    className={`p-3 border-2 rounded-lg text-sm font-medium transition-colors ${tipoGeneracion === 'existente'
                                            ? 'border-slate-500 bg-slate-50 text-slate-900'
                                            : 'border-slate-200 text-slate-600 hover:border-slate-300'
                                        }`}
                                >
                                    <Person className="h-5 w-5 mx-auto mb-1" />
                                    Ciudadano Existente
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setTipoGeneracion('nuevo')}
                                    className={`p-3 border-2 rounded-lg text-sm font-medium transition-colors ${tipoGeneracion === 'nuevo'
                                            ? 'border-slate-500 bg-slate-50 text-slate-900'
                                            : 'border-slate-200 text-slate-600 hover:border-slate-300'
                                        }`}
                                >
                                    <Add className="h-5 w-5 mx-auto mb-1" />
                                    Ciudadano Nuevo
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setTipoGeneracion('especial')}
                                    className={`p-3 border-2 rounded-lg text-sm font-medium transition-colors ${tipoGeneracion === 'especial'
                                            ? 'border-slate-500 bg-slate-50 text-slate-900'
                                            : 'border-slate-200 text-slate-600 hover:border-slate-300'
                                        }`}
                                >
                                    <Event className="h-5 w-5 mx-auto mb-1" />
                                    Turno Especial
                                </button>
                            </div>
                        </div>

                        {/* Sector */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Sector *
                            </label>
                            <select
                                name="sectorId"
                                value={formData.sectorId}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent ${errors.sectorId ? 'border-red-300' : 'border-slate-300'
                                    }`}
                            >
                                <option value="">Seleccionar sector...</option>
                                {sectores.map(sector => (
                                    <option key={sector.id} value={sector.id}>
                                        {sector.codigo} - {sector.nombre}
                                    </option>
                                ))}
                            </select>
                            {errors.sectorId && (
                                <p className="mt-1 text-sm text-red-600">{errors.sectorId}</p>
                            )}
                        </div>

                        {/* DNI */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                DNI del Ciudadano *
                            </label>
                            <div className="flex space-x-2">
                                <input
                                    type="text"
                                    name="dni"
                                    value={formData.dni}
                                    onChange={handleInputChange}
                                    maxLength="8"
                                    className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent ${errors.dni ? 'border-red-300' : 'border-slate-300'
                                        }`}
                                    placeholder="12345678"
                                />
                                {tipoGeneracion === 'existente' && (
                                    <button
                                        type="button"
                                        onClick={buscarCiudadano}
                                        disabled={!formData.dni || buscandoCiudadano}
                                        className="px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                                    >
                                        <Search className="h-4 w-4" />
                                        <span>{buscandoCiudadano ? 'Buscando...' : 'Buscar'}</span>
                                    </button>
                                )}
                            </div>
                            {errors.dni && (
                                <p className="mt-1 text-sm text-red-600">{errors.dni}</p>
                            )}
                        </div>

                        {/* Datos del ciudadano encontrado */}
                        {ciudadanoEncontrado && tipoGeneracion === 'existente' && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <div className="flex items-center mb-2">
                                    <Person className="h-5 w-5 text-green-600 mr-2" />
                                    <span className="text-green-800 font-medium">Ciudadano Encontrado</span>
                                </div>
                                <div className="text-sm text-green-700">
                                    <p><strong>Nombre:</strong> {ciudadanoEncontrado.nombre} {ciudadanoEncontrado.apellido}</p>
                                    <p><strong>DNI:</strong> {ciudadanoEncontrado.dni}</p>
                                    {ciudadanoEncontrado.telefono && <p><strong>Teléfono:</strong> {ciudadanoEncontrado.telefono}</p>}
                                </div>
                            </div>
                        )}

                        {/* Datos del ciudadano nuevo */}
                        {tipoGeneracion === 'nuevo' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Nombre *
                                    </label>
                                    <input
                                        type="text"
                                        name="nombre"
                                        value={formData.nombre}
                                        onChange={handleInputChange}
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent ${errors.nombre ? 'border-red-300' : 'border-slate-300'
                                            }`}
                                        placeholder="Nombre"
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
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent ${errors.apellido ? 'border-red-300' : 'border-slate-300'
                                            }`}
                                        placeholder="Apellido"
                                    />
                                    {errors.apellido && (
                                        <p className="mt-1 text-sm text-red-600">{errors.apellido}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Teléfono
                                    </label>
                                    <input
                                        type="text"
                                        name="telefono"
                                        value={formData.telefono}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                                        placeholder="0351-1234567"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Dirección
                                    </label>
                                    <input
                                        type="text"
                                        name="direccion"
                                        value={formData.direccion}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                                        placeholder="Dirección"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Datos de turno especial */}
                        {tipoGeneracion === 'especial' && (
                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-4">
                                <div className="flex items-center mb-2">
                                    <Event className="h-5 w-5 text-purple-600 mr-2" />
                                    <span className="text-purple-800 font-medium">Configuración de Cita</span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Fecha de Cita *
                                        </label>
                                        <input
                                            type="date"
                                            name="fechaCita"
                                            value={formData.fechaCita}
                                            onChange={handleInputChange}
                                            min={fechaMinima}
                                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent ${errors.fechaCita ? 'border-red-300' : 'border-slate-300'
                                                }`}
                                        />
                                        {errors.fechaCita && (
                                            <p className="mt-1 text-sm text-red-600">{errors.fechaCita}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Hora de Cita *
                                        </label>
                                        <input
                                            type="time"
                                            name="horaCita"
                                            value={formData.horaCita}
                                            onChange={handleInputChange}
                                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent ${errors.horaCita ? 'border-red-300' : 'border-slate-300'
                                                }`}
                                        />
                                        {errors.horaCita && (
                                            <p className="mt-1 text-sm text-red-600">{errors.horaCita}</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Motivo de la Cita *
                                    </label>
                                    <input
                                        type="text"
                                        name="motivoCita"
                                        value={formData.motivoCita}
                                        onChange={handleInputChange}
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent ${errors.motivoCita ? 'border-red-300' : 'border-slate-300'
                                            }`}
                                        placeholder="Reunión con intendente, audiencia, etc."
                                    />
                                    {errors.motivoCita && (
                                        <p className="mt-1 text-sm text-red-600">{errors.motivoCita}</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Prioridad */}
                        <div>
                            <div className="flex items-center space-x-3 mb-3">
                                <input
                                    type="checkbox"
                                    id="esPrioritario"
                                    name="esPrioritario"
                                    checked={formData.esPrioritario}
                                    onChange={handleInputChange}
                                    className="rounded border-slate-300 text-yellow-600 focus:ring-yellow-500"
                                />
                                <label htmlFor="esPrioritario" className="text-sm font-medium text-slate-700 flex items-center">
                                    <Star className="h-4 w-4 text-yellow-600 mr-1" />
                                    Turno Prioritario
                                </label>
                            </div>

                            {formData.esPrioritario && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Motivo de Prioridad *
                                    </label>
                                    <input
                                        type="text"
                                        name="motivoPrioridad"
                                        value={formData.motivoPrioridad}
                                        onChange={handleInputChange}
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent ${errors.motivoPrioridad ? 'border-red-300' : 'border-slate-300'
                                            }`}
                                        placeholder="Discapacidad, embarazo, adulto mayor, etc."
                                    />
                                    {errors.motivoPrioridad && (
                                        <p className="mt-1 text-sm text-red-600">{errors.motivoPrioridad}</p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Observaciones */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Observaciones
                            </label>
                            <textarea
                                name="observaciones"
                                value={formData.observaciones}
                                onChange={handleInputChange}
                                rows={3}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                                placeholder="Información adicional sobre el turno..."
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-slate-200 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 text-sm font-medium text-white bg-slate-600 border border-transparent rounded-md hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                        >
                            <Save className="h-4 w-4" />
                            <span>{loading ? 'Generando...' : 'Generar Turno'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default GenerarTurnoModal;