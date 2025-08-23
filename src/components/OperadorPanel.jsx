import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const OperadorPanel = () => {
    const { getUser } = useAuth();
    const user = getUser();

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Panel de Operador</h1>
                    <p className="text-gray-600 mt-2">Bienvenido {user?.nombre}, gestiona los turnos desde aquí.</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Panel de Operación</h2>
                    <p className="text-gray-600">Este panel estará disponible próximamente.</p>
                    <p className="text-sm text-gray-500 mt-2">Aquí podrás llamar turnos, generar nuevos turnos y atender ciudadanos.</p>
                </div>
            </div>
        </div>
    );
};

export default OperadorPanel;