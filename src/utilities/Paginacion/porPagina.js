// Cuántas filas por página muestra cada tabla. Se recuerda por tabla en el
// navegador; el backend solo acepta estos valores (ver App\Support\Paginacion).

export const OPCIONES_POR_PAGINA = [5, 10, 15, 20, 25, 50, 100];
export const POR_PAGINA_DEFECTO = 10;

const memoria = {};
const clave = (tabla) => `gym:porPagina:${tabla}`;

export const porPagina = (tabla) => {
    if (!tabla) return POR_PAGINA_DEFECTO;
    if (memoria[tabla]) return memoria[tabla];
    let n = POR_PAGINA_DEFECTO;
    try { n = Number(localStorage.getItem(clave(tabla))) || POR_PAGINA_DEFECTO; } catch { /* sin almacenamiento */ }
    memoria[tabla] = OPCIONES_POR_PAGINA.includes(n) ? n : POR_PAGINA_DEFECTO;
    return memoria[tabla];
};

export const setPorPagina = (tabla, n) => {
    if (!tabla || !OPCIONES_POR_PAGINA.includes(Number(n))) return;
    memoria[tabla] = Number(n);
    try { localStorage.setItem(clave(tabla), String(n)); } catch { /* sin almacenamiento */ }
};
