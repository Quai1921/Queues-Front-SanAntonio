import React, { useState } from 'react';
import {
    Person,
    Phone,
    LocationOn,
    Edit,
    PriorityHigh,
    Badge,
    MoreVert,
    Schedule,
    Warning
} from '@mui/icons-material';

/**
 * Componente de tarjeta para mostrar información de ciudadano
 */
const CiudadanoCard = ({
    ciudadano,
    onEditar,
    onCambiarPrioridad,
    onVerHistorial,
    loading = false
}) => {
    const [menuAbierto, setMenuAbierto] = useState(false);

    const handleMenuClick = (e) => {
        e.stopPropagation();
        setMenuAbierto(!menuAbierto);
    };

    const handleOpcionMenu = (accion, e) => {
        e.stopPropagation();
        setMenuAbierto(false);

        switch (accion) {
            case 'editar':
                onEditar?.(ciudadano);
                break;
            case 'prioridad':
                onCambiarPrioridad?.(ciudadano);
                break;
            case 'historial':
                onVerHistorial?.(ciudadano);
                break;
            default:
                break;
        }
    };

    const formatearDni = (dni) => {
        if (!dni) return '';
        if (dni.length <= 7) {
            return dni.replace(/(\d{1,2})(\d{3})(\d{3})/, '$1.$2.$3');
        } else {
            return dni.replace(/(\d{2})(\d{3})(\d{3})/, '$1.$2.$3');
        }
    };

    return (
        <div className={`bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all duration-200 ${loading ? 'opacity-50' : ''
            }`}>
            {/* Header con DNI y nombre */}
            <div className="p-4 border-b border-slate-100">
                <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                        <div className="p-2 bg-slate-100 rounded-lg">
                            <Person className="h-5 w-5 text-slate-600" />
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                                <h3 className="font-semibold text-slate-900 truncate">
                                    {ciudadano.apellido}, {ciudadano.nombre}
                                </h3>
                                {ciudadano.esPrioritario && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                        <PriorityHigh className="h-3 w-3 mr-1" />
                                        Prioritario
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center text-sm text-slate-600 mt-1">
                                <Badge className="h-4 w-4 mr-1" />
                                DNI: {formatearDni(ciudadano.dni)}
                            </div>

                            {ciudadano.esPrioritario && ciudadano.motivoPrioridad && (
                                <div className="text-xs text-red-600 mt-1">
                                    {ciudadano.motivoPrioridad}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Menú de acciones */}
                    <div className="relative">
                        <button
                            onClick={handleMenuClick}
                            disabled={loading}
                            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                            <MoreVert className="h-5 w-5" />
                        </button>

                        {menuAbierto && (
                            <div className="absolute right-0 top-8 w-48 bg-white rounded-lg shadow-lg border border-slate-200 z-10">
                                <div className="py-1">
                                    <button
                                        onClick={(e) => handleOpcionMenu('editar', e)}
                                        className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center"
                                    >
                                        <Edit className="h-4 w-4 mr-2" />
                                        Editar información
                                    </button>

                                    <button
                                        onClick={(e) => handleOpcionMenu('prioridad', e)}
                                        className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center"
                                    >
                                        <PriorityHigh className="h-4 w-4 mr-2" />
                                        {ciudadano.esPrioritario ? 'Quitar prioridad' : 'Establecer prioridad'}
                                    </button>

                                    <button
                                        onClick={(e) => handleOpcionMenu('historial', e)}
                                        className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center"
                                    >
                                        <Schedule className="h-4 w-4 mr-2" />
                                        Ver historial
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Información de contacto */}
            <div className="p-4 space-y-3">
                <div className="flex items-center text-sm text-slate-600">
                    <Phone className="h-4 w-4 mr-2 text-slate-400" />
                    <span>{ciudadano.telefono}</span>
                </div>

                <div className="flex items-start text-sm text-slate-600">
                    <LocationOn className="h-4 w-4 mr-2 text-slate-400 mt-0.5" />
                    <span className="flex-1">{ciudadano.direccion}</span>
                </div>

                {ciudadano.observaciones && (
                    <div className="mt-3 p-2 bg-slate-50 rounded-lg">
                        <div className="text-xs text-slate-500 font-medium mb-1">Observaciones</div>
                        <div className="text-sm text-slate-700">{ciudadano.observaciones}</div>
                    </div>
                )}
            </div>

            {/* Footer con estadísticas */}
            <div className="px-4 py-3 bg-slate-50 rounded-b-xl border-t border-slate-100">
                <div className="flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center space-x-4">
                        <span>
                            Turnos: <span className="font-medium text-slate-700">{ciudadano.cantidadTurnos || 0}</span>
                        </span>

                        {ciudadano.tieneTurnoPendiente && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
                                <Warning className="h-3 w-3 mr-1" />
                                Turno pendiente
                            </span>
                        )}
                    </div>

                    {/* <div className="text-xs text-slate-400">
                        ID: {ciudadano.id}
                    </div> */}
                </div>
            </div>
        </div>
    );
};

export default CiudadanoCard;