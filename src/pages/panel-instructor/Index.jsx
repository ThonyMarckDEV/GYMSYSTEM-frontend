import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { panel } from 'services/claseService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import LoadingScreen from 'components/Shared/LoadingScreen';
import MisClasesCard from 'components/Clases/MisClasesCard';
import ClaseDetalleModal from 'components/Clases/ClaseDetalleModal';
import { colorClase } from 'components/Clases/ClaseUI';
import { KpiTile } from 'components/Dashboard/Charts';
import { fechaLarga } from 'utilities/Fechas/fechas';
import {
    CalendarDaysIcon, ClipboardDocumentCheckIcon, UsersIcon, ChartBarIcon,
    WrenchScrewdriverIcon, ClockIcon, MapPinIcon, CheckCircleIcon, PlusIcon, ArrowRightIcon
} from '@heroicons/react/24/outline';

const pct = (n) => (n === null || n === undefined ? '—' : `${n}%`);

/** Estado de una clase de hoy según la hora. */
const momento = (c) => {
    if (c.terminada) return { texto: c.asistencia_tomada ? 'Terminada' : 'Terminada · falta asistencia', cls: c.asistencia_tomada ? 'text-slate-400' : 'text-amber-700' };
    if (c.ya_empezo) return { texto: 'En curso', cls: 'text-green-700' };
    return { texto: `Empieza a las ${c.hora_inicio}`, cls: 'text-slate-500' };
};

