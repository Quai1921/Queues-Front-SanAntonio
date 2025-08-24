import React, { useState, useEffect } from 'react';
import {
    Close,
    Person,
    Save,
    Search,
    Business
} from '@mui/icons-material';
import empleadosService from '../services/empleadoService';

/**
 * Modal para asignar responsable a un sector
 */
const AsignarResponsableModal = ({ isOpen, onClose, onSubmit, sector, loading = false }) => {
    const [empleados, setEmpleados] = useState([]);
    const [loadingEmpleados, setLoadingEmpleados] = useState(false);
    const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);
    const [busqueda, setBusqueda] = useState('');
    const [error, setError] = useState(null);

    console.log(empleados);

    // Cargar empleados cuando se abre el modal
    useEffect(() => {
        if (isOpen) {
            cargarEmpleados();
            setEmpleadoSeleccionado(null);
            setBusqueda('');
            setError(null);
        }
    }, [isOpen]);

    const cargarEmpleados = async () => {
        try {
            setLoadingEmpleados(true);
            setError(null);

            // Llamada real a la API
            const empleadosData = await empleadosService.obtenerResponsablesDisponibles();

            // Formatear empleados para la UI
            const empleadosFormateados = empleadosData.map(emp =>
                empleadosService.formatearParaUI(emp)
            );

            setEmpleados(empleadosFormateados);

        } catch (err) {
            console.error('Error cargando empleados:', err);
            setError('Error cargando la lista de empleados: ' + err.message);
        } finally {
            setLoadingEmpleados(false);
        }
    };

    // Filtrar empleados según búsqueda
    const empleadosFiltrados = empleados.filter(emp => {
        if (!busqueda.trim()) return true;

        const texto = busqueda.toLowerCase();
        return (
            emp.nombreCompleto.toLowerCase().includes(texto) ||
            emp.username.toLowerCase().includes(texto) ||
            emp.email.toLowerCase().includes(texto) ||
            (emp.sectorAsignado && emp.sectorAsignado.toLowerCase().includes(texto)) ||
            (emp.sectorNombre && emp.sectorNombre.toLowerCase().includes(texto))
        );
    });

    // Empleados elegibles (RESPONSABLE_SECTOR o ADMIN, activos)
    const empleadosElegibles = empleadosFiltrados.filter(emp => emp.activo);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!empleadoSeleccionado) {
            setError('Por favor seleccione un empleado');
            return;
        }

        try {
            await onSubmit(sector.sector?.id, empleadoSeleccionado.id);
            handleClose();
        } catch (error) {
            console.error('Error asignando responsable:', error);
            setError('Error al asignar responsable: ' + error.message);
        }
    };

    const handleClose = () => {
        setEmpleadoSeleccionado(null);
        setBusqueda('');
        setError(null);
        onClose();
    };

    if (!isOpen || !sector) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                    <div className="flex items-center">
                        <div className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center mr-3">
                            <Person className="h-6 w-6 text-slate-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-slate-900">Asignar Responsable</h2>
                            <p className="text-sm text-slate-600">
                                Sector: <span className="font-semibold">{sector.sector?.codigo} - {sector.sector?.nombre}</span>
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        disabled={loading}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                    >
                        <Close className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">

                    {/* Responsable actual */}
                    {sector.sector?.responsable && (
                        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <h3 className="text-sm font-medium text-slate-800 mb-2">Responsable actual:</h3>
                            <div className="flex items-center">
                                <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center mr-3">
                                    <Person className="h-4 w-4 text-slate-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-900">
                                        {sector.sector.responsable.nombreCompleto}
                                    </p>
                                    <p className="text-xs text-slate-700">
                                        {sector.sector.responsable.username}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Búsqueda */}
                    <div className="mb-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                            <input
                                type="text"
                                placeholder="Buscar empleados por nombre, usuario o email..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg"
                                disabled={loading || loadingEmpleados}
                            />
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-800">{error}</p>
                        </div>
                    )}

                    {/* Lista de empleados */}
                    <div className="mb-6">
                        <h3 className="text-sm font-medium text-slate-700 mb-3">
                            Seleccionar nuevo responsable
                        </h3>

                        {loadingEmpleados ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
                                <p className="text-slate-600">Cargando empleados...</p>
                            </div>
                        ) : error ? (
                            <div className="text-center py-8">
                                <p className="text-red-600 mb-3">{error}</p>
                                <button
                                    onClick={cargarEmpleados}
                                    className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                >
                                    Reintentar
                                </button>
                            </div>
                        ) : empleadosElegibles.length === 0 ? (
                            <div className="text-center py-8">
                                <Person className="h-12 w-12 text-slate-400 mx-auto mb-2" />
                                <p className="text-slate-600">
                                    {empleados.length === 0
                                        ? 'No hay empleados responsables disponibles'
                                        : 'No se encontraron empleados que coincidan con la búsqueda'
                                    }
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {empleadosElegibles.map((empleado) => (
                                    <label
                                        key={empleado.id}
                                        className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-colors ${empleadoSeleccionado?.id === empleado.id
                                                ? 'border-slate-500 bg-slate-50'
                                                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="empleado"
                                            value={empleado.id}
                                            checked={empleadoSeleccionado?.id === empleado.id}
                                            onChange={() => setEmpleadoSeleccionado(empleado)}
                                            disabled={loading}
                                            className="sr-only"
                                        />
                                        <div className="flex items-center w-full">
                                            <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center mr-3">
                                                <Person className="h-5 w-5 text-slate-600" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <p className="font-medium text-slate-900">
                                                        {empleado.nombreCompleto}
                                                    </p>
                                                    <div className="flex items-center space-x-2">
                                                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                                                            {empleado.rolLabel}
                                                        </span>
                                                        {/* {empleado.sectorAsignado && (
                                                            <span className="px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
                                                                Asignado: {empleado.sectorCodigo}
                                                            </span>
                                                        )} */}
                                                    </div>
                                                </div>
                                                <p className="text-sm text-slate-600">
                                                    {empleado.username} • {empleado.email}
                                                </p>
                                            </div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={loading}
                            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors duration-300 disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading || !empleadoSeleccionado || loadingEmpleados}
                            className="px-4 py-2 text-sm font-medium text-white bg-[#224666] border border-transparent rounded-lg hover:bg-[#2c3e50] transition-colors duration-300 disabled:opacity-50 flex items-center"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                    Asignando...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Asignar Responsable
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AsignarResponsableModal;