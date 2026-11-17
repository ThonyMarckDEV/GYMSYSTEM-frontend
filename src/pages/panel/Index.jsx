import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboard } from 'services/perfilService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import LoadingScreen from 'components/Shared/LoadingScreen';
import MisClasesCard from 'components/Clases/MisClasesCard';
import { KpiTile } from 'components/Dashboard/Charts';
import { soles } from 'components/Pagos/PagoUI';
import { fechaLarga } from 'utilities/Fechas/fechas';
import {
    IdentificationIcon, ClockIcon, XCircleIcon, PauseCircleIcon, FireIcon, CalendarDaysIcon,
    CheckBadgeIcon, ScaleIcon, PlayIcon, TrophyIcon, ReceiptPercentIcon, ArrowRightIcon, PlusIcon, SparklesIcon
} from '@heroicons/react/24/outline';

const kg = (n) => `${Math.round(Number(n || 0)).toLocaleString('es-PE')} kg`;
const CONCEPTOS = { membresia: 'Plan', clase: 'Clase', producto: 'Compra' };

/** Tarjeta principal: la membresía y cuánto le queda. */
const MembresiaCard = ({ m }) => {
    if (m.estado === 'sin_membresia') {
        return (
            <section className="rounded-2xl p-6 bg-secondary text-white shadow-xl">
                <p className="text-[11px] font-black uppercase tracking-widest text-primary">Mi membresía</p>
                <p className="text-2xl font-black mt-1">Aún no tienes un plan activo</p>
                <p className="text-sm text-white/70 mt-1">Elige un plan y págalo en línea o en recepción para empezar a entrenar.</p>
                <Link to="/mi-perfil" className="mt-4 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-primary text-secondary font-black uppercase text-sm">Ver planes <ArrowRightIcon className="w-4 h-4" /></Link>
            </section>
        );
    }

    const vigente = m.estado === 'activa' || m.estado === 'por_vencer';
    const porVencer = m.estado === 'por_vencer';
    const titulo = vigente
        ? (m.dias_restantes === 0 ? 'Vence hoy' : `${m.dias_restantes} ${m.dias_restantes === 1 ? 'día' : 'días'} restantes`)
        : m.estado === 'congelada' ? 'Membresía congelada' : 'Membresía vencida';

    return (
        <section className={`rounded-2xl p-6 shadow-xl text-white ${vigente ? 'bg-secondary' : 'bg-slate-700'}`}>
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-[11px] font-black uppercase tracking-widest text-primary flex items-center gap-1.5"><IdentificationIcon className="w-4 h-4" /> Mi membresía · {m.plan}</p>
                    <p className="text-3xl font-black mt-1 tabular-nums">{titulo}</p>
                    {m.fecha_fin && (
                        <p className="text-sm text-white/70 mt-0.5">
                            {vigente ? 'Vigente hasta el' : 'Terminó el'} {fechaLarga(m.fecha_fin)}{m.sucursal ? ` · Sede ${m.sucursal}` : ''}
                        </p>
                    )}
                </div>
                {m.estado === 'congelada' && <PauseCircleIcon className="w-10 h-10 text-primary shrink-0" />}
            </div>

            {vigente && m.porcentaje_usado !== null && (
                <div className="mt-4">
                    <div className="h-2.5 rounded-full bg-white/15 overflow-hidden" role="progressbar" aria-valuenow={m.porcentaje_usado} aria-valuemin={0} aria-valuemax={100} aria-label="Tiempo usado de la membresía">
                        <div className={`h-full rounded-full ${porVencer ? 'bg-amber-400' : 'bg-primary'}`} style={{ width: `${m.porcentaje_usado}%` }} />
                    </div>
                    <div className="mt-1 flex justify-between text-[11px] text-white/60 tabular-nums">
                        <span>{m.fecha_inicio}</span><span>{m.porcentaje_usado}% usado</span><span>{m.fecha_fin}</span>
                    </div>
                </div>
            )}

            {m.siguiente ? (
                <p className="mt-4 text-sm bg-white/10 rounded-lg px-3 py-2">
                    ✔ Ya renovaste: tu plan <b>{m.siguiente.plan}</b> empieza el {fechaLarga(m.siguiente.fecha_inicio)}.
                </p>
            ) : m.puede_renovar && (porVencer || !vigente) && m.estado !== 'congelada' ? (
                <Link to="/mi-perfil" className="mt-4 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-primary text-secondary font-black uppercase text-sm">
                    Renovar ahora <ArrowRightIcon className="w-4 h-4" />
                </Link>
            ) : m.estado === 'congelada' ? (
                <p className="mt-4 text-sm text-white/70">Para reanudarla acércate a recepción.</p>
            ) : null}
        </section>
    );
};

