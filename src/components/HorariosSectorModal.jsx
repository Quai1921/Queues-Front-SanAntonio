import React, { useState, useEffect } from 'react';
import {
    Close,
    Schedule,
    CalendarToday,
    AccessTime,
    Info,
    Lock
} from '@mui/icons-material';
import sectoresService from '../services/sectoresService';

/**
 * Modal para mostrar horarios de atención de un sector especial
 */
const HorariosSectorModal = ({ isOpen, onClose, sector, loading = false }) => {
    const [horarios, setHorarios] = useState([]);
    const [loadingHorarios, setLoadingHorarios] = useState(false);
    const [error, setError] = useState(null);

    // Mapeo de días en español
    const diasSemana = {
        'MONDAY': 'Lunes',
        'TUESDAY': 'Martes',
        'WEDNESDAY': 'Miércoles',
        'THURSDAY': 'Jueves',
        'FRIDAY': 'Viernes',
        'SATURDAY': 'Sábado',
        'SUNDAY': 'Domingo'
    };

    // Cargar horarios cuando se abre el modal
    useEffect(() => {
        if (isOpen && sector?.sector?.id) {
            cargarHorariosSector();
        }
    }, [isOpen, sector]);

    const cargarHorariosSector = async () => {
        if (!sector?.sector?.id) return;

        setLoadingHorarios(true);
        setError(null);

        try {
            // Usar el servicio que ya tienes configurado
            const data = await sectoresService.obtenerCompleto(sector.sector.id);

            // Extraer horarios de la respuesta
            setHorarios(data.horarios || []);
        } catch (error) {
            console.error('Error cargando horarios:', error);
            setError('No se pudieron cargar los horarios de atención');
        } finally {
            setLoadingHorarios(false);
        }
    };

    const formatearHora = (hora) => {
        if (!hora) return '';
        // Convertir formato HH:mm:ss a HH:mm
        return hora.substring(0, 5);
    };

    const agruparHorariosPorDia = (horarios) => {
        const agrupados = horarios.reduce((acc, horario) => {
            const dia = horario.diaSemana;
            if (!acc[dia]) {
                acc[dia] = [];
            }
            acc[dia].push(horario);
            return acc;
        }, {});

        // Ordenar por días de la semana
        const ordenDias = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
        const resultado = {};

        ordenDias.forEach(dia => {
            if (agrupados[dia]) {
                resultado[dia] = agrupados[dia].sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
            }
        });

        return resultado;
    };

    if (!isOpen || !sector) return null;

    const horariosAgrupados = agruparHorariosPorDia(horarios);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                    <div className="flex items-center">
                        <div
                            className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-semibold mr-4 bg-slate-200"
                        >
                            <AccessTime className="h-6 w-6 text-slate-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-slate-900">
                                Horarios de Atención
                            </h2>
                            <p className="text-sm text-slate-600">
                                Sector {sector.sector?.codigo} - {sector.sector?.nombre}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        disabled={loading}
                    >
                        <Close className="h-5 w-5" />
                    </button>
                </div>

                {/* Contenido */}
                <div className="p-6">
                    {/* Información del sector especial */}
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                        <div className="flex items-start">
                            <Info className="h-5 w-5 text-slate-600 mr-2 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-slate-800">
                                    Sector con Cita Previa
                                </p>
                                <p className="text-sm text-slate-700 mt-1">
                                    Este sector requiere que solicites un turno con anticipación.
                                    Los horarios mostrados indican cuándo puedes agendar tu cita.
                                </p>
                                {sector.sector?.descripcion && (
                                    <p className="text-sm text-slate-700 mt-2 font-medium">
                                        {sector.sector.descripcion}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Loading de horarios */}
                    {loadingHorarios && (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600 mx-auto"></div>
                            <p className="mt-4 text-slate-600">Cargando horarios...</p>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                            <p className="text-red-800 text-sm">{error}</p>
                        </div>
                    )}

                    {/* Horarios */}
                    {!loadingHorarios && !error && (
                        <>
                            {Object.keys(horariosAgrupados).length > 0 ? (
                                <div className="space-y-4">
                                    {Object.entries(horariosAgrupados).map(([dia, horariosDelDia]) => (
                                        <div key={dia} className="border border-slate-200 rounded-lg">
                                            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                                                <div className="flex items-center">
                                                    <CalendarToday className="h-5 w-5 text-slate-600 mr-2" />
                                                    <h3 className="font-medium text-slate-900">
                                                        {diasSemana[dia]}
                                                    </h3>
                                                </div>
                                            </div>
                                            <div className="p-4 space-y-3">
                                                {horariosDelDia.map((horario, index) => (
                                                    <div
                                                        key={horario.id || index}
                                                        className="flex items-center justify-between bg-white border border-slate-100 rounded-lg p-3"
                                                    >
                                                        <div className="flex items-center">
                                                            <AccessTime className="h-4 w-4 text-slate-500 mr-3" />
                                                            <div>
                                                                <p className="font-medium text-slate-900">
                                                                    {formatearHora(horario.horaInicio)} - {formatearHora(horario.horaFin)}
                                                                </p>
                                                                {horario.intervaloCitas && (
                                                                    <p className="text-sm text-slate-500">
                                                                        Intervalo: {horario.intervaloCitas} minutos
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${horario.activo
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : 'bg-red-100 text-red-800'
                                                                }`}>
                                                                {horario.activo ? 'Activo' : 'Inactivo'}
                                                            </span>
                                                            {horario.capacidadMaxima && (
                                                                <p className="text-xs text-slate-500 mt-1">
                                                                    Capacidad: {horario.capacidadMaxima}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <Schedule className="mx-auto h-12 w-12 text-slate-400" />
                                    <h3 className="mt-4 text-lg font-medium text-slate-900">
                                        Sin horarios configurados
                                    </h3>
                                    <p className="mt-2 text-slate-600">
                                        Este sector especial aún no tiene horarios de atención configurados.
                                    </p>
                                    <p className="mt-1 text-sm text-slate-500">
                                        Contacta al administrador para configurar los horarios.
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
                    <div className="text-sm text-slate-500">
                        {sector.sector?.tiempoEstimadoAtencion && (
                            <span>Tiempo promedio: {sector.sector.tiempoEstimadoAtencion} min</span>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
                        disabled={loading}
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HorariosSectorModal;