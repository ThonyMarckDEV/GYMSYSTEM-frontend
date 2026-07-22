// services/membresiaService.js — ADMIN
import { fetchWithAuth } from 'js/authToken';
import API_BASE_URL from 'js/urlHelper';
import { handleResponse } from 'utilities/Responses/handleResponse';

const BASE_URL = `${API_BASE_URL}/api/membresia`;

export const index = async (page = 1, filters = {}) => {
    const params = new URLSearchParams({
        page:   page,
        search: filters.search || '',
        estado: filters.estado || '',
        plan:   filters.plan   || '',
    });
    const response = await fetchWithAuth(`${BASE_URL}/index?${params.toString()}`, { method: 'GET' });
    return handleResponse(response);
};

export const show = async (id) => {
    const response = await fetchWithAuth(`${BASE_URL}/show/${id}`, { method: 'GET' });
    return handleResponse(response);
};

export const aprobar = async (id) => {
    const response = await fetchWithAuth(`${BASE_URL}/aprobar/${id}`, { method: 'PATCH' });
    return handleResponse(response);
};

export const rechazar = async (id, data) => {
    const response = await fetchWithAuth(`${BASE_URL}/rechazar/${id}`, {
        method: 'PATCH',
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