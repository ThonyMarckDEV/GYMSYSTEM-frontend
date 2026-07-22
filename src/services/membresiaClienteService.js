// services/membresiaClienteService.js — CLIENTE
import { fetchWithAuth } from 'js/authToken';
import API_BASE_URL from 'js/urlHelper';
import { handleResponse } from 'utilities/Responses/handleResponse';

const BASE_URL = `${API_BASE_URL}/api/membresia`;

export const solicitar = async (formData) => {
    // FormData: NO seteamos Content-Type, el navegador arma el boundary solo
    const response = await fetchWithAuth(`${BASE_URL}/solicitar`, {
        method: 'POST',
        body: formData,
    });
    return handleResponse(response);
};

export const misSolicitudes = async () => {
    const response = await fetchWithAuth(`${BASE_URL}/mis-solicitudes`, { method: 'GET' });
    return handleResponse(response);
};