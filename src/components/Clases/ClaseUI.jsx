import React from 'react';
import { ClockIcon, MapPinIcon, UserIcon, CheckCircleIcon, NoSymbolIcon, UsersIcon } from '@heroicons/react/24/outline';

// ---------------------------------------------------------------------------
// Color por clase: sigue al NOMBRE (no al orden), así SPINNING siempre tiene el
// mismo color. Solo es un acento: el nombre siempre va escrito.
// ---------------------------------------------------------------------------
const ACENTOS = ['#2563eb', '#7c3aed', '#059669', '#d97706', '#db2777', '#0891b2', '#4f46e5', '#65a30d'];

export const colorClase = (nombre = '') => {
    let h = 0;
    for (const ch of nombre.toUpperCase()) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    return ACENTOS[h % ACENTOS.length];
};

/** Etiqueta de estado de la clase para el usuario (texto + ícono, no solo color). */
export const EstadoClase = ({ clase }) => {
    if (clase.estado === 'cancelada') {
        return <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-red-700"><NoSymbolIcon className="w-3.5 h-3.5" /> Cancelada</span>;
    }
    if (clase.inscrito) {
        return <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-green-700"><CheckCircleIcon className="w-3.5 h-3.5" /> Inscrito</span>;
    }
    if (clase.terminada) return <span className="text-[10px] font-black uppercase text-slate-400">Terminada</span>;
    if (clase.disponibles === 0) return <span className="text-[10px] font-black uppercase text-amber-700">Llena</span>;
    return null;
};

/** Barra de cupos ocupados. */
export const Cupos = ({ clase, compacto = false }) => {
    const pct = clase.cupo ? Math.min(100, Math.round((clase.inscritos / clase.cupo) * 100)) : 0;
    return (
        <div className={compacto ? '' : 'mt-1'}>
            <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span className="inline-flex items-center gap-1"><UsersIcon className="w-3.5 h-3.5" /> {clase.inscritos}/{clase.cupo}</span>
                {!compacto && <span>{clase.disponibles} {clase.disponibles === 1 ? 'cupo' : 'cupos'}</span>}
            </div>
            <div className="h-1 mt-0.5 rounded-full bg-slate-100 overflow-hidden" aria-hidden>
                <div className="h-full rounded-full bg-slate-700" style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
};

/** Tarjeta de una clase dentro del calendario. */
export const ClaseCard = ({ clase, onClick }) => {
    const cancelada = clase.estado === 'cancelada';
    const acento = colorClase(clase.nombre);
    return (
        <button type="button" onClick={() => onClick(clase)}
            className={`w-full text-left rounded-lg border bg-white p-2.5 shadow-sm hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-primary
                ${clase.inscrito ? 'border-green-300 ring-1 ring-green-200' : 'border-slate-200'} ${cancelada || clase.terminada ? 'opacity-60' : ''}`}
            style={{ borderLeftWidth: 4, borderLeftColor: acento }}>
            <div className="flex items-center justify-between gap-1">
                <span className="text-[11px] font-bold text-slate-500 tabular-nums inline-flex items-center gap-1">
                    <ClockIcon className="w-3.5 h-3.5" /> {clase.hora_inicio}–{clase.hora_fin}
                </span>
                <EstadoClase clase={clase} />
            </div>
            <p className={`mt-0.5 text-sm font-black text-slate-900 truncate ${cancelada ? 'line-through' : ''}`}>{clase.nombre}</p>
            <p className="text-[11px] text-slate-500 truncate inline-flex items-center gap-1"><UserIcon className="w-3 h-3" /> {clase.instructor?.nombre}</p>
            <p className="text-[11px] text-slate-400 truncate inline-flex items-center gap-1">
                <MapPinIcon className="w-3 h-3" /> {clase.sucursal?.nombre}{clase.lugar ? ` · ${clase.lugar}` : ''}
            </p>
            {!cancelada && <Cupos clase={clase} compacto />}
        </button>
    );
};
