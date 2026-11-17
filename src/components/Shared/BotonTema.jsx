import React from 'react';
import { MoonIcon, SunIcon } from '@heroicons/react/24/solid';
import { useTema } from 'hooks/useTema';

/**
 * Botón global del tema (arriba a la derecha, dentro del sistema):
 * luna = pasar a modo oscuro · sol = volver a modo claro.
 */
const BotonTema = () => {
    const { oscuro, alternar } = useTema();
    const texto = oscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro';

    return (
        <button type="button" onClick={alternar} title={texto} aria-label={texto} aria-pressed={oscuro}
            className="fixed top-3 right-3 md:top-4 md:right-5 z-[45] w-9 h-9 rounded-full flex items-center justify-center
                bg-transparent text-slate-500 hover:text-secondary hover:bg-slate-100 transition-colors duration-200
                active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            <span className="relative w-5 h-5" aria-hidden>
                <MoonIcon className={`absolute inset-0 w-5 h-5 transition-all duration-300 ${oscuro ? 'opacity-0 -rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'}`} />
                <SunIcon className={`absolute inset-0 w-5 h-5 text-primary transition-all duration-300 ${oscuro ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-50'}`} />
            </span>
        </button>
    );
};

export default BotonTema;
