import React, { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { index, show, destroy, historial as listarHistorial, eliminarSesion } from 'services/rutinaService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';
import PageHeader from 'components/Shared/Headers/PageHeader';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import LoadingScreen from 'components/Shared/LoadingScreen';
import { KpiTile } from 'components/Dashboard/Charts';
import RutinaFormModal, { OBJETIVOS } from 'components/Rutinas/RutinaFormModal';
import { fechaLarga } from 'utilities/Fechas/fechas';
import {
    ClipboardDocumentListIcon, FireIcon, CalendarDaysIcon, ScaleIcon, TrophyIcon, PlayIcon,
    PencilSquareIcon, TrashIcon, PlusIcon, ClockIcon, ChevronDownIcon
} from '@heroicons/react/24/outline';

const kg = (n) => `${Math.round(Number(n || 0)).toLocaleString('es-PE')} kg`;

/** Un entrenamiento del historial (se despliega el detalle por ejercicio). */
const SesionItem = ({ s, onEliminar }) => {
    const [abierto, setAbierto] = useState(false);
    return (
        <li className="bg-white rounded-xl border border-slate-200">
            <button type="button" onClick={() => setAbierto(a => !a)} aria-expanded={abierto}
                className="w-full flex items-center justify-between gap-3 p-4 text-left">
                <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-400">{fechaLarga(s.fecha)}</p>
                    <p className="font-black text-secondary uppercase truncate">{s.dia_nombre || `Día ${s.dia}`} <span className="text-slate-400 font-semibold normal-case">· {s.rutina}</span></p>
                    <p className="text-xs text-slate-500 tabular-nums">
                        {s.series_completadas} series · {kg(s.volumen_kg)}{s.duracion_min ? ` · ${s.duracion_min} min` : ''}
                    </p>
                </div>
                <ChevronDownIcon className={`w-5 h-5 text-slate-400 shrink-0 transition-transform ${abierto ? 'rotate-180' : ''}`} />
            </button>
            {abierto && (
                <div className="px-4 pb-4 border-t border-slate-100 pt-3 space-y-2">
                    {s.ejercicios.map(e => (
                        <div key={e.nombre} className="flex flex-wrap items-baseline gap-x-2 text-sm">
                            <span className="font-bold text-slate-800">{e.nombre}</span>
                            <span className="text-xs text-slate-500 tabular-nums">{e.series.map(x => `${x.peso_kg ?? 0}×${x.repeticiones ?? '-'}`).join(' · ')}</span>
                        </div>
                    ))}
                    <div className="flex justify-end">
                        <button onClick={() => onEliminar(s)} className="inline-flex items-center gap-1 text-xs font-bold text-red-700 hover:underline"><TrashIcon className="w-3.5 h-3.5" /> Eliminar del historial</button>
                    </div>
                </div>
            )}
        </li>
    );
};

/** Mis rutinas: armar rutinas, entrenar con ellas y ver el progreso. */
const Index = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [datos, setDatos] = useState(null);
    const [pestana, setPestana] = useState('rutinas');
    const [historial, setHistorial] = useState({ items: [], page: 0, last: 1 });
    const [alert, setAlert] = useState(location.state?.mensaje ? { type: 'success', message: location.state.mensaje } : null);
    const [editando, setEditando] = useState(null);   // 'nueva' | rutina (detalle)

    const cargar = useCallback(async () => {
        try {
            const r = await index();
            setDatos(r.data);
        } catch (err) {
            setAlert(handleApiError(err, 'No se pudieron cargar tus rutinas'));
        }
    }, []);

    const cargarHistorial = useCallback(async (page = 1) => {
        try {
            const r = await listarHistorial(page);
            setHistorial(h => ({ items: page === 1 ? r.data : [...h.items, ...r.data], page: r.current_page, last: r.last_page }));
        } catch (err) {
            setAlert(handleApiError(err, 'No se pudo cargar tu historial'));
        }
    }, []);

    useEffect(() => { cargar(); }, [cargar]);
    useEffect(() => { if (pestana === 'historial' && historial.page === 0) cargarHistorial(1); }, [pestana, historial.page, cargarHistorial]);
    // El mensaje de "entrenamiento guardado" se muestra una sola vez
    useEffect(() => { if (location.state?.mensaje) window.history.replaceState({}, ''); }, [location.state]);

    const editar = async (r) => {
        try {
            const d = await show(r.id);
            setEditando(d.data);
        } catch (err) {
            setAlert(handleApiError(err, 'No se pudo abrir la rutina'));
        }
    };

    const eliminar = async (r) => {
        if (!window.confirm(`¿Eliminar la rutina ${r.nombre}? Tu historial de entrenamientos se conserva.`)) return;
        try {
            const res = await destroy(r.id);
            setAlert({ type: 'success', message: res.message });
            cargar();
        } catch (err) {
            setAlert(handleApiError(err, 'No se pudo eliminar la rutina'));
        }
    };

    const quitarSesion = async (s) => {
        if (!window.confirm('¿Eliminar este entrenamiento del historial?')) return;
        try {
            const res = await eliminarSesion(s.id);
            setAlert({ type: 'success', message: res.message });
            setHistorial(h => ({ ...h, items: h.items.filter(x => x.id !== s.id) }));
            cargar();
        } catch (err) {
            setAlert(handleApiError(err, 'No se pudo eliminar'));
        }
    };

    if (!datos) return alert ? <div className="container mx-auto p-6"><AlertMessage type={alert.type} message={alert.message} details={alert.details} /></div> : <LoadingScreen />;

    const { rutinas, resumen, limites } = datos;
    const lleno = rutinas.length >= limites.rutinas;

    return (
        <div className="container mx-auto p-4 sm:p-6">
            <PageHeader title="Mis rutinas" subtitle="Arma tu rutina, entrena y mira tu progreso" icon={ClipboardDocumentListIcon} />
            <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <KpiTile destacado label="Esta semana" valor={`${resumen.sesiones_semana} ${resumen.sesiones_semana === 1 ? 'entreno' : 'entrenos'}`} icon={FireIcon} ayuda={`${resumen.sesiones_mes} en el mes`} />
                <KpiTile label="Racha" valor={`${resumen.racha_semanas} ${resumen.racha_semanas === 1 ? 'semana' : 'semanas'}`} icon={CalendarDaysIcon} ayuda="Semanas seguidas entrenando" />
                <KpiTile label="Volumen semanal" valor={kg(resumen.volumen_semana)} icon={ScaleIcon} ayuda="Repeticiones × peso" />
                <KpiTile label="Último entreno" valor={resumen.ultima_sesion ? fechaLarga(resumen.ultima_sesion.slice(0, 10)) : '—'} icon={ClockIcon} />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="inline-flex gap-1 p-1 bg-white border border-slate-200 rounded-xl" role="tablist">
                    {[['rutinas', 'Rutinas'], ['historial', 'Historial']].map(([k, l]) => (
                        <button key={k} role="tab" aria-selected={pestana === k} onClick={() => setPestana(k)}
                            className={`px-4 py-2 rounded-lg text-sm font-black uppercase ${pestana === k ? 'bg-secondary text-primary' : 'text-slate-500 hover:text-secondary'}`}>{l}</button>
                    ))}
                </div>
                {pestana === 'rutinas' && (
                    <button onClick={() => setEditando('nueva')} disabled={lleno} title={lleno ? `Máximo ${limites.rutinas} rutinas` : undefined}
                        className="inline-flex items-center gap-1.5 bg-primary text-secondary px-5 py-2.5 rounded-lg font-black uppercase text-sm shadow hover:bg-primary-hover disabled:opacity-40">
                        <PlusIcon className="w-4 h-4" /> Nueva rutina <span className="text-xs font-bold opacity-70">{rutinas.length}/{limites.rutinas}</span>
                    </button>
                )}
            </div>

            {pestana === 'rutinas' ? (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                    <div className="xl:col-span-2 space-y-4">
                        {rutinas.length === 0 ? (
                            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center">
                                <ClipboardDocumentListIcon className="w-10 h-10 text-slate-300 mx-auto" />
                                <p className="mt-2 font-black text-secondary">Aún no tienes rutinas</p>
                                <p className="text-sm text-slate-500">Crea tu primera rutina: elige los días, los ejercicios, las series y el peso.</p>
                                <button onClick={() => setEditando('nueva')} className="mt-4 inline-flex items-center gap-1.5 bg-primary text-secondary px-5 py-2.5 rounded-lg font-black uppercase text-sm">
                                    <PlusIcon className="w-4 h-4" /> Crear rutina
                                </button>
                            </div>
                        ) : rutinas.map(r => (
                            <section key={r.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <h3 className="font-black text-secondary uppercase truncate">{r.nombre}</h3>
                                        <p className="text-xs text-slate-500">
                                            {[OBJETIVOS[r.objetivo], `${r.dias.length} ${r.dias.length === 1 ? 'día' : 'días'}`, `${r.ejercicios_total} ejercicios`, r.sesiones ? `${r.sesiones} entrenos` : null].filter(Boolean).join(' · ')}
                                        </p>
                                        {r.ultima_sesion && <p className="text-[11px] text-slate-400">Último entreno: {fechaLarga(r.ultima_sesion.slice(0, 10))}</p>}
                                    </div>
                                    <div className="flex gap-1 shrink-0">
                                        <button onClick={() => editar(r)} title="Editar" className="p-2 text-slate-500 hover:text-secondary hover:bg-primary-light rounded-lg"><PencilSquareIcon className="w-5 h-5" /></button>
                                        <button onClick={() => eliminar(r)} title="Eliminar" className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg"><TrashIcon className="w-5 h-5" /></button>
                                    </div>
                                </div>
                                <p className="mt-3 mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">¿Qué entrenas hoy?</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {r.dias.map(d => (
                                        <button key={d.dia} onClick={() => navigate(`/mis-rutinas/entrenar/${r.id}/${d.dia}`)}
                                            className="group flex items-center justify-between gap-2 p-3 rounded-xl border border-slate-200 hover:border-secondary hover:bg-secondary text-left transition-colors">
                                            <div className="min-w-0">
                                                <p className="text-sm font-black text-secondary group-hover:text-primary uppercase truncate">{d.nombre}</p>
                                                <p className="text-[11px] text-slate-400 group-hover:text-white/70">{d.ejercicios} ejercicios</p>
                                            </div>
                                            <PlayIcon className="w-5 h-5 text-slate-400 group-hover:text-primary shrink-0" />
                                        </button>
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>

                    <aside className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 h-fit">
                        <h3 className="text-sm font-black uppercase text-secondary flex items-center gap-2"><TrophyIcon className="w-5 h-5 text-primary" /> Mis récords</h3>
                        {resumen.records.length === 0 ? (
                            <p className="text-sm text-slate-400 mt-3">Tus mejores pesos aparecerán aquí cuando registres tus entrenamientos.</p>
                        ) : (
                            <ul className="mt-3 divide-y divide-slate-100">
                                {resumen.records.map(rec => (
                                    <li key={rec.ejercicio} className="py-2 flex items-center justify-between gap-2">
                                        <span className="text-sm font-bold text-slate-700 truncate">{rec.ejercicio}</span>
                                        <span className="text-sm font-black text-secondary tabular-nums shrink-0">{rec.peso_max} kg</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </aside>
                </div>
            ) : (
                <div>
                    {historial.page === 0 ? <p className="text-sm text-slate-400 text-center py-8">Cargando...</p>
                        : historial.items.length === 0 ? (
                            <p className="text-sm text-slate-400 text-center py-10 bg-white rounded-2xl border border-dashed border-slate-300">Todavía no registras entrenamientos. Elige un día de tu rutina y dale play.</p>
                        ) : (
                            <ul className="space-y-2.5 max-w-3xl">
                                {historial.items.map(s => <SesionItem key={s.id} s={s} onEliminar={quitarSesion} />)}
                            </ul>
                        )}
                    {historial.page > 0 && historial.page < historial.last && (
                        <button onClick={() => cargarHistorial(historial.page + 1)} className="mt-4 px-5 py-2.5 rounded-lg border border-slate-300 bg-white text-sm font-bold text-slate-600 hover:border-slate-500">Ver más</button>
                    )}
                </div>
            )}

            {editando && (
                <RutinaFormModal rutina={editando === 'nueva' ? null : editando} limites={limites}
                    onClose={() => setEditando(null)}
                    onGuardado={(msg) => { setEditando(null); setAlert({ type: 'success', message: msg }); cargar(); }} />
            )}
        </div>
    );
};

export default Index;
