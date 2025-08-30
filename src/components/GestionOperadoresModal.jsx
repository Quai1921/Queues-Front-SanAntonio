import React, { useState, useEffect } from 'react';
import {
    Close,
    Person,
    Save,
    Search,
    Business,
    SupportAgent,
    Delete,
    SupervisorAccount,
    RemoveCircle as RemoveCircleIcon,
    Assignment,
    Warning,
    Group,
    Add
} from '@mui/icons-material';
import empleadosService from '../services/empleadoService';


const GestionOperadoresModal = ({ isOpen, onClose, onRefresh, sector, loading = false }) => {
    const [tab, setTab] = useState('asignados'); // 'asignados' | 'asignar'

    // Estados para personal asignado
    const [personalAsignado, setPersonalAsignado] = useState({
        responsable: null,
        operadores: []
    });

    // console.log(personalAsignado);

    // Estados para asignar nuevos operadores
    const [operadoresDisponibles, setOperadoresDisponibles] = useState([]);
    const [operadorSeleccionado, setOperadorSeleccionado] = useState(null);
    const [busqueda, setBusqueda] = useState('');

    // Estados de loading y errores
    const [loadingData, setLoadingData] = useState(false);
    const [loadingAction, setLoadingAction] = useState(false);
    const [error, setError] = useState(null);

    // Cargar datos cuando se abre el modal
    useEffect(() => {
        if (isOpen && sector) {
            cargarDatosSector();
            setBusqueda('');
            setOperadorSeleccionado(null);
            setError(null);
            setTab('asignados');
        }
    }, [isOpen, sector]);

    // Cargar personal asignado y operadores disponibles
    const cargarDatosSector = async () => {
        try {
            setLoadingData(true);
            setError(null);

            // Obtener el ID correcto del sector
            const sectorId = sector?.sector?.id || sector?.id;

            if (!sectorId) {
                throw new Error('ID de sector no disponible');
            }

            console.log('🔍 Cargando datos para sector ID:', sectorId);

            // Cargar personal asignado al sector
            const [personalData, operadoresData] = await Promise.all([
                empleadosService.obtenerPersonalPorSector(sectorId),
                empleadosService.obtenerOperadoresDisponibles()
            ]);

            setPersonalAsignado({
                responsable: personalData.responsable,
                operadores: personalData.operadores || []
            });

            setOperadoresDisponibles(operadoresData.map(emp =>
                empleadosService.formatearParaUI(emp)
            ));

        } catch (err) {
            console.error('Error cargando datos del sector:', err);
            setError('Error cargando la información del sector: ' + err.message);
        } finally {
            setLoadingData(false);
        }
    };

    const handleAsignarOperador = async () => {
        if (!operadorSeleccionado) return;

        try {
            setLoadingAction(true);

            // Obtener el ID correcto del sector
            const sectorId = sector?.sector?.id || sector?.id;

            await empleadosService.asignarSector(operadorSeleccionado.id, {
                sectorId: sectorId
            });

            // Recargar datos
            await cargarDatosSector();
            setOperadorSeleccionado(null);
            setTab('asignados');

            if (onRefresh) onRefresh();

        } catch (err) {
            console.error('Error asignando operador:', err);
            setError('Error asignando operador: ' + err.message);
        } finally {
            setLoadingAction(false);
        }
    };

    const handleDesasignarOperador = async (operador) => {
        const sectorCodigo = sector?.sector?.codigo || sector?.codigo;

        // Crear modal de confirmación personalizado
        const confirmed = await new Promise((resolve) => {
            const modalDiv = document.createElement('div');
            modalDiv.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4';
            modalDiv.innerHTML = `
                <div class="bg-white rounded-xl shadow-xl max-w-md w-full p-4 text-sm">
                    <div class="flex items-center mb-4">
                        <div class="w-10 h-10 bg-red-500 rounded-md flex items-center justify-center mr-3">
                            <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                            </svg>
                        </div>
                        <h3 class="text-lg font-semibold text-slate-900">Confirmar Desasignación</h3>
                    </div>
                    <p class="text-slate-600 mb-6">
                        ¿Estás seguro de desasignar a <strong>${operador.nombre} ${operador.apellido}</strong> del sector <strong>${sectorCodigo}</strong>?
                        <br><br>
                        El operador quedará disponible para ser asignado a otro sector.
                    </p>
                    <div class="flex justify-end space-x-3">
                        <button id="cancelBtn" class="px-4 h-8 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors">
                            Cancelar
                        </button>
                        <button id="confirmBtn" class="px-4 h-8 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors">
                            Desasignar
                        </button>
                    </div>
                </div>
            `;

            document.body.appendChild(modalDiv);

            const cancelBtn = modalDiv.querySelector('#cancelBtn');
            const confirmBtn = modalDiv.querySelector('#confirmBtn');

            const cleanup = () => {
                document.body.removeChild(modalDiv);
            };

            cancelBtn.onclick = () => {
                cleanup();
                resolve(false);
            };

            confirmBtn.onclick = () => {
                cleanup();
                resolve(true);
            };

            modalDiv.onclick = (e) => {
                if (e.target === modalDiv) {
                    cleanup();
                    resolve(false);
                }
            };
        });

        if (!confirmed) return;

        try {
            setLoadingAction(true);
            await empleadosService.asignarSector(operador.id, { sectorId: null });

            // Recargar datos
            await cargarDatosSector();

            if (onRefresh) onRefresh();

        } catch (err) {
            console.error('Error desasignando operador:', err);
            setError('Error desasignando operador: ' + err.message);
        } finally {
            setLoadingAction(false);
        }
    };

    const handleClose = () => {
        if (!loadingAction) {
            onClose();
        }
    };

    // Filtrar operadores disponibles según búsqueda
    const operadoresFiltrados = operadoresDisponibles.filter(op => {
        if (!busqueda.trim()) return true;
        const termino = busqueda.toLowerCase();
        return (
            op.nombre.toLowerCase().includes(termino) ||
            op.apellido.toLowerCase().includes(termino) ||
            op.usuario.toLowerCase().includes(termino)
        );
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden text-sm">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
                    <div className="flex items-center">
                        <div className="w-10 h-10 bg-slate-200 rounded-md flex items-center justify-center mr-3">
                            <Group className="h-6 w-6 text-slate-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900">Gestión de Personal</h2>
                            <p className="text-sm text-slate-600">
                                Sector {sector?.sector?.codigo || sector?.codigo} - {sector?.sector?.nombre || sector?.nombre}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        disabled={loadingAction}
                        className="p-2 hover:bg-slate-200 rounded-md transition-colors disabled:opacity-50"
                    >
                        <Close className="h-5 w-5 text-slate-500" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-200">
                    <button
                        onClick={() => setTab('asignados')}
                        className={`px-4 py-2 font-medium transition-colors ${tab === 'asignados'
                                ? 'text-slate-600 border-b-2 border-slate-600 bg-slate-50'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                    >
                        Personal Asignado ({personalAsignado.operadores.length})
                    </button>
                    <button
                        onClick={() => setTab('asignar')}
                        className={`px-4 py-2 font-medium transition-colors ${tab === 'asignar'
                                ? 'text-slate-600 border-b-2 border-slate-600 bg-slate-50'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                    >
                        Asignar Operador ({operadoresDisponibles.length} disponibles)
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 max-h-96 overflow-y-auto">
                    {error && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                            <div className="flex items-start">
                                <Warning className="h-5 w-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                                <p className="text-red-800 text-sm">{error}</p>
                            </div>
                        </div>
                    )}

                    {tab === 'asignados' && (
                        <div className="space-y-4">
                            {/* Responsable Actual */}
                            <div>
                                <h3 className="text-sm font-medium text-slate-700 mb-3 flex items-center">
                                    <SupervisorAccount className="h-4 w-4 mr-2" />
                                    Responsable del Sector
                                </h3>
                                {personalAsignado.responsable ? (
                                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-md">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 bg-slate-200 rounded-md flex items-center justify-center mr-3">
                                                    <Person className="h-5 w-5 text-slate-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-900">
                                                        {personalAsignado.responsable.nombre} {personalAsignado.responsable.apellido}
                                                    </p>
                                                    <p className="text-sm text-slate-700">
                                                        {personalAsignado.responsable.username}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="px-3 py-1 bg-slate-200 text-slate-800 rounded-full text-xs font-medium">
                                                Responsable
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-md text-center">
                                        <SupervisorAccount className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                                        <p className="text-slate-600">Sin responsable asignado</p>
                                        <p className="text-sm text-slate-500">
                                            Usa "Asignar Responsable" desde la tabla de sectores
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Operadores Asignados */}
                            <div>
                                <h3 className="text-sm font-medium text-slate-700 mb-3 flex items-center">
                                    <SupportAgent className="h-4 w-4 mr-2" />
                                    Operadores Asignados ({personalAsignado.operadores.length})
                                </h3>

                                {loadingData ? (
                                    <div className="flex justify-center py-8">
                                        <div className="w-6 h-6 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                ) : personalAsignado.operadores.length > 0 ? (
                                    <div className="space-y-3">
                                        {personalAsignado.operadores.map((operador) => (
                                            <div
                                                key={operador.id}
                                                className="p-4 bg-slate-50 border border-slate-200 rounded-md"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center">
                                                        <div className="w-10 h-10 bg-slate-200 rounded-md flex items-center justify-center mr-3">
                                                            <Person className="h-5 w-5 text-slate-600" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-slate-800">
                                                                {operador.nombre} {operador.apellido}
                                                            </p>
                                                            <p className="text-sm text-slate-700">
                                                                {operador.username}
                                                                {operador.activo ? (
                                                                    <span className="ml-2 text-green-600">• Activo</span>
                                                                ) : (
                                                                    <span className="ml-2 text-red-600">• Inactivo</span>
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <span className="px-3 py-1 bg-slate-200 text-slate-800 rounded-full text-xs font-medium">
                                                            Operador
                                                        </span>
                                                        <button
                                                            onClick={() => handleDesasignarOperador(operador)}
                                                            disabled={loadingAction}
                                                            className="p-1 transition-all duration-300 text-gray-400 hover:text-red-600"
                                                            title="Desasignar del sector"
                                                        >
                                                            <RemoveCircleIcon className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-8 bg-slate-50 border border-slate-200 rounded-md text-center">
                                        <SupportAgent className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                                        <p className="text-slate-600 font-medium">No hay operadores asignados</p>
                                        <p className="text-sm text-slate-500 mt-1">
                                            Usa la pestaña "Asignar Operador" para añadir personal a este sector
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {tab === 'asignar' && (
                        <div className="space-y-6">
                            {/* Búsqueda */}
                            <div>
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Buscar operadores disponibles..."
                                        value={busqueda}
                                        onChange={(e) => setBusqueda(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md"
                                    />
                                </div>
                            </div>

                            {/* Lista de Operadores Disponibles */}
                            {loadingData ? (
                                <div className="flex justify-center py-8">
                                    <div className="w-6 h-6 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            ) : operadoresFiltrados.length > 0 ? (
                                <div className="space-y-3 max-h-64 overflow-y-auto">
                                    {operadoresFiltrados.map((operador) => (
                                        <div
                                            key={operador.id}
                                            className={`p-4 border rounded-md cursor-pointer transition-all ${operadorSeleccionado?.id === operador.id
                                                    ? 'border-slate-500 bg-slate-50 ring-2 ring-slate-500 ring-opacity-20'
                                                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                                }`}
                                            onClick={() => setOperadorSeleccionado(
                                                operadorSeleccionado?.id === operador.id ? null : operador
                                            )}
                                        >
                                            <div className="flex items-center">
                                                <div className={`w-10 h-10 rounded-md flex items-center justify-center mr-3 ${operadorSeleccionado?.id === operador.id
                                                        ? 'bg-slate-200'
                                                        : 'bg-slate-200'
                                                    }`}>
                                                    <Person className="h-5 w-5 text-slate-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium text-slate-900">
                                                        {operador.nombre} {operador.apellido}
                                                    </p>
                                                    <p className="text-sm text-slate-600">
                                                        @{operador.usuario} • Sin sector asignado
                                                    </p>
                                                </div>
                                                {operadorSeleccionado?.id === operador.id && (
                                                    <div className="w-5 h-5 bg-slate-500 rounded-full flex items-center justify-center">
                                                        <div className="w-2 h-2 bg-white rounded-full"></div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : busqueda.trim() ? (
                                <div className="p-8 text-center">
                                    <Search className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                                    <p className="text-slate-600">No se encontraron operadores con "{busqueda}"</p>
                                </div>
                            ) : (
                                <div className="p-8 text-center">
                                    <SupportAgent className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                                    <p className="text-slate-600 font-medium">No hay operadores disponibles</p>
                                    <p className="text-sm text-slate-500 mt-1">
                                        Todos los operadores están asignados a otros sectores
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end space-x-3 p-6 border-t border-slate-200 bg-slate-50">
                    <button
                        onClick={handleClose}
                        disabled={loadingAction}
                        className="px-4 h-8 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors disabled:opacity-50"
                    >
                        Cerrar
                    </button>

                    {tab === 'asignar' && (
                        <button
                            onClick={handleAsignarOperador}
                            disabled={loadingAction || !operadorSeleccionado}
                            className="px-4 h-8 text-sm font-medium text-white bg-[#224666] rounded-md hover:bg-[#2c3e50] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                        >
                            {loadingAction ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                    Asignando...
                                </>
                            ) : (
                                <>
                                    <Add sx={{ fontSize: '20px' }} className="mr-2" />
                                    Asignar Operador
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GestionOperadoresModal;