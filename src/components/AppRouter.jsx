// components/AppRouter.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthGuard from './AuthGuard';
import LoginPage from '../pages/LoginPage';
import Dashboard from '../pages/Dashboard';
import AdminPanel from '../pages/AdminPanel';
import Unauthorized from '../pages/Unauthorized';

function AppRouter() {
    return (
        <Routes>
            {/* Rutas públicas */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* Página de error de permisos (opcional) */}
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            {/* Rutas protegidas */}
            <Route path="/dashboard" element={
                <AuthGuard>
                    <Dashboard />
                </AuthGuard>
            } />
            
            {/* Ruta admin solo para ADMIN y RESPONSABLE_SECTOR */}
            <Route path="/admin" element={
                <AuthGuard requireRoles={['ADMIN', 'RESPONSABLE_SECTOR']}>
                    <AdminPanel />
                </AuthGuard>
            } />
            
            {/* Ruta por defecto - redirige a dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Ruta 404 - opcional */}
            <Route path="*" element={
                <AuthGuard>
                    <div>Página no encontrada</div>
                </AuthGuard>
            } />
        </Routes>
    );
}

export default AppRouter;