/** "Hoy te toca": el siguiente día de su rutina. */
const EntrenoHoyCard = ({ e }) => {
    if (!e.tiene_rutinas) {
        return (
            <section className="bg-white rounded-2xl border border-dashed border-slate-300 p-5 h-full flex flex-col justify-center">
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5"><SparklesIcon className="w-4 h-4" /> Tu entrenamiento</p>
                <p className="font-black text-secondary mt-1">Arma tu primera rutina</p>
                <p className="text-sm text-slate-500">Elige tus ejercicios, series y peso, y registra cada entreno para ver tu progreso.</p>
                <Link to="/mis-rutinas" className="mt-3 self-start inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-secondary font-black uppercase text-xs"><PlusIcon className="w-4 h-4" /> Crear rutina</Link>
            </section>
        );
    }
    const s = e.sugerencia;
    return (
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 h-full flex flex-col">
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5"><FireIcon className="w-4 h-4" /> {e.entreno_hoy ? 'Ya entrenaste hoy 💪 · el próximo' : 'Hoy te toca'}</p>
            <p className="text-2xl font-black text-secondary uppercase leading-tight mt-1">{s.dia_nombre}</p>
            <p className="text-sm text-slate-500">{s.rutina} · {s.ejercicios} ejercicios</p>
            {e.ultima_sesion && <p className="text-[11px] text-slate-400 mt-1">Último entreno: {fechaLarga(e.ultima_sesion.fecha)} ({e.ultima_sesion.dia_nombre})</p>}
            <div className="mt-auto pt-4 flex gap-2">
                <Link to={`/mis-rutinas/entrenar/${s.rutina_id}/${s.dia}`} className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-secondary text-primary font-black uppercase text-sm">
                    <PlayIcon className="w-4 h-4" /> Empezar
                </Link>
                <Link to="/mis-rutinas" className="px-4 py-2.5 rounded-lg border border-slate-300 text-sm font-bold text-slate-600 hover:border-slate-500">Mis rutinas</Link>
            </div>
        </section>
    );
};

