import { fetchWithAuth } from 'js/authToken';

/**
 * Descarga un archivo protegido (Excel, PDF...) con la sesión del usuario
 * y lo guarda con el nombre que manda el backend (Content-Disposition).
 * Lanza un Error con el mensaje del backend si no se pudo generar.
 */
export const descargarArchivo = async (url, nombrePorDefecto = 'reporte.xlsx') => {
    const res = await fetchWithAuth(url, { method: 'GET', headers: { Accept: 'application/json' } });

    if (!res.ok) {
        let mensaje = 'No se pudo generar el archivo.';
        try {
            const json = await res.json();
            mensaje = json.details && typeof json.details === 'string' ? json.details : json.message || mensaje;
        } catch { /* respuesta sin JSON */ }
        throw new Error(res.status === 403 ? 'No tienes permiso para descargar este reporte.' : mensaje);
    }

    const disposition = res.headers.get('Content-Disposition') || '';
    const nombre = disposition.match(/filename="?([^";]+)"?/i)?.[1] || nombrePorDefecto;

    const blob = await res.blob();
    const enlace = document.createElement('a');
    enlace.href = URL.createObjectURL(blob);
    enlace.download = nombre;
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
    setTimeout(() => URL.revokeObjectURL(enlace.href), 1000);
    return nombre;
};

/** Arma la query string ignorando los filtros vacíos. */
export const query = (filtros = {}) => {
    const params = new URLSearchParams();
    Object.entries(filtros).forEach(([k, v]) => { if (v !== '' && v !== null && v !== undefined) params.append(k, v); });
    const s = params.toString();
    return s ? `?${s}` : '';
};
