import { fetchWithAuth } from 'js/authToken';
import API_BASE_URL from 'js/urlHelper';
import { handleResponse } from 'utilities/Responses/handleResponse';

const BASE_URL = `${API_BASE_URL}/api/membresia`;

export const index = async (clienteId) => {
    const response = await fetchWithAuth(`${BASE_URL}/index/${clienteId}`, { method: 'GET' });
    return handleResponse(response);
};

export const asignar = async (clienteId, data) => {
    const response = await fetchWithAuth(`${BASE_URL}/asignar/${clienteId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return handleResponse(response);
};

export const congelar = async (id, data) => {
    const response = await fetchWithAuth(`${BASE_URL}/congelar/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return handleResponse(response);
};

export const reanudar = async (id) => {
    const response = await fetchWithAuth(`${BASE_URL}/reanudar/${id}`, { method: 'PATCH' });
    return handleResponse(response);
};

export const cancelar = async (id) => {
    const response = await fetchWithAuth(`${BASE_URL}/cancelar/${id}`, { method: 'PATCH' });
    return handleResponse(response);
};