import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BellIcon, CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon, InformationCircleIcon, XMarkIcon, CheckIcon
} from '@heroicons/react/24/outline';
import { BellAlertIcon } from '@heroicons/react/24/solid';
import { useNotificaciones } from 'context/NotificacionesContext';

const NIVELES = {
    exito:  { icon: CheckCircleIcon,         cls: 'text-green-600 bg-green-50' },
    error:  { icon: XCircleIcon,             cls: 'text-red-600 bg-red-50' },
    alerta: { icon: ExclamationTriangleIcon, cls: 'text-amber-600 bg-amber-50' },
    info:   { icon: InformationCircleIcon,   cls: 'text-blue-600 bg-blue-50' },
};

/** "hace 3 min", "ayer", "12/11" */
const haceCuanto = (iso) => {
    const seg = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
    if (seg < 60) return 'ahora';
    if (seg < 3600) return `hace ${Math.floor(seg / 60)} min`;
    if (seg < 86400) return `hace ${Math.floor(seg / 3600)} h`;
    if (seg < 172800) return 'ayer';
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
};

/** Campanita (arriba a la derecha, al lado de la luna) con el popup de notificaciones. */
const CampanaNotificaciones = () => {
    const navigate = useNavigate();
    const { items, noLeidas, cargando, enVivo, nueva, hayMas, leer, leerTodas, eliminar, verMas } = useNotificaciones();
    const [abierto, setAbierto] = useState(false);
    const [filtro, setFiltro] = useState('todas');
    const [sacudir, setSacudir] = useState(false);
    const ref = useRef(null);

    // Llegó una nueva: la campana se sacude
    useEffect(() => {
        if (!nueva) return;
        setSacudir(true);
        const t = setTimeout(() => setSacudir(false), 1000);
        return () => clearTimeout(t);
    }, [nueva]);

    // Cerrar con clic afuera o Esc
    useEffect(() => {
        if (!abierto) return;
        const clic = (e) => { if (ref.current && !ref.current.contains(e.target)) setAbierto(false); };
        const tecla = (e) => { if (e.key === 'Escape') setAbierto(false); };
        document.addEventListener('mousedown', clic);
        document.addEventListener('keydown', tecla);
        return () => { document.removeEventListener('mousedown', clic); document.removeEventListener('keydown', tecla); };
    }, [abierto]);

    const visibles = filtro === 'no_leidas' ? items.filter(n => !n.leida) : items;

    const abrir = (n) => {
        leer(n);
        if (n.url) { setAbierto(false); navigate(n.url); }
    };

    const etiqueta = noLeidas ? `Notificaciones: ${noLeidas} sin leer` : 'Notificaciones';

    return (
        <div ref={ref} className="fixed top-3 right-[3.25rem] md:top-4 md:right-[3.75rem] z-[45]">
            <button type="button" onClick={() => setAbierto(a => !a)} title={etiqueta} aria-label={etiqueta} aria-expanded={abierto}
                className={`relative w-9 h-9 rounded-full flex items-center justify-center transition-colors duration-200
                    active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary
                    ${abierto ? 'bg-slate-100 text-secondary' : 'bg-transparent text-slate-500 hover:text-secondary hover:bg-slate-100'}`}>
                <span className={sacudir ? 'campana-sacude' : ''} aria-hidden>
                    {noLeidas ? <BellAlertIcon className="w-5 h-5 text-secondary" /> : <BellIcon className="w-5 h-5" />}
                </span>
                {noLeidas > 0 && (
                    <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-red-600 text-white text-[10px] font-black leading-4 text-center tabular-nums">
                        {noLeidas > 99 ? '99+' : noLeidas}
                    </span>
                )}
            </button>

            {abierto && (
                <div className="aparecer-arriba absolute right-0 mt-2 w-[min(400px,calc(100vw-1.5rem))] max-h-[min(560px,calc(100vh-6rem))] flex flex-col
                    bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden" role="dialog" aria-label="Notificaciones">
                    {/* Cabecera */}
                    <div className="px-4 pt-3 pb-2 border-b border-slate-100">
                        <div className="flex items-center justify-between gap-2">
                            <p className="font-black text-secondary uppercase text-sm">Notificaciones</p>
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold ${enVivo ? 'text-green-600' : 'text-slate-400'}`}
                                title={enVivo ? 'Recibes los avisos al instante' : 'Sin conexión en vivo: se actualiza cada minuto'}>
                                <span className={`w-1.5 h-1.5 rounded-full ${enVivo ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`} /> {enVivo ? 'En vivo' : 'Sin conexión en vivo'}
                            </span>
                        </div>
                        <div className="mt-2 flex items-center justify-between gap-2">
                            <div className="inline-flex gap-1 p-0.5 rounded-lg bg-slate-100" role="tablist">
                                {[['todas', 'Todas'], ['no_leidas', `No leídas${noLeidas ? ` (${noLeidas})` : ''}`]].map(([k, l]) => (
                                    <button key={k} role="tab" aria-selected={filtro === k} onClick={() => setFiltro(k)}
                                        className={`px-2.5 py-1 rounded-md text-xs font-bold ${filtro === k ? 'bg-white text-secondary shadow-sm' : 'text-slate-500'}`}>{l}</button>
                                ))}
                            </div>
                            {noLeidas > 0 && (
                                <button onClick={leerTodas} className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-secondary">
                                    <CheckIcon className="w-3.5 h-3.5" /> Marcar todas como leídas
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Lista */}
                    <ul className="flex-1 overflow-y-auto divide-y divide-slate-100">
                        {visibles.length === 0 ? (
                            <li className="px-6 py-12 text-center">
                                <BellIcon className="w-10 h-10 mx-auto text-slate-300" />
                                <p className="mt-2 text-sm font-bold text-slate-500">{filtro === 'no_leidas' ? 'Estás al día' : 'Aún no tienes notificaciones'}</p>
                                <p className="text-xs text-slate-400">Aquí te avisaremos de pagos, clases y todo lo importante.</p>
                            </li>
                        ) : visibles.map(n => {
                            const nv = NIVELES[n.nivel] || NIVELES.info;
                            const Icon = nv.icon;
                            return (
                                <li key={n.id} className={`group relative ${n.leida ? '' : 'bg-primary-light/40'}`}>
                                    <button type="button" onClick={() => abrir(n)} className="w-full text-left flex gap-3 px-4 py-3 pr-9 hover:bg-slate-50">
                                        <span className={`mt-0.5 w-8 h-8 shrink-0 rounded-full flex items-center justify-center ${nv.cls}`}><Icon className="w-5 h-5" /></span>
                                        <span className="min-w-0 flex-1">
                                            <span className={`block text-sm leading-tight ${n.leida ? 'font-semibold text-slate-700' : 'font-black text-slate-900'}`}>{n.titulo}</span>
                                            <span className="block text-xs text-slate-500 mt-0.5 line-clamp-3">{n.mensaje}</span>
                                            <span className="block text-[11px] text-slate-400 mt-1">{haceCuanto(n.created_at)}</span>
                                        </span>
                                        {!n.leida && <span className="absolute right-4 top-4 w-2 h-2 rounded-full bg-primary" aria-label="Sin leer" />}
                                    </button>
                                    <button type="button" onClick={() => eliminar(n)} title="Quitar" aria-label="Quitar notificación"
                                        className="absolute right-2 bottom-2 p-1 rounded-md text-slate-300 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 focus:opacity-100">
                                        <XMarkIcon className="w-4 h-4" />
                                    </button>
                                </li>
                            );
                        })}
                    </ul>

                    {hayMas && filtro === 'todas' && (
                        <button onClick={verMas} disabled={cargando} className="py-2.5 text-xs font-bold text-slate-500 hover:text-secondary border-t border-slate-100 disabled:opacity-50">
                            {cargando ? 'Cargando...' : 'Ver más'}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default CampanaNotificaciones;
