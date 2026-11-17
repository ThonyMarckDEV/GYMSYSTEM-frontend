import { fetchWithAuth } from 'js/authToken';
import API_BASE_URL from 'js/urlHelper';
import { handleResponse } from 'utilities/Responses/handleResponse';

const BASE_URL = `${API_BASE_URL}/api/rutina`;
const json = (method, data) => ({ method, body: JSON.stringify(data ?? {}) });

/** Mis rutinas + resumen (sesiones, racha, récords) + límites */
export const index = async () => handleResponse(await fetchWithAuth(`${BASE_URL}/index`, { method: 'GET' }));
export const ejercicios = async () => handleResponse(await fetchWithAuth(`${BASE_URL}/ejercicios`, { method: 'GET' }));
export const show = async (id) => handleResponse(await fetchWithAuth(`${BASE_URL}/show/${id}`, { method: 'GET' }));

/** data: { nombre, objetivo, descripcion, dias: [{ nombre, ejercicios: [{ ejercicio_id?, nombre, series, repeticiones, peso_kg, descanso_seg, notas }] }] } */
export const store = async (data) => handleResponse(await fetchWithAuth(`${BASE_URL}/store`, json('POST', data)));
export const update = async (id, data) => handleResponse(await fetchWithAuth(`${BASE_URL}/update/${id}`, json('PUT', data)));
export const destroy = async (id) => handleResponse(await fetchWithAuth(`${BASE_URL}/destroy/${id}`, { method: 'DELETE' }));

/** data: { dia, duracion_min, notas, series: [{ rutina_ejercicio_id, serie, repeticiones, peso_kg, completada }] } */
export const guardarSesion = async (id, data) => handleResponse(await fetchWithAuth(`${BASE_URL}/sesion/${id}`, json('POST', data)));
export const historial = async (page = 1) => handleResponse(await fetchWithAuth(`${BASE_URL}/historial?page=${page}`, { method: 'GET' }));
export const eliminarSesion = async (id) => handleResponse(await fetchWithAuth(`${BASE_URL}/sesion/${id}`, { method: 'DELETE' }));
