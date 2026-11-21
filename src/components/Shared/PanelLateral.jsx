import React, { createContext, useContext, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';

/** true cuando el contenido se muestra dentro del panel lateral (los encabezados se compactan). */
export const PanelLateralContext = createContext(false);
export const useEnPanel = () => useContext(PanelLateralContext);

/** Evento que avisa a los listados que deben recargarse (se cerró un panel de edición). */
export const EVENTO_REFRESCAR = 'gym:refrescar-lista';

/**
 * Panel que se desliza desde la derecha para crear o editar sin salir del listado.
 * `volverA`: ruta del listado que queda detrás; cerrar = navegar ahí.
 */
const PanelLateral = ({ volverA, ancho = 'sm:max-w-2xl', children }) => {
    const navigate = useNavigate();
    const cerrar = () => navigate(volverA);

    useEffect(() => {
        const previo = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const tecla = (e) => { if (e.key === 'Escape') navigate(volverA); };
        window.addEventListener('keydown', tecla);
        return () => {
            document.body.style.overflow = previo;
            window.removeEventListener('keydown', tecla);
            // Al cerrarse (guardado o cancelado) el listado de atrás se actualiza
            window.dispatchEvent(new CustomEvent(EVENTO_REFRESCAR));
        };
    }, [navigate, volverA]);

    return createPortal(
        <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] panel-fondo" onClick={cerrar} />
            <aside className={`panel-lateral relative h-[100dvh] w-full ${ancho} bg-[#f6f7f9] shadow-elegant-gold flex flex-col`}>
                <div className="absolute top-3 right-3 z-10">
                    <button type="button" onClick={cerrar} aria-label="Cerrar panel"
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 bg-white border border-slate-200 shadow-card transition-colors">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto overscroll-contain">
                    <PanelLateralContext.Provider value={true}>
                        {children}
                    </PanelLateralContext.Provider>
                </div>
            </aside>
        </div>,
        document.body
    );
};

export default PanelLateral;
