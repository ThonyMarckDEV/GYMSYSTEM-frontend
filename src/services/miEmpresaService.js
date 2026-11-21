import { fetchWithAuth } from 'js/authToken';
import API_BASE_URL from 'js/urlHelper';
import { handleResponse } from 'utilities/Responses/handleResponse';

// Mi empresa: datos del negocio y logo de la empresa activa (aparecen en los tickets)
const BASE_URL = `${API_BASE_URL}/api/mi-empresa`;

export const show = async () => handleResponse(await fetchWithAuth(`${BASE_URL}/show`, { method: 'GET' }));

export const update = async (data) =>
    handleResponse(await fetchWithAuth(`${BASE_URL}/update`, { method: 'PUT', body: JSON.stringify(data) }));

/** Endpoint del logo: devuelve una URL temporal firmada (se muestra con ImagenProtegida) */
export const logoUrl = (version = '') => `${BASE_URL}/logo${version ? `?v=${version}` : ''}`;

/** Subir o cambiar el logo (PNG/JPG, máx. 2 MB) */
export const subirLogo = async (archivo) => {
    const fd = new FormData();
    fd.append('logo', archivo);
    return handleResponse(await fetchWithAuth(`${BASE_URL}/logo`, { method: 'POST', body: fd }));
};

export const eliminarLogo = async () =>
    handleResponse(await fetchWithAuth(`${BASE_URL}/logo`, { method: 'DELETE' }));
