import { fetchWithAuth } from 'js/authToken';
import API_BASE_URL from 'js/urlHelper';
import { handleResponse } from 'utilities/Responses/handleResponse';
import { porPagina } from 'utilities/Paginacion/porPagina';

const BASE_URL = `${API_BASE_URL}/api/perfil`;

export const index = async () => {
    const response = await fetchWithAuth(`${BASE_URL}/index`, { method: 'GET' });
    return handleResponse(response);
};

/** Mis pagos (solo los del cliente). filtros: { estado, concepto } — incluye `resumen` */
export const misPagos = async (page = 1, filtros = {}) => {
    const params = new URLSearchParams({
        page,
        per_page: porPagina('mispagos'),
        estado: filtros.estado || '',
        concepto: filtros.concepto || '',
    });
    return handleResponse(await fetchWithAuth(`${BASE_URL}/pagos?${params}`, { method: 'GET' }));
};

/** URL protegida de la captura del comprobante (se abre con ImagenProtegida) */
export const comprobanteUrl = (pagoId) => `${BASE_URL}/comprobante/${pagoId}`;

/** URL protegida del ticket PDF de un pago del cliente */
export const ticketUrl = (pagoId) => `${BASE_URL}/ticket/${pagoId}`;

/** Panel del cliente: membresía, avisos, clases, entrenamiento y últimos pagos */
export const dashboard = async () =>
    handleResponse(await fetchWithAuth(`${BASE_URL}/dashboard`, { method: 'GET' }));

/** Planes, Yape/Plin del gimnasio y estado del último pago en línea */
export const opcionesPago = async () =>
    handleResponse(await fetchWithAuth(`${BASE_URL}/opcionesPago`, { method: 'GET' }));

/** formData: plan_id, metodo_pago (yape|plin), numero_operacion, comprobante (imagen) */
export const pagar = async (formData) =>
    handleResponse(await fetchWithAuth(`${BASE_URL}/pagar`, { method: 'POST', body: formData }));
