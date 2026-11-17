import { fetchWithAuth } from 'js/authToken';
import API_BASE_URL from 'js/urlHelper';
import { handleResponse } from 'utilities/Responses/handleResponse';

const BASE_URL = `${API_BASE_URL}/api/producto`;
const json = (method, data) => ({ method, body: JSON.stringify(data ?? {}) });

/** filtros: { search, categoria, estado, sucursal_id, bajo_stock } — la respuesta incluye `resumen` */
export const index = async (page = 1, filtros = {}) => {
    const params = new URLSearchParams({
        page,
        search: filtros.search || '',
        categoria: filtros.categoria || '',
        estado: filtros.estado ?? '',
        sucursal_id: filtros.sucursal_id || '',
        bajo_stock: filtros.bajo_stock ? 1 : '',
    });
    return handleResponse(await fetchWithAuth(`${BASE_URL}/index?${params}`, { method: 'GET' }));
};

/** Productos activos con el stock de una sede (para traslados) */
export const combobox = async (sucursalId = '') =>
    handleResponse(await fetchWithAuth(`${BASE_URL}/combobox?sucursal_id=${sucursalId || ''}`, { method: 'GET' }));

export const store = async (data) => handleResponse(await fetchWithAuth(`${BASE_URL}/store`, json('POST', data)));
export const update = async (id, data) => handleResponse(await fetchWithAuth(`${BASE_URL}/update/${id}`, json('PUT', data)));
export const cambiarEstado = async (id) => handleResponse(await fetchWithAuth(`${BASE_URL}/status/${id}`, { method: 'PATCH' }));

/** Kardex del producto. filtros: { sucursal_id, tipo } */
export const kardex = async (id, page = 1, filtros = {}) => {
    const params = new URLSearchParams({ page, sucursal_id: filtros.sucursal_id || '', tipo: filtros.tipo || '' });
    return handleResponse(await fetchWithAuth(`${BASE_URL}/kardex/${id}?${params}`, { method: 'GET' }));
};

/** data: { tipo: entrada|salida|ajuste, sucursal_id?, cantidad, costo_unitario?, motivo? } */
export const movimiento = async (id, data) => handleResponse(await fetchWithAuth(`${BASE_URL}/movimiento/${id}`, json('POST', data)));
