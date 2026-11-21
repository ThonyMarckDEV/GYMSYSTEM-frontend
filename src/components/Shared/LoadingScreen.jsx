import React, { createContext, useContext } from 'react';
import { useEnPanel } from 'components/Shared/PanelLateral';

/** true dentro del layout con menú lateral (la carga no debe tapar el menú). */
export const EnLayoutContext = createContext(false);

const Bloque = ({ className = '' }) => <div className={`bg-slate-200/80 rounded-md ${className}`} />;

/** Esqueleto de un formulario (dentro del panel lateral). */
const EsqueletoFormulario = () => (
    <div className="p-6 animate-pulse" aria-busy="true" aria-label="Cargando">
        <div className="flex items-center gap-3 mb-6 pr-12">
            <Bloque className="w-9 h-9 rounded-lg" />
            <div className="space-y-2 flex-1">
                <Bloque className="h-4 w-40" />
                <Bloque className="h-3 w-28" />
            </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
            <Bloque className="h-4 w-44" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                        <Bloque className="h-3 w-24" />
                        <Bloque className="h-10 w-full rounded-lg" />
                    </div>
                ))}
            </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
            <Bloque className="h-10 w-24 rounded-lg" />
            <Bloque className="h-10 w-36 rounded-lg" />
        </div>
    </div>
);

/** Esqueleto de una página del sistema (no tapa el menú lateral). */
const EsqueletoPagina = () => (
    <div className="container mx-auto p-6 animate-pulse" aria-busy="true" aria-label="Cargando">
        <div className="flex items-center gap-3.5 pb-5 mb-6 border-b border-slate-200">
            <Bloque className="w-11 h-11 rounded-xl" />
            <div className="space-y-2">
                <Bloque className="h-6 w-48" />
                <Bloque className="h-3.5 w-64" />
            </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {[0, 1, 2].map(i => (
                <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
                    <Bloque className="h-3 w-24" />
                    <Bloque className="h-7 w-20" />
                </div>
            ))}
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            {[0, 1, 2, 3, 4].map(i => <Bloque key={i} className="h-10 w-full rounded-lg" />)}
        </div>
    </div>
);

/** Carga a pantalla completa (al iniciar o cerrar sesión). */
const PantallaCompleta = () => (
    <div className="pantalla-carga fixed inset-0 z-50 bg-[#f6f7f9] flex items-center justify-center" aria-busy="true" aria-label="Cargando">
        <div className="w-8 h-8 border-[3px] border-slate-200 border-t-slate-900 rounded-full animate-spin" />
    </div>
);

const LoadingScreen = () => {
    const enPanel = useEnPanel();
    const enLayout = useContext(EnLayoutContext);
    if (enPanel) return <EsqueletoFormulario />;
    if (enLayout) return <EsqueletoPagina />;
    return <PantallaCompleta />;
};

export default LoadingScreen;
