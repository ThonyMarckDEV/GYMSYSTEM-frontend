import { fetchWithAuth } from 'js/authToken';
import API_BASE_URL from 'js/urlHelper';
import { handleResponse } from 'utilities/Responses/handleResponse';

// Cajas físicas de cada sucursal (CRUD del admin)
const BASE_URL = `${API_BASE_URL}/api/caja`;

export const index = async (page = 1, filters = {}) => {
    const params = new URLSearchParams({
        page,
        search: filters.search || '',
        estado: filters.estado || '',
        sucursal_id: filters.sucursal_id || '',
    });
    return handleResponse(await fetchWithAuth(`${BASE_URL}/index?${params.toString()}`, { method: 'GET' }));
};

/** @param {boolean} disponibles solo cajas sin turno abierto (para abrir caja) */
export const combobox = async ({ disponibles = false, sucursal_id = '' } = {}) =>
    handleResponse(await fetchWithAuth(`${BASE_URL}/combobox?disponibles=${disponibles ? 1 : 0}&sucursal_id=${sucursal_id || ''}`, { method: 'GET' }));

export const store = async (data) =>
    handleResponse(await fetchWithAuth(`${BASE_URL}/store`, { method: 'POST', body: JSON.stringify(data) }));

export const update = async (id, data) =>
    handleResponse(await fetchWithAuth(`${BASE_URL}/update/${id}`, { method: 'PUT', body: JSON.stringify(data) }));

export const toggleStatus = async (id) =>
    handleResponse(await fetchWithAuth(`${BASE_URL}/status/${id}`, { method: 'PATCH' }));
