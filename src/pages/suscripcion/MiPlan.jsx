import React, { useEffect, useState } from 'react';
import { RocketLaunchIcon, CheckCircleIcon, CalendarDaysIcon, ExclamationTriangleIcon, ReceiptPercentIcon } from '@heroicons/react/24/outline';
import { miPlan, miReciboUrl } from 'services/suscripcionService';
import { useTicket, BotonTicket } from 'components/Pagos/PagoUI';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';
import PageHeader from 'components/Shared/Headers/PageHeader';
import LoadingScreen from 'components/Shared/LoadingScreen';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import { Medidor, RECURSOS } from 'components/Dashboard/MiPlanCard';

const soles = (n) => `S/ ${Number(n || 0).toFixed(2)}`;
const fecha = (d) => (d ? new Date(`${d}T00:00:00`).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');
const METODOS = { transferencia: 'Transferencia', yape: 'Yape', plin: 'Plin', efectivo: 'Efectivo', tarjeta: 'Tarjeta' };
const TIPO_PAGO = { subida: 'Subió de plan', bajada: 'Baja de plan' };

/** Estado de la suscripción con su color y texto (nunca solo color). */
const EstadoSuscripcion = ({ s }) => {
    if (!s?.vence) return <span className="text-sm text-slate-500">Sin fecha de vencimiento</span>;
    if (s.bloqueada) return <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-700"><ExclamationTriangleIcon className="w-4 h-4" /> Vencida — acceso bloqueado</span>;
    if (s.vencida) return <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-700"><ExclamationTriangleIcon className="w-4 h-4" /> Vencida — en gracia hasta el {fecha(s.gracia_hasta)}</span>;
    if (s.dias_restantes <= 7) return <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-700"><CalendarDaysIcon className="w-4 h-4" /> Vence en {s.dias_restantes} {s.dias_restantes === 1 ? 'día' : 'días'}</span>;
    return <span className="inline-flex items-center gap-1.5 text-sm text-emerald-700"><CheckCircleIcon className="w-4 h-4" /> Activa · quedan {s.dias_restantes} días</span>;
};

/**
 * Mi plan (cada empresa): plan contratado, consumo vs. límites, beneficios
 * incluidos y no incluidos, historial de pagos y planes para mejorar.
 */
const MiPlan = () => {
    const [data, setData] = useState(null);
    const [alert, setAlert] = useState(null);
    const { abrirTicket, TicketModal, errorTicket } = useTicket(miReciboUrl, 'Recibo de suscripción');

    useEffect(() => { if (errorTicket) setAlert({ type: 'error', message: errorTicket }); }, [errorTicket]);

    useEffect(() => {
        miPlan().then(r => setData(r.data)).catch(err => setAlert(handleApiError(err, 'No se pudo cargar tu plan.')));
    }, []);

    if (!data && !alert) return <LoadingScreen />;

    const plan = data?.plan;

    return (
        <div className="container mx-auto p-6 space-y-6">
            <PageHeader title="Mi plan" subtitle="Tu suscripción y cuánto estás usando de tu plan" icon={RocketLaunchIcon} />
            <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />
            <TicketModal />

            {data && (
                <>
                    {/* PLAN Y ESTADO */}
                    <div className="bg-secondary text-white rounded-2xl p-6 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Plan actual</p>
                            <p className="text-3xl font-bold mt-1">{plan?.nombre || 'Sin plan'}</p>
                            {plan?.descripcion && <p className="text-sm text-white/70 mt-1 max-w-xl">{plan.descripcion}</p>}
                        </div>
                        <div className="md:text-right">
                            {plan && <p className="text-2xl font-bold tabular-nums">{soles(plan.precio_mensual)}<span className="text-sm font-medium text-white/60"> / mes</span></p>}
                            <p className="text-sm text-white/70 mt-1">Vence: <b className="text-white">{fecha(data.suscripcion?.vence)}</b></p>
                            {data.suscripcion?.cambio_programado && (
                                <p className="text-sm text-amber-300 mt-1">
                                    Desde el <b>{fecha(data.suscripcion.cambio_programado.desde)}</b> pasa al plan <b>{data.suscripcion.cambio_programado.plan}</b>
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="-mt-3"><EstadoSuscripcion s={data.suscripcion} /></div>

                    {/* CONSUMO */}
                    <section className="bg-white rounded-xl border border-slate-200 shadow-card p-6">
                        <h2 className="text-base font-semibold text-slate-900 mb-1">Uso de tu plan</h2>
                        <p className="text-sm text-slate-500 mb-5">Tienes todas las funciones del sistema; el plan solo define cuántas sedes, cajas, clientes, empleados y productos puedes tener.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-5">
                            {RECURSOS.map(r => <Medidor key={r.key} label={r.label} icon={r.icon} {...(data.recursos?.[r.key] || {})} />)}
                        </div>
                    </section>

                    {/* PLANES PARA COMPARAR */}
                    <section>
                        <h2 className="text-base font-semibold text-slate-900 mb-3">Planes disponibles</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {(data.planes || []).map(p => {
                                const actual = p.id === plan?.id;
                                const lim = (v, txt) => (v === null || v === undefined ? `${txt} ilimitados` : `Hasta ${v} ${txt}`);
                                return (
                                    <div key={p.id} className={`rounded-xl border p-5 bg-white shadow-card ${actual ? 'border-secondary ring-1 ring-secondary' : 'border-slate-200'}`}>
                                        <div className="flex items-center justify-between">
                                            <p className="font-bold text-slate-900">{p.nombre}</p>
                                            {actual && <span className="text-[11px] font-semibold bg-secondary text-primary rounded-full px-2 py-0.5">Tu plan</span>}
                                        </div>
                                        <p className="text-2xl font-bold text-slate-900 mt-2 tabular-nums">{soles(p.precio_mensual)}<span className="text-sm font-medium text-slate-400"> / mes</span></p>
                                        <ul className="mt-4 space-y-1.5 text-sm text-slate-600">
                                            <li>{lim(p.max_sucursales, 'sedes')}</li>
                                            <li>{p.max_cajas_por_sucursal == null ? 'Cajas ilimitadas' : `Hasta ${p.max_cajas_por_sucursal} ${p.max_cajas_por_sucursal === 1 ? 'caja' : 'cajas'} por sede`}</li>
                                            <li>{lim(p.max_clientes, 'clientes')}</li>
                                            <li>{lim(p.max_empleados, 'empleados')}</li>
                                            <li>{lim(p.max_productos, 'productos')}</li>
                                            <li className="flex items-center gap-1.5 pt-1 text-emerald-700"><CheckCircleIcon className="w-4 h-4" /> Todas las funciones</li>
                                        </ul>
                                    </div>
                                );
                            })}
                        </div>
                        <p className="text-sm text-slate-500 mt-3">Para cambiar de plan o renovar, contacta al administrador del sistema.</p>
                    </section>

                    {/* PAGOS */}
                    <section className="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden">
                        <h2 className="text-base font-semibold text-slate-900 px-6 pt-5 pb-3 flex items-center gap-2"><ReceiptPercentIcon className="w-5 h-5" /> Pagos de tu suscripción</h2>
                        {data.pagos?.length ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm">
                                    <thead className="bg-slate-50 border-y border-slate-200 text-[11px] uppercase tracking-wider text-slate-500">
                                        <tr><th className="text-left px-6 py-2.5 font-semibold">Periodo</th><th className="text-left px-4 py-2.5 font-semibold">Plan</th><th className="text-left px-4 py-2.5 font-semibold">Meses</th><th className="text-left px-4 py-2.5 font-semibold">Monto</th><th className="text-left px-4 py-2.5 font-semibold">Método</th><th className="text-left px-4 py-2.5 font-semibold">Estado</th><th className="px-4 py-2.5"><span className="sr-only">Recibo</span></th></tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {data.pagos.map(p => (
                                            <tr key={p.id} className={p.estado === 'anulado' ? 'text-slate-400' : 'text-slate-700'}>
                                                <td className="px-6 py-3 whitespace-nowrap">{fecha(p.periodo_desde)} — {fecha(p.periodo_hasta)}</td>
                                                <td className="px-4 py-3">
                                                    {p.plan}
                                                    {p.tipo && p.tipo !== 'renovacion' && <span className="block text-[11px] text-slate-500">{TIPO_PAGO[p.tipo]}{p.dias_credito > 0 ? ` · +${p.dias_credito} días de saldo` : ''}</span>}
                                                </td>
                                                <td className="px-4 py-3 tabular-nums">{p.meses}</td>
                                                <td className="px-4 py-3 font-semibold tabular-nums">{soles(p.monto)}</td>
                                                <td className="px-4 py-3">{METODOS[p.metodo_pago] || p.metodo_pago}</td>
                                                <td className="px-4 py-3">{p.estado === 'anulado' ? 'Anulado' : 'Pagado'}</td>
                                                <td className="px-4 py-1.5 text-right"><BotonTicket compacto onClick={() => abrirTicket(p.id)} /></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : <p className="px-6 pb-6 text-sm text-slate-500">Aún no hay pagos registrados.</p>}
                    </section>
                </>
            )}
        </div>
    );
};

export default MiPlan;
