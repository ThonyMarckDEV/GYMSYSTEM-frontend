import { fetchWithAuth } from 'js/authToken';
import API_BASE_URL from 'js/urlHelper';
import { handleResponse } from 'utilities/Responses/handleResponse';

const BASE_URL = `${API_BASE_URL}/api/dashboard`;

/**
 * @param {object} filters { sucursal_id } — se ignora si el usuario tiene sucursal fija
 */
export const index = async (filters = {}) => {
    const params = new URLSearchParams({ sucursal_id: filters.sucursal_id || '' });
    const response = await fetchWithAuth(`${BASE_URL}/index?${params.toString()}`, { method: 'GET' });
    return handleResponse(response);
};
