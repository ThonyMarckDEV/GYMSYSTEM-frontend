import { fetchWithAuth } from 'js/authToken';
import API_BASE_URL from 'js/urlHelper';
import { handleResponse } from 'utilities/Responses/handleResponse';

const BASE_URL = `${API_BASE_URL}/api/pago`;

export const index = async (page = 1, filters = {}) => {
    const params = new URLSearchParams({
        page,
        search:      filters.search || '',
        estado:      filters.estado || '',
        metodo_pago: filters.metodo_pago || '',
        origen:      filters.origen || '',
        concepto:    filters.concepto || '',
        fecha_desde: filters.fecha_desde || '',
        fecha_hasta: filters.fecha_hasta || '',
    });
    const response = await fetchWithAuth(`${BASE_URL}/index?${params.toString()}`, { method: 'GET' });
    return handleResponse(response);
};

export const show = async (id) => handleResponse(await fetchWithAuth(`${BASE_URL}/show/${id}`, { method: 'GET' }));

export const verificar = async (id) =>
    handleResponse(await fetchWithAuth(`${BASE_URL}/verificar/${id}`, { method: 'PATCH' }));

export const rechazar = async (id, motivo) =>
    handleResponse(await fetchWithAuth(`${BASE_URL}/rechazar/${id}`, { method: 'PATCH', body: JSON.stringify({ motivo }) }));

export const anular = async (id, pin, motivo) =>
    handleResponse(await fetchWithAuth(`${BASE_URL}/anular/${id}`, { method: 'PATCH', body: JSON.stringify({ pin, motivo }) }));

/** URLs de archivos protegidos (se abren con obtenerArchivoUrl) */
export const comprobanteUrl = (id) => `${BASE_URL}/comprobante/${id}`;
export const ticketUrl = (id) => `${BASE_URL}/ticket/${id}`;
