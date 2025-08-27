import React, { useState, useEffect } from 'react';
import {
    Close,
    Schedule,
    Save,
    AccessTime,
    CalendarMonth,
    Group,
    Notes,
    Warning
} from '@mui/icons-material';
import horariosService from '../services/horarioService';

/**
 * Modal para crear un nuevo horario de atención
 */
const CrearHorarioModal = ({ isOpen, onClose, onSubmit, sector, loading = false }) => {
    const [formData, setFormData] = useState({
        diaSemana: '',
        horaInicio: '',
        horaFin: '',
        intervaloCitas: 30,
        capacidadMaxima: 1,
        observaciones: ''
    });

    const [errors, setErrors] = useState({});

    // Limpiar formulario cuando se abre el modal
    useEffect(() => {
        if (isOpen) {
            setFormData({
                diaSemana: '',
                horaInicio: '',
                horaFin: '',
                intervaloCitas: 30,
                capacidadMaxima: 1,
                observaciones: ''
            });
            setErrors({});
        }
    }, [isOpen]);

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
            await onSubmit(formData);
        } catch (error) {
            // Los errores se manejan en el componente padre
        }
    };

    if (!isOpen) return null;

    const diasSemana = horariosService.getDiasSemanario();
    const intervalosComunes = horariosService.getIntervalosComunes();

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                    <div className="flex items-center">
                        <div className="p-2 bg-[#224666] rounded-lg mr-3">
                            <Schedule className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900">Crear Horario</h3>
                            <p className="text-sm text-slate-600">
                                Sector: <span className="font-medium">{sector?.codigo} - {sector?.nombre}</span>
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="text-slate-400 hover:text-slate-600 transition-colors p-2"
                    >
                        <Close className="h-5 w-5" />
                    </button>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Día de la semana */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            <CalendarMonth className="inline h-4 w-4 mr-1" />
                            Día de la Semana *
                        </label>
                        <select
                            name="diaSemana"
                            value={formData.diaSemana}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#224666] focus:border-transparent ${errors.diaSemana ? 'border-red-300' : 'border-slate-300'
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
                            <p className="mt-1 text-sm text-red-600">{errors.diaSemana}</p>
                        )}
                    </div>

                    {/* Horarios */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                <AccessTime className="inline h-4 w-4 mr-1" />
                                Hora de Inicio *
                            </label>
                            <input
                                type="time"
                                name="horaInicio"
                                value={formData.horaInicio}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#224666] focus:border-transparent ${errors.horaInicio ? 'border-red-300' : 'border-slate-300'
                                    }`}
                            />
                            {errors.horaInicio && (
                                <p className="mt-1 text-sm text-red-600">{errors.horaInicio}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                <AccessTime className="inline h-4 w-4 mr-1" />
                                Hora de Fin *
                            </label>
                            <input
                                type="time"
                                name="horaFin"
                                value={formData.horaFin}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#224666] focus:border-transparent ${errors.horaFin ? 'border-red-300' : 'border-slate-300'
                                    }`}
                            />
                            {errors.horaFin && (
                                <p className="mt-1 text-sm text-red-600">{errors.horaFin}</p>
                            )}
                        </div>
                    </div>

                    {/* Configuración de citas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Intervalo entre Citas (minutos) *
                            </label>
                            <select
                                name="intervaloCitas"
                                value={formData.intervaloCitas}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#224666] focus:border-transparent ${errors.intervaloCitas ? 'border-red-300' : 'border-slate-300'
                                    }`}
                            >
                                {intervalosComunes.map(intervalo => (
                                    <option key={intervalo.valor} value={intervalo.valor}>
                                        {intervalo.etiqueta}
                                    </option>
                                ))}
                            </select>
                            {errors.intervaloCitas && (
                                <p className="mt-1 text-sm text-red-600">{errors.intervaloCitas}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                <Group className="inline h-4 w-4 mr-1" />
                                Capacidad Máxima *
                            </label>
                            <input
                                type="number"
                                name="capacidadMaxima"
                                min="1"
                                max="50"
                                value={formData.capacidadMaxima}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#224666] focus:border-transparent ${errors.capacidadMaxima ? 'border-red-300' : 'border-slate-300'
                                    }`}
                            />
                            {errors.capacidadMaxima && (
                                <p className="mt-1 text-sm text-red-600">{errors.capacidadMaxima}</p>
                            )}
                        </div>
                    </div>

                    {/* Observaciones */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            <Notes className="inline h-4 w-4 mr-1" />
                            Observaciones
                        </label>
                        <textarea
                            name="observaciones"
                            rows="3"
                            placeholder="Notas adicionales sobre este horario..."
                            value={formData.observaciones}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#224666] focus:border-transparent resize-none"
                        />
                    </div>

                    {/* Información adicional */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start">
                            <Warning className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                            <div className="text-sm">
                                <p className="text-blue-800 font-medium">Información importante:</p>
                                <ul className="text-blue-700 mt-1 space-y-1">
                                    <li>• Los horarios no pueden superponerse en el mismo día</li>
                                    <li>• El intervalo mínimo es de 5 minutos</li>
                                    <li>• La capacidad máxima es por franja horaria</li>
                                    <li>• Los horarios nuevos se crean como activos</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Botones */}
                    <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="px-4 py-2 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center px-4 py-2 bg-[#224666] text-white rounded-lg hover:bg-[#1a3a52] transition-colors disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Creando...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Crear Horario
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CrearHorarioModal;