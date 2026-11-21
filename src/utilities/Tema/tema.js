// Tema claro / oscuro de toda la app.
// Se guarda en el navegador; si nunca eligió, sigue la preferencia del sistema operativo.

const CLAVE = 'gym:tema';
const EVENTO = 'gym:tema-cambio';

const leer = () => { try { return localStorage.getItem(CLAVE); } catch { return null; } };
const guardar = (v) => { try { localStorage.setItem(CLAVE, v); } catch { /* sin almacenamiento */ } };

export const temaDelSistema = () =>
    (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches) ? 'oscuro' : 'claro';

/** 'oscuro' | 'claro' */
export const obtenerTema = () => {
    const t = leer();
    return t === 'oscuro' || t === 'claro' ? t : temaDelSistema();
};

/** Pone o quita la clase `dark` en <html> (Tailwind darkMode: 'class'). */
export const aplicarTema = (tema) => {
    const html = document.documentElement;
    html.classList.toggle('dark', tema === 'oscuro');
    html.style.colorScheme = tema === 'oscuro' ? 'dark' : 'light';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', tema === 'oscuro' ? '#0f1218' : '#FFC700');
};

export const cambiarTema = (tema) => {
    guardar(tema);
    aplicarTema(tema);
    window.dispatchEvent(new CustomEvent(EVENTO, { detail: tema }));
};

export const EVENTO_TEMA = EVENTO;
