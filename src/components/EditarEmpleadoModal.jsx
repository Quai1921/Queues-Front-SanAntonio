import React, { useState, useEffect } from 'react';
import {
    Close,
    Person,
    Save,
    Edit,
    Email,
    AdminPanelSettings,
    Business,
    SupportAgent
} from '@mui/icons-material';

/**
 * Modal para editar un empleado existente
 */
const EditarEmpleadoModal = ({ isOpen, onClose, onSubmit, empleado, loading = false }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        email: '',
        dni: '',
        telefono: '',
        rol: 'OPERADOR'
    });

    const [errors, setErrors] = useState({});

    // Cargar datos del empleado cuando se abre el modal
    useEffect(() => {
        if (isOpen && empleado) {
            setFormData({
                nombre: empleado.nombre || '',
                apellido: empleado.apellido || '',
                email: empleado.email || '',
                dni: empleado.dni || '',
                telefono: empleado.telefono || '',
                rol: empleado.rol || 'OPERADOR'
            });
            setErrors({});
        }
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
            newErrors.nombre = 'El nombre es requerido';
        } else if (formData.nombre.length > 50) {
            newErrors.nombre = 'El nombre no puede tener más de 50 caracteres';
        }

        // Apellido
        if (!formData.apellido.trim()) {
            newErrors.apellido = 'El apellido es requerido';
        } else if (formData.apellido.length > 50) {
            newErrors.apellido = 'El apellido no puede tener más de 50 caracteres';
        }

        // Email
        if (formData.email.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                newErrors.email = 'El formato del email no es válido';
            }
        }

        // DNI
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

        // Preparar datos para envío (solo campos que pueden editarse)
        const datosEmpleado = {
            nombre: formData.nombre,
            apellido: formData.apellido,
            email: formData.email || null,
            dni: formData.dni || null,
            telefono: formData.telefono || null,
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
                <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-slate-50">
                    <div className="flex items-center">
                        <div className="w-10 h-10 bg-[#224666] rounded-lg flex items-center justify-center mr-3">
                            <Edit className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900">Editar Empleado</h2>
                            <p className="text-sm text-slate-600">
                                {empleado ? `Modificando: @${empleado.username}` : 'Cargando...'}
                            </p>
                        </div>
                    </div>

                    {/* Estado del empleado */}
                    {empleado && (
                        <div className="flex items-center space-x-3">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${empleado.activo
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                {empleado.activo ? 'Activo' : 'Inactivo'}
                            </span>

                            <button
                                onClick={handleClose}
                                disabled={loading}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                            >
                                <Close className="h-5 w-5" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                    <div className="space-y-4">
                        {/* Información no editable */}
                        <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                            <h3 className="text-sm font-medium text-slate-900">Información del Sistema</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-slate-500">Username:</span>
                                    <span className="ml-2 font-mono text-slate-900">@{empleado?.username}</span>
                                </div>
                                <div>
                                    <span className="text-slate-500">ID:</span>
                                    <span className="ml-2 font-mono text-slate-900">#{empleado?.id}</span>
                                </div>
                                {empleado?.fechaCreacion && (
                                    <div>
                                        <span className="text-slate-500">Creado:</span>
                                        <span className="ml-2 text-slate-900">
                                            {new Date(empleado.fechaCreacion).toLocaleDateString('es-AR')}
                                        </span>
                                    </div>
                                )}
                                {empleado?.sectorResponsable && (
                                    <div>
                                        <span className="text-slate-500">Sector actual:</span>
                                        <span className="ml-2 text-slate-900">
                                            {empleado.sectorResponsable.nombre}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Información Personal */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-slate-900 flex items-center">
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
                                        placeholder="Juan"
                                        className={`w-full px-3 py-2 border rounded-lg transition-colors ${errors.nombre ? 'border-red-300' : 'border-slate-300'
                                            }`}
                                        disabled={loading}
                                        maxLength={50}
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
                                        placeholder="Pérez"
                                        className={`w-full px-3 py-2 border rounded-lg transition-colors ${errors.apellido ? 'border-red-300' : 'border-slate-300'
                                            }`}
                                        disabled={loading}
                                        maxLength={50}
                                    />
                                    {errors.apellido && (
                                        <p className="text-red-600 text-sm mt-1">{errors.apellido}</p>
                                    )}
                                </div>

                                {/* DNI */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        DNI
                                    </label>
                                    <input
                                        type="text"
                                        name="dni"
                                        value={formData.dni}
                                        onChange={handleInputChange}
                                        placeholder="12345678"
                                        className={`w-full px-3 py-2 border rounded-lg transition-colors ${errors.dni ? 'border-red-300' : 'border-slate-300'
                                            }`}
                                        disabled={loading}
                                        maxLength={8}
                                    />
                                    {errors.dni && (
                                        <p className="text-red-600 text-sm mt-1">{errors.dni}</p>
                                    )}
                                </div>

                                {/* Teléfono */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Teléfono
                                    </label>
                                    <input
                                        type="tel"
                                        name="telefono"
                                        value={formData.telefono}
                                        onChange={handleInputChange}
                                        placeholder="+54 9 351 123-4567"
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center">
                                    <Email className="h-4 w-4 mr-1" />
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="juan.perez@sanantonio.gov.ar"
                                    className={`w-full px-3 py-2 border rounded-lg transition-colors ${errors.email ? 'border-red-300' : 'border-slate-300'
                                        }`}
                                    disabled={loading}
                                />
                                {errors.email && (
                                    <p className="text-red-600 text-sm mt-1">{errors.email}</p>
                                )}
                            </div>
                        </div>

                        {/* Rol del Sistema */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-slate-900 flex items-center">
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
                                            Si cambias a "Responsable de Sector", deberás asignar un sector posteriormente.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Acciones adicionales */}
                        <div className="bg-slate-50 p-4 rounded-lg">
                            <h3 className="text-sm font-medium text-slate-900 mb-2">Acciones Adicionales</h3>
                            <div className="text-sm text-slate-600 space-y-1">
                                <p>• Para cambiar la contraseña, usa el botón específico de "Cambiar Contraseña"</p>
                                <p>• Para asignar/cambiar sector, usa el botón "Asignar Sector"</p>
                                <p>• Para activar/desactivar, usa los botones de estado en la tabla principal</p>
                            </div>
                        </div>
                    </div>

                    {/* Botones */}
                    <div className="flex items-center justify-end space-x-3 pt-6 mt-6 border-t border-slate-200">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={loading}
                            className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
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
                                    <Save className="mr-2 h-4 w-4" />
                                    Guardar Cambios
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditarEmpleadoModal;