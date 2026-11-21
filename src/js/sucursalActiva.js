// src/js/sucursalActiva.js
// -----------------------------------------------------------------------
// Sucursal activa (edición empresa única, multisucursal).
// Solo la usa el SUPERADMIN para pasar de modo global (todas las sedes)
// a modo sucursal: se envía al backend en el header X-Sucursal-Id.
// Para el resto de usuarios el backend ignora el header.
// -----------------------------------------------------------------------

const STORAGE_KEY = 'sucursal_activa';

export const getSucursalActiva = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

export const setSucursalActiva = (sucursal) => {
    try {
        if (sucursal && sucursal.id) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ id: sucursal.id, nombre: sucursal.nombre }));
        } else {
            localStorage.removeItem(STORAGE_KEY);
        }
    } catch {
        // Sin almacenamiento disponible: se trabaja en modo global
    }
};

export const clearSucursalActiva = () => setSucursalActiva(null);
