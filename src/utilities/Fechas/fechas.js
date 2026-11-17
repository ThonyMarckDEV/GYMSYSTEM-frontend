// Utilidades de fechas para el calendario (semana de lunes a domingo, hora local).

const pad = (n) => String(n).padStart(2, '0');

/** Date → 'YYYY-MM-DD' (en hora local, sin desfase de zona horaria) */
export const aISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** 'YYYY-MM-DD' → Date local a medianoche */
export const deISO = (s) => {
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, m - 1, d);
};

export const sumarDias = (d, n) => {
    const r = new Date(d);
    r.setDate(r.getDate() + n);
    return r;
};

/** Lunes de la semana de la fecha */
export const inicioSemana = (d) => {
    const r = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const dia = (r.getDay() + 6) % 7; // 0 = lunes
    return sumarDias(r, -dia);
};

export const diasDeSemana = (lunes) => Array.from({ length: 7 }, (_, i) => sumarDias(lunes, i));

export const esHoy = (d) => aISO(d) === aISO(new Date());

const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

export const nombreDia = (d, corto = false) => (corto ? DIAS[d.getDay()].slice(0, 3) : DIAS[d.getDay()]);
export const fechaCorta = (d) => `${d.getDate()} ${MESES[d.getMonth()]}`;

/** 'YYYY-MM-DD' → 'Lunes 18 nov' */
export const fechaLarga = (iso) => {
    const d = deISO(iso);
    return `${nombreDia(d)} ${fechaCorta(d)}`;
};

/** Rango legible de la semana: '17 – 23 nov 2026' */
export const rangoSemana = (lunes) => {
    const dom = sumarDias(lunes, 6);
    const mismoMes = lunes.getMonth() === dom.getMonth();
    return `${lunes.getDate()}${mismoMes ? '' : ' ' + MESES[lunes.getMonth()]} – ${dom.getDate()} ${MESES[dom.getMonth()]} ${dom.getFullYear()}`;
};
