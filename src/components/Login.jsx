import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate, useLocation } from 'react-router-dom';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import ErrorIcon from '@mui/icons-material/Error';
import BusinessIcon from '@mui/icons-material/Business';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, isAuthenticated, isLoading, error, clearError } = useAuth();

    const [formData, setFormData] = useState({
        username: '',
        password: '',
        rememberMe: false
    });

    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});

    // Redirigir si ya está autenticado
    useEffect(() => {
        if (isAuthenticated) {
            const from = location.state?.from?.pathname || '/dashboard';
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, navigate, location.state]);

    // Limpiar errores cuando el componente se monta
    useEffect(() => {
        if (error) {
            clearError();
        }
    }, []);

    // Manejar cambios en el formulario
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Limpiar error del campo específico
        if (validationErrors[name]) {
            setValidationErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }

        // Limpiar error general
        if (error) {
            clearError();
        }
    };

    // Validar formulario
    const validateForm = () => {
        const errors = {};

        if (!formData.username.trim()) {
            errors.username = 'El nombre de usuario es requerido';
        } else if (formData.username.length < 3) {
            errors.username = 'El nombre de usuario debe tener al menos 3 caracteres';
        }

        if (!formData.password) {
            errors.password = 'La contraseña es requerida';
        } else if (formData.password.length < 6) {
            errors.password = 'La contraseña debe tener al menos 6 caracteres';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Manejar envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            const result = await login(formData);
            if (!result.success) {
                console.error('Error en login:', result.message);
            }
        } catch (error) {
            console.error('Error inesperado en login:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Mostrar loading si está cargando la autenticación inicial
    if (isLoading && !isSubmitting) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                {/* Logo y título */}
                <div className="flex justify-center">
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <BusinessIcon className="w-8 h-8 text-white" />
                    </div>
                </div>

                <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
                    Sistema de Turnos
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    San Antonio - Iniciar Sesión
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10">

                    {/* Error general */}
                    {error && (
                        <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <ErrorIcon className="h-5 w-5 text-red-400" />
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800">
                                        Error de autenticación
                                    </h3>
                                    <div className="mt-1 text-sm text-red-700">
                                        {error}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {/* Campo Usuario */}
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium leading-6 text-gray-900">
                                Usuario
                            </label>
                            <div className="relative mt-2">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <PersonIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    autoComplete="username"
                                    required
                                    value={formData.username}
                                    onChange={handleChange}
                                    className={`block w-full rounded-lg border-0 py-3 pl-10 pr-3 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 ${validationErrors.username
                                            ? 'ring-red-300 focus:ring-red-600'
                                            : 'ring-gray-300'
                                        }`}
                                    placeholder="Ingresa tu usuario"
                                    disabled={isSubmitting}
                                />
                            </div>
                            {validationErrors.username && (
                                <p className="mt-1 text-sm text-red-600">{validationErrors.username}</p>
                            )}
                        </div>

                        {/* Campo Contraseña */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                                Contraseña
                            </label>
                            <div className="relative mt-2">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <LockIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={`block w-full rounded-lg border-0 py-3 pl-10 pr-10 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 ${validationErrors.password
                                            ? 'ring-red-300 focus:ring-red-600'
                                            : 'ring-gray-300'
                                        }`}
                                    placeholder="Ingresa tu contraseña"
                                    disabled={isSubmitting}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowPassword(!showPassword)}
                                    tabIndex={-1}
                                >
                                    {showPassword ? (
                                        <VisibilityOff className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-pointer" />
                                    ) : (
                                        <Visibility className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-pointer" />
                                    )}
                                </button>
                            </div>
                            {validationErrors.password && (
                                <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
                            )}
                        </div>

                        {/* Recordar sesión */}
                        <div className="flex items-center">
                            <input
                                id="rememberMe"
                                name="rememberMe"
                                type="checkbox"
                                checked={formData.rememberMe}
                                onChange={handleChange}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                                disabled={isSubmitting}
                            />
                            <label htmlFor="rememberMe" className="ml-3 block text-sm leading-6 text-gray-900">
                                Recordar sesión
                            </label>
                        </div>

                        {/* Botón de envío */}
                        <div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex w-full justify-center rounded-lg bg-blue-600 px-3 py-3 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                            >
                                {isSubmitting ? (
                                    <div className="flex items-center">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                        Iniciando sesión...
                                    </div>
                                ) : (
                                    'Iniciar Sesión'
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Footer */}
                    <div className="mt-8 text-center">
                        <p className="text-xs text-gray-500">Sistema de Gestión de Turnos</p>
                        <p className="text-xs text-gray-400 mt-1">Municipalidad de San Antonio</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;