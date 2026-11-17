// src/js/empresaActiva.js
// -----------------------------------------------------------------------
// Empresa activa (multitenant).
// Solo la usa el SUPERADMIN para "entrar" a una empresa: se envía al backend
// en el header X-Empresa-Id. Para el resto de usuarios el backend ignora el
// header y siempre usa la empresa a la que pertenecen.
// -----------------------------------------------------------------------

const STORAGE_KEY = 'empresa_activa';

export const getEmpresaActiva = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

export const setEmpresaActiva = (empresa) => {
    try {
        if (empresa && empresa.id) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                id: empresa.id,
                nombre_comercial: empresa.nombre_comercial,
            }));
        } else {
            localStorage.removeItem(STORAGE_KEY);
        }
    } catch {
        // Sin almacenamiento disponible: se trabaja en modo global
    }
};

export const clearEmpresaActiva = () => setEmpresaActiva(null);
