import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDaysIcon, ClockIcon, MapPinIcon, ArrowRightIcon, UsersIcon } from '@heroicons/react/24/outline';
import { misClases } from 'services/claseService';
import { colorClase } from 'components/Clases/ClaseUI';
import { aISO, deISO, nombreDia, fechaCorta } from 'utilities/Fechas/fechas';

const etiquetaDia = (iso) => {
    const hoy = aISO(new Date());
    const manana = aISO(new Date(Date.now() + 86400000));
    if (iso === hoy) return 'Hoy';
    if (iso === manana) return 'Mañana';
    const d = deISO(iso);
    return `${nombreDia(d)} ${fechaCorta(d)}`;
};

/**
 * Home: próximas clases.
 * - Cliente: las clases en las que está inscrito.
 * - Instructor: las clases que dicta (con sus inscritos).
 */
const MisClasesCard = ({ esInstructor }) => {
    const [clases, setClases] = useState(null);

    useEffect(() => {
        misClases().then(r => setClases(r.data || [])).catch(() => setClases([]));
    }, []);

    if (clases === null) return <div className="h-40 rounded-2xl bg-slate-100 animate-pulse" />;

    const siguiente = clases[0];

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 pt-5">
                <h3 className="text-slate-500 text-[11px] font-black uppercase tracking-widest flex items-center gap-2">
                    <CalendarDaysIcon className="w-4 h-4" /> {esInstructor ? 'Tus próximas clases a dictar' : 'Tus próximas clases'}
                </h3>
                <Link to="/clases" className="text-xs font-bold text-slate-500 hover:text-slate-900 inline-flex items-center gap-1">
                    {esInstructor ? 'Ver calendario' : 'Reservar clases'} <ArrowRightIcon className="w-3.5 h-3.5" />
                </Link>
            </div>

            {clases.length === 0 ? (
                <div className="px-6 py-8 text-center">
                    <p className="text-sm text-slate-500">{esInstructor ? 'No tienes clases programadas.' : 'Aún no reservaste ninguna clase.'}</p>
                    <Link to="/clases" className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-secondary rounded-lg text-xs font-black uppercase">
                        {esInstructor ? 'Crear una clase' : 'Ver clases disponibles'}
                    </Link>
                </div>
            ) : (
                <>
                    {/* La siguiente clase, destacada */}
                    <div className="mx-6 mt-4 rounded-xl p-4 text-white" style={{ background: `linear-gradient(135deg, ${colorClase(siguiente.nombre)}, #0a0a0a)` }}>
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/70">{etiquetaDia(siguiente.fecha)}</p>
                        <p className="text-2xl font-black leading-tight">{siguiente.nombre}</p>
                        {!esInstructor && siguiente.pago_pendiente && <p className="text-xs font-bold text-amber-300">Pago en revisión · tu cupo está reservado</p>}
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-white/90">
                            <span className="inline-flex items-center gap-1 tabular-nums"><ClockIcon className="w-4 h-4" /> {siguiente.hora_inicio} – {siguiente.hora_fin}</span>
                            <span className="inline-flex items-center gap-1"><MapPinIcon className="w-4 h-4" /> {siguiente.sucursal?.nombre}{siguiente.lugar ? ` · ${siguiente.lugar}` : ''}</span>
                            {esInstructor
                                ? <span className="inline-flex items-center gap-1"><UsersIcon className="w-4 h-4" /> {siguiente.inscritos}/{siguiente.cupo} inscritos</span>
                                : <span>con {siguiente.instructor?.nombre}</span>}
                        </div>
                    </div>

                    <ul className="px-6 py-4 divide-y divide-slate-100">
                        {clases.slice(1).map(c => (
                            <li key={c.id} className="py-2.5 flex items-center gap-3">
                                <span className="w-1.5 h-9 rounded-full flex-shrink-0" style={{ backgroundColor: colorClase(c.nombre) }} aria-hidden />
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-bold text-slate-800 truncate">{c.nombre}</p>
                                    <p className="text-[11px] text-slate-500 truncate">{etiquetaDia(c.fecha)} · {c.hora_inicio} · {c.sucursal?.nombre}</p>
                                    {!esInstructor && c.pago_pendiente && <p className="text-[10px] font-bold text-amber-700">Pago en revisión</p>}
                                </div>
                                {esInstructor && <span className="text-xs font-bold text-slate-500 tabular-nums">{c.inscritos}/{c.cupo}</span>}
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    );
};

export default MisClasesCard;
