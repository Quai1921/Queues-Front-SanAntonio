import React, { useState, useEffect } from 'react';
import {
    Close,
    Schedule,
    Save,
    AccessTime,
    CalendarMonth,
    Group,
    Notes,
    Warning,
    Edit
} from '@mui/icons-material';
import horariosService from '../services/horarioService';

/**
 * Modal para editar un horario de atención existente
 */
const EditarHorarioModal = ({ isOpen, onClose, onSubmit, horario, sector, loading = false }) => {
    const [formData, setFormData] = useState({
        diaSemana: '',
        horaInicio: '',
        horaFin: '',
        intervaloCitas: 30,
        capacidadMaxima: 1,
        observaciones: ''
    });

    const [errors, setErrors] = useState({});

    // Cargar datos del horario cuando se abre el modal
    useEffect(() => {
        if (isOpen && horario) {
            setFormData({
                diaSemana: horario.diaSemana || '',
                horaInicio: horario.horaInicio?.substring(0, 5) || '', // Solo HH:MM
                horaFin: horario.horaFin?.substring(0, 5) || '', // Solo HH:MM
                intervaloCitas: horario.intervaloCitas || 30,
                capacidadMaxima: horario.capacidadMaxima || 1,
                observaciones: horario.observaciones || ''
            });
            setErrors({});
        }
    }, [isOpen, horario]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Limpiar error del campo si existe
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validar datos
        const validation = horariosService.validarDatosHorario(formData);
        if (!validation.esValido) {
            setErrors(validation.errores);
            return;
        }

        try {
            // Preparar datos para el backend (con formato de tiempo completo)
            const datosParaEnviar = {
                ...formData,
                horaInicio: `${formData.horaInicio}:00`,
                horaFin: `${formData.horaFin}:00`
            };

            await onSubmit(datosParaEnviar);
        } catch (error) {
            // Los errores se manejan en el componente padre
        }
    };

    if (!isOpen || !horario) return null;

    const diasSemana = horariosService.getDiasSemanario();
    const intervalosComunes = horariosService.getIntervalosComunes();

    const getDiaLabel = (dia) => {
        const diaObj = diasSemana.find(d => d.valor === dia);
        return diaObj ? diaObj.etiqueta : dia;
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[95vh] overflow-y-auto text-sm">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                    <div className="flex items-center">
                        <div className="w-10 h-10 bg-slate-200 rounded-md flex items-center justify-center mr-3">
                            <Edit className="h-6 w-6 text-slate-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900">Editar Horario</h3>
                            <p className=" text-slate-600">
                                Sector: <span className="font-medium">{sector?.codigo} - {sector?.nombre}</span>
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                                Horario actual: {getDiaLabel(horario.diaSemana)} {horario.horaInicio?.substring(0, 5)} - {horario.horaFin?.substring(0, 5)}
                            </p>
                            <div className={`inline-flex items-center px-2 py-1 rounded-md mt-1 text-xs font-medium ${horario.activo
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                Este horario está actualmente {horario.activo ? 'activo' : 'inactivo'}
                            </div>
                        </div>
                    </div>
                    
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-50"
                    >
                        <Close className="h-5 w-5" />
                    </button>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="px-6 pt-3 py-4 space-y-2">
                    
                    {/* Día de la semana / Horarios*/}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block  font-medium text-slate-700 mb-2">
                                <CalendarMonth className="inline h-4 w-4 mr-1" />
                                Día de la Semana *
                            </label>
                            <select
                                name="diaSemana"
                                value={formData.diaSemana}
                                onChange={handleInputChange}
                                className={`w-full px-3 h-8 border rounded-md ${errors.diaSemana ? 'border-red-300' : 'border-slate-300'
                                    }`}
                            >
                                <option value="">Seleccionar día</option>
                                {diasSemana.map(dia => (
                                    <option key={dia.valor} value={dia.valor}>
                                        {dia.etiqueta}
                                    </option>
                                ))}
                            </select>
                            {errors.diaSemana && (
                                <p className="mt-1  text-red-600">{errors.diaSemana}</p>
                            )}
                        </div>

                        <div>
                            <label className="block  font-medium text-slate-700 mb-2">
                                <AccessTime className="inline h-4 w-4 mr-1" />
                                Hora de Inicio *
                            </label>
                            <input
                                type="time"
                                name="horaInicio"
                                value={formData.horaInicio}
                                onChange={handleInputChange}
                                className={`w-full px-3 h-8 border rounded-md ${errors.horaInicio ? 'border-red-300' : 'border-slate-300'
                                    }`}
                            />
                            {errors.horaInicio && (
                                <p className="mt-1  text-red-600">{errors.horaInicio}</p>
                            )}
                        </div>

                        <div>
                            <label className="block  font-medium text-slate-700 mb-2">
                                <AccessTime className="inline h-4 w-4 mr-1" />
                                Hora de Fin *
                            </label>
                            <input
                                type="time"
                                name="horaFin"
                                value={formData.horaFin}
                                onChange={handleInputChange}
                                className={`w-full px-3 h-8 border rounded-md ${errors.horaFin ? 'border-red-300' : 'border-slate-300'
                                    }`}
                            />
                            {errors.horaFin && (
                                <p className="mt-1  text-red-600">{errors.horaFin}</p>
                            )}
                        </div>
                    </div>
                    
                    {/* Configuración de citas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block  font-medium text-slate-700 mb-2">
                                Intervalo entre Citas (minutos) *
                            </label>
                            <select
                                name="intervaloCitas"
                                value={formData.intervaloCitas}
                                onChange={handleInputChange}
                                className={`w-full px-3 h-8 border rounded-md ${errors.intervaloCitas ? 'border-red-300' : 'border-slate-300'
                                    }`}
                            >
                                {intervalosComunes.map(intervalo => (
                                    <option key={intervalo.valor} value={intervalo.valor}>
                                        {intervalo.etiqueta}
                                    </option>
                                ))}
                            </select>
                            {errors.intervaloCitas && (
                                <p className="mt-1  text-red-600">{errors.intervaloCitas}</p>
                            )}
                        </div>

                        <div>
                            <label className="block  font-medium text-slate-700 mb-2">
                                Capacidad Máxima *
                            </label>
                            <input
                                type="number"
                                name="capacidadMaxima"
                                min="1"
                                max="50"
                                value={formData.capacidadMaxima}
                                onChange={handleInputChange}
                                className={`w-full px-3 h-8 border rounded-md ${errors.capacidadMaxima ? 'border-red-300' : 'border-slate-300'
                                    }`}
                            />
                            {errors.capacidadMaxima && (
                                <p className="mt-1  text-red-600">{errors.capacidadMaxima}</p>
                            )}
                        </div>
                    </div>

                    {/* Observaciones */}
                    <div>
                        <label className="block  font-medium text-slate-700 mb-2">
                            <Notes className="inline h-4 w-4 mr-1" />
                            Observaciones
                        </label>
                        <textarea
                            name="observaciones"
                            rows="3"
                            placeholder="Notas adicionales sobre este horario..."
                            value={formData.observaciones}
                            onChange={handleInputChange}
                            className="w-full px-3 h-12 py-1.5 border border-slate-300 rounded-md resize-none"
                        />
                    </div>

                    {/* Información adicional */}
                    <div className="bg-slate-50 border border-slate-200 rounded-md p-2">
                        <div className="flex items-start">
                            <Warning className="h-5 w-5 text-amber-600 mr-3 mt-0.5 flex-shrink-0" />
                            <div className="">
                                <p className="text-slate-800 font-medium">Consideraciones importantes:</p>
                                <ul className="text-slate-700 mt-1 space-y-1">
                                    <li>• Los cambios de horario pueden afectar citas existentes</li>
                                    <li>• Verificar que no se superponga con otros horarios del mismo día</li>
                                    <li>• Los cambios se aplicarán inmediatamente</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Botones */}
                    <div className="flex items-center justify-end space-x-3 pt-2 border-t border-slate-200">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="px-4 h-8 text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center px-4 h-8 bg-[#224666] text-white rounded-md hover:bg-[#1a3a52] transition-colors disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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

export default EditarHorarioModal;