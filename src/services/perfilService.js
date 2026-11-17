import { fetchWithAuth } from 'js/authToken';
import API_BASE_URL from 'js/urlHelper';
import { handleResponse } from 'utilities/Responses/handleResponse';

const BASE_URL = `${API_BASE_URL}/api/perfil`;

export const index = async () => {
    const response = await fetchWithAuth(`${BASE_URL}/index`, { method: 'GET' });
    return handleResponse(response);
};

/** Planes, Yape/Plin del gimnasio y estado del último pago en línea */
export const opcionesPago = async () =>
    handleResponse(await fetchWithAuth(`${BASE_URL}/opcionesPago`, { method: 'GET' }));

/** formData: plan_id, metodo_pago (yape|plin), numero_operacion, comprobante (imagen) */
export const pagar = async (formData) =>
    handleResponse(await fetchWithAuth(`${BASE_URL}/pagar`, { method: 'POST', body: formData }));
