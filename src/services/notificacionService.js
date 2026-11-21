import { fetchWithAuth } from 'js/authToken';
import API_BASE_URL from 'js/urlHelper';
import { handleResponse } from 'utilities/Responses/handleResponse';

const BASE_URL = `${API_BASE_URL}/api/notificacion`;

/** Mis notificaciones (paginadas) + cuántas no leí */
export const index = async (page = 1, soloNoLeidas = false) =>
    handleResponse(await fetchWithAuth(`${BASE_URL}/index?page=${page}&per_page=15${soloNoLeidas ? '&no_leidas=1' : ''}`, { method: 'GET' }));

export const leer = async (id) => handleResponse(await fetchWithAuth(`${BASE_URL}/leer/${id}`, { method: 'PATCH' }));
export const leerTodas = async () => handleResponse(await fetchWithAuth(`${BASE_URL}/leerTodas`, { method: 'PATCH' }));
export const eliminar = async (id) => handleResponse(await fetchWithAuth(`${BASE_URL}/eliminar/${id}`, { method: 'DELETE' }));
