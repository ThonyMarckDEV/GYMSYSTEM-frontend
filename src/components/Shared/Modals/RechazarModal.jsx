// components/Shared/Modals/RechazarModal.jsx
import React, { useState } from 'react';
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const RechazarModal = ({ isOpen, onClose, onConfirm, loading = false }) => {
    const [motivo, setMotivo] = useState('');

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (!motivo.trim()) return;
        onConfirm(motivo.trim());
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-elegant-gold w-full max-w-md overflow-hidden border border-primary/20">
                <div className="flex justify-between items-center px-6 py-4 border-b border-primary/20 bg-secondary">
                    <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                        <ExclamationTriangleIcon className="w-5 h-5" /> Rechazar Solicitud
                    </h3>
                    <button onClick={onClose} className="text-primary/60 hover:text-primary transition-colors">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6">
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Motivo del rechazo <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        value={motivo}
                        onChange={(e) => setMotivo(e.target.value)}
                        rows={3}
                        className="w-full p-2.5 text-sm text-secondary border border-slate-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none resize-none"
                        placeholder="Ej: La imagen no corresponde al monto del plan seleccionado."
                    />
                </div>

                <div className="px-6 py-4 bg-primary-light/40 border-t border-primary/20 flex justify-end gap-3">
                    <button onClick={onClose} disabled={loading}
                        className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg font-bold hover:bg-slate-200 transition-colors uppercase text-sm disabled:opacity-50">
                        Cancelar
                    </button>
                    <button onClick={handleConfirm} disabled={loading || !motivo.trim()}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold uppercase tracking-wide text-sm transition-colors disabled:opacity-50">
                        {loading ? 'Rechazando...' : 'Rechazar'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RechazarModal;