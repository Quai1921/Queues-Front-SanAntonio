import React, { useState, useEffect } from 'react';
import {
    Close,
    Lock,
    Save,
    Visibility,
    VisibilityOff,
    Security
} from '@mui/icons-material';

/**
 * Modal para cambiar la contraseña de un empleado
 */
const CambiarPasswordModal = ({ isOpen, onClose, onSubmit, empleado, loading = false }) => {
    const [formData, setFormData] = useState({
        nuevaPassword: '',
        confirmarPassword: ''
    });

    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Reset form cuando se abre el modal
    useEffect(() => {
        if (isOpen) {
            setFormData({
                nuevaPassword: '',
                confirmarPassword: ''
            });
            setErrors({});
            setShowPassword(false);
            setShowConfirmPassword(false);
        }
    }, [isOpen]);

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

        // Nueva contraseña
        if (!formData.nuevaPassword.trim()) {
            newErrors.nuevaPassword = 'La nueva contraseña es requerida';
        } else if (formData.nuevaPassword.length < 6) {
            newErrors.nuevaPassword = 'La contraseña debe tener al menos 6 caracteres';
        }

        // Confirmar contraseña
        if (!formData.confirmarPassword.trim()) {
            newErrors.confirmarPassword = 'Debes confirmar la nueva contraseña';
        } else if (formData.nuevaPassword !== formData.confirmarPassword) {
            newErrors.confirmarPassword = 'Las contraseñas no coinciden';
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
        const passwordData = {
            nuevaPassword: formData.nuevaPassword,
            confirmarPassword: formData.confirmarPassword
        };

        onSubmit(passwordData);
    };

    const handleClose = () => {
        if (!loading) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-slate-50">
                    <div className="flex items-center">
                        <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center mr-3">
                            <Lock className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900">Cambiar Contraseña</h2>
                            <p className="text-sm text-slate-600">
                                {empleado ? `Usuario: @${empleado.username}` : 'Cargando...'}
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

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-4">
                        {/* Información del empleado */}
                        <div className="bg-slate-50 p-3 rounded-lg">
                            <div className="flex items-center justify-between text-sm">
                                <div>
                                    <p className="font-medium text-slate-900">
                                        {empleado?.nombreCompleto}
                                    </p>
                                    <p className="text-slate-600">
                                        {empleado?.email || 'Sin email registrado'}
                                    </p>
                                </div>
                                <div className="flex items-center">
                                    <Security className="h-4 w-4 text-slate-400 mr-1" />
                                    <span className={`text-xs px-2 py-1 rounded-full ${empleado?.activo
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                        }`}>
                                        {empleado?.activo ? 'Activo' : 'Inactivo'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Nueva contraseña */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Nueva Contraseña *
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="nuevaPassword"
                                    value={formData.nuevaPassword}
                                    onChange={handleInputChange}
                                    placeholder="Mínimo 6 caracteres"
                                    className={`w-full px-3 py-2 pr-10 border rounded-lg transition-colors ${errors.nuevaPassword ? 'border-red-300' : 'border-slate-300'
                                        }`}
                                    disabled={loading}
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <VisibilityOff className="h-4 w-4" /> : <Visibility className="h-4 w-4" />}
                                </button>
                            </div>
                            {errors.nuevaPassword && (
                                <p className="text-red-600 text-sm mt-1">{errors.nuevaPassword}</p>
                            )}
                        </div>

                        {/* Confirmar contraseña */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Confirmar Nueva Contraseña *
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    name="confirmarPassword"
                                    value={formData.confirmarPassword}
                                    onChange={handleInputChange}
                                    placeholder="Repetir la nueva contraseña"
                                    className={`w-full px-3 py-2 pr-10 border rounded-lg transition-colors ${errors.confirmarPassword ? 'border-red-300' : 'border-slate-300'
                                        }`}
                                    disabled={loading}
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    tabIndex={-1}
                                >
                                    {showConfirmPassword ? <VisibilityOff className="h-4 w-4" /> : <Visibility className="h-4 w-4" />}
                                </button>
                            </div>
                            {errors.confirmarPassword && (
                                <p className="text-red-600 text-sm mt-1">{errors.confirmarPassword}</p>
                            )}
                        </div>

                        {/* Validador visual de contraseñas */}
                        {formData.nuevaPassword && formData.confirmarPassword && (
                            <div className="flex items-center space-x-2 text-sm">
                                <div className={`w-3 h-3 rounded-full ${formData.nuevaPassword === formData.confirmarPassword
                                        ? 'bg-green-500'
                                        : 'bg-red-500'
                                    }`}></div>
                                <span className={
                                    formData.nuevaPassword === formData.confirmarPassword
                                        ? 'text-green-700'
                                        : 'text-red-700'
                                }>
                                    {formData.nuevaPassword === formData.confirmarPassword
                                        ? 'Las contraseñas coinciden'
                                        : 'Las contraseñas no coinciden'}
                                </span>
                            </div>
                        )}

                        {/* Advertencias de seguridad */}
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                            <div className="flex items-start">
                                <div className="w-5 h-5 text-amber-600 mt-0.5">🔒</div>
                                <div className="ml-3 text-sm">
                                    <p className="text-amber-800 font-medium">Recomendaciones de Seguridad</p>
                                    <ul className="text-amber-700 mt-1 space-y-1">
                                        <li>• Usa al menos 6 caracteres</li>
                                        <li>• Combina letras, números y símbolos</li>
                                        <li>• Evita usar datos personales obvios</li>
                                        <li>• El empleado deberá cambiarla en su próximo acceso</li>
                                    </ul>
                                </div>
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
                            disabled={loading || !formData.nuevaPassword || !formData.confirmarPassword}
                            className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Cambiando...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Cambiar Contraseña
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CambiarPasswordModal;