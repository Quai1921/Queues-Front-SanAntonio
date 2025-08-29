import React, { useState, useMemo } from 'react';
import {
    Person,
    EditDocument as Edit,
    Schedule,
    Accessible as AccessibleIcon,
    KeyboardArrowLeft,
    KeyboardArrowRight,
    FirstPage,
    LastPage
} from '@mui/icons-material';

const CiudadanoTabla = ({
    ciudadanos = [],
    onEditar,
    onCambiarPrioridad,
    onVerHistorial,
    loading = false
}) => {
    const [paginaActual, setPaginaActual] = useState(1);
    const elementosPorPagina = 10;

    // Calcular paginación
    const totalElementos = ciudadanos.length;
    const totalPaginas = Math.ceil(totalElementos / elementosPorPagina);
    const indiceInicio = (paginaActual - 1) * elementosPorPagina;
    const indiceFin = indiceInicio + elementosPorPagina;
    const ciudadanosPaginados = ciudadanos.slice(indiceInicio, indiceFin);

    const formatearDni = (dni) => {
        if (!dni) return '';
        return dni.replace(/(\d{2})(\d{3})(\d{3})/, '$1.$2.$3');
    };

    const formatearTelefono = (telefono) => {
        if (!telefono) return '';
        return telefono.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
    };

    const truncarTexto = (texto, maxLength = 30) => {
        if (!texto || texto.length <= maxLength) return texto;
        return texto.substring(0, maxLength) + '...';
    };

    const irAPagina = (numeroPagina) => {
        if (numeroPagina >= 1 && numeroPagina <= totalPaginas) {
            setPaginaActual(numeroPagina);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#224666]"></div>
                    <p className="mt-2 text-slate-600">Cargando ciudadanos...</p>
                </div>
            </div>
        );
    }

    if (ciudadanos.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12">
                <div className="text-center">
                    <Person className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-500 text-lg font-medium mb-2">
                        No se encontraron ciudadanos
                    </p>
                    <p className="text-slate-400 text-sm">
                        Ajuste los filtros o agregue nuevos ciudadanos
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            {/* Tabla */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-4 py-2 text-left text-sm font-semibold text-slate-900 w-[300px]">
                                Ciudadano
                            </th>
                            <th className="px-4 py-2 text-left text-sm font-semibold text-slate-900 w-[110px]">
                                DNI
                            </th>
                            <th className="px-4 py-2 text-left text-sm font-semibold text-slate-900 w-[135px]">
                                Contacto
                            </th>
                            <th className="px-4 py-2 text-left text-sm font-semibold text-slate-900 w-[300px]">
                                Dirección
                            </th>
                            <th className="px-4 py-2 text-left text-sm font-semibold text-slate-900">
                                Estado
                            </th>
                            <th className="px-4 py-2 text-left text-sm font-semibold text-slate-900">
                                Turnos
                            </th>
                            <th className="px-4 py-2 text-right text-sm font-semibold text-slate-900">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {ciudadanosPaginados.map((ciudadano) => (
                            <tr
                                key={ciudadano.id || ciudadano.dni}
                                className="hover:bg-slate-50 transition-colors"
                            >
                                {/* Ciudadano */}
                                <td className="px-6 py-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-slate-100 rounded-lg">
                                            <Person className="h-5 w-5 text-slate-600" />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-sm text-slate-900">
                                                {ciudadano.apellido}, {ciudadano.nombre}
                                            </div>
                                            {ciudadano.esPrioritario && ciudadano.motivoPrioridad && (
                                                <div className="text-xs text-slate-400">
                                                    {truncarTexto(ciudadano.motivoPrioridad, 25)}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </td>

                                {/* DNI */}
                                <td className="px-4 py-2">
                                    <div className="flex items-center text-xs text-slate-600">
                                        {formatearDni(ciudadano.dni)}
                                    </div>
                                </td>

                                {/* Contacto */}
                                <td className="px-4 py-2">
                                    {ciudadano.telefono && (
                                        <div className="flex items-center text-xs text-slate-600">
                                            {formatearTelefono(ciudadano.telefono)}
                                        </div>
                                    )}
                                </td>

                                {/* Dirección */}
                                <td className="px-4 py-2">
                                    <div className="flex items-start text-xs text-slate-600">
                                        <span title={ciudadano.direccion}>
                                            {truncarTexto(ciudadano.direccion, 35)}
                                        </span>
                                    </div>
                                </td>

                                {/* Estado */}
                                <td className="px-4 py-2">
                                    <div className="space-y-1">
                                        {ciudadano.esPrioritario && (
                                            <span className="flex justify-center items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                Prioritario
                                            </span>
                                        )}
                                        {ciudadano.tieneTurnoPendiente && (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                Turno pendiente
                                            </span>
                                        )}
                                        {!ciudadano.esPrioritario && !ciudadano.tieneTurnoPendiente && (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                                                Normal
                                            </span>
                                        )}
                                    </div>
                                </td>

                                {/* Turnos */}
                                <td className="px-4 py-2">
                                    <span className="text-xs font-medium text-slate-900">
                                        {ciudadano.cantidadTurnos || 0}
                                    </span>
                                </td>

                                {/* Acciones */}
                                <td className="px-4 py-2">
                                    <div className="flex items-center justify-end space-x-2">
                                        <button
                                            onClick={() => onEditar?.(ciudadano)}
                                            className="p-1.5 text-slate-400 hover:text-cyan-800 transition-colors rounded-lg"
                                            title="Editar ciudadano"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </button>

                                        <button
                                            onClick={() => onCambiarPrioridad?.(ciudadano)}
                                            className={`p-1.5 transition-colors rounded-lg ${
                                                ciudadano.esPrioritario 
                                                    ? 'text-slate-400 hover:text-red-800' 
                                                    : 'text-slate-400 hover:text-red-800'
                                            }`}
                                            title={ciudadano.esPrioritario ? 'Quitar prioridad' : 'Establecer prioridad'}
                                        >
                                            <AccessibleIcon className="h-4 w-4" />
                                        </button>

                                        <button
                                            onClick={() => onVerHistorial?.(ciudadano)}
                                            className="p-1.5 text-slate-400 hover:text-slate-800 transition-colors rounded-lg"
                                            title="Ver historial"
                                        >
                                            <Schedule className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Paginación */}
            {totalPaginas > 1 && (
                <div className="px-6 py-4 border-t border-slate-200 bg-white">
                    <div className="flex items-center justify-end">

                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => irAPagina(1)}
                                disabled={paginaActual === 1}
                                className={`p-2 rounded-lg ${
                                    paginaActual === 1
                                        ? 'text-slate-300 cursor-not-allowed'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                }`}
                            >
                                <FirstPage className="h-4 w-4" />
                            </button>

                            <button
                                onClick={() => irAPagina(paginaActual - 1)}
                                disabled={paginaActual === 1}
                                className={`p-2 rounded-lg ${
                                    paginaActual === 1
                                        ? 'text-slate-300 cursor-not-allowed'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                }`}
                            >
                                <KeyboardArrowLeft className="h-4 w-4" />
                            </button>

                            {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                                const numeroPagina = i + 1;
                                return (
                                    <button
                                        key={numeroPagina}
                                        onClick={() => irAPagina(numeroPagina)}
                                        className={`flex justify-center items-center size-6 text-sm rounded-full ${
                                            numeroPagina === paginaActual
                                                ? 'bg-[#224666] text-white'
                                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                        }`}
                                    >
                                        {numeroPagina}
                                    </button>
                                );
                            })}

                            <button
                                onClick={() => irAPagina(paginaActual + 1)}
                                disabled={paginaActual === totalPaginas}
                                className={`p-2 rounded-lg ${
                                    paginaActual === totalPaginas
                                        ? 'text-slate-300 cursor-not-allowed'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                }`}
                            >
                                <KeyboardArrowRight className="h-4 w-4" />
                            </button>

                            <button
                                onClick={() => irAPagina(totalPaginas)}
                                disabled={paginaActual === totalPaginas}
                                className={`p-2 rounded-lg ${
                                    paginaActual === totalPaginas
                                        ? 'text-slate-300 cursor-not-allowed'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                }`}
                            >
                                <LastPage className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CiudadanoTabla;