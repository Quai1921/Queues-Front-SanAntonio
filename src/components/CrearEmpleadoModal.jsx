import React, { useState, useEffect } from 'react';
import {
    Close,
    Person,
    Save,
    Visibility,
    VisibilityOff,
    Email,
    Badge,
    AdminPanelSettings,
    Business,
    SupportAgent
} from '@mui/icons-material';
import sectoresService from '../services/sectoresService';

/**
 * Modal para crear un nuevo empleado
 */
const CrearEmpleadoModal = ({ isOpen, onClose, onSubmit, loading = false }) => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmarPassword: '',
        nombre: '',
        apellido: '',
        email: '',
        dni: '',
        telefono: '',
        rol: 'OPERADOR',
        sectorId: ''
    });

    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [sectores, setSectores] = useState([]);
    const [loadingSectores, setLoadingSectores] = useState(false);


    // Cargar sectores cuando se abre el modal
    useEffect(() => {
        if (isOpen) {
            cargarSectores();
            // Reset form
            setFormData({
                username: '',
                password: '',
                confirmarPassword: '',
                nombre: '',
                apellido: '',
                email: '',
                dni: '',
                telefono: '',
                rol: 'OPERADOR',
                sectorId: ''
            });
            setErrors({});
        }
    }, [isOpen]);

    const cargarSectores = async () => {
        setLoadingSectores(true);
        try {
            // Cambiar de obtenerTodos() a obtenerPublicos() para consistencia
            const data = await sectoresService.obtenerPublicos();

            // Los sectores ya vienen filtrados por activos desde el backend
            setSectores(data || []);

        } catch (error) {
            console.error('Error cargando sectores:', error);
            setSectores([]);
        } finally {
            setLoadingSectores(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // Formatear username en mayúsculas
        const finalValue = name === 'username' ? value.toUpperCase() : value;

        setFormData(prev => ({
            ...prev,
            [name]: finalValue
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

        // Username
        if (!formData.username.trim()) {
            newErrors.username = 'El username es obligatorio';
        } else if (formData.username.length < 3) {
            newErrors.username = 'El username debe tener al menos 3 caracteres';
        } else if (!/^[a-zA-Z0-9._-]+$/.test(formData.username)) {
            newErrors.username = 'Solo se permiten letras, números, puntos, guiones';
        }

        // Password
        if (!formData.password.trim()) {
            newErrors.password = 'La contraseña es obligatoria';
        } else if (formData.password.length < 6) {
            newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
        }

        // Confirmar password
        if (!formData.confirmarPassword.trim()) {
            newErrors.confirmarPassword = 'Debe confirmar la contraseña';
        } else if (formData.password !== formData.confirmarPassword) {
            newErrors.confirmarPassword = 'Las contraseñas no coinciden';
        }

        // Nombre
        if (!formData.nombre.trim()) {
            newErrors.nombre = 'El nombre es obligatorio';
        }

        // Apellido
        if (!formData.apellido.trim()) {
            newErrors.apellido = 'El apellido es obligatorio';
        }

        // Email (opcional pero debe ser válido)
        if (formData.email.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                newErrors.email = 'El formato del email no es válido';
            }
        }

        // DNI (opcional pero debe ser válido)
        if (formData.dni.trim()) {
            if (!/^\d{7,8}$/.test(formData.dni)) {
                newErrors.dni = 'El DNI debe tener entre 7 y 8 dígitos';
            }
        }

        // Sector (obligatorio para RESPONSABLE_SECTOR, opcional para OPERADOR)
        if (formData.rol === 'RESPONSABLE_SECTOR' && !formData.sectorId) {
            newErrors.sectorId = 'Los responsables de sector deben tener un sector asignado';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        // Preparar datos para envío
        const datosEmpleado = {
            username: formData.username,
            password: formData.password,
            nombre: formData.nombre,
            apellido: formData.apellido,
            email: formData.email || null,
            dni: formData.dni || null,
            telefono: formData.telefono || null,
            rol: formData.rol
        };

        // Solo incluir sectorId si se ha seleccionado uno
        if (formData.sectorId) {
            datosEmpleado.sectorId = parseInt(formData.sectorId);
        }

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
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden text-sm">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-200">
                    <div className="flex items-center">
                        <div className="w-10 h-10 bg-slate-200 rounded-md flex items-center justify-center mr-3">
                            <Person className="h-6 w-6 text-slate-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900">Crear Empleado</h2>
                            <p className="text-slate-600">Agregar nuevo usuario al sistema</p>
                        </div>
                    </div>

                    <button
                        onClick={handleClose}
                        disabled={loading}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-50"
                    >
                        <Close className="h-5 w-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
                    <div className="space-y-4">
                        {/* Credenciales */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                {/* Username */}
                                <div>
                                    <label className="block font-medium text-slate-700 mb-1">
                                        Username *
                                    </label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        placeholder="Ej: jperez"
                                        className={`w-full px-3 h-8 border rounded-md transition-colors ${errors.username ? 'border-red-300' : 'border-slate-300'
                                            }`}
                                        disabled={loading}
                                        maxLength={20}
                                    />
                                    {errors.username && (
                                        <p className="text-red-600 mt-1">{errors.username}</p>
                                    )}
                                </div>
                                
                                {/* Password */}
                                <div>
                                        <label className="block font-medium text-slate-700 mb-1">
                                            Contraseña *
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                name="password"
                                                value={formData.password}
                                                onChange={handleInputChange}
                                                placeholder="Mínimo 6 caracteres"
                                                className={`w-full px-3 h-8 pr-10 border rounded-md transition-colors ${errors.password ? 'border-red-300' : 'border-slate-300'
                                                    }`}
                                                disabled={loading}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-all duration-300"
                                            >
                                                {showPassword ? <VisibilityOff sx={{ fontSize: '20px' }} /> : <Visibility sx={{ fontSize: '20px' }}/>}
                                            </button>
                                        </div>
                                        {errors.password && (
                                            <p className="text-red-600 mt-1">{errors.password}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block font-medium text-slate-700 mb-1">
                                            Confirmar Contraseña *
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                name="confirmarPassword"
                                                value={formData.confirmarPassword}
                                                onChange={handleInputChange}
                                                placeholder="Repetir contraseña"
                                                className={`w-full px-3 h-8 pr-10 border rounded-md transition-colors ${errors.confirmarPassword ? 'border-red-300' : 'border-slate-300'
                                                    }`}
                                                disabled={loading}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-all duration-300"
                                            >
                                                {showConfirmPassword ? <VisibilityOff sx={{ fontSize: '20px' }}/> : <Visibility sx={{ fontSize: '20px' }}/>}
                                            </button>
                                        </div>
                                        {errors.confirmarPassword && (
                                            <p className="text-red-600 mt-1">{errors.confirmarPassword}</p>
                                        )}
                                    </div>

                                
                            </div>
                        </div>

                        {/* Información Personal */}
                        <div className="space-y-1">
                            <h3 className="font-medium text-slate-900 flex items-center">
                                <Person className="h-4 w-4 mr-2" />
                                Información Personal
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                {/* Nombre */}
                                <div>
                                    <label className="block font-medium text-slate-700 mb-1">
                                        Nombre *
                                    </label>
                                    <input
                                        type="text"
                                        name="nombre"
                                        value={formData.nombre}
                                        onChange={handleInputChange}
                                        placeholder="Juan"
                                        className={`w-full px-3 h-8 border rounded-md transition-colors ${errors.nombre ? 'border-red-300' : 'border-slate-300'
                                            }`}
                                        disabled={loading}
                                        maxLength={50}
                                    />
                                    {errors.nombre && (
                                        <p className="text-red-600 mt-1">{errors.nombre}</p>
                                    )}
                                </div>

                                {/* Apellido */}
                                <div>
                                    <label className="block font-medium text-slate-700 mb-1">
                                        Apellido *
                                    </label>
                                    <input
                                        type="text"
                                        name="apellido"
                                        value={formData.apellido}
                                        onChange={handleInputChange}
                                        placeholder="Pérez"
                                        className={`w-full px-3 h-8 border rounded-md transition-colors ${errors.apellido ? 'border-red-300' : 'border-slate-300'
                                            }`}
                                        disabled={loading}
                                        maxLength={50}
                                    />
                                    {errors.apellido && (
                                        <p className="text-red-600 mt-1">{errors.apellido}</p>
                                    )}
                                </div>

                                {/* DNI */}
                                <div>
                                    <label className="block font-medium text-slate-700 mb-1">
                                        DNI *
                                    </label>
                                    <input
                                        type="text"
                                        name="dni"
                                        value={formData.dni}
                                        onChange={handleInputChange}
                                        placeholder="12345678"
                                        className={`w-full px-3 h-8 border rounded-md transition-colors ${errors.dni ? 'border-red-300' : 'border-slate-300'
                                            }`}
                                        disabled={loading}
                                        maxLength={8}
                                    />
                                    {errors.dni && (
                                        <p className="text-red-600 mt-1">{errors.dni}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block font-medium text-slate-700 mb-1 items-center">
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="juan.perez@sanantonio.gov.ar"
                                        className={`w-full px-3 h-8 border rounded-md transition-colors ${errors.email ? 'border-red-300' : 'border-slate-300'
                                            }`}
                                        disabled={loading}
                                    />
                                    {errors.email && (
                                        <p className="text-red-600 mt-1">{errors.email}</p>
                                    )}
                                </div>
                            </div>

                            {/* Email */}
                            
                        </div>

                        {/* Rol y Permisos */}
                        <div className="space-y-1">
                            <h3 className="font-medium text-slate-900 flex items-center">
                                <AdminPanelSettings className="h-4 w-4 mr-2" />
                                Rol y Permisos
                            </h3>

                            <div>
                                <label className="block font-medium text-slate-700 mb-2">
                                    Rol en el Sistema *
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {[
                                        { value: 'OPERADOR', label: 'Operador', desc: 'Atención al público' },
                                        { value: 'RESPONSABLE_SECTOR', label: 'Responsable', desc: 'Gestión de sector' },
                                        { value: 'ADMIN', label: 'Administrador', desc: 'Acceso completo' }
                                    ].map((rol) => (
                                        <div key={rol.value}>
                                            <label className="flex items-center p-3 border-2 border-slate-200 rounded-md cursor-pointer hover:border-[#224666] transition-colors">
                                                <input
                                                    type="radio"
                                                    name="rol"
                                                    value={rol.value}
                                                    checked={formData.rol === rol.value}
                                                    onChange={handleInputChange}
                                                    className="hidden"
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

                            {/* Sector (para RESPONSABLE_SECTOR y OPERADOR) */}
                            {(formData.rol === 'RESPONSABLE_SECTOR' || formData.rol === 'OPERADOR') && (
                                <div>
                                    <label className="block font-medium text-slate-700 mb-1">
                                        Sector *
                                    </label>
                                    <select
                                        name="sectorId"
                                        value={formData.sectorId}
                                        onChange={handleInputChange}
                                        className={`w-full px-3 py-2 border rounded-md transition-colors ${errors.sectorId
                                                ? 'border-red-500'
                                                : 'border-slate-300'
                                            }`}
                                    >
                                        <option value="">
                                            {loadingSectores ? 'Cargando sectores...' : 'Seleccionar sector'}
                                        </option>
                                        {sectores.map(sector => (
                                            <option key={sector.id} value={sector.id}>
                                                {sector.codigo} - {sector.nombre}
                                            </option>
                                        ))}
                                    </select>

                                    {errors.sectorId && (
                                        <p className="text-red-600 mt-1">{errors.sectorId}</p>
                                    )}

                                    {/* Información sobre el sector */}
                                    <div className="mt-1.5 text-xs text-slate-600">
                                        {formData.rol === 'RESPONSABLE_SECTOR' ? (
                                            <p>Los responsables de sector deben tener un sector asignado</p>
                                        ) : (
                                            <p>Los operadores deben tener un sector asignado</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Botones */}
                    <div className="flex items-center justify-end space-x-3 pt-2 border-t border-slate-200">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={loading}
                            className="px-4 h-8 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center px-4 h-8 bg-[#224666] text-white rounded-md hover:bg-[#2c3e50] transition-colors disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Creando...
                                </>
                            ) : (
                                <>
                                    <Save sx={{ fontSize: '20px' }} className="mr-2" />
                                    Crear Empleado
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CrearEmpleadoModal;