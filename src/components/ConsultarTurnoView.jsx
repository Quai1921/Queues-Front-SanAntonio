import React, { useState } from 'react';
import {
    Search,
    Person,
    CalendarToday,
    AccessTime,
    Star,
    Business,
    Phone,
    LocationOn,
    Assignment,
    History,
    Visibility,
    Clear
} from '@mui/icons-material';

/**
 * Vista para consultar turnos por diferentes criterios
 */
const ConsultarTurnoView = ({
    onConsultarPorCodigo,
    onConsultarPorDni,
    loading = false
}) => {
    const [tipoConsulta, setTipoConsulta] = useState('codigo'); // 'codigo', 'dni'
    const [formData, setFormData] = useState({
        codigo: '',
        fecha: '',
        dni: ''
    });
    const [resultados, setResultados] = useState([]);
    const [turnoSeleccionado, setTurnoSeleccionado] = useState(null);
    const [error, setError] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError('');
    };

    const handleConsulta = async (e) => {
        e.preventDefault();
        setError('');
        setResultados([]);
        setTurnoSeleccionado(null);

        try {
            if (tipoConsulta === 'codigo') {
                if (!formData.codigo.trim()) {
                    setError('Debe ingresar un código de turno');
                    return;
                }

                const turno = formData.fecha
                    ? await onConsultarPorCodigo(formData.codigo, formData.fecha)
                    : await onConsultarPorCodigo(formData.codigo);

                if (turno) {
                    setTurnoSeleccionado(turno);
                } else {
                    setError('No se encontró el turno especificado');
                }
            } else if (tipoConsulta === 'dni') {
                if (!formData.dni.trim()) {
                    setError('Debe ingresar un DNI');
                    return;
                }

                const turnos = await onConsultarPorDni(formData.dni);

                if (turnos && turnos.length > 0) {
                    setResultados(turnos);
                } else {
                    setError('No se encontraron turnos para el DNI especificado');
                }
            }
        } catch (err) {
            setError(err.message || 'Error realizando la consulta');
        }
    };

    const limpiarFormulario = () => {
        setFormData({ codigo: '', fecha: '', dni: '' });
        setResultados([]);
        setTurnoSeleccionado(null);
        setError('');
    };

    const formatearFecha = (fechaISO) => {
        if (!fechaISO) return '-';
        return new Date(fechaISO).toLocaleDateString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTiempoTranscurrido = (fechaCreacion) => {
        if (!fechaCreacion) return '-';
        const ahora = new Date();
        const creacion = new Date(fechaCreacion);
        const diff = Math.floor((ahora - creacion) / 1000 / 60);

        if (diff < 60) return `${diff} minutos`;
        if (diff < 1440) return `${Math.floor(diff / 60)} horas`;
        return `${Math.floor(diff / 1440)} días`;
    };

    // Renderizar formulario de consulta
    const renderFormularioConsulta = () => (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                <Search className="h-5 w-5 mr-2 text-slate-600" />
                Consultar Turnos
            </h3>

            {/* Tipo de consulta */}
            <div className="mb-6">
                <div className="grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={() => setTipoConsulta('codigo')}
                        className={`p-3 border-2 rounded-lg text-sm font-medium transition-colors ${tipoConsulta === 'codigo'
                                ? 'border-slate-500 bg-slate-50 text-slate-900'
                                : 'border-slate-200 text-slate-600 hover:border-slate-300'
                            }`}
                    >
                        <Assignment className="h-5 w-5 mx-auto mb-1" />
                        Por Código de Turno
                    </button>
                    <button
                        type="button"
                        onClick={() => setTipoConsulta('dni')}
                        className={`p-3 border-2 rounded-lg text-sm font-medium transition-colors ${tipoConsulta === 'dni'
                                ? 'border-slate-500 bg-slate-50 text-slate-900'
                                : 'border-slate-200 text-slate-600 hover:border-slate-300'
                            }`}
                    >
                        <Person className="h-5 w-5 mx-auto mb-1" />
                        Por DNI del Ciudadano
                    </button>
                </div>
            </div>

            <form onSubmit={handleConsulta}>
                {tipoConsulta === 'codigo' ? (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Código de Turno *
                            </label>
                            <input
                                type="text"
                                name="codigo"
                                value={formData.codigo}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md"
                                placeholder="Ej: INT001, REN002"
                                style={{ textTransform: 'uppercase' }}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Fecha Específica (opcional)
                            </label>
                            <input
                                type="date"
                                name="fecha"
                                value={formData.fecha}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md"
                            />
                            <p className="mt-1 text-sm text-slate-500">
                                Si no especifica fecha, se buscará el último turno generado con ese código
                            </p>
                        </div>
                    </div>
                ) : (
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            DNI del Ciudadano *
                        </label>
                        <input
                            type="text"
                            name="dni"
                            value={formData.dni}
                            onChange={handleInputChange}
                            maxLength="8"
                            className="w-full px-3 py-2 border border-slate-300 rounded-md"
                            placeholder="12345678"
                        />
                        <p className="mt-1 text-sm text-slate-500">
                            Se mostrarán todos los turnos del ciudadano
                        </p>
                    </div>
                )}

                <div className="mt-6 flex space-x-3">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                        <Search className="h-4 w-4" />
                        <span>{loading ? 'Consultando...' : 'Consultar'}</span>
                    </button>
                    <button
                        type="button"
                        onClick={limpiarFormulario}
                        className="px-4 py-2 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 transition-colors flex items-center space-x-2"
                    >
                        <Clear className="h-4 w-4" />
                        <span>Limpiar</span>
                    </button>
                </div>
            </form>

            {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            )}
        </div>
    );

    // Renderizar detalle de turno único
    const renderDetalleTurno = (turno) => (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-900">
                    Detalle del Turno
                </h3>
                <button
                    onClick={() => setTurnoSeleccionado(null)}
                    className="text-slate-400 hover:text-slate-600"
                >
                    <Clear className="h-5 w-5" />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Información del turno */}
                <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                        <div className="font-mono text-3xl font-bold text-slate-900">
                            {turno.codigo}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${turno.estadoColor}`}>
                            {turno.estadoTexto}
                        </span>
                        {turno.esPrioritario && (
                            <div className="flex items-center text-yellow-600">
                                <Star className="h-5 w-5 mr-1" />
                                <span className="text-sm font-medium">Prioritario</span>
                            </div>
                        )}
                    </div>

                    <div className="border-t border-slate-200 pt-4 space-y-3">
                        <div className="flex items-center space-x-3">
                            <Business className="h-4 w-4 text-slate-400" />
                            <div>
                                <span className="text-sm text-slate-600">Sector:</span>
                                <span className="ml-2 font-medium text-slate-900">
                                    {turno.sector?.codigo} - {turno.sector?.nombre}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <CalendarToday className="h-4 w-4 text-slate-400" />
                            <div>
                                <span className="text-sm text-slate-600">Generado:</span>
                                <span className="ml-2 text-slate-900">
                                    {formatearFecha(turno.fechaHoraCreacion)}
                                </span>
                            </div>
                        </div>

                        {turno.fechaHoraLlamado && (
                            <div className="flex items-center space-x-3">
                                <Phone className="h-4 w-4 text-slate-400" />
                                <div>
                                    <span className="text-sm text-slate-600">Llamado:</span>
                                    <span className="ml-2 text-slate-900">
                                        {formatearFecha(turno.fechaHoraLlamado)}
                                    </span>
                                </div>
                            </div>
                        )}

                        {turno.fechaHoraInicioAtencion && (
                            <div className="flex items-center space-x-3">
                                <AccessTime className="h-4 w-4 text-slate-400" />
                                <div>
                                    <span className="text-sm text-slate-600">Inicio Atención:</span>
                                    <span className="ml-2 text-slate-900">
                                        {formatearFecha(turno.fechaHoraInicioAtencion)}
                                    </span>
                                </div>
                            </div>
                        )}

                        {turno.fechaHoraFin && (
                            <div className="flex items-center space-x-3">
                                <History className="h-4 w-4 text-slate-400" />
                                <div>
                                    <span className="text-sm text-slate-600">Finalizado:</span>
                                    <span className="ml-2 text-slate-900">
                                        {formatearFecha(turno.fechaHoraFin)}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Información de turnos especiales */}
                    {turno.tipoTurno === 'ESPECIAL' && (
                        <div className="bg-purple-50 border border-purple-200 rounded-md p-3">
                            <h4 className="text-sm font-medium text-purple-900 mb-2">Turno Especial</h4>
                            {turno.fechaCita && (
                                <p className="text-sm text-purple-700">
                                    <strong>Fecha de cita:</strong> {new Date(turno.fechaCita).toLocaleDateString('es-AR')}
                                </p>
                            )}
                            {turno.horaCita && (
                                <p className="text-sm text-purple-700">
                                    <strong>Hora de cita:</strong> {turno.horaCita}
                                </p>
                            )}
                            {turno.motivoCita && (
                                <p className="text-sm text-purple-700">
                                    <strong>Motivo:</strong> {turno.motivoCita}
                                </p>
                            )}
                        </div>
                    )}

                    {turno.observaciones && (
                        <div className="bg-slate-50 border border-slate-200 rounded-md p-3">
                            <h4 className="text-sm font-medium text-slate-900 mb-2">Observaciones</h4>
                            <p className="text-sm text-slate-700">{turno.observaciones}</p>
                        </div>
                    )}
                </div>

                {/* Información del ciudadano */}
                <div className="space-y-4">
                    <div className="flex items-center space-x-3 mb-4">
                        <Person className="h-5 w-5 text-slate-600" />
                        <h4 className="text-lg font-medium text-slate-900">Información del Ciudadano</h4>
                    </div>

                    <div className="space-y-3">
                        <div>
                            <span className="text-sm text-slate-600">Nombre completo:</span>
                            <div className="text-lg font-medium text-slate-900">
                                {turno.ciudadano?.nombreCompleto}
                            </div>
                        </div>

                        <div>
                            <span className="text-sm text-slate-600">DNI:</span>
                            <div className="font-mono text-slate-900">
                                {turno.ciudadano?.dni}
                            </div>
                        </div>

                        {turno.ciudadano?.telefono && (
                            <div>
                                <span className="text-sm text-slate-600">Teléfono:</span>
                                <div className="text-slate-900">
                                    {turno.ciudadano.telefono}
                                </div>
                            </div>
                        )}

                        {turno.ciudadano?.direccion && (
                            <div className="flex items-start space-x-2">
                                <LocationOn className="h-4 w-4 text-slate-400 mt-1" />
                                <div>
                                    <span className="text-sm text-slate-600">Dirección:</span>
                                    <div className="text-slate-900">
                                        {turno.ciudadano.direccion}
                                    </div>
                                </div>
                            </div>
                        )}

                        {turno.esPrioritario && turno.motivoPrioridad && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                                <h5 className="text-sm font-medium text-yellow-900 mb-1">Prioridad</h5>
                                <p className="text-sm text-yellow-700">{turno.motivoPrioridad}</p>
                            </div>
                        )}
                    </div>

                    {/* Empleados */}
                    {(turno.empleadoLlamada || turno.empleadoAtencion) && (
                        <div className="border-t border-slate-200 pt-4">
                            <h5 className="text-sm font-medium text-slate-900 mb-3">Personal Asignado</h5>
                            <div className="space-y-2">
                                {turno.empleadoLlamada && (
                                    <div className="text-sm">
                                        <span className="text-slate-600">Llamado por:</span>
                                        <span className="ml-2 text-slate-900">{turno.empleadoLlamada.nombreCompleto}</span>
                                    </div>
                                )}
                                {turno.empleadoAtencion && (
                                    <div className="text-sm">
                                        <span className="text-slate-600">Atendido por:</span>
                                        <span className="ml-2 text-slate-900">{turno.empleadoAtencion.nombreCompleto}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    // Renderizar lista de turnos múltiples
    const renderListaTurnos = () => (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200">
                <h3 className="text-lg font-medium text-slate-900">
                    Turnos Encontrados ({resultados.length})
                </h3>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Código</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Sector</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Estado</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Fecha</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Tiempo</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {resultados.map((turno, index) => (
                            <tr key={turno.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center space-x-2">
                                        <span className="font-mono text-lg font-bold text-slate-900">
                                            {turno.codigo}
                                        </span>
                                        {turno.esPrioritario && (
                                            <Star className="h-4 w-4 text-yellow-600" />
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-slate-900">{turno.sector?.nombre}</div>
                                    <div className="text-sm text-slate-500">{turno.sector?.codigo}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${turno.estadoColor}`}>
                                        {turno.estadoTexto}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                    {formatearFecha(turno.fechaHoraCreacion)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                    {getTiempoTranscurrido(turno.fechaHoraCreacion)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <button
                                        onClick={() => setTurnoSeleccionado(turno)}
                                        className="text-slate-600 hover:text-slate-900 transition-colors"
                                        title="Ver detalle"
                                    >
                                        <Visibility className="h-5 w-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Formulario de consulta */}
            {renderFormularioConsulta()}

            {/* Resultados */}
            {turnoSeleccionado && renderDetalleTurno(turnoSeleccionado)}
            {resultados.length > 0 && !turnoSeleccionado && renderListaTurnos()}
        </div>
    );
};

export default ConsultarTurnoView;