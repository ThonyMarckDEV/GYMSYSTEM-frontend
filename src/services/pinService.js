import { fetchWithAuth } from 'js/authToken';
import API_BASE_URL from 'js/urlHelper';
import { handleResponse } from 'utilities/Responses/handleResponse';

const BASE_URL = `${API_BASE_URL}/api/pin`;

export const index = async (page = 1) =>
    handleResponse(await fetchWithAuth(`${BASE_URL}/index?page=${page}`, { method: 'GET' }));

export const usuarios = async (sucursalId = '') =>
    handleResponse(await fetchWithAuth(`${BASE_URL}/usuarios?sucursal_id=${sucursalId || ''}`, { method: 'GET' }));

/** data: { usuario_id, sucursal_id?, minutos_vigencia, max_usos, descripcion } → devuelve el PIN una sola vez */
export const store = async (data) =>
    handleResponse(await fetchWithAuth(`${BASE_URL}/store`, { method: 'POST', body: JSON.stringify(data) }));

export const revocar = async (id) =>
    handleResponse(await fetchWithAuth(`${BASE_URL}/revocar/${id}`, { method: 'PATCH' }));
