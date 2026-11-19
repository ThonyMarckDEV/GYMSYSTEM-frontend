// components/Shared/Modals/CongelarModal.jsx
import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Snowflake } from 'lucide-react';

const CongelarModal = ({ isOpen, onClose, onConfirm, loading = false }) => {
    const [motivo, setMotivo] = useState('');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-elegant-gold w-full max-w-md overflow-hidden">
                <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
                    <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                        <Snowflake className="w-5 h-5" /> Congelar Membresía
                    </h3>
                    <button onClick={onClose} className="p-1.5 -mr-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors" aria-label="Cerrar">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Motivo (opcional)
                    </label>
                    <textarea
                        value={motivo}
                        onChange={(e) => setMotivo(e.target.value)}
                        rows={3}
                        className="w-full p-2.5 text-sm text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none resize-none"
                        placeholder="Ej: Viaje, lesión, motivo personal..."
                    />
                </div>

                <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                    <button onClick={onClose} disabled={loading}
                        className="px-4 py-2 bg-white text-slate-700 border border-slate-300 rounded-lg font-medium hover:bg-slate-50 transition-colors text-sm disabled:opacity-50">
                        Cancelar
                    </button>
                    <button onClick={() => onConfirm(motivo.trim() || null)} disabled={loading}
                        className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-black/80 font-semibold text-sm transition-colors disabled:opacity-50">
                        {loading ? 'Congelando...' : 'Congelar'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CongelarModal;