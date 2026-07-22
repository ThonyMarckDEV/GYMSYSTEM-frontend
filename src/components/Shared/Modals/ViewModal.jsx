import React, { useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const ViewModal = ({ isOpen, onClose, title, children, isLoading = false }) => {
    
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm transition-opacity">
            <div className="bg-white rounded-xl shadow-elegant-gold w-full max-w-3xl overflow-hidden transform transition-all border border-primary/20">
                
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-primary/20 bg-secondary">
                    <h3 className="text-lg font-bold text-primary">{title}</h3>
                    <button 
                        onClick={onClose} 
                        className="text-primary/60 hover:text-primary transition-colors"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 max-h-[80vh] overflow-y-auto text-secondary">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="w-10 h-10 border-4 border-primary-light border-t-primary rounded-full animate-spin mb-4"></div>
                            <p className="text-secondary/60 font-medium">Cargando detalles...</p>
                        </div>
                    ) : (
                        children
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-primary-light/40 border-t border-primary/20 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-secondary text-primary rounded-lg hover:bg-secondary/90 font-bold uppercase tracking-wide text-sm transition-colors"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewModal;