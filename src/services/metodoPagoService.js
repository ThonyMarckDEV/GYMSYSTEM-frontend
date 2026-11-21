import { fetchWithAuth } from 'js/authToken';
import API_BASE_URL from 'js/urlHelper';
import { handleResponse } from 'utilities/Responses/handleResponse';

const BASE_URL = `${API_BASE_URL}/api/metodoPago`;

export const index = async () => handleResponse(await fetchWithAuth(`${BASE_URL}/index`, { method: 'GET' }));

/** formData: FormData con yape_numero, yape_titular, plin_numero, plin_titular, qr_yape, qr_plin */
export const update = async (formData) =>
    handleResponse(await fetchWithAuth(`${BASE_URL}/update`, { method: 'POST', body: formData }));

/** Endpoint del QR ('yape' | 'plin'): devuelve una URL temporal firmada (ImagenProtegida) */
export const qrUrl = (tipo) => `${BASE_URL}/qr/${tipo}`;
