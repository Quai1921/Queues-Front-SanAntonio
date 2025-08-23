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

    const year = new Date().getFullYear();

    return (
        <main className="min-h-screen w-full flex items-center justify-center bg-slate-100 p-4">
            <div className="w-full max-w-md">
                {/* Card Container */}
                <div className="rounded-2xl shadow-2xl overflow-hidden bg-white border border-slate-200">
                    {/* Header */}
                    <div className="px-8 py-10 bg-[#224666] text-white">
                        <div className="flex justify-center items-center mb-6">
                            <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20">
                                <img
                                    src="/SanAntonioArredondoWhite.avif"
                                    alt="Escudo San Antonio de Arredondo"
                                    className="w-12 h-12 object-contain"
                                />
                            </div>
                        </div>

                        <div className="text-center">
                            <h1 className="text-2xl font-bold mb-2">Portal de Atención Municipal</h1>
                            <p className="text-white/90 text-xl">Municipalidad San Antonio de Arredondo</p>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="px-8 py-10">
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
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                                className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-[#5F78AD] hover:bg-[#4B6B9A] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
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
                    </div>

                    {/* Footer */}
                    <div className="text-center mt-2 text-sm text-gray-500 pb-8">
                        <p>© {year} Portal de Atención Municipal</p>
                        <p>Municipalidad de San Antonio de Arredondo</p>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default Login;