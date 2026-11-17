import { fetchWithAuth } from 'js/authToken';

const mensajeDeError = async (response, porDefecto) => {
    try {
        const data = await response.json();
        return (Array.isArray(data.details) ? data.details[0] : data.details) || data.message || porDefecto;
    } catch {
        return porDefecto;
    }
};

/**
 * Imágenes de MinIO (comprobantes, QR, logo, fotos): el endpoint protegido
 * verifica el permiso y devuelve una URL TEMPORAL FIRMADA de la API
 * (/api/archivo/...) que solo sirve para esa imagen y vence en minutos.
 * Se usa directo en <img src>; nunca se ve la URL real del bucket.
 */
export const obtenerUrlFirmada = async (url) => {
    const response = await fetchWithAuth(url, { method: 'GET' });
    if (!response.ok) throw new Error(await mensajeDeError(response, 'No se pudo obtener la imagen.'));
    const data = await response.json();
    const firmada = data?.data?.url;
    if (!firmada) throw new Error('No se pudo obtener la imagen.');
    return firmada;
};

/**
 * Archivos generados al momento (ticket PDF): se descargan con el token y se
 * devuelve una URL local (blob:) para el visor. Quien la use debe liberarla
 * con URL.revokeObjectURL cuando ya no la necesite.
 */
export const obtenerArchivoUrl = async (url) => {
    const response = await fetchWithAuth(url, { method: 'GET', headers: { Accept: '*/*' } });
    if (!response.ok) throw new Error(await mensajeDeError(response, 'No se pudo obtener el archivo.'));
    const blob = await response.blob();
    return URL.createObjectURL(blob);
};