/** Panel del cliente. */
const Index = () => {
    const [datos, setDatos] = useState(null);
    const [alert, setAlert] = useState(null);

    useEffect(() => {
        dashboard().then(r => setDatos(r.data)).catch(err => setAlert(handleApiError(err, 'No se pudo cargar tu panel')));
    }, []);

    if (!datos) return alert ? <div className="container mx-auto p-6"><AlertMessage type={alert.type} message={alert.message} details={alert.details} /></div> : <LoadingScreen />;

    const { cliente, membresia, avisos, clases, entrenamiento: e, pagos } = datos;

    return (
        <div className="container mx-auto p-4 sm:p-6 max-w-6xl">
            <div className="mb-5">
                <h1 className="text-2xl sm:text-3xl font-black text-secondary">¡Hola, {cliente.nombre}! 👋</h1>
                {cliente.socio_desde && <p className="text-sm text-slate-500">Entrenando con nosotros desde {fechaLarga(cliente.socio_desde)}</p>}
            </div>

            {/* AVISOS */}
            {(avisos.pagos_en_revision.length > 0 || avisos.pago_rechazado) && (
                <div className="space-y-2 mb-5">
                    {avisos.pagos_en_revision.map(p => (
                        <p key={p.id} className="flex items-start gap-2 text-sm text-amber-900 bg-amber-50 border border-amber-200 rounded-xl p-3">
                            <ClockIcon className="w-5 h-5 shrink-0" />
                            <span>Tu pago de <b>{CONCEPTOS[p.concepto] ? `${CONCEPTOS[p.concepto].toLowerCase()} ` : ''}{p.descripcion}</b> ({soles(p.monto)}) está en revisión. Te avisaremos cuando recepción lo verifique.</span>
                        </p>
                    ))}
                    {avisos.pago_rechazado && (
                        <p className="flex items-start gap-2 text-sm text-red-900 bg-red-50 border border-red-200 rounded-xl p-3">
                            <XCircleIcon className="w-5 h-5 shrink-0" />
                            <span>Rechazaron tu pago de <b>{avisos.pago_rechazado.descripcion}</b>: {avisos.pago_rechazado.motivo}. Puedes volver a enviarlo o acercarte a recepción.</span>
                        </p>
                    )}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
                <div className="lg:col-span-2"><MembresiaCard m={membresia} /></div>
                <EntrenoHoyCard e={e} />
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
                <KpiTile label="Entrenos esta semana" valor={e.sesiones_semana} icon={FireIcon} ayuda={`${e.sesiones_mes} en el mes`} />
                <KpiTile label="Racha" valor={`${e.racha_semanas} ${e.racha_semanas === 1 ? 'semana' : 'semanas'}`} icon={CalendarDaysIcon} ayuda="Semanas seguidas entrenando" />
                <KpiTile label="Clases este mes" valor={clases.asistidas_mes} icon={CheckBadgeIcon} ayuda={`${clases.reservas_proximas} reservadas${clases.faltas_mes ? ` · ${clases.faltas_mes} faltas` : ''}`} />
                <KpiTile label="Volumen semanal" valor={kg(e.volumen_semana)} icon={ScaleIcon} ayuda="Repeticiones × peso" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2">
                    <MisClasesCard esInstructor={false} />
                </div>

                <div className="space-y-5">
                    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                        <h3 className="text-slate-500 text-[11px] font-black uppercase tracking-widest flex items-center gap-2"><TrophyIcon className="w-4 h-4" /> Mis récords</h3>
                        {e.records.length === 0 ? (
                            <p className="text-sm text-slate-400 mt-3">Registra tus entrenamientos y aquí verás tus mejores pesos.</p>
                        ) : (
                            <ul className="mt-2 divide-y divide-slate-100">
                                {e.records.map(r => (
                                    <li key={r.ejercicio} className="py-2 flex justify-between gap-2 text-sm">
                                        <span className="font-bold text-slate-700 truncate">{r.ejercicio}</span>
                                        <span className="font-black text-secondary tabular-nums shrink-0">{r.peso_max} kg</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>

                    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                        <div className="flex items-center justify-between gap-2">
                            <h3 className="text-slate-500 text-[11px] font-black uppercase tracking-widest flex items-center gap-2"><ReceiptPercentIcon className="w-4 h-4" /> Mis últimos pagos</h3>
                            <Link to="/mis-pagos" className="text-xs font-bold text-slate-500 hover:text-secondary inline-flex items-center gap-1">Ver todos <ArrowRightIcon className="w-3.5 h-3.5" /></Link>
                        </div>
                        {pagos.length === 0 ? (
                            <p className="text-sm text-slate-400 mt-3">Aún no tienes pagos registrados.</p>
                        ) : (
                            <ul className="mt-2 divide-y divide-slate-100">
                                {pagos.map(p => (
                                    <li key={p.id} className="py-2 flex justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-slate-700 truncate">{p.descripcion}</p>
                                            <p className="text-[11px] text-slate-400">{CONCEPTOS[p.concepto] || 'Pago'} · {fechaLarga(p.fecha)}</p>
                                        </div>
                                        <span className="text-sm font-black text-secondary tabular-nums shrink-0">{soles(p.monto)}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Index;
