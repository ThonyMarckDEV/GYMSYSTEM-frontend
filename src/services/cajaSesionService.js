import { fetchWithAuth } from 'js/authToken';
import API_BASE_URL from 'js/urlHelper';
import { handleResponse } from 'utilities/Responses/handleResponse';

const BASE_URL = `${API_BASE_URL}/api/cajaSesion`;

export const actual = async () => handleResponse(await fetchWithAuth(`${BASE_URL}/actual`, { method: 'GET' }));

/** data: { caja_id, monto_apertura, observaciones? } */
export const abrir = async (data) =>
    handleResponse(await fetchWithAuth(`${BASE_URL}/abrir`, { method: 'POST', body: JSON.stringify(data) }));

/** Turno de caja. data: { monto_contado } o { desglose: { "200": 1, "0.5": 4 } }, observaciones */
export const cerrar = async (data) =>
    handleResponse(await fetchWithAuth(`${BASE_URL}/cerrar`, { method: 'POST', body: JSON.stringify(data) }));

export const buscarCliente = async (dni) =>
    handleResponse(await fetchWithAuth(`${BASE_URL}/buscarCliente?dni=${encodeURIComponent(dni)}`, { method: 'GET' }));

export const cobrar = async (clienteId, data) =>
    handleResponse(await fetchWithAuth(`${BASE_URL}/cobrar/${clienteId}`, { method: 'POST', body: JSON.stringify(data) }));

export const index = async (page = 1, filters = {}) => {
    const params = new URLSearchParams({
        page,
        estado:      filters.estado || '',
        fecha_desde: filters.fecha_desde || '',
        fecha_hasta: filters.fecha_hasta || '',
    });
    return handleResponse(await fetchWithAuth(`${BASE_URL}/index?${params.toString()}`, { method: 'GET' }));
};

export const show = async (id) => handleResponse(await fetchWithAuth(`${BASE_URL}/show/${id}`, { method: 'GET' }));
