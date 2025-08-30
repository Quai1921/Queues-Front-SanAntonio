import React, { useState, useEffect } from 'react';
import {
    Close,
    PriorityHigh,
    Save,
    Warning,
    Person
} from '@mui/icons-material';
import useCiudadano from '../hooks/useCiudadano';

/**
 * Modal para establecer o quitar prioridad de un ciudadano
 */
const EstablecerPrioridadModal = ({
    isOpen,
    onClose,
    onSubmit,
    ciudadano,
    loading = false
}) => {
    const [esPrioritario, setEsPrioritario] = useState(false);
    const [motivo, setMotivo] = useState('');
    const [errors, setErrors] = useState({});

    // Hook para acceder a funciones de utilidad
    const { getMotivosPrioridadComunes } = useCiudadano();

    // Cargar datos del ciudadano cuando se abre el modal
    useEffect(() => {
        if (isOpen && ciudadano) {
            setEsPrioritario(ciudadano.esPrioritario || false);
            setMotivo(ciudadano.motivoPrioridad || '');
            setErrors({});
        }
    }, [isOpen, ciudadano]);

    const handlePrioridadChange = (e) => {
        const checked = e.target.checked;
        setEsPrioritario(checked);

        // Si quitan la prioridad, limpiar el motivo
        if (!checked) {
            setMotivo('');
        }

        // Limpiar errores
        if (errors.motivo) {
            setErrors(prev => ({ ...prev, motivo: null }));
        }
    };

    const handleMotivoChange = (e) => {
        setMotivo(e.target.value);

        // Limpiar error si existe
        if (errors.motivo) {
            setErrors(prev => ({ ...prev, motivo: null }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validar que si es prioritario debe tener motivo
        if (esPrioritario && !motivo.trim()) {
            setErrors({ motivo: 'El motivo de prioridad es obligatorio' });
            return;
        }

        try {
            await onSubmit(esPrioritario, motivo.trim());
        } catch (error) {
            // Los errores se manejan en el componente padre
        }
    };

    if (!isOpen || !ciudadano) return null;

    const motivosPrioridad = getMotivosPrioridadComunes();
    const estadoActual = ciudadano.esPrioritario;
    const accion = esPrioritario ? 'establecer' : 'quitar';
    const titulo = esPrioritario ? 'Establecer Prioridad' : 'Quitar Prioridad';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl text-sm">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-200">
                    <div className="flex items-center">
                        <div className={`p-2 rounded-lg mr-3 ${esPrioritario ? 'bg-slate-100' : 'bg-slate-100'
                            }`}>
                            <PriorityHigh className={`h-6 w-6 ${esPrioritario ? 'text-slate-600' : 'text-slate-600'
                                }`} />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900">{titulo}</h3>
                            <p className=" text-slate-600">
                                {ciudadano.apellido}, {ciudadano.nombre} - DNI: {ciudadano.dni}
                            </p>
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

                {/* Contenido */}
                <form onSubmit={handleSubmit} className="p-4 space-y-3">
                    {/* Estado actual */}
                    {estadoActual !== esPrioritario && (
                        <div className={`p-4 rounded-lg border ${estadoActual ? 'bg-slate-50 border-slate-200' : 'bg-slate-50 border-slate-200'
                            }`}>
                            <div className="flex items-center">
                                <Person className="h-5 w-5 mr-2 text-slate-600" />
                                <div>
                                    <div className="font-medium text-slate-900">Estado actual</div>
                                    <div className=" text-slate-600">
                                        {estadoActual ? (
                                            <>
                                                Ciudadano prioritario
                                                {ciudadano.motivoPrioridad && (
                                                    <span className="font-bold text-slate-800"> - {ciudadano.motivoPrioridad}</span>
                                                )}
                                            </>
                                        ) : (
                                            'Ciudadano sin prioridad'
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Checkbox de prioridad */}
                    <div className="flex items-start space-x-3">
                        <input
                            type="checkbox"
                            id="esPrioritario"
                            checked={esPrioritario}
                            onChange={handlePrioridadChange}
                            className="mt-1 h-4 w-4 text-slate-600 border-slate-300 rounded"
                        />
                        <div className="flex-1">
                            <label htmlFor="esPrioritario" className="block font-medium text-slate-900">
                                Establecer como ciudadano prioritario
                            </label>
                            <p className=" text-slate-600 mt-1">
                                Los ciudadanos prioritarios tienen preferencia en la atención y pueden acceder a turnos especiales.
                            </p>
                        </div>
                    </div>

                    {/* Motivo de prioridad */}
                    {esPrioritario && (
                        <div className="space-y-3">
                            <label className="block  font-medium text-slate-700">
                                Motivo de prioridad *
                            </label>

                            <select
                                value={motivo}
                                onChange={handleMotivoChange}
                                className={`w-full px-3 h-8 border rounded-lg ${errors.motivo ? 'border-red-300' : 'border-slate-300'
                                    }`}
                            >
                                <option value="">Seleccionar motivo</option>
                                {motivosPrioridad.map(motivoOpcion => (
                                    <option key={motivoOpcion} value={motivoOpcion}>
                                        {motivoOpcion}
                                    </option>
                                ))}
                            </select>

                            {motivo === 'Otro' && (
                                <input
                                    type="text"
                                    placeholder="Especificar otro motivo..."
                                    value={motivo === 'Otro' ? '' : motivo}
                                    onChange={(e) => setMotivo(e.target.value)}
                                    maxLength="100"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                />
                            )}

                            {errors.motivo && (
                                <p className=" text-red-600">{errors.motivo}</p>
                            )}
                        </div>
                    )}

                    {/* Advertencia si quita prioridad */}
                    {!esPrioritario && estadoActual && (
                        <div className="flex items-start space-x-3 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                            <Warning className="h-5 w-5 text-amber-600 mt-0.5" />
                            <div>
                                <div className="font-medium text-slate-900">Quitar prioridad</div>
                                <div className=" text-slate-700 mt-1">
                                    Al quitar la prioridad, este ciudadano perderá los beneficios de atención preferencial
                                    y acceso a turnos especiales.
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Botones */}
                    <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="px-4 h-8  font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`px-4 h-8  font-medium text-white rounded-lg disabled:opacity-50 flex items-center ${esPrioritario
                                    ? 'bg-[#224666] hover:bg-[#2c3e50] transition-all duration-300'
                                    : 'bg-[#224666] hover:bg-[#2c3e50] transition-all duration-300'
                                    
                                }`}
                        >
                            {loading ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            ) : (
                                <Save sx={{ fontSize: '20px' }} className="mr-2" />
                            )}
                            {esPrioritario ? 'Establecer Prioridad' : 'Quitar Prioridad'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EstablecerPrioridadModal;