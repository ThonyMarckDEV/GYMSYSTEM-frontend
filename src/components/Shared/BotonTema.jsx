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
            className="fixed top-3 right-3 md:top-4 md:right-5 z-[45] w-11 h-11 rounded-full flex items-center justify-center
                bg-secondary text-primary border border-primary/40 shadow-lg transition-transform duration-200
                hover:scale-110 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
            <span className="relative w-6 h-6" aria-hidden>
                <MoonIcon className={`absolute inset-0 w-6 h-6 transition-all duration-300 ${oscuro ? 'opacity-0 -rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'}`} />
                <SunIcon className={`absolute inset-0 w-6 h-6 transition-all duration-300 ${oscuro ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-50'}`} />
            </span>
        </button>
    );
};

export default BotonTema;