/** Panel del instructor. */
const Index = () => {
    const navigate = useNavigate();
    const [datos, setDatos] = useState(null);
    const [alert, setAlert] = useState(null);
    const [abierta, setAbierta] = useState(null);

    const cargar = useCallback(() => {
        panel().then(r => setDatos(r.data)).catch(err => setAlert(handleApiError(err, 'No se pudo cargar tu panel')));
    }, []);

    useEffect(() => { cargar(); }, [cargar]);

    if (!datos) return alert ? <div className="container mx-auto p-6"><AlertMessage type={alert.type} message={alert.message} details={alert.details} /></div> : <LoadingScreen />;

    const { instructor, hoy, pendientes_asistencia: pendientes, mes, por_clase: porClase, equipos } = datos;
    const maxAsist = Math.max(1, ...porClase.map(c => c.asistencias));

    return (
        <div className="container mx-auto p-4 sm:p-6 max-w-6xl">
            <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-secondary">¡Hola, {instructor.nombre}! 💪</h1>
                    <p className="text-sm text-slate-500">{instructor.sede ? `Sede ${instructor.sede} · ` : ''}{hoy.length ? `Hoy dictas ${hoy.length} ${hoy.length === 1 ? 'clase' : 'clases'}` : 'Hoy no tienes clases'}</p>
                </div>
                <Link to="/clases" className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-primary text-secondary font-black uppercase text-sm shadow hover:bg-primary-hover">
                    <PlusIcon className="w-4 h-4" /> Programar clase
                </Link>
            </div>

            <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />

            {/* ASISTENCIAS PENDIENTES */}
            {pendientes.length > 0 && (
                <section className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                    <h2 className="font-black text-amber-900 flex items-center gap-2"><ClipboardDocumentCheckIcon className="w-5 h-5" /> Te falta tomar asistencia en {pendientes.length} {pendientes.length === 1 ? 'clase' : 'clases'}</h2>
                    <ul className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                        {pendientes.map(c => (
                            <li key={c.id}>
                                <button onClick={() => setAbierta(c)} className="w-full flex items-center justify-between gap-3 p-3 rounded-xl bg-white border border-amber-200 text-left hover:border-amber-400">
                                    <div className="min-w-0">
                                        <p className="text-sm font-black text-slate-800 truncate">{c.nombre}</p>
                                        <p className="text-[11px] text-slate-500">{fechaLarga(c.fecha)} · {c.hora_inicio} · {c.inscritos} inscritos</p>
                                    </div>
                                    <span className="text-xs font-black uppercase text-amber-800 shrink-0">Tomar asistencia →</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {/* HOY */}
            <section className="mb-5">
                <h2 className="text-slate-500 text-[11px] font-black uppercase tracking-widest flex items-center gap-2 mb-2"><CalendarDaysIcon className="w-4 h-4" /> Tus clases de hoy</h2>
                {hoy.length === 0 ? (
                    <p className="text-sm text-slate-400 bg-white border border-dashed border-slate-300 rounded-2xl p-6 text-center">No tienes clases programadas para hoy.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                        {hoy.map(c => {
                            const m = momento(c);
                            return (
                                <button key={c.id} onClick={() => setAbierta(c)}
                                    className="text-left bg-white rounded-2xl border border-slate-200 shadow-sm p-4 hover:shadow-md transition-shadow"
                                    style={{ borderLeftWidth: 6, borderLeftColor: colorClase(c.nombre) }}>
                                    <div className="flex items-start justify-between gap-2">
                                        <p className="font-black text-secondary uppercase truncate">{c.nombre}</p>
                                        {c.asistencia_tomada && <CheckCircleIcon className="w-5 h-5 text-green-600 shrink-0" aria-label="Asistencia tomada" />}
                                    </div>
                                    <p className="text-sm text-slate-600 tabular-nums flex items-center gap-1"><ClockIcon className="w-4 h-4 text-slate-400" /> {c.hora_inicio} – {c.hora_fin}</p>
                                    <p className="text-xs text-slate-500 flex items-center gap-1"><MapPinIcon className="w-3.5 h-3.5 text-slate-400" /> {c.sucursal?.nombre}{c.lugar ? ` · ${c.lugar}` : ''}</p>
                                    <div className="mt-2 flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-700 inline-flex items-center gap-1"><UsersIcon className="w-4 h-4" /> {c.inscritos}/{c.cupo}</span>
                                        <span className={`text-[11px] font-black uppercase ${m.cls}`}>{m.texto}</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* EL MES */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
                <KpiTile destacado label="Clases dictadas" valor={mes.clases_dictadas} icon={CalendarDaysIcon} ayuda={`Este mes · ${mes.proximas_7_dias} en los próximos 7 días`} />
                <KpiTile label="Alumnos que asistieron" valor={mes.alumnos} icon={UsersIcon} ayuda="Este mes" />
                <KpiTile label="Asistencia" valor={pct(mes.asistencia_pct)} icon={ClipboardDocumentCheckIcon} ayuda="De los inscritos marcados" />
                <KpiTile label="Ocupación" valor={pct(mes.ocupacion_pct)} icon={ChartBarIcon} ayuda="Inscritos sobre el cupo" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2">
                    <MisClasesCard esInstructor />
                </div>

                <div className="space-y-5">
                    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                        <h3 className="text-slate-500 text-[11px] font-black uppercase tracking-widest flex items-center gap-2"><ChartBarIcon className="w-4 h-4" /> Tus clases del mes</h3>
                        {porClase.length === 0 ? (
                            <p className="text-sm text-slate-400 mt-3">Aún no hay asistencias registradas este mes.</p>
                        ) : (
                            <ul className="mt-3 space-y-3">
                                {porClase.map(c => (
                                    <li key={c.nombre}>
                                        <div className="flex items-baseline justify-between gap-2 text-sm">
                                            <span className="font-bold text-slate-700 truncate">{c.nombre}</span>
                                            <span className="text-xs text-slate-500 tabular-nums shrink-0"><b className="text-secondary">{c.asistencias}</b> asistencias · {c.sesiones} {c.sesiones === 1 ? 'sesión' : 'sesiones'}</span>
                                        </div>
                                        <div className="h-2 mt-1 rounded-full bg-slate-100 overflow-hidden" aria-hidden>
                                            <div className="h-full rounded-full" style={{ width: `${(c.asistencias * 100) / maxAsist}%`, backgroundColor: colorClase(c.nombre) }} />
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>

                    {(equipos.averiados > 0 || equipos.mantenimiento > 0) && (
                        <section className="rounded-2xl border border-red-200 bg-red-50 p-5">
                            <h3 className="font-black text-red-800 flex items-center gap-2"><WrenchScrewdriverIcon className="w-5 h-5" /> Equipos con problemas</h3>
                            <p className="text-sm text-red-900 mt-1">
                                {equipos.averiados > 0 && <><b>{equipos.averiados}</b> {equipos.averiados === 1 ? 'averiado' : 'averiados'}</>}
                                {equipos.averiados > 0 && equipos.mantenimiento > 0 && ' · '}
                                {equipos.mantenimiento > 0 && <><b>{equipos.mantenimiento}</b> en mantenimiento</>}
                                {' '}en tu sede. Tenlo en cuenta al planificar tus clases.
                            </p>
                            <Link to="/inventario" className="mt-2 inline-flex items-center gap-1 text-xs font-black uppercase text-red-800 hover:underline">Ver inventario <ArrowRightIcon className="w-3.5 h-3.5" /></Link>
                        </section>
                    )}
                </div>
            </div>

            {abierta && (
                <ClaseDetalleModal clase={abierta} esCliente={false}
                    onClose={() => setAbierta(null)}
                    onCambio={(msg) => { if (msg) setAlert({ type: 'success', message: msg }); cargar(); }}
                    onEditar={() => { setAbierta(null); navigate('/clases'); }} />
            )}
        </div>
    );
};

export default Index;
