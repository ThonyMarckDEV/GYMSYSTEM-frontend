import { useCallback, useEffect, useState } from 'react';
import { obtenerTema, cambiarTema, EVENTO_TEMA } from 'utilities/Tema/tema';

/** Tema actual y cómo alternarlo (todos los componentes que lo usan se sincronizan). */
export const useTema = () => {
    const [tema, setTema] = useState(obtenerTema);

    useEffect(() => {
        const alCambiar = (e) => setTema(e.detail);
        window.addEventListener(EVENTO_TEMA, alCambiar);
        return () => window.removeEventListener(EVENTO_TEMA, alCambiar);
    }, []);

    const alternar = useCallback(() => cambiarTema(tema === 'oscuro' ? 'claro' : 'oscuro'), [tema]);

    return { tema, oscuro: tema === 'oscuro', alternar };
};
