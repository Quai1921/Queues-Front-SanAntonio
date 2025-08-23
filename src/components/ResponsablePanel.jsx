import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const ResponsablePanel = () => {
    const { getUser } = useAuth();
    const user = getUser();

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Panel de Responsable</h1>
                    <p className="text-gray-600 mt-2">Bienvenido {user?.nombre}, supervisa tu sector desde aquí.</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Panel de Responsable de Sector</h2>
                    <p className="text-gray-600">Este panel estará disponible próximamente.</p>
                    <p className="text-sm text-gray-500 mt-2">Aquí podrás gestionar estadísticas, horarios y mensajes de tu sector.</p>
                </div>
            </div>
        </div>
    );
};

export default ResponsablePanel;