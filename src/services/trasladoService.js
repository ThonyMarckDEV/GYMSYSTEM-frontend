import { fetchWithAuth } from 'js/authToken';
import API_BASE_URL from 'js/urlHelper';
import { handleResponse } from 'utilities/Responses/handleResponse';
import { porPagina } from 'utilities/Paginacion/porPagina';

const BASE_URL = `${API_BASE_URL}/api/traslado`;

export const index = async (page = 1, filtros = {}) => {
    const params = new URLSearchParams({ per_page: porPagina('traslados'), page, sucursal_id: filtros.sucursal_id || '' });
    return handleResponse(await fetchWithAuth(`${BASE_URL}/index?${params}`, { method: 'GET' }));
};

/** data: { origen_id?, destino_id, observacion?, items: [{ producto_id, cantidad }] } */
export const store = async (data) =>
    handleResponse(await fetchWithAuth(`${BASE_URL}/store`, { method: 'POST', body: JSON.stringify(data) }));
