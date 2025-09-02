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
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import ciudadanoService from '../services/ciudadanoService';

/**
 * Modal para generar un nuevo turno
 * Maneja dos tipos de generación:
 * 1. Ciudadano nuevo
 * 2. Ciudadano existente
 * Con configuración de cita automática para sectores ESPECIAL
 */
const GenerarTurnoModal = ({
    isOpen,
    onClose,
    onSubmit,
    sectores = [],
    loading = false
}) => {
    const [tipoGeneracion, setTipoGeneracion] = useState('existente'); // 'nuevo', 'existente'
    const [formData, setFormData] = useState({
        sectorId: '',
        dni: '',
        apellidoBusqueda: '', // Nuevo campo para búsqueda
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
    const [ciudadanosEncontrados, setCiudadanosEncontrados] = useState([]); // Nuevo estado

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
            apellidoBusqueda: '',
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
        setCiudadanosEncontrados([]);
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
        if (name === 'dni' || name === 'apellidoBusqueda') {
            setCiudadanoEncontrado(null);
            setCiudadanosEncontrados([]);
        }
    };

    const buscarCiudadanos = async () => {
        const criterios = {};

        // Determinar criterios de búsqueda
        if (formData.dni && formData.dni.length >= 7) {
            criterios.dni = formData.dni;
        }
        if (formData.apellidoBusqueda && formData.apellidoBusqueda.length >= 2) {
            criterios.apellido = formData.apellidoBusqueda.trim();
        }

        // Validar que hay al menos un criterio
        if (!criterios.dni && !criterios.apellido) {
            setErrors({
                dni: criterios.dni ? null : 'DNI debe tener al menos 7 dígitos',
                apellidoBusqueda: criterios.apellido ? null : 'Apellido debe tener al menos 2 caracteres'
            });
            return;
        }

        setBuscandoCiudadano(true);
        setErrors({});

        try {
            const ciudadanos = await ciudadanoService.buscar(criterios);

            if (ciudadanos && ciudadanos.length > 0) {
                if (ciudadanos.length === 1) {
                    // Si hay un solo resultado, seleccionarlo automáticamente
                    const ciudadano = ciudadanos[0];
                    setCiudadanoEncontrado(ciudadano);
                    setFormData(prev => ({
                        ...prev,
                        dni: ciudadano.dni,
                        nombre: ciudadano.nombre,
                        apellido: ciudadano.apellido,
                        telefono: ciudadano.telefono || '',
                        direccion: ciudadano.direccion || '',
                        esPrioritario: ciudadano.esPrioritario || false,
                        motivoPrioridad: ciudadano.motivoPrioridad || ''
                    }));
                    setCiudadanosEncontrados([]);
                } else {
                    // Si hay múltiples resultados, mostrar lista para seleccionar
                    setCiudadanosEncontrados(ciudadanos);
                    setCiudadanoEncontrado(null);
                }
            } else {
                setCiudadanosEncontrados([]);
                setCiudadanoEncontrado(null);
                setErrors({
                    dni: criterios.dni ? 'No se encontraron ciudadanos con esos criterios' : null,
                    apellidoBusqueda: criterios.apellido ? 'No se encontraron ciudadanos con esos criterios' : null
                });
            }
        } catch (error) {
            console.error('Error buscando ciudadanos:', error);
            setErrors({
                dni: criterios.dni ? error.message || 'Error en la búsqueda' : null,
                apellidoBusqueda: criterios.apellido ? error.message || 'Error en la búsqueda' : null
            });
            setCiudadanosEncontrados([]);
            setCiudadanoEncontrado(null);
        } finally {
            setBuscandoCiudadano(false);
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

        // Validación para sectores especiales
        const sectorSeleccionado = sectores.find(s => s.id === parseInt(formData.sectorId));
        const esSectorEspecial = sectorSeleccionado?.tipoSector === 'ESPECIAL';

        if (esSectorEspecial) {
            if (!formData.fechaCita) {
                newErrors.fechaCita = 'Fecha de cita es requerida para sectores especiales';
            }
            if (!formData.horaCita) {
                newErrors.horaCita = 'Hora de cita es requerida para sectores especiales';
            }
            if (!formData.motivoCita || !formData.motivoCita.trim()) {
                newErrors.motivoCita = 'Motivo de cita es requerido para sectores especiales';
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
            const sectorSeleccionado = sectores.find(s => s.id === parseInt(formData.sectorId));
            const esSectorEspecial = sectorSeleccionado?.tipoSector === 'ESPECIAL';

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
            }

            // Agregar datos de cita si es sector especial
            if (esSectorEspecial) {
                datosGeneracion = {
                    ...datosGeneracion,
                    fechaCita: formData.fechaCita,
                    horaCita: formData.horaCita,
                    motivoCita: formData.motivoCita,
                    esEspecial: true
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
            <div className="bg-white rounded-md shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto text-sm">
                {/* Header */}
                <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-slate-900 flex items-center">
                        <div className="w-10 h-10 bg-slate-200 rounded-md flex items-center justify-center mr-3">
                            <EventAvailableIcon className="h-6 w-6 text-slate-600" />
                        </div>
                        Generar Nuevo Turno
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-50"
                    >
                        <Close className="h-6 w-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="p-4 space-y-2">

                        {/* Tipo de generación - SIEMPRE VISIBLE */}
                        <div>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setTipoGeneracion('existente')}
                                    className={`flex items-center justify-center p-2 border-2 rounded-md font-medium transition-colors ${tipoGeneracion === 'existente'
                                            ? 'border-slate-500 bg-slate-50 text-slate-900'
                                            : 'border-slate-200 text-slate-600 hover:border-slate-300'
                                        }`}
                                >
                                    <Person sx={{ fontSize: '20px' }} className="mr-2" />
                                    Ciudadano Existente
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setTipoGeneracion('nuevo')}
                                    className={`flex items-center justify-center p-2 border-2 rounded-md  font-medium transition-colors ${tipoGeneracion === 'nuevo'
                                            ? 'border-slate-500 bg-slate-50 text-slate-900'
                                            : 'border-slate-200 text-slate-600 hover:border-slate-300'
                                        }`}
                                >
                                    <Add sx={{ fontSize: '20px' }} className="mr-2" />
                                    Ciudadano Nuevo
                                </button>
                            </div>
                        </div>

                        
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            {/* Sector */}
                            <div>
                                <label className="block  font-medium text-slate-700 mb-1">
                                    Sector *
                                </label>
                                <select
                                    name="sectorId"
                                    value={formData.sectorId}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 h-8 border rounded-md ${errors.sectorId ? 'border-red-300' : 'border-slate-300'
                                        }`}
                                >
                                    <option value="">Seleccionar sector...</option>
                                    {sectores.map(sector => (
                                        <option key={sector.id} value={sector.id}>
                                            {sector.codigo} - {sector.nombre}
                                            {sector.tipoSector === 'ESPECIAL' && ' (Con Cita Previa)'}
                                        </option>
                                    ))}
                                </select>
                                {errors.sectorId && (
                                    <p className="mt-1  text-red-600">{errors.sectorId}</p>
                                )}
                            </div>

                            {/* Aviso para sector especial */}
                            {(() => {
                                const sectorSeleccionado = sectores.find(s => s.id === parseInt(formData.sectorId));
                                const esSectorEspecial = sectorSeleccionado?.tipoSector === 'ESPECIAL';

                                if (esSectorEspecial) {
                                    return (
                                        <div className="flex justify-center items-center gap-2 h-8 mt-auto bg-slate-50 border border-slate-200 rounded-md">
                                                <Event sx={{ fontSize: '20px' }} className="text-amber-600 mr-2" />
                                                <p className=" text-slate-700">
                                                    Este sector requiere cita previa.
                                                </p>
                                        </div>
                                    );
                                }
                                return null;
                            })()}
                        </div>
                        

                        

                        {/* Búsqueda de ciudadano */}
                        {tipoGeneracion === 'existente' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block  font-medium text-slate-700 mb-2">
                                            Buscar por DNI
                                        </label>
                                        <input
                                            type="text"
                                            name="dni"
                                            value={formData.dni}
                                            onChange={handleInputChange}
                                            maxLength="8"
                                            className={`w-full px-3 h-8 border rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent ${errors.dni ? 'border-red-300' : 'border-slate-300'
                                                }`}
                                            placeholder="12345678"
                                        />
                                        {errors.dni && (
                                            <p className="mt-1  text-red-600">{errors.dni}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block  font-medium text-slate-700 mb-2">
                                            Buscar por Apellido
                                        </label>
                                        <input
                                            type="text"
                                            name="apellidoBusqueda"
                                            value={formData.apellidoBusqueda}
                                            onChange={handleInputChange}
                                            className={`w-full px-3 h-8 border rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent ${errors.apellidoBusqueda ? 'border-red-300' : 'border-slate-300'
                                                }`}
                                            placeholder="García, López, etc."
                                        />
                                        {errors.apellidoBusqueda && (
                                            <p className="mt-1  text-red-600">{errors.apellidoBusqueda}</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <button
                                        type="button"
                                        onClick={buscarCiudadanos}
                                        disabled={(!formData.dni && !formData.apellidoBusqueda) || buscandoCiudadano}
                                        className="flex justify-center items-center w-full px-6 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed space-x-2"
                                    >
                                        <Search sx={{ fontSize: '20px' }} className="mr-2" />
                                        <span>{buscandoCiudadano ? 'Buscando...' : 'Buscar Ciudadano'}</span>
                                    </button>
                                </div>

                                {/* Lista de ciudadanos encontrados */}
                                {ciudadanosEncontrados.length > 0 && (
                                    <div className="border border-slate-200 rounded-md">
                                        <div className="p-2 bg-slate-50 border-b">
                                            <span className=" font-medium text-slate-700">
                                                Ciudadanos encontrados ({ciudadanosEncontrados.length})
                                            </span>
                                        </div>
                                        <div className="max-h-40 overflow-y-auto">
                                            {ciudadanosEncontrados.map((ciudadano) => (
                                                <button
                                                    key={ciudadano.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setCiudadanoEncontrado(ciudadano);
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            dni: ciudadano.dni,
                                                            nombre: ciudadano.nombre,
                                                            apellido: ciudadano.apellido,
                                                            telefono: ciudadano.telefono || '',
                                                            direccion: ciudadano.direccion || '',
                                                            esPrioritario: ciudadano.esPrioritario || false,
                                                            motivoPrioridad: ciudadano.motivoPrioridad || ''
                                                        }));
                                                        setCiudadanosEncontrados([]);
                                                    }}
                                                    className="w-full p-3 text-left hover:bg-slate-50 border-b border-slate-100 last:border-b-0"
                                                >
                                                    <div>
                                                        <div className="font-medium text-slate-900">
                                                            {ciudadano.nombre} {ciudadano.apellido}
                                                        </div>
                                                        <div className="text-slate-600">
                                                            DNI: {ciudadano.dni}
                                                            {ciudadano.telefono && ` • Tel: ${ciudadano.telefono}`}
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* DNI para ciudadano nuevo */}
                        {tipoGeneracion === 'nuevo' && (
                            <div>
                                <label className="block  font-medium text-slate-700 mb-2">
                                    DNI *
                                </label>
                                <input
                                    type="text"
                                    name="dni"
                                    value={formData.dni}
                                    onChange={handleInputChange}
                                    maxLength="8"
                                    className={`w-full px-3 h-8 border rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent ${errors.dni ? 'border-red-300' : 'border-slate-300'
                                        }`}
                                    placeholder="12345678"
                                />
                                {errors.dni && (
                                    <p className="mt-1  text-red-600">{errors.dni}</p>
                                )}
                            </div>
                        )}

                        {/* Datos del ciudadano encontrado */}
                        {ciudadanoEncontrado && tipoGeneracion === 'existente' && (
                            <div className="bg-green-50 border border-green-200 rounded-md p-2">
                                <div className="flex items-center mb-2">
                                    <Person className="h-5 w-5 text-slate-600 mr-2" />
                                    <span className="text-slate-800 font-medium">Ciudadano Encontrado</span>
                                </div>
                                <div className=" text-slate-700">
                                    <p><strong>Nombre:</strong> {ciudadanoEncontrado.nombre} {ciudadanoEncontrado.apellido}</p>
                                    <p><strong>DNI:</strong> {ciudadanoEncontrado.dni}</p>
                                </div>
                            </div>
                        )}

                        {/* Datos del ciudadano nuevo */}
                        {tipoGeneracion === 'nuevo' && (
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block  font-medium text-slate-700 mb-2">
                                        Nombre *
                                    </label>
                                    <input
                                        type="text"
                                        name="nombre"
                                        value={formData.nombre}
                                        onChange={handleInputChange}
                                        className={`w-full px-3 h-8 border rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent ${errors.nombre ? 'border-red-300' : 'border-slate-300'
                                            }`}
                                        placeholder="Nombre"
                                    />
                                    {errors.nombre && (
                                        <p className="mt-1 text-red-600">{errors.nombre}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block font-medium text-slate-700 mb-2">
                                        Apellido *
                                    </label>
                                    <input
                                        type="text"
                                        name="apellido"
                                        value={formData.apellido}
                                        onChange={handleInputChange}
                                        className={`w-full px-3 h-8 border rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent ${errors.apellido ? 'border-red-300' : 'border-slate-300'
                                            }`}
                                        placeholder="Apellido"
                                    />
                                    {errors.apellido && (
                                        <p className="mt-1  text-red-600">{errors.apellido}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block  font-medium text-slate-700 mb-2">
                                        Teléfono
                                    </label>
                                    <input
                                        type="text"
                                        name="telefono"
                                        value={formData.telefono}
                                        onChange={handleInputChange}
                                        className="w-full px-3 h-8 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                                        placeholder="0351-1234567"
                                    />
                                </div>
                                <div>
                                    <label className="block  font-medium text-slate-700 mb-2">
                                        Dirección
                                    </label>
                                    <input
                                        type="text"
                                        name="direccion"
                                        value={formData.direccion}
                                        onChange={handleInputChange}
                                        className="w-full px-3 h-8 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                                        placeholder="Dirección"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Configuración de cita para sectores ESPECIALES */}
                        {(() => {
                            const sectorSeleccionado = sectores.find(s => s.id === parseInt(formData.sectorId));
                            const esSectorEspecial = sectorSeleccionado?.tipoSector === 'ESPECIAL';

                            if (esSectorEspecial) {
                                return (
                                    <div className="bg-slate-50 border border-slate-200 rounded-md p-4 space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Fecha de cita */}
                                            <div>
                                                <label className="block font-medium text-slate-700 mb-2">
                                                    <Event className="h-4 w-4 inline mr-1" />
                                                    Fecha de Cita *
                                                </label>
                                                <input
                                                    type="date"
                                                    name="fechaCita"
                                                    value={formData.fechaCita}
                                                    onChange={handleInputChange}
                                                    min={fechaMinima}
                                                    required
                                                    className={`w-full px-3 h-8 border rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent ${errors.fechaCita ? 'border-red-300' : 'border-slate-300'
                                                        }`}
                                                />
                                                {errors.fechaCita && (
                                                    <p className="mt-1  text-red-600">{errors.fechaCita}</p>
                                                )}
                                            </div>

                                            {/* Hora de cita */}
                                            <div>
                                                <label className="block font-medium text-slate-700 mb-2">
                                                    <AccessTime className="h-4 w-4 inline mr-1" />
                                                    Hora de Cita *
                                                </label>
                                                <input
                                                    type="time"
                                                    name="horaCita"
                                                    value={formData.horaCita}
                                                    onChange={handleInputChange}
                                                    required
                                                    className={`w-full px-3 h-8 border rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent ${errors.horaCita ? 'border-red-300' : 'border-slate-300'
                                                        }`}
                                                />
                                                {errors.horaCita && (
                                                    <p className="mt-1  text-red-600">{errors.horaCita}</p>
                                                )}
                                            </div>

                                            {/* Motivo de cita */}
                                            <div className="md:col-span-2">
                                                <label className="block  font-medium text-slate-700 mb-2">
                                                    Motivo de la Cita *
                                                </label>
                                                <textarea
                                                    name="motivoCita"
                                                    value={formData.motivoCita}
                                                    onChange={handleInputChange}
                                                    rows={2}
                                                    required
                                                    className={`w-full resize-none px-3 py-1.5 h-12 border rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent ${errors.motivoCita ? 'border-red-300' : 'border-slate-300'
                                                        }`}
                                                    placeholder="Describa el motivo de la cita..."
                                                />
                                                {errors.motivoCita && (
                                                    <p className="mt-1  text-red-600">{errors.motivoCita}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            }
                            return null;
                        })()}

                        {/* Prioridad - Solo mostrar si no es ciudadano existente con prioridad ya establecida */}
                        {!(ciudadanoEncontrado?.esPrioritario) && (
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
                                    <label htmlFor="esPrioritario" className=" font-medium text-slate-700 flex items-center">
                                        Turno Prioritario
                                    </label>
                                </div>

                                {formData.esPrioritario && (
                                    <div>
                                        <label className="block  font-medium text-slate-700 mb-2">
                                            Motivo de Prioridad *
                                        </label>
                                        <select
                                            name="motivoPrioridad"
                                            value={formData.motivoPrioridad}
                                            onChange={handleInputChange}
                                            className={`w-full px-3 h-8 border rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent ${errors.motivoPrioridad ? 'border-red-300' : 'border-slate-300'
                                                }`}
                                        >
                                            <option value="">Seleccionar motivo...</option>
                                            <option value="DISCAPACIDAD">Discapacidad</option>
                                            <option value="EMBARAZO">Embarazo</option>
                                            <option value="ADULTO_MAYOR">Adulto Mayor (+65 años)</option>
                                            <option value="MENOR_ACOMPANADO">Menor acompañado</option>
                                            <option value="URGENCIA_MEDICA">Urgencia médica</option>
                                            <option value="OTRO">Otro motivo</option>
                                        </select>
                                        {errors.motivoPrioridad && (
                                            <p className="mt-1  text-red-600">{errors.motivoPrioridad}</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Mostrar prioridad existente */}
                        {ciudadanoEncontrado?.esPrioritario && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                                <div className="flex items-center mb-2">
                                    <Star className="h-5 w-5 text-yellow-600 mr-2" />
                                    <span className="text-yellow-800 font-medium">Ciudadano con Prioridad</span>
                                </div>
                                <p className=" text-yellow-700">
                                    Este ciudadano ya tiene prioridad establecida: <strong>{ciudadanoEncontrado.motivoPrioridad}</strong>
                                </p>
                            </div>
                        )}

                        {/* Observaciones */}
                        <div>
                            <label className="block  font-medium text-slate-700 mb-1">
                                Observaciones
                            </label>
                            <textarea
                                name="observaciones"
                                value={formData.observaciones}
                                onChange={handleInputChange}
                                rows={3}
                                className="w-full px-3 resize-none h-12 py-1.5 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                                placeholder="Información adicional sobre el turno..."
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-slate-200 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 h-8 font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors duration-300 disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 h-8 font-medium text-white bg-[#224666] border border-transparent rounded-md hover:bg-[#2c3e50] transition-colors duration-300 disabled:opacity-50 flex items-center"
                        >
                            <Save sx={{ fontSize: '20px' }} className="mr-2" />
                            <span>{loading ? 'Generando...' : 'Generar Turno'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default GenerarTurnoModal;