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
import impresionService from '../services/impresionService';
import { CheckCircle, Print } from '@mui/icons-material';
import sectoresService from '../services/sectoresService';

const TurnoGeneradoSuccess = ({ turno, onImprimir, onCerrar }) => {
    return (
        <div className="p-6 text-center">
            <div className='flex justify-center items-center gap-4 mb-4'>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                ¡Turno Generado Exitosamente!
            </h3>

            </div>

            {/* Título */}

            {/* Información del turno */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">Código:</span>
                        <span className="text-lg font-bold text-slate-600">{turno?.codigo}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">Ciudadano:</span>
                        <span className="text-sm text-gray-900">{turno?.ciudadano?.nombreCompleto}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">Sector:</span>
                        <span className="text-sm text-gray-900">{turno?.sector?.nombre}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">Fecha:</span>
                        <span className="text-sm text-gray-900">
                            {new Date().toLocaleDateString('es-AR')} - {new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                </div>
            </div>

            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                    onClick={onImprimir}
                    className="inline-flex items-center px-6 h-8 border border-transparent text-base font-medium rounded-md text-white bg-[#224666] hover:bg-[#2c3e50] transition-colors"
                >
                    <Print sx={{ fontSize: '20px' }} className="mr-2" />
                    Imprimir Turno
                </button>
                <button
                    onClick={onCerrar}
                    className="inline-flex items-center px-6 h-8 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                    Cerrar
                </button>
            </div>

            {/* Mensaje adicional */}
            <p className="text-sm text-gray-600 mt-4">
                Turno agregado a la cola. Puede imprimir el comprobante presionando "Imprimir Turno".
            </p>
        </div>
    );
};

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
    const [ciudadanosEncontrados, setCiudadanosEncontrados] = useState([]);

    const [turnoGenerado, setTurnoGenerado] = useState(null);
    const [mostrarExito, setMostrarExito] = useState(false);
    const [loadingInterno, setLoadingInterno] = useState(false);

    const [sectorCompleto, setSectorCompleto] = useState(null);
    const [fechasDisponibles, setFechasDisponibles] = useState([]);     // [{value:'2025-09-02', label:'Mar 02/09'}]
    const [horasDisponibles, setHorasDisponibles] = useState([]);       // ['17:00', '17:30']

    const dayMap = {
        MONDAY: 1, TUESDAY: 2, WEDNESDAY: 3, THURSDAY: 4, FRIDAY: 5, SATURDAY: 6, SUNDAY: 0
    };

    // Limpiar formulario cuando se abre/cierra
    useEffect(() => {
        if (isOpen) {
            resetFormulario();
        }
    }, [isOpen]);

    useEffect(() => {
        const cargarAgendaSector = async () => {
            setSectorCompleto(null);
            setFechasDisponibles([]);
            setHorasDisponibles([]);
            setFormData(prev => ({ ...prev, fechaCita: '', horaCita: '' }));

            const sid = parseInt(formData.sectorId);
            if (!sid) return;

            const sectorBase = sectores.find(s => s.id === sid);
            const esEspecial = sectorBase?.tipoSector === 'ESPECIAL';
            if (!esEspecial) return;

            try {
                const completo = await sectoresService.obtenerCompleto(sid); // trae { horarios: [...] }
                setSectorCompleto(completo);

                // días activos
                const diasActivos = (completo?.horarios || [])
                    .filter(h => h.activo)
                    .map(h => h.diaSemana); // p.ej. 'TUESDAY'

                const diasSet = new Set(diasActivos);

                // próximas 30 fechas que caen en alguno de esos días
                const hoy = new Date();
                const out = [];
                for (let i = 0; i < 30; i++) {
                    const d = new Date(hoy);
                    d.setDate(hoy.getDate() + i);
                    const dow = d.getDay(); // 0..6
                    // ¿este dow está en diasSet?
                    const coincide = Array.from(diasSet).some(nombre => dayMap[nombre] === dow);
                    if (coincide) {
                        const yyyy = d.getFullYear();
                        const mm = String(d.getMonth() + 1).padStart(2, '0');
                        const dd = String(d.getDate()).padStart(2, '0');
                        const value = `${yyyy}-${mm}-${dd}`;
                        const label = d.toLocaleDateString('es-AR', { weekday: 'short', day: '2-digit', month: '2-digit' });
                        out.push({ value, label }); // ej: "mar 02/09"
                    }
                }
                setFechasDisponibles(out);
            } catch (e) {
                console.error('Error cargando agenda del sector:', e);
                setErrors(prev => ({ ...prev, fechaCita: 'No se pudo cargar la agenda del sector' }));
            }
        };

        cargarAgendaSector();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData.sectorId, sectores]);

    useEffect(() => {
        const cargarDisponibilidad = async () => {
            setHorasDisponibles([]);
            if (!formData.sectorId || !formData.fechaCita) return;

            try {
                const horas = await sectoresService.obtenerDisponibilidad(
                    parseInt(formData.sectorId),
                    formData.fechaCita // 'YYYY-MM-DD'
                );

                setHorasDisponibles(horas);

                // si la hora elegida ya no está disponible, limpiarla
                if (formData.horaCita && !horas.includes(formData.horaCita)) {
                    setFormData(prev => ({ ...prev, horaCita: '' }));
                }
            } catch (e) {
                console.error('No se pudo cargar la disponibilidad real:', e);
                setErrors(prev => ({ ...prev, horaCita: 'No se pudo cargar la disponibilidad' }));
            }
        };
        cargarDisponibilidad();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData.sectorId, formData.fechaCita]);


    useEffect(() => {
        if (!sectorCompleto || !formData.fechaCita) {
            setHorasDisponibles([]);
            return;
        }
        try {
            const d = new Date(formData.fechaCita + 'T00:00:00');
            const dow = d.getDay();

            // Juntar horariosDisponibles de los horarios activos cuyo diaSemana coincide
            const horas = (sectorCompleto.horarios || [])
                .filter(h => h.activo && dayMap[h.diaSemana] === dow)
                .flatMap(h => h.horariosDisponibles || []) // 'HH:mm:ss'
                .map(t => t.slice(0, 5))                    // 'HH:mm'
                .filter(Boolean);

            // Ordenar y sin duplicados
            const unicos = Array.from(new Set(horas)).sort((a, b) => a.localeCompare(b));
            setHorasDisponibles(unicos);

            // si la hora seleccionada ya no está, limpiarla
            if (formData.horaCita && !unicos.includes(formData.horaCita)) {
                setFormData(prev => ({ ...prev, horaCita: '' }));
            }
        } catch (e) {
            console.error('Error calculando horas disponibles:', e);
            setHorasDisponibles([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData.fechaCita, sectorCompleto]);

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


    const verificarDniExistente = async (dni) => {
        if (!dni || dni.length < 7 || tipoGeneracion !== 'nuevo') return;

        try {
            const existe = await ciudadanoService.existeCiudadano(dni);

            if (existe) {
                setErrors(prev => ({
                    ...prev,
                    dni: 'Ya existe un ciudadano con este DNI. Use "Ciudadano Existente" para buscarlo.'
                }));
            } else {
                setErrors(prev => ({
                    ...prev,
                    dni: null
                }));
            }
        } catch (error) {
            console.error('Error verificando DNI:', error);
        }
    };

    const handleDniBlur = () => {
        if (formData.dni && tipoGeneracion === 'nuevo') {
            verificarDniExistente(formData.dni);
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

        // Reglas por tipo
        if (tipoGeneracion === 'nuevo') {
            if (!formData.nombre.trim()) newErrors.nombre = 'Nombre es requerido';
            if (!formData.apellido.trim()) newErrors.apellido = 'Apellido es requerido';
        }
        if (tipoGeneracion === 'existente' && !ciudadanoEncontrado) {
            newErrors.dni = 'Debe buscar y encontrar al ciudadano';
        }

        if (tipoGeneracion === 'existente' && !ciudadanoEncontrado) {
            newErrors.dni = 'Debe buscar y encontrar al ciudadano';
        }

        if (!formData.telefono.trim()) {
            newErrors.telefono = 'Teléfono es requerido';
        } else if (!/^[+]?[0-9\s\-\(\)]{8,20}$/.test(formData.telefono.trim())) {
            newErrors.telefono = 'Formato de teléfono inválido';
        }

        if (!formData.direccion.trim()) {
            newErrors.direccion = 'Dirección es requerida';
        } else if (formData.direccion.trim().length > 200) {
            newErrors.direccion = 'La dirección no puede exceder 200 caracteres';
        }


        // ESPECIAL: fecha, hora, motivo
        const sectorSeleccionado = sectores.find(s => s.id === parseInt(formData.sectorId));
        const esSectorEspecial = sectorSeleccionado?.tipoSector === 'ESPECIAL';
        if (esSectorEspecial) {
            if (!formData.fechaCita) newErrors.fechaCita = 'Fecha de cita es requerida';
            if (!formData.horaCita) newErrors.horaCita = 'Hora de cita es requerida';
            if (!formData.motivoCita || !formData.motivoCita.trim()) {
                newErrors.motivoCita = 'Motivo de cita es requerido';
            }
            // Defensa extra: la fecha elegida debe estar en fechasDisponibles
            if (formData.fechaCita && !fechasDisponibles.some(f => f.value === formData.fechaCita)) {
                newErrors.fechaCita = 'La fecha seleccionada no tiene atención disponible';
            }
            // Defensa extra: la hora elegida debe estar en horasDisponibles
            if (formData.horaCita && !horasDisponibles.includes(formData.horaCita)) {
                newErrors.horaCita = 'La hora seleccionada no tiene atención disponible';
            }
            if (formData.fechaCita && horasDisponibles.length > 0 && !horasDisponibles.includes(formData.horaCita)) {
                newErrors.horaCita = 'La hora seleccionada ya no está disponible';
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
            setLoadingInterno(true);
            setErrors({});

            const sectorSeleccionado = sectores.find(s => s.id === parseInt(formData.sectorId));
            const esSectorEspecial = sectorSeleccionado?.tipoSector === 'ESPECIAL';

            // CORRECCIÓN: Enviar datos en formato plano como espera el backend
            let datosGeneracion = {
                sectorId: parseInt(formData.sectorId),
                dni: formData.dni, // DIRECTO, no anidado
                nombre: formData.nombre, // DIRECTO
                apellido: formData.apellido, // DIRECTO 
                telefono: formData.telefono, // DIRECTO
                direccion: formData.direccion, // DIRECTO
                esPrioritario: formData.esPrioritario,
                motivoPrioridad: formData.esPrioritario ? formData.motivoPrioridad : null,
                observaciones: formData.observaciones || null
            };

            // Agregar datos de cita si es sector especial
            if (esSectorEspecial) {
                datosGeneracion = {
                    ...datosGeneracion,
                    fechaCita: formData.fechaCita,
                    horaCita: formData.horaCita,
                    tipo: 'ESPECIAL' // Agregar tipo para sectores especiales
                };
            }

            console.log('Generando turno con datos:', datosGeneracion);
            
            const res = await onSubmit(datosGeneracion);
            const turnoNormalizado =
                res?.turno ??
                res?.data?.turno ??
                res?.data ??
                res;
            console.log(turnoNormalizado)

            if (turnoNormalizado) {
                setTurnoGenerado(turnoNormalizado);
                setMostrarExito(true);
            } else {
                // Opcional: log para diagnosticar
                console.warn('Respuesta de onSubmit sin turno:', res);
                setErrors({ general: 'No se pudo generar el turno (respuesta vacía).' });
            }

        } catch (error) {
            console.error('Error generando turno:', error);

            if (error.response?.data?.fieldErrors) {
                // Manejar errores de validación específicos por campo
                setErrors(error.response.data.fieldErrors);
            } else if (error.response?.data?.message) {
                if (error.response.data.message.includes('Ya existe un ciudadano con DNI')) {
                    setErrors({ dni: error.response.data.message });
                } else {
                    setErrors({ general: error.response.data.message });
                }
            } else {
                setErrors({ general: 'Error generando turno' });
            }
        } finally {
            setLoadingInterno(false);
        }
    };


    const handleImprimir = async () => {
        try {
            if (!turnoGenerado) return;

            const datosImpresion = {
                codigo: turnoGenerado.codigo,
                fecha: new Date().toLocaleDateString('es-AR'),
                hora: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
                ciudadano: `${turnoGenerado.ciudadano?.nombre || ''} ${turnoGenerado.ciudadano?.apellido || ''}`.trim(),
                dni: turnoGenerado.ciudadano?.dni,
                sector: turnoGenerado.sector?.nombre,
                tipo: turnoGenerado.tipo === 'NORMAL' ? 'Normal' : 'Con Cita',
                prioridad: turnoGenerado.prioridad || 0
            };

            await impresionService.imprimirTurno(datosImpresion); // ✅ Usar el servicio

        } catch (error) {
            console.error('Error imprimiendo turno:', error);
            alert('Error al imprimir el turno');
        }
    };

    // Función para cerrar el modal después del éxito
    const handleCerrarExito = () => {
        setMostrarExito(false);
        setTurnoGenerado(null);
        resetFormulario(); 
        onClose();
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
                            {mostrarExito ? (
                                <CheckCircle className="h-6 w-6 text-slate-600" />
                            ) : (
                                <EventAvailableIcon className="h-6 w-6 text-slate-600" />
                            )}
                        </div>
                        {mostrarExito ? 'Turno Generado' : 'Generar Nuevo Turno'}
                    </h2>
                    <button
                        onClick={mostrarExito ? handleCerrarExito : onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-50"
                    >
                        <Close className="h-6 w-6" />
                    </button>
                </div>

                {mostrarExito ? (
                    <TurnoGeneradoSuccess
                        turno={turnoGenerado}
                        onImprimir={handleImprimir}
                        onCerrar={handleCerrarExito}
                    />
                ) : (





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
                                                className={`w-full px-3 h-8 border rounded-md ${errors.dni ? 'border-red-300' : 'border-slate-300'
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
                                                className={`w-full px-3 h-8 border rounded-md ${errors.apellidoBusqueda ? 'border-red-300' : 'border-slate-300'
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
                                        onBlur={handleDniBlur}
                                        value={formData.dni}
                                        onChange={handleInputChange}
                                        maxLength="8"
                                        className={`w-full px-3 h-8 border rounded-md ${errors.dni ? 'border-red-300' : 'border-slate-300'
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
                                            className={`w-full px-3 h-8 border rounded-md ${errors.nombre ? 'border-red-300' : 'border-slate-300'
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
                                            className={`w-full px-3 h-8 border rounded-md ${errors.apellido ? 'border-red-300' : 'border-slate-300'
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
                                            className="w-full px-3 h-8 border border-slate-300 rounded-md"
                                            placeholder="0351-1234567"
                                        />
                                            {errors.telefono && (
                                                <p className="text-red-600 text-xs mt-1">{errors.telefono}</p>
                                            )}
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
                                            className="w-full px-3 h-8 border border-slate-300 rounded-md"
                                            placeholder="Dirección"
                                        />
                                            {errors.direccion && (
                                                <p className="text-red-600 text-xs mt-1">{errors.direccion}</p>
                                            )}
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
                                                    {/* <input
                                                        type="date"
                                                        name="fechaCita"
                                                        value={formData.fechaCita}
                                                        onChange={handleInputChange}
                                                        min={fechaMinima}
                                                        required
                                                        className={`w-full px-3 h-8 border rounded-md ${errors.fechaCita ? 'border-red-300' : 'border-slate-300'
                                                            }`}
                                                    /> */}
                                                    <select
                                                        name="fechaCita"
                                                        value={formData.fechaCita}
                                                        onChange={handleInputChange}
                                                        className={`w-full px-3 h-8 border rounded-md ${errors.fechaCita ? 'border-red-300' : 'border-slate-300'}`}
                                                        disabled={fechasDisponibles.length === 0}
                                                        required
                                                    >
                                                        <option value="">{fechasDisponibles.length ? 'Seleccionar fecha...' : 'Sin fechas disponibles'}</option>
                                                        {fechasDisponibles.map(f => (
                                                            <option key={f.value} value={f.value}>{f.label}</option>
                                                        ))}
                                                    </select>
                                                    {errors.fechaCita && (<p className="mt-1  text-red-600">{errors.fechaCita}</p>)}
                                                </div>

                                                {/* Hora de cita */}
                                                <div>
                                                    <label className="block font-medium text-slate-700 mb-2">
                                                        <AccessTime className="h-4 w-4 inline mr-1" />
                                                        Hora de Cita *
                                                    </label>
                                                    {/* <input
                                                        type="time"
                                                        name="horaCita"
                                                        value={formData.horaCita}
                                                        onChange={handleInputChange}
                                                        required
                                                        className={`w-full px-3 h-8 border rounded-md ${errors.horaCita ? 'border-red-300' : 'border-slate-300'
                                                            }`}
                                                    />
                                                     */}
                                                    <select
                                                        name="horaCita"
                                                        value={formData.horaCita}
                                                        onChange={handleInputChange}
                                                        required
                                                        disabled={!formData.fechaCita || horasDisponibles.length === 0}
                                                        className={`w-full px-3 h-8 border rounded-md ${errors.horaCita ? 'border-red-300' : 'border-slate-300'}`}
                                                    >
                                                        <option value="">
                                                            {!formData.fechaCita
                                                                ? 'Primero seleccione fecha'
                                                                : (horasDisponibles.length ? 'Seleccionar hora...' : 'Sin horarios disponibles')}
                                                        </option>
                                                        {horasDisponibles.map(h => (
                                                            <option key={h} value={h}>{h}</option>
                                                        ))}
                                                    </select>
                                                    {errors.horaCita && (<p className="mt-1  text-red-600">{errors.horaCita}</p>)}
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
                                                        className={`w-full resize-none px-3 py-1.5 h-12 border rounded-md ${errors.motivoCita ? 'border-red-300' : 'border-slate-300'
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
                                            className="rounded border-slate-300 text-yellow-600"
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
                                                className={`w-full px-3 h-8 border rounded-md ${errors.motivoPrioridad ? 'border-red-300' : 'border-slate-300'
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
                                    className="w-full px-3 resize-none h-12 py-1.5 border border-slate-300 rounded-md"
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
                                disabled={loadingInterno}
                                className="px-4 h-8 font-medium text-white bg-[#224666] border border-transparent rounded-md hover:bg-[#2c3e50] transition-colors duration-300 disabled:opacity-50 flex items-center"
                            >
                                <Save sx={{ fontSize: '20px' }} className="mr-2" />
                                <span>{loadingInterno  ? 'Generando...' : 'Generar Turno'}</span>
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );

};

export default GenerarTurnoModal;