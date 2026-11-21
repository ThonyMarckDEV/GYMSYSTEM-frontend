import React from 'react';
import { MapPinIcon, UserIcon, CheckCircleIcon, NoSymbolIcon, UsersIcon, ClockIcon } from '@heroicons/react/24/outline';

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
        return <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-red-700 shrink-0"><NoSymbolIcon className="w-3.5 h-3.5" /> Cancelada</span>;
    }
    if (clase.inscrito) {
        return <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-green-700 shrink-0"><CheckCircleIcon className="w-3.5 h-3.5" /> Inscrito</span>;
    }
    if (clase.pago_pendiente) {
        return <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-amber-700 shrink-0"><ClockIcon className="w-3.5 h-3.5" /> Pago en revisión</span>;
    }
    if (clase.terminada) return <span className="text-[10px] font-black uppercase text-slate-400 shrink-0">Terminada</span>;
    if (clase.disponibles === 0) return <span className="text-[10px] font-black uppercase text-amber-700 shrink-0">Llena</span>;
    return null;
};

/** Precio de una clase o evento con costo (nada si está incluida en la membresía). */
export const PrecioClase = ({ clase, className = '' }) => Number(clase.precio) > 0 ? (
    <span className={`inline-block px-1.5 py-px rounded-md bg-secondary text-primary text-[10px] font-black tabular-nums shrink-0 ${className}`}
        title={clase.requiere_membresia ? 'Con costo · solo socios' : 'Con costo · abierto a todos'}>
        S/ {Number(clase.precio).toFixed(2)}
    </span>
) : null;

/** Barra de cupos ocupados. */
export const Cupos = ({ clase, compacto = false }) => {
    const pct = clase.cupo ? Math.min(100, Math.round((clase.inscritos / clase.cupo) * 100)) : 0;
    return (
        <div className={compacto ? 'mt-1' : 'mt-1'}>
            <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span className="inline-flex items-center gap-1"><UsersIcon className="w-3.5 h-3.5" /> {clase.inscritos}/{clase.cupo}</span>
                {!compacto && <span>{clase.disponibles} {clase.disponibles === 1 ? 'cupo libre' : 'cupos libres'}</span>}
            </div>
            <div className="h-1 mt-0.5 rounded-full bg-slate-100 overflow-hidden" aria-hidden>
                <div className="h-full rounded-full bg-slate-700 dark:bg-primary" style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
};

/** Línea ícono + texto que se corta con "…" si no entra. */
const Linea = ({ icon: Icon, children, className = '' }) => (
    <p className={`flex items-center gap-1 min-w-0 ${className}`}>
        <Icon className="w-3 h-3 shrink-0" /> <span className="truncate">{children}</span>
    </p>
);

const bordeClase = (clase) => `${clase.inscrito ? 'border-green-300 ring-1 ring-green-200' : 'border-slate-200'} ${clase.estado === 'cancelada' || clase.terminada ? 'opacity-60' : ''}`;

/** Tarjeta compacta: columna del calendario semanal (pantallas anchas). */
export const ClaseCard = ({ clase, onClick }) => {
    const cancelada = clase.estado === 'cancelada';
    return (
        <button type="button" onClick={() => onClick(clase)} title={`${clase.nombre} · ${clase.instructor?.nombre || ''}`}
            className={`w-full min-w-0 text-left rounded-lg border bg-white p-2 shadow-sm hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-primary ${bordeClase(clase)}`}
            style={{ borderLeftWidth: 4, borderLeftColor: colorClase(clase.nombre) }}>
            <div className="flex items-center justify-between gap-1">
                <p className="text-[11px] font-bold text-slate-500 tabular-nums">{clase.hora_inicio}–{clase.hora_fin}</p>
                <PrecioClase clase={clase} />
            </div>
            <p className={`text-sm font-black text-slate-900 truncate ${cancelada ? 'line-through' : ''}`}>{clase.nombre}</p>
            <Linea icon={UserIcon} className="text-[11px] text-slate-500">{clase.instructor?.nombre}</Linea>
            <Linea icon={MapPinIcon} className="text-[11px] text-slate-400">{clase.lugar || clase.sucursal?.nombre}</Linea>
            <EstadoClase clase={clase} />
            {!cancelada && <Cupos clase={clase} compacto />}
        </button>
    );
};

/** Fila de agenda: vista de un día (pantallas medianas y celular). */
export const ClaseFila = ({ clase, onClick }) => {
    const cancelada = clase.estado === 'cancelada';
    return (
        <button type="button" onClick={() => onClick(clase)}
            className={`w-full text-left flex items-stretch gap-4 rounded-xl border bg-white p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-primary ${bordeClase(clase)}`}
            style={{ borderLeftWidth: 5, borderLeftColor: colorClase(clase.nombre) }}>
            <div className="w-14 shrink-0 text-center tabular-nums border-r border-slate-100 pr-3">
                <p className="text-lg font-black text-slate-900 leading-tight">{clase.hora_inicio}</p>
                <p className="text-xs font-semibold text-slate-400">{clase.hora_fin}</p>
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                        <p className={`text-base font-black text-slate-900 truncate ${cancelada ? 'line-through' : ''}`}>{clase.nombre}</p>
                        <PrecioClase clase={clase} />
                    </div>
                    <EstadoClase clase={clase} />
                </div>
                <div className="mt-0.5 flex flex-col sm:flex-row sm:gap-4 min-w-0">
                    <Linea icon={UserIcon} className="text-xs text-slate-500">{clase.instructor?.nombre}</Linea>
                    <Linea icon={MapPinIcon} className="text-xs text-slate-500">{clase.sucursal?.nombre}{clase.lugar ? ` · ${clase.lugar}` : ''}</Linea>
                </div>
                {!cancelada && <div className="max-w-xs"><Cupos clase={clase} /></div>}
            </div>
        </button>
    );
};
