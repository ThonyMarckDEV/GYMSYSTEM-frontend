import { fetchWithAuth } from 'js/authToken';
import API_BASE_URL from 'js/urlHelper';
import { handleResponse } from 'utilities/Responses/handleResponse';

// Edición empresa única: datos del negocio (solo superadmin)
const BASE_URL = `${API_BASE_URL}/api/empresa`;

export const show = async () => handleResponse(await fetchWithAuth(`${BASE_URL}/show`, { method: 'GET' }));

export const update = async (data) =>
    handleResponse(await fetchWithAuth(`${BASE_URL}/update`, { method: 'PUT', body: JSON.stringify(data) }));
