import { fetchWithAuth } from 'js/authToken';

/**
 * Descarga un archivo protegido (comprobante, QR, ticket PDF) usando el token
 * y devuelve una URL local (blob:) para mostrarlo en <img> o en el visor de PDF.
 * Quien la use debe liberarla con URL.revokeObjectURL cuando ya no la necesite.
 */
export const obtenerArchivoUrl = async (url) => {
    const response = await fetchWithAuth(url, { method: 'GET', headers: { Accept: '*/*' } });

    if (!response.ok) {
        let message = 'No se pudo obtener el archivo.';
        try {
            const data = await response.json();
            message = (Array.isArray(data.details) ? data.details[0] : data.details) || data.message || message;
        } catch { /* respuesta no JSON */ }
        throw new Error(message);
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);
};
