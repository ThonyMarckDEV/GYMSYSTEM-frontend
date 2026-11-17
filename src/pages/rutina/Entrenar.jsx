import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { show, guardarSesion } from 'services/rutinaService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import LoadingScreen from 'components/Shared/LoadingScreen';
import { ArrowLeftIcon, CheckIcon, ClockIcon, FireIcon, ForwardIcon, TrophyIcon } from '@heroicons/react/24/outline';

const CLAVE = (id, dia) => `gym:entreno:${id}:${dia}`;
const DOCE_HORAS = 12 * 60 * 60 * 1000;

// localStorage puede no estar disponible (modo privado): nunca debe romper el entrenamiento
const leer = (k) => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch { return null; } };
const escribir = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* sin almacenamiento */ } };
const borrar = (k) => { try { localStorage.removeItem(k); } catch { /* sin almacenamiento */ } };

const mmss = (seg) => `${String(Math.floor(seg / 60)).padStart(2, '0')}:${String(seg % 60).padStart(2, '0')}`;
/** "8-12" → 8 (la meta mínima); "10" → 10 */
const repsObjetivo = (r) => Number(String(r).split('-')[0]) || '';

/** Series iniciales: peso sugerido = lo último que levantó, si no el de la rutina. */
const seriesIniciales = (lista) => Object.fromEntries(lista.map(e => [e.id,
    Array.from({ length: e.series }, () => ({
        repeticiones: repsObjetivo(e.repeticiones),
        peso_kg: e.ultimo?.peso_kg ?? e.peso_kg ?? '',
        completada: false,
    })),
]));

