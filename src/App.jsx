import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Login from './components/Login.jsx';
import Unauthorized from './components/Unauthorized.jsx';
import Dashboard from './components/Dashboard.jsx';
import AdminPanel from './components/AdminPanel.jsx';
import ResponsablePanel from './components/ResponsablePanel.jsx';
import OperadorPanel from './components/OperadorPanel.jsx';

function App() {

  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Ruta pública de login */}
            <Route path="/login" element={<Login />} />

            {/* Ruta de acceso no autorizado */}
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Dashboard principal - protegido para todos los usuarios autenticados */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* Panel de administración - solo para ADMIN */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <AdminPanel />
                </ProtectedRoute>
              }
            />

            {/* Panel de responsable - para ADMIN y RESPONSABLE_SECTOR */}
            <Route
              path="/responsable/*"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'RESPONSABLE_SECTOR']}>
                  <ResponsablePanel />
                </ProtectedRoute>
              }
            />

            {/* Panel de operador - para todos los roles autenticados */}
            <Route
              path="/operador/*"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'RESPONSABLE_SECTOR', 'OPERADOR']}>
                  <OperadorPanel />
                </ProtectedRoute>
              }
            />

            {/* Ruta raíz - redirigir al dashboard */}
            <Route
              path="/"
              element={<Navigate to="/dashboard" replace />}
            />

            {/* Ruta catch-all para páginas no encontradas */}
            <Route
              path="*"
              element={
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                    <p className="text-gray-600 mb-8">Página no encontrada</p>
                    <button
                      onClick={() => window.location.href = '/dashboard'}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Volver al inicio
                    </button>
                  </div>
                </div>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App
