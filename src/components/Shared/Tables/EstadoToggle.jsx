import React from 'react';

/**
 * Estado de un registro en una tabla (Activo / Inactivo).
 * Con permiso es un botón que pide confirmar el cambio; sin permiso es solo una etiqueta.
 */
const EstadoToggle = ({ activo, puede, onClick, si = 'Activo', no = 'Inactivo', title = 'Clic para cambiar el estado' }) => {
    const color = activo ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-600 border border-red-200';

    if (!puede) {
        return <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase ${color}`}>{activo ? si : no}</span>;
    }
    return (
        <button type="button" onClick={onClick} title={title}
            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase cursor-pointer hover:scale-105 transition-transform shadow-sm ${color}`}>
            {activo ? si : no}
        </button>
    );
};

/** Celda de acciones vacía (el usuario no tiene permiso para ninguna). */
export const SinAcciones = () => <span className="text-xs text-slate-300" aria-label="Sin acciones">—</span>;

export default EstadoToggle;
