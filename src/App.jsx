import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import AuthGuard from './components/AuthGuard.jsx'; // Reemplaza ProtectedRoute
import LoginPage from './pages/LoginPage.jsx';
import Unauthorized from './components/Unauthorized.jsx';
import Dashboard from './pages/Dashboard.jsx';
import AdminPanel from './components/AdminPanel.jsx';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div>
          <Routes>
            {/* Ruta pública de login */}
            <Route path="/login" element={<LoginPage />} />

            {/* Ruta de acceso no autorizado */}
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Dashboard principal - protegido para todos los usuarios autenticados */}
            <Route
              path="/dashboard"
              element={
                <AuthGuard>
                  <Dashboard />
                </AuthGuard>
              }
            />

            {/* Panel de administración - solo para ADMIN */}
            <Route
              path="/admin/*"
              element={
                <AuthGuard requireRoles={['ADMIN']}>
                  <AdminPanel />
                </AuthGuard>
              }
            />

            {/* Panel de responsable - para ADMIN y RESPONSABLE_SECTOR */}
            {/* <Route
              path="/responsable/*"
              element={
                <AuthGuard requireRoles={['ADMIN', 'RESPONSABLE_SECTOR']}>
                  <ResponsablePanel />
                </AuthGuard>
              }
            /> */}

            {/* Panel de operador - para todos los roles autenticados */}
            {/* <Route
              path="/operador/*"
              element={
                <AuthGuard requireRoles={['ADMIN', 'RESPONSABLE_SECTOR', 'OPERADOR']}>
                  <OperadorPanel />
                </AuthGuard>
              }
            /> */}

            {/* Ruta raíz - redirigir al dashboard */}
            <Route
              path="/"
              element={<Navigate to="/dashboard" replace />}
            />

            {/* Ruta catch-all para páginas no encontradas */}
            <Route
              path="*"
              element={
                <AuthGuard>
                  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                      <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                      <p className="text-gray-600 mb-8">Página no encontrada</p>
                      <button
                        onClick={() => window.location.href = '/dashboard'}
                        className="px-4 py-2 bg-[#224666] text-white rounded-lg hover:bg-[#1a3a52] transition-colors"
                      >
                        Volver al inicio
                      </button>
                    </div>
                  </div>
                </AuthGuard>
              }
            />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;