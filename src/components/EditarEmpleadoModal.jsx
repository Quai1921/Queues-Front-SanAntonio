import React, { useState, useEffect } from 'react';
import {
    Close,
    Person,
    Save,
    Edit,
    Email,
    Badge,
    AdminPanelSettings,
    Business,
    SupportAgent
} from '@mui/icons-material';
import empleadosService from '../services/empleadoService';
import EditDocumentIcon from '@mui/icons-material/EditDocument';

const EditarEmpleadoModal = ({ isOpen, onClose, onSubmit, empleado, loading = false }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        email: '',
        dni: '',
        rol: 'OPERADOR'
    });

    const [errors, setErrors] = useState({});

    // Cargar datos del empleado cuando se abre el modal
    useEffect(() => {
        const cargarDatosCompletos = async () => {
            if (isOpen && empleado) {
                try {
                    // Obtener datos completos del empleado desde el backend
                    const empleadoCompleto = await empleadosService.obtenerPorId(empleado.id);

                    setFormData({
                        nombre: empleadoCompleto.nombre || '',
                        apellido: empleadoCompleto.apellido || '',
                        email: empleadoCompleto.email || '',
                        dni: empleadoCompleto.dni || '',
                        rol: empleadoCompleto.rol || 'OPERADOR'
                    });
                } catch (error) {
                    console.error('Error cargando datos del empleado:', error);
                    // Fallback con datos disponibles
                    const [apellido = '', nombre = ''] = empleado.nombreCompleto
                        ? empleado.nombreCompleto.split(', ')
                        : ['', ''];

                    setFormData({
                        nombre: nombre,
                        apellido: apellido,
                        email: empleado.email || '',
                        dni: '',
                        rol: empleado.rol || 'OPERADOR'
                    });
                }
                setErrors({});
            }
        };

        cargarDatosCompletos();
    }, [isOpen, empleado]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Limpiar error específico cuando el usuario empieza a escribir
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Nombre
        if (!formData.nombre.trim()) {
            newErrors.nombre = 'El nombre es obligatorio';
        } else if (formData.nombre.length > 100) {
            newErrors.nombre = 'El nombre no puede exceder 100 caracteres';
        }

        // Apellido
        if (!formData.apellido.trim()) {
            newErrors.apellido = 'El apellido es obligatorio';
        } else if (formData.apellido.length > 100) {
            newErrors.apellido = 'El apellido no puede exceder 100 caracteres';
        }

        // Email (opcional pero debe ser válido)
        if (formData.email.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                newErrors.email = 'El formato del email no es válido';
            } else if (formData.email.length > 150) {
                newErrors.email = 'El email no puede exceder 150 caracteres';
            }
        }

        // DNI (opcional pero debe ser válido)
        if (formData.dni.trim()) {
            if (!/^\d{7,8}$/.test(formData.dni)) {
                newErrors.dni = 'El DNI debe tener entre 7 y 8 dígitos';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        // Preparar datos para envío (solo campos que pueden editarse según el backend)
        const datosEmpleado = {
            nombre: formData.nombre.trim(),
            apellido: formData.apellido.trim(),
            email: formData.email.trim() || null,
            dni: formData.dni.trim() || null,
            rol: formData.rol
        };

        onSubmit(datosEmpleado);
    };

    const handleClose = () => {
        if (!loading) {
            onClose();
        }
    };

    const getRolIcon = (rol) => {
        switch (rol) {
            case 'ADMIN':
                return <AdminPanelSettings className="h-4 w-4" />;
            case 'RESPONSABLE_SECTOR':
                return <Business className="h-4 w-4" />;
            case 'OPERADOR':
                return <SupportAgent className="h-4 w-4" />;
            default:
                return <Person className="h-4 w-4" />;
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                    <div className="flex items-center">
                        <div className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center mr-3">
                            <EditDocumentIcon className="h-6 w-6 text-slate-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900">Editar Empleado</h2>
                            <p className="text-sm text-slate-600">
                                {empleado ? `Modificando: ${empleado.username}` : 'Cargando...'}
                            </p>
                        </div>
                    </div>

                    <div className='flex justify-between gap-8'>
                        {/* Estado del empleado */}
                        {empleado && (
                            <div className="flex flex-col justify-center items-center">
                                <p className='text-sm font-medium text-slate-700'>Estado</p>
                                
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${empleado.activo
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                    }`}>
                                    {empleado.activo ? 'Activo' : 'Inactivo'}
                                </span>

                                {empleado.sector && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        {empleado.sector.codigo}
                                    </span>
                                )}
                            </div>
                        )}

                        <button
                            onClick={handleClose}
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                            disabled={loading}
                        >
                            <Close className="h-6 w-6" />
                        </button>

                    </div>
                    
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto max-h-[calc(90vh-140px)]">
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">

                        {/* Información Personal */}
                        <div className="space-y-1">
                            <h3 className="text-sm font-medium text-slate-900 flex items-center pb-2">
                                <Person className="h-4 w-4 mr-2" />
                                Información Personal
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Nombre */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Nombre *
                                    </label>
                                    <input
                                        type="text"
                                        name="nombre"
                                        value={formData.nombre}
                                        onChange={handleInputChange}
                                        className={`w-full px-3 py-2 border rounded-lg transition-colors ${errors.nombre
                                                ? 'border-red-500 '
                                                : 'border-slate-300'
                                            }`}
                                        placeholder="Ingrese el nombre"
                                        disabled={loading}
                                    />
                                    {errors.nombre && (
                                        <p className="text-red-600 text-sm mt-1">{errors.nombre}</p>
                                    )}
                                </div>

                                {/* Apellido */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Apellido *
                                    </label>
                                    <input
                                        type="text"
                                        name="apellido"
                                        value={formData.apellido}
                                        onChange={handleInputChange}
                                        className={`w-full px-3 py-2 border rounded-lg transition-colors ${errors.apellido
                                                ? 'border-red-500'
                                                : 'border-slate-300'
                                            }`}
                                        placeholder="Ingrese el apellido"
                                        disabled={loading}
                                    />
                                    {errors.apellido && (
                                        <p className="text-red-600 text-sm mt-1">{errors.apellido}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Información de Contacto */}
                        {/* DNI */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        DNI
                                    </label>
                                    <input
                                        type="text"
                                        name="dni"
                                        value={formData.dni}
                                        onChange={handleInputChange}
                                        className={`w-full px-3 py-2 border rounded-lg transition-colors ${errors.dni
                                                ? 'border-red-500 focus:border-red-500'
                                                : 'border-slate-300 focus:border-[#224666]'
                                            } focus:ring-2 focus:ring-[#224666]/20`}
                                        placeholder="12345678"
                                        disabled={loading}
                                    />
                                    {errors.dni && (
                                        <p className="text-red-600 text-sm mt-1">{errors.dni}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className={`w-full px-3 py-2 border rounded-lg transition-colors ${errors.email
                                                ? 'border-red-500 focus:border-red-500'
                                                : 'border-slate-300 focus:border-[#224666]'
                                            } focus:ring-2 focus:ring-[#224666]/20`}
                                        placeholder="ejemplo@sanantonio.gov.ar"
                                        disabled={loading}
                                    />
                                    {errors.email && (
                                        <p className="text-red-600 text-sm mt-1">{errors.email}</p>
                                    )}
                                </div>
                            </div>

                        {/* Rol del Sistema */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-slate-900 flex items-center border-b border-slate-200 pb-2">
                                <AdminPanelSettings className="h-4 w-4 mr-2" />
                                Rol del Sistema
                            </h3>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Rol Asignado *
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {[
                                        { value: 'OPERADOR', label: 'Operador', desc: 'Atención al público' },
                                        { value: 'RESPONSABLE_SECTOR', label: 'Responsable', desc: 'Gestión de sector' },
                                        { value: 'ADMIN', label: 'Administrador', desc: 'Acceso completo' }
                                    ].map((rol) => (
                                        <div key={rol.value}>
                                            <label className="flex items-center p-3 border-2 border-slate-200 rounded-lg cursor-pointer hover:border-[#224666] transition-colors">
                                                <input
                                                    type="radio"
                                                    name="rol"
                                                    value={rol.value}
                                                    checked={formData.rol === rol.value}
                                                    onChange={handleInputChange}
                                                    className="hidden"
                                                    disabled={loading}
                                                />
                                                <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${formData.rol === rol.value
                                                        ? 'border-[#224666] bg-[#224666]'
                                                        : 'border-slate-300'
                                                    }`}>
                                                    {formData.rol === rol.value && (
                                                        <div className="w-2 h-2 bg-white rounded-full"></div>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center">
                                                        {getRolIcon(rol.value)}
                                                        <span className="ml-2 font-medium text-slate-900">
                                                            {rol.label}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-slate-500 mt-1">{rol.desc}</p>
                                                </div>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Advertencia sobre cambio de rol */}
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                                <div className="flex items-start">
                                    <div className="w-5 h-5 text-amber-600 mt-0.5">⚠️</div>
                                    <div className="ml-3 text-sm">
                                        <p className="text-amber-800 font-medium">Cambio de Rol</p>
                                        <p className="text-amber-700 mt-1">
                                            Cambiar el rol modificará los permisos del empleado.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-end space-x-3 pt-6 mt-6 border-t border-slate-200">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
                                disabled={loading}
                            >
                                Cancelar
                            </button>

                            <button
                                type='submit'
                                onClick={handleSubmit}
                                disabled={loading}
                                className="flex items-center px-4 py-2 bg-[#224666] text-white rounded-lg hover:bg-[#2c3e50] transition-colors disabled:opacity-50"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Guardando...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        Guardar Cambios
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
                
            </div>
        </div>
    );
};

export default EditarEmpleadoModal;