import React from 'react';
import { Link } from 'react-router-dom';
import { ExclamationTriangleIcon, LockClosedIcon, GlobeAltIcon, BuildingOffice2Icon, BuildingStorefrontIcon } from '@heroicons/react/24/outline';
import { useAuth } from 'context/AuthContext';

const fecha = (d) => (d ? new Date(`${d}T00:00:00`).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' }) : '');

/** Días que faltan para una fecha YYYY-MM-DD (0 = hoy). */
const diasHasta = (d) => {
    const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
    return Math.round((new Date(`${d}T00:00:00`) - hoy) / 86400000);
};

const Aviso = ({ icon: Icon, tono, children }) => {
    const tonos = {
        neutro: 'bg-slate-100 border-slate-200 text-slate-700',
        ambar: 'bg-amber-50 border-amber-200 text-amber-900',
        rojo: 'bg-red-50 border-red-200 text-red-800',
    };
    return (
        <div className={`mx-6 mt-4 px-4 py-2.5 rounded-lg border text-sm flex items-start gap-2 ${tonos[tono]}`} role="status">
            <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div className="min-w-0">{children}</div>
        </div>
    );
};

/**
 * Avisos arriba de cada pantalla (SaaS):
 * - superadmin: modo plataforma o dentro de qué empresa está
 * - modo sucursal
 * - la suscripción de la empresa por vencer o vencida (en gracia)
 */
export const AvisosSuscripcion = () => {
    const { esSuperAdmin, empresaActiva, sucursalActiva, suscripcion, can } = useAuth();
    const verPlan = can('suscripcion.miPlan');

    return (
        <>
            {esSuperAdmin && !empresaActiva && (
                <Aviso icon={GlobeAltIcon} tono="neutro">
                    <b>Modo plataforma:</b> ves la información de todas las empresas. Para dar soporte a un gimnasio, elígelo en el menú lateral.
                </Aviso>
            )}
            {esSuperAdmin && empresaActiva && (
                <Aviso icon={BuildingOffice2Icon} tono="ambar">
                    Estás dentro de <b>{empresaActiva.nombre_comercial}</b>. Lo que registres quedará en esa empresa.
                </Aviso>
            )}
            {sucursalActiva && (
                <Aviso icon={BuildingStorefrontIcon} tono="neutro">
                    Modo sucursal: estás viendo solo la sede <b>{sucursalActiva.nombre}</b>. Cámbialo a "Todas las sedes" en el menú lateral.
                </Aviso>
            )}
            {suscripcion?.vencida && !suscripcion.bloqueada && (
                <Aviso icon={ExclamationTriangleIcon} tono="rojo">
                    La suscripción venció el <b>{fecha(suscripcion.vence)}</b>. Puedes seguir usando el sistema hasta el <b>{fecha(suscripcion.gracia_hasta)}</b>; renueva antes para no perder el acceso.
                    {verPlan && <> <Link to="/mi-plan" className="font-semibold underline underline-offset-2">Ver mi plan</Link></>}
                </Aviso>
            )}
            {suscripcion?.cambio_programado && diasHasta(suscripcion.cambio_programado.desde) <= 7 && (
                <Aviso icon={ExclamationTriangleIcon} tono="ambar">
                    El <b>{fecha(suscripcion.cambio_programado.desde)}</b> la empresa pasa al plan <b>{suscripcion.cambio_programado.plan}</b> y dejarán de estar disponibles los beneficios que ese plan no incluye.
                    {verPlan && <> <Link to="/mi-plan" className="font-semibold underline underline-offset-2">Ver mi plan</Link></>}
                </Aviso>
            )}
            {suscripcion && !suscripcion.vencida && suscripcion.dias_restantes !== null && suscripcion.dias_restantes <= 7 && (
                <Aviso icon={ExclamationTriangleIcon} tono="ambar">
                    La suscripción vence {suscripcion.dias_restantes === 0 ? <b>hoy</b> : <>en <b>{suscripcion.dias_restantes} {suscripcion.dias_restantes === 1 ? 'día' : 'días'}</b></>} ({fecha(suscripcion.vence)}).
                    {verPlan && <> <Link to="/mi-plan" className="font-semibold underline underline-offset-2">Ver mi plan</Link></>}
                </Aviso>
            )}
        </>
    );
};

/** Pantalla cuando la suscripción venció y pasó la gracia (el backend ya bloquea con 402). */
export const SuscripcionBloqueada = () => {
    const { empresa, suscripcion, can, logout } = useAuth();
    return (
        <div className="max-w-lg mx-auto px-6 py-16 text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-5">
                <LockClosedIcon className="w-7 h-7 text-red-600" />
            </div>
            <h1 className="text-2xl font-semibold text-slate-900">La suscripción venció</h1>
            <p className="text-slate-600 mt-2">
                La suscripción de <b>{empresa?.nombre_comercial}</b> venció el {fecha(suscripcion?.vence)}. Para seguir usando el sistema,
                el administrador de tu gimnasio debe renovar el plan.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                {can('suscripcion.miPlan') && (
                    <Link to="/mi-plan" className="px-5 py-2.5 rounded-lg bg-secondary text-white text-sm font-semibold hover:bg-black/80">Ver mi plan</Link>
                )}
                <button onClick={logout} className="px-5 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50">Cerrar sesión</button>
            </div>
        </div>
    );
};
