import { fetchWithAuth } from 'js/authToken';
import API_BASE_URL from 'js/urlHelper';
import { handleResponse } from 'utilities/Responses/handleResponse';

const BASE_URL = `${API_BASE_URL}/api/clase`;
const json = (method, data) => ({ method, body: JSON.stringify(data ?? {}) });

/** filtros: { sucursal_id, instructor_id, mias } */
export const calendario = async (desde, hasta, filtros = {}) => {
    const params = new URLSearchParams({
        desde, hasta,
        sucursal_id: filtros.sucursal_id || '',
        instructor_id: filtros.instructor_id || '',
        mias: filtros.mias ? 1 : 0,
    });
    return handleResponse(await fetchWithAuth(`${BASE_URL}/calendario?${params}`, { method: 'GET' }));
};

export const show = async (id) => handleResponse(await fetchWithAuth(`${BASE_URL}/show/${id}`, { method: 'GET' }));
export const misClases = async () => handleResponse(await fetchWithAuth(`${BASE_URL}/misClases`, { method: 'GET' }));
export const instructores = async () => handleResponse(await fetchWithAuth(`${BASE_URL}/instructores`, { method: 'GET' }));

export const store = async (data) => handleResponse(await fetchWithAuth(`${BASE_URL}/store`, json('POST', data)));
export const update = async (id, data) => handleResponse(await fetchWithAuth(`${BASE_URL}/update/${id}`, json('PUT', data)));
export const cancelar = async (id, motivo) => handleResponse(await fetchWithAuth(`${BASE_URL}/cancelar/${id}`, json('PATCH', { motivo })));

/** asistencias: [{ inscripcion_id, asistencia: 'asistio' | 'falto' | null }] */
export const asistencia = async (id, asistencias) =>
    handleResponse(await fetchWithAuth(`${BASE_URL}/asistencia/${id}`, json('PUT', { asistencias })));

export const inscribir = async (id) => handleResponse(await fetchWithAuth(`${BASE_URL}/inscribir/${id}`, { method: 'POST' }));
export const desinscribir = async (id) => handleResponse(await fetchWithAuth(`${BASE_URL}/inscribir/${id}`, { method: 'DELETE' }));
