import { fetchWithAuth } from 'js/authToken';
import API_BASE_URL from 'js/urlHelper';
import { handleResponse } from 'utilities/Responses/handleResponse';

const BASE_URL = `${API_BASE_URL}/api/progreso`;
const json = (method, data) => ({ method, body: JSON.stringify(data ?? {}) });

/** Perfil, medición actual con IMC/grasa/riesgo, cambios, historial, plan de calorías, hoy y 7 días */
export const resumen = async () => handleResponse(await fetchWithAuth(`${BASE_URL}/resumen`, { method: 'GET' }));
/** data: { estatura_cm, nivel_actividad, objetivo, peso_meta_kg? } */
export const guardarPerfil = async (data) => handleResponse(await fetchWithAuth(`${BASE_URL}/perfil`, json('PUT', data)));
/** data: { fecha, peso_kg, grasa_pct?, cintura_cm?, cadera_cm?, pecho_cm?, brazo_cm?, muslo_cm?, cuello_cm?, notas? } */
export const guardarMedicion = async (data) => handleResponse(await fetchWithAuth(`${BASE_URL}/medicion`, json('POST', data)));
export const eliminarMedicion = async (id) => handleResponse(await fetchWithAuth(`${BASE_URL}/medicion/${id}`, { method: 'DELETE' }));

export const comidas = async (fecha) => handleResponse(await fetchWithAuth(`${BASE_URL}/comidas?fecha=${fecha}`, { method: 'GET' }));
/** data: { fecha, tipo, nombre, porcion?, calorias, proteina_g?, carbos_g?, grasas_g? } */
export const agregarComida = async (data) => handleResponse(await fetchWithAuth(`${BASE_URL}/comida`, json('POST', data)));
/** Corregir una comida (el día no cambia) */
export const actualizarComida = async (id, data) => handleResponse(await fetchWithAuth(`${BASE_URL}/comida/${id}`, json('PUT', data)));
export const eliminarComida = async (id) => handleResponse(await fetchWithAuth(`${BASE_URL}/comida/${id}`, { method: 'DELETE' }));
export const frecuentes = async () => handleResponse(await fetchWithAuth(`${BASE_URL}/frecuentes`, { method: 'GET' }));