/** Entrenar un día de la rutina: marcar cada serie y guardar el entrenamiento. */
const Entrenar = () => {
    const { id, dia } = useParams();
    const navigate = useNavigate();
    const clave = CLAVE(id, dia);

    const [rutina, setRutina] = useState(null);
    const [series, setSeries] = useState({});
    const [inicio, setInicio] = useState(Date.now());
    const [ahora, setAhora] = useState(Date.now());
    const [descanso, setDescanso] = useState(null);   // { hasta, ejercicio }
    const [guardando, setGuardando] = useState(false);
    const [alert, setAlert] = useState(null);
    const cargado = useRef(false);

    useEffect(() => {
        show(id).then(r => {
            setRutina(r.data);
            const d = r.data.dias[Number(dia) - 1];
            if (!d) { setAlert({ type: 'error', message: 'Ese día no existe en la rutina.' }); return; }
            const guardado = leer(clave);
            if (guardado && Date.now() - guardado.inicio < DOCE_HORAS) {
                setSeries({ ...seriesIniciales(d.lista), ...guardado.series });
                setInicio(guardado.inicio);
            } else {
                setSeries(seriesIniciales(d.lista));
            }
            cargado.current = true;
        }).catch(err => setAlert(handleApiError(err, 'No se pudo cargar la rutina')));
    }, [id, dia, clave]);

    // Avance guardado en el navegador por si se cierra la página
    useEffect(() => { if (cargado.current) escribir(clave, { inicio, series }); }, [series, inicio, clave]);

    // Reloj: tiempo de entrenamiento y descanso
    useEffect(() => {
        const t = setInterval(() => setAhora(Date.now()), 1000);
        return () => clearInterval(t);
    }, []);

    const restante = descanso ? Math.max(0, Math.ceil((descanso.hasta - ahora) / 1000)) : 0;
    useEffect(() => {
        if (descanso && restante === 0) {
            try { navigator.vibrate?.([200, 100, 200]); } catch { /* sin vibración */ }
            setDescanso(null);
        }
    }, [descanso, restante]);

    const diaInfo = rutina?.dias[Number(dia) - 1];
    const lista = useMemo(() => diaInfo?.lista || [], [diaInfo]);

    const setSerie = (ejId, i, cambios) => setSeries(s => ({ ...s, [ejId]: s[ejId].map((x, j) => j === i ? { ...x, ...cambios } : x) }));

    const marcar = useCallback((e, i) => {
        const actual = series[e.id]?.[i];
        if (!actual) return;
        const completada = !actual.completada;
        setSerie(e.id, i, { completada });
        if (completada && e.descanso_seg > 0) setDescanso({ hasta: Date.now() + e.descanso_seg * 1000, ejercicio: e.nombre });
    }, [series]);

    const todas = Object.values(series).flat();
    const hechas = todas.filter(s => s.completada).length;
    const volumen = todas.filter(s => s.completada).reduce((acc, s) => acc + (Number(s.repeticiones) || 0) * (Number(s.peso_kg) || 0), 0);
    const transcurrido = Math.floor((ahora - inicio) / 1000);

    const terminar = async () => {
        setGuardando(true); setAlert(null);
        try {
            const res = await guardarSesion(id, {
                dia: Number(dia),
                duracion_min: Math.max(1, Math.round(transcurrido / 60)),
                series: lista.flatMap(e => (series[e.id] || []).map((s, i) => ({
                    rutina_ejercicio_id: e.id, serie: i + 1,
                    repeticiones: s.repeticiones === '' ? null : Number(s.repeticiones),
                    peso_kg: s.peso_kg === '' ? null : Number(s.peso_kg),
                    completada: s.completada,
                }))),
            });
            borrar(clave);
            navigate('/mis-rutinas', { state: { mensaje: `${res.message} ${res.data.series_completadas} series · ${Math.round(res.data.volumen_kg)} kg de volumen.` } });
        } catch (err) {
            setAlert(handleApiError(err, 'No se pudo guardar el entrenamiento'));
            setGuardando(false);
        }
    };

    const descartar = () => {
        if (!window.confirm('¿Descartar este entrenamiento? Se perderá lo que marcaste.')) return;
        borrar(clave);
        navigate('/mis-rutinas');
    };

    if (!rutina && !alert) return <LoadingScreen />;

    return (
        <div className="container mx-auto p-4 sm:p-6 max-w-3xl">
            <Link to="/mis-rutinas" className="inline-flex items-center gap-1 text-sm font-bold text-slate-500 hover:text-secondary mb-3"><ArrowLeftIcon className="w-4 h-4" /> Mis rutinas</Link>
            <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />

            {diaInfo && (
                <>
                    {/* Cabecera fija con el avance */}
                    <div className="sticky top-0 z-10 -mx-4 sm:mx-0 px-4 py-3 sm:rounded-2xl bg-secondary text-white shadow-lg mb-4">
                        <p className="text-[11px] font-black uppercase tracking-widest text-primary">{rutina.nombre}</p>
                        <div className="flex items-end justify-between gap-3">
                            <h1 className="text-xl font-black uppercase leading-tight">{diaInfo.nombre}</h1>
                            <p className="text-2xl font-black tabular-nums inline-flex items-center gap-1.5"><ClockIcon className="w-5 h-5 text-primary" /> {mmss(transcurrido)}</p>
                        </div>
                        <div className="mt-2 h-2 rounded-full bg-white/15 overflow-hidden" aria-hidden>
                            <div className="h-full bg-primary transition-all" style={{ width: `${todas.length ? (hechas * 100) / todas.length : 0}%` }} />
                        </div>
                        <p className="mt-1 text-xs text-white/70 tabular-nums">{hechas}/{todas.length} series · {Math.round(volumen)} kg levantados</p>
                    </div>

                    <div className="space-y-4">
                        {lista.map((e, idx) => {
                            const ss = series[e.id] || [];
                            const completo = ss.length > 0 && ss.every(s => s.completada);
                            return (
                                <section key={e.id} className={`bg-white rounded-2xl border p-4 shadow-sm ${completo ? 'border-green-300' : 'border-slate-200'}`}>
                                    <div className="flex items-start justify-between gap-2 mb-3">
                                        <div className="min-w-0">
                                            <h2 className="font-black text-secondary uppercase flex items-center gap-2">
                                                <span className={`w-6 h-6 shrink-0 rounded-full text-xs flex items-center justify-center ${completo ? 'bg-green-600 text-white' : 'bg-secondary text-primary'}`}>{completo ? <CheckIcon className="w-4 h-4" /> : idx + 1}</span>
                                                <span className="truncate">{e.nombre}</span>
                                            </h2>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                Meta: {e.series} × {e.repeticiones}{e.peso_kg ? ` · ${e.peso_kg} kg` : ''}{e.descanso_seg ? ` · descanso ${e.descanso_seg}s` : ''}
                                            </p>
                                            {e.ultimo && <p className="text-[11px] text-slate-400">La última vez ({e.ultimo.fecha}): {e.ultimo.peso_kg ?? 0} kg × {e.ultimo.repeticiones}</p>}
                                            {e.notas && <p className="text-[11px] text-amber-800 mt-0.5">📝 {e.notas}</p>}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-[auto_1fr_1fr_auto] items-center gap-2 text-[10px] font-black uppercase text-slate-400 px-1">
                                        <span>Serie</span><span>Kg</span><span>Reps</span><span className="sr-only">Hecha</span>
                                    </div>
                                    <div className="space-y-1.5 mt-1">
                                        {ss.map((s, i) => (
                                            <div key={i} className={`grid grid-cols-[auto_1fr_1fr_auto] items-center gap-2 rounded-lg px-1 py-1 ${s.completada ? 'bg-green-50' : ''}`}>
                                                <span className="w-9 text-center text-sm font-black text-slate-500 tabular-nums">{i + 1}</span>
                                                <input type="number" inputMode="decimal" min="0" step="0.5" value={s.peso_kg} onChange={ev => setSerie(e.id, i, { peso_kg: ev.target.value })}
                                                    className="w-full p-2 text-center text-base font-bold text-secondary tabular-nums border border-slate-300 rounded-lg" aria-label={`Kg de la serie ${i + 1} de ${e.nombre}`} />
                                                <input type="number" inputMode="numeric" min="0" value={s.repeticiones} onChange={ev => setSerie(e.id, i, { repeticiones: ev.target.value })}
                                                    className="w-full p-2 text-center text-base font-bold text-secondary tabular-nums border border-slate-300 rounded-lg" aria-label={`Repeticiones de la serie ${i + 1} de ${e.nombre}`} />
                                                <button type="button" onClick={() => marcar(e, i)} aria-pressed={s.completada} aria-label={`Marcar serie ${i + 1} como hecha`}
                                                    className={`w-11 h-11 rounded-lg border-2 flex items-center justify-center transition-colors ${s.completada ? 'bg-green-600 border-green-600 text-white' : 'border-slate-300 text-slate-300 hover:border-green-500 hover:text-green-600'}`}>
                                                    <CheckIcon className="w-6 h-6" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            );
                        })}
                    </div>

                    {/* Barra inferior: descanso o terminar */}
                    <div className="sticky bottom-0 z-20 -mx-4 sm:mx-0 mt-5 p-3 sm:rounded-2xl bg-white/95 backdrop-blur border-t sm:border border-slate-200 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
                        <div className="flex items-center gap-3">
                            {descanso ? (
                                <>
                                    <div className="flex-1">
                                        <p className="text-[10px] font-black uppercase text-slate-400">Descanso · {descanso.ejercicio}</p>
                                        <p className="text-3xl font-black tabular-nums text-secondary">{mmss(restante)}</p>
                                    </div>
                                    <button onClick={() => setDescanso(d => ({ ...d, hasta: d.hasta + 30000 }))} className="px-3 py-3 rounded-lg border border-slate-300 text-sm font-bold text-slate-600">+30 s</button>
                                    <button onClick={() => setDescanso(null)} className="inline-flex items-center gap-1 px-4 py-3 rounded-lg bg-secondary text-primary text-sm font-black uppercase"><ForwardIcon className="w-4 h-4" /> Saltar</button>
                                </>
                            ) : (
                                <>
                                    <button onClick={descartar} className="px-4 py-3 rounded-lg border border-slate-300 text-sm font-bold text-slate-600">Descartar</button>
                                    <button onClick={terminar} disabled={guardando || hechas === 0}
                                        className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-lg bg-primary text-secondary font-black uppercase shadow disabled:opacity-40">
                                        {hechas === todas.length && todas.length > 0 ? <TrophyIcon className="w-5 h-5" /> : <FireIcon className="w-5 h-5" />}
                                        {guardando ? 'Guardando...' : hechas === 0 ? 'Marca tu primera serie' : 'Terminar entrenamiento'}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Entrenar;
