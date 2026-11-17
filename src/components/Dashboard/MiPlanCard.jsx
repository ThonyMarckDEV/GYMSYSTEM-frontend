import React, { useEffect, useState } from 'react';
import { RocketLaunchIcon, BuildingStorefrontIcon, UsersIcon, UserGroupIcon, CalendarDaysIcon, ExclamationTriangleIcon, InboxStackIcon } from '@heroicons/react/24/outline';
import { miPlan } from 'services/suscripcionService';

const RECURSOS = [
    { key: 'sucursales', label: 'Sucursales', icon: BuildingStorefrontIcon },
    { key: 'cajas_por_sucursal', label: 'Cajas por sede', icon: InboxStackIcon },
    { key: 'clientes',   label: 'Clientes',   icon: UsersIcon },
    { key: 'empleados',  label: 'Empleados',  icon: UserGroupIcon },
];

/**
 * Medidor de uso: la barra es neutra y solo cambia a estado (ámbar/rojo)
 * cerca del límite, siempre acompañada de texto (no se depende solo del color).
 */
const Medidor = ({ label, icon: Icon, usado, limite, porcentaje, detalle }) => {
    const ilimitado = limite === null || limite === undefined;
    const lleno = !ilimitado && usado >= limite;
    const cerca = !ilimitado && !lleno && porcentaje >= 80;

    const barColor = lleno ? 'bg-red-600' : cerca ? 'bg-amber-500' : 'bg-zinc-800';

    return (
        <div>
            <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="flex items-center gap-1.5 font-bold text-slate-700">
                    <Icon className="w-4 h-4 text-slate-400" /> {label}
                </span>
                <span className="font-black text-secondary tabular-nums">
                    {usado}<span className="text-slate-400 font-bold"> / {ilimitado ? '∞' : limite}</span>
                </span>
            </div>
            <div className="h-2 rounded-full bg-slate-100 overflow-hidden"
                role="meter" aria-valuenow={usado} aria-valuemin={0} aria-valuemax={ilimitado ? undefined : limite}
                aria-label={`${label}: ${usado} de ${ilimitado ? 'ilimitado' : limite}`}>
                <div className={`h-full rounded-full ${barColor}`} style={{ width: ilimitado ? '100%' : `${Math.max(porcentaje ?? 0, usado > 0 ? 4 : 0)}%`, opacity: ilimitado ? 0.15 : 1 }} />
            </div>
            {lleno && <p className="mt-1 text-[11px] font-bold text-red-700 flex items-center gap-1"><ExclamationTriangleIcon className="w-3.5 h-3.5" /> Límite alcanzado</p>}
            {cerca && <p className="mt-1 text-[11px] font-bold text-amber-700 flex items-center gap-1"><ExclamationTriangleIcon className="w-3.5 h-3.5" /> Cerca del límite</p>}
            {ilimitado && <p className="mt-1 text-[11px] text-slate-400">Ilimitado</p>}
            {/* Cajas: el límite es por sede, se muestra cada una */}
            {detalle?.length > 0 && (
                <p className="mt-1 text-[11px] text-slate-500">
                    {detalle.map(d => `${d.sucursal} ${d.usado}/${ilimitado ? '∞' : limite}`).join(' · ')}
                </p>
            )}
        </div>
    );
};

/** Tarjeta "Mi plan": plan contratado por la empresa y su consumo. */
const MiPlanCard = ({ data: dataProp }) => {
    const [data, setData] = useState(dataProp || null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (dataProp) { setData(dataProp); return; }
        miPlan()
            .then(res => setData(res.data))
            .catch(err => setError(err.details?.[0] || err.message || 'No se pudo cargar el plan.'));
    }, [dataProp]);

    if (error) return null;
    if (!data) {
        return <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm animate-pulse h-56" />;
    }

    const { plan, recursos, suscripcion_vence, dias_restantes } = data;
    const porVencer = dias_restantes !== null && dias_restantes <= 7;

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                    <h3 className="text-slate-500 text-[11px] font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                        <RocketLaunchIcon className="w-4 h-4" /> Mi plan
                    </h3>
                    <p className="text-2xl font-black text-secondary leading-none">{plan?.nombre || 'Sin plan'}</p>
                    {plan?.descripcion && <p className="text-xs text-slate-500 mt-1">{plan.descripcion}</p>}
                </div>
                {plan && (
                    <div className="text-right">
                        <p className="text-lg font-black text-secondary tabular-nums">S/ {Number(plan.precio_mensual).toFixed(2)}</p>
                        <p className="text-[10px] uppercase font-bold text-slate-400">por mes</p>
                    </div>
                )}
            </div>

            <div className="space-y-4">
                {RECURSOS.map(r => (
                    recursos[r.key] && <Medidor key={r.key} label={r.label} icon={r.icon} {...recursos[r.key]} />
                ))}
            </div>

            {suscripcion_vence && (
                <div className={`mt-6 pt-4 border-t border-slate-100 text-xs flex items-center gap-1.5 font-bold ${porVencer ? 'text-red-700' : 'text-slate-500'}`}>
                    {porVencer ? <ExclamationTriangleIcon className="w-4 h-4" /> : <CalendarDaysIcon className="w-4 h-4" />}
                    Vence el {suscripcion_vence}
                    {dias_restantes >= 0 ? ` (en ${dias_restantes} días)` : ' (vencida)'}
                </div>
            )}
        </div>
    );
};

export default MiPlanCard;
