import React, { useState, useEffect } from 'react';
import {
    Close,
    Person,
    Save,
    Search,
    Business,
    SupportAgent
} from '@mui/icons-material';
import empleadosService from '../services/empleadoService';

/**
 * Modal para asignar operadores a un sector
 */
const AsignarOperadorModal = ({ isOpen, onClose, onSubmit, sector, loading = false }) => {
    const [empleados, setEmpleados] = useState([]);
    const [loadingEmpleados, setLoadingEmpleados] = useState(false);
    const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);
    const [busqueda, setBusqueda] = useState('');
    const [error, setError] = useState(null);

    // Cargar empleados operadores cuando se abre el modal
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

            // Obtener solo empleados con rol OPERADOR que estén sin sector asignado
            const empleadosData = await empleadosService.obtenerPorRol('OPERADOR');

            // Filtrar empleados sin sector asignado
            const empleadosSinSector = empleadosData.filter(emp =>
                emp.activo && (!emp.sectorCodigo || emp.sectorCodigo === null)
            );

            // Formatear empleados para la UI
            const empleadosFormateados = empleadosSinSector.map(emp =>
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

        const busquedaLower = busqueda.toLowerCase();
        return (
            emp.nombreCompleto?.toLowerCase().includes(busquedaLower) ||
            emp.username?.toLowerCase().includes(busquedaLower) ||
            emp.email?.toLowerCase().includes(busquedaLower) ||
            emp.dni?.toString().includes(busquedaLower)
        );
    });

    const handleEmpleadoSelect = (empleado) => {
        setEmpleadoSeleccionado(empleado);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!empleadoSeleccionado) {
            setError('Debe seleccionar un empleado');
            return;
        }

        const datosAEnviar = {
            empleadoId: empleadoSeleccionado.id,
            sectorData: { sectorId: sector?.sector?.id }
        };

        onSubmit(datosAEnviar);
    };

    const handleClose = () => {
        if (!loading) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                    <div className="flex items-center">
                        <div className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center mr-3">
                            <SupportAgent className="h-6 w-6 text-slate-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-slate-900">Asignar Operador</h2>
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
                <div className="px-6 pt-3 overflow-y-auto flex-1">
                    {/* Información del sector */}
                    <div className="mb-2 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-900">Asignando operador al sector:</p>
                                <p className="text-slate-800">
                                    <span className="font-bold text-sm">{sector.sector?.codigo}</span>
                                    <span className="font-bold ml-1">{sector.sector?.nombre}</span>
                                </p>
                                {sector.sector?.descripcion && (
                                    <p className="text-slate-700 text-sm mt-1">{sector.sector.descripcion}</p>
                                )}
                            </div>
                            <Business className="h-6 w-6 text-slate-600" />
                        </div>
                    </div>

                    {/* Búsqueda */}
                    <div className="mb-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                            <input
                                type="text"
                                placeholder="Buscar por nombre, usuario, email o DNI..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg transition-colors"
                            />
                        </div>
                    </div>

                    {/* Lista de empleados */}
                    <div className="border border-slate-200 rounded-lg overflow-hidden mb-6">
                        <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
                            <p className="text-sm font-medium text-slate-700">
                                Operadores disponibles ({empleadosFiltrados.length})
                            </p>
                        </div>

                        <div className="max-h-64 overflow-y-auto">
                            {loadingEmpleados ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="w-6 h-6 border-2 border-slate-600 border-t-transparent rounded-full animate-spin mr-3"></div>
                                    <span className="text-slate-600">Cargando empleados...</span>
                                </div>
                            ) : error ? (
                                <div className="p-4 text-center text-red-600">
                                    <p>{error}</p>
                                </div>
                            ) : empleadosFiltrados.length === 0 ? (
                                <div className="p-8 text-center">
                                    <SupportAgent className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                                    <p className="text-slate-500">No hay operadores disponibles</p>
                                    <p className="text-slate-400 text-sm mt-1">
                                        {busqueda ? 'Intenta con otros términos de búsqueda' : 'Todos los operadores ya tienen sectores asignados'}
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {empleadosFiltrados.map((empleado) => (
                                        <button
                                            key={empleado.id}
                                            onClick={() => handleEmpleadoSelect(empleado)}
                                            className={`w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors ${empleadoSeleccionado?.id === empleado.id
                                                    ? 'bg-slate-50 border-l-4 border-l-slate-500'
                                                    : ''
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center mr-3">
                                                        <Person className="h-4 w-4 text-slate-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-slate-900">
                                                            {empleado.nombreCompleto}
                                                        </p>
                                                        <div className="flex items-center space-x-3 text-xs text-slate-500">
                                                            <span>@{empleado.username}</span>
                                                            {empleado.email && <span>{empleado.email}</span>}
                                                            {empleado.dni && <span>DNI: {empleado.dni}</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                                {empleadoSeleccionado?.id === empleado.id && (
                                                    <div className="w-5 h-5 bg-slate-600 rounded-full flex items-center justify-center">
                                                        <div className="w-2 h-2 bg-white rounded-full"></div>
                                                    </div>
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Información adicional */}
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
                        <div className="flex items-start">
                            <div className="ml-3 text-sm">
                                <p className="text-amber-800 font-medium">Información</p>
                                <p className="text-amber-700 mt-1">
                                    Solo se muestran operadores activos que no tienen sector asignado.
                                    Los operadores solo pueden estar asignados a un sector a la vez.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end space-x-3 p-6 border-t border-slate-200 bg-slate-50">
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={loading}
                        className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !empleadoSeleccionado}
                        className="px-4 py-2 text-sm font-medium text-white bg-[#224666] rounded-lg hover:bg-[#2c3e50] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                Asignando...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4 mr-2" />
                                Asignar Operador
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AsignarOperadorModal;