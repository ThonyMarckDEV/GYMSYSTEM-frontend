import { useEffect, useRef } from 'react';
import { EVENTO_REFRESCAR } from 'components/Shared/PanelLateral';

/** Recarga el listado cuando se cierra el panel lateral de crear/editar. */
export const useRefrescarLista = (recargar) => {
    const ref = useRef(recargar);
    ref.current = recargar;
    useEffect(() => {
        const fn = () => ref.current?.();
        window.addEventListener(EVENTO_REFRESCAR, fn);
        return () => window.removeEventListener(EVENTO_REFRESCAR, fn);
    }, []);
};
