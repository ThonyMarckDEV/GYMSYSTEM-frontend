import React from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const ConfirmModal = ({ 
    title = "¿Estás seguro?", 
    message, 
    onConfirm, 
    onCancel, 
    confirmText = 'Sí, continuar', 
    cancelText = 'Cancelar' 
}) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            <div 
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
                onClick={onCancel}
            ></div>

            <div className="relative bg-white rounded-2xl shadow-elegant-gold w-full max-w-sm overflow-hidden aparecer-abajo">
                
                <div className="p-6">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 mb-4">
                        <ExclamationTriangleIcon className="h-6 w-6 text-amber-600" aria-hidden="true" />
                    </div>

                    <div className="text-center">
                        <h3 className="text-lg font-semibold text-slate-900">
                            {title}
                        </h3>
                        <div className="mt-2">
                            <p className="text-sm text-slate-500">
                                {message}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="px-6 pb-6 flex flex-col-reverse sm:flex-row gap-3">
                    
                    <button
                        type="button"
                        onClick={onCancel}
                        className="w-full sm:flex-1 inline-flex justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all active:scale-[0.98]"
                    >
                        {cancelText}
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        className="w-full sm:flex-1 inline-flex justify-center rounded-lg bg-secondary px-4 py-2.5 text-sm font-semibold text-white hover:bg-black/80 transition-all active:scale-[0.98]"
                    >
                        {confirmText}
                    </button>

                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;