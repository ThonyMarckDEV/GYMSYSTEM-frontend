import { fetchWithAuth } from 'js/authToken';
import API_BASE_URL from 'js/urlHelper';
import { handleResponse } from 'utilities/Responses/handleResponse';
import { porPagina } from 'utilities/Paginacion/porPagina';

const BASE_URL = `${API_BASE_URL}/api/suscripcion`;

export const index = async (page = 1, filters = {}) => {
    const params = new URLSearchParams({
        page:   page,
        search: filters.search || '',
        estado: filters.estado || '',
    });
    const response = await fetchWithAuth(`${BASE_URL}/index?${params.toString()}`, { method: 'GET' });
    return handleResponse(response);
};

export const combobox = async (filters = {}) => {
    const params = new URLSearchParams({
        search: filters.search || '',
    });
    const response = await fetchWithAuth(`${BASE_URL}/combobox?${params.toString()}`, { method: 'GET' });
    return handleResponse(response);
};

export const show = async (id) => {
    const response = await fetchWithAuth(`${BASE_URL}/show/${id}`, { method: 'GET' });
    return handleResponse(response);
};

export const store = async (data) => {
    const response = await fetchWithAuth(`${BASE_URL}/store`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return handleResponse(response);
};

export const update = async (id, data) => {
    const response = await fetchWithAuth(`${BASE_URL}/update/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return handleResponse(response);
};

export const toggleStatus = async (id) => {
    const response = await fetchWithAuth(`${BASE_URL}/status/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
    });
    return handleResponse(response);
};

// Plan contratado por la empresa activa y su consumo (sucursales 1/1, clientes x/y...)
export const miPlan = async () => {
    const response = await fetchWithAuth(`${BASE_URL}/miPlan`, { method: 'GET' });
    return handleResponse(response);
};

// ---- Cobro de la suscripción a las empresas (solo superadmin) ----
export const pagos = async (page = 1, filters = {}) => {
    const params = new URLSearchParams({
        page, per_page: porPagina('cobros'),
        empresa_id: filters.empresa_id || '', estado: filters.estado || '',
        metodo_pago: filters.metodo_pago || '', desde: filters.desde || '', hasta: filters.hasta || '',
    });
    return handleResponse(await fetchWithAuth(`${BASE_URL}/pagos?${params.toString()}`, { method: 'GET' }));
};

/** data: { plan_suscripcion_id, meses, monto?, metodo_pago, numero_operacion?, nota? } */
export const registrarPago = async (empresaId, data) =>
    handleResponse(await fetchWithAuth(`${BASE_URL}/pagos/${empresaId}`, { method: 'POST', body: JSON.stringify(data) }));

/** Recibo PDF del pago, emitido por GYM SYSTEM (superadmin / la propia empresa). */
export const reciboUrl = (pagoId) => `${BASE_URL}/pagos/recibo/${pagoId}`;
export const miReciboUrl = (pagoId) => `${BASE_URL}/miPlan/recibo/${pagoId}`;

/** Vista previa del pago (no guarda): renovación, subida o bajada, saldo y nuevo vencimiento. */
export const simularPago = async (empresaId, data) =>
    handleResponse(await fetchWithAuth(`${BASE_URL}/pagos/${empresaId}/simular`, { method: 'POST', body: JSON.stringify(data) }));

export const anularPago = async (pagoId) =>
    handleResponse(await fetchWithAuth(`${BASE_URL}/pagos/anular/${pagoId}`, { method: 'PATCH' }));
