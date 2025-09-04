// src/components/GenerarReporteModal.jsx
import React, { useState } from 'react';

const GenerarReporteModal = ({ isOpen, onClose, onSubmit, loading }) => {
    const [fi, setFi] = useState('');
    const [ff, setFf] = useState('');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] bg-black/30 flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
                <h3 className="text-lg font-semibold text-slate-900">Generar reporte resumen</h3>
                <p className="text-slate-600 text-sm mb-4">Seleccione el período (máx. 6 meses).</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm text-slate-700 mb-1">Desde</label>
                        <input type="date" value={fi} onChange={(e) => setFi(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-700 mb-1">Hasta</label>
                        <input type="date" value={ff} onChange={(e) => setFf(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
                    </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                    <button onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
                    <button
                        onClick={() => onSubmit(fi, ff)}
                        disabled={!fi || !ff || loading}
                        className="px-4 py-2 bg-[#224666] text-white rounded-lg hover:bg-[#2c3e50] disabled:opacity-50"
                    >
                        {loading ? 'Generando…' : 'Generar'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GenerarReporteModal;
