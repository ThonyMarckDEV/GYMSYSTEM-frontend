import { fetchWithAuth } from 'js/authToken';
import API_BASE_URL from 'js/urlHelper';
import { handleResponse } from 'utilities/Responses/handleResponse';

const BASE_URL = `${API_BASE_URL}/api/perfil`;

// Cliente: su propio perfil
export const index = async () => {
    const response = await fetchWithAuth(`${BASE_URL}/index`, { method: 'GET' });
    return handleResponse(response);
};

// Admin/asesor: perfil de un cliente específico
export const show = async (clienteId) => {
    const response = await fetchWithAuth(`${BASE_URL}/show/${clienteId}`, { method: 'GET' });
    return handleResponse(response);
};