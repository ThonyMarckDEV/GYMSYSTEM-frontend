import { fetchWithAuth } from 'js/authToken';
import API_BASE_URL from 'js/urlHelper';
import { handleResponse } from 'utilities/Responses/handleResponse';

const BASE_URL = `${API_BASE_URL}/api/inventario`;

/** filtros: { search, categoria, estado, mantenimiento } — la respuesta incluye `resumen` */
export const index = async (page = 1, filtros = {}) => {
    const params = new URLSearchParams({
        page,
        search: filtros.search || '',
        categoria: filtros.categoria || '',
        estado: filtros.estado || '',
        mantenimiento: filtros.mantenimiento ? 1 : '',
    });
    // Respuesta paginada: handleResponse la devuelve completa (data, total, resumen...)
    return handleResponse(await fetchWithAuth(`${BASE_URL}/index?${params}`, { method: 'GET' }));
};

/** formData: campos del equipo + foto (opcional) */
export const store = async (formData) => handleResponse(await fetchWithAuth(`${BASE_URL}/store`, { method: 'POST', body: formData }));
export const update = async (id, formData) => handleResponse(await fetchWithAuth(`${BASE_URL}/update/${id}`, { method: 'POST', body: formData }));

export const cambiarEstado = async (id, estado, nota = '') =>
    handleResponse(await fetchWithAuth(`${BASE_URL}/estado/${id}`, { method: 'PATCH', body: JSON.stringify({ estado, nota }) }));

/** URL protegida de la foto (se abre con ImagenProtegida) */
export const fotoUrl = (id, version = '') => `${BASE_URL}/foto/${id}${version ? `?v=${version}` : ''}`;
