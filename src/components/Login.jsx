import React, { useState } from 'react';
import {
    Person,
    Lock,
    Visibility,
    VisibilityOff,
    Login as LoginIcon
} from '@mui/icons-material';

const Login = ({ onLogin, loading = false, error = null }) => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        rememberMe: false
    });
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.username.trim() && formData.password) {
            onLogin(formData);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo/Header */}
                <div className="text-center mb-8">
                    <div className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mb-4">
                        <Person className="text-white text-3xl" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Sistema de Turnos
                    </h1>
                    <p className="text-gray-600">
                        Municipalidad San Antonio
                    </p>
                </div>

                {/* Formulario */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <div className="flex items-center">
                                    <div className="text-red-600 text-sm">
                                        {error}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Username Field */}
                        <div className="space-y-2">
                            <label htmlFor="username" className="text-sm font-medium text-gray-700">
                                Usuario
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Person className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    autoComplete="username"
                                    required
                                    value={formData.username}
                                    onChange={handleChange}
                                    disabled={loading}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    placeholder="Ingrese su usuario"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium text-gray-700">
                                Contraseña
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    disabled={loading}
                                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    placeholder="Ingrese su contraseña"
                                />
                                <button
                                    type="button"
                                    onClick={togglePasswordVisibility}
                                    disabled={loading}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {showPassword ? (
                                        <VisibilityOff className="h-5 w-5" />
                                    ) : (
                                        <Visibility className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Remember Me */}
                        <div className="flex items-center">
                            <input
                                id="rememberMe"
                                name="rememberMe"
                                type="checkbox"
                                checked={formData.rememberMe}
                                onChange={handleChange}
                                disabled={loading}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                            <label htmlFor="rememberMe" className="ml-3 text-sm text-gray-600">
                                Recordarme en este dispositivo
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading || !formData.username.trim() || !formData.password}
                            className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Iniciando sesión...
                                </>
                            ) : (
                                <>
                                    <LoginIcon className="mr-2 h-4 w-4" />
                                    Iniciar Sesión
                                </>
                            )}
                        </button>
                    </form>

                    {/* Additional Info */}
                    <div className="mt-6 text-center">
                        <p className="text-xs text-gray-500">
                            Para soporte técnico, contacte al administrador del sistema
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-6 text-sm text-gray-500">
                    © 2025 Sistema de Gestión de Turnos - San Antonio
                </div>
            </div>
        </div>
    );
};

export default Login;