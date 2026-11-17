import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    resumen as cargarResumen, guardarPerfil, guardarMedicion, eliminarMedicion,
    comidas as cargarComidas, agregarComida, eliminarComida, frecuentes as cargarFrecuentes,
} from 'services/progresoService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';
import PageHeader from 'components/Shared/Headers/PageHeader';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import LoadingScreen from 'components/Shared/LoadingScreen';
import ConfirmModal from 'components/Shared/Modals/ConfirmModal';
import { GraficoLinea, GraficoCalorias } from 'components/Progreso/Graficos';
import { aISO, sumarDias, deISO, fechaLarga } from 'utilities/Fechas/fechas';
import {
    ScaleIcon, FireIcon, CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon, TrashIcon,
    ChevronLeftIcon, ChevronRightIcon, PlusIcon, Cog6ToothIcon, ArrowTrendingDownIcon, ArrowTrendingUpIcon, MinusIcon,
} from '@heroicons/react/24/outline';

const inputCls = 'w-full p-2.5 text-sm text-secondary border border-slate-300 rounded-lg focus:ring-1 focus:ring-primary outline-none bg-white tabular-nums';
const labelCls = 'block text-[11px] font-bold text-slate-600 uppercase mb-1';
const fmt = (v, d = 1) => (v === null || v === undefined ? '—' : Number(v).toLocaleString('es-PE', { maximumFractionDigits: d }));

const TIPOS_COMIDA = [['desayuno', 'Desayuno'], ['almuerzo', 'Almuerzo'], ['cena', 'Cena'], ['snack', 'Snack']];

// Estado (bien / atención / riesgo) siempre con ícono + texto, nunca solo color
const NIVEL = {
    exito:  { icon: CheckCircleIcon, cls: 'bg-green-50 text-green-700 border-green-200' },
    alerta: { icon: ExclamationTriangleIcon, cls: 'bg-amber-50 text-amber-800 border-amber-200' },
    error:  { icon: XCircleIcon, cls: 'bg-red-50 text-red-700 border-red-200' },
};
const Estado = ({ cat }) => {
    if (!cat) return null;
    const n = NIVEL[cat.nivel] || NIVEL.alerta;
    const Icon = n.icon;
    return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-black ${n.cls}`}><Icon className="w-3.5 h-3.5" /> {cat.label}</span>;
};

/** Cambio con flecha (si bajar es bueno, la bajada se muestra en verde) */
const Cambio = ({ valor, unidad, bajarEsBueno = true, desde }) => {
    if (valor === null || valor === undefined) return null;
    const Icon = valor < 0 ? ArrowTrendingDownIcon : valor > 0 ? ArrowTrendingUpIcon : MinusIcon;
    const bueno = valor === 0 ? null : (valor < 0) === bajarEsBueno;
    const cls = bueno === null ? 'text-slate-500' : bueno ? 'text-green-700' : 'text-red-700';
    return (
        <span className={`inline-flex items-center gap-1 text-xs font-bold ${cls}`}>
            <Icon className="w-4 h-4" /> {valor > 0 ? '+' : ''}{fmt(valor)}{unidad}{desde ? <span className="font-normal text-slate-400"> desde {desde}</span> : null}
        </span>
    );
};

const Tarjeta = ({ titulo, valor, unidad, children }) => (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <p className="text-[11px] font-black uppercase tracking-widest text-slate-500">{titulo}</p>
        <p className="mt-1 text-3xl font-black text-slate-900 tabular-nums">{valor}<span className="text-base font-bold text-slate-400 ml-1">{unidad}</span></p>
        <div className="mt-1.5 flex flex-col items-start gap-1">{children}</div>
    </div>
);

/** Barra de progreso (consumido vs meta) */
const Barra = ({ etiqueta, valor, meta, unidad = 'g' }) => {
    const pct = meta ? Math.min(100, Math.round((valor / meta) * 100)) : 0;
    const paso = meta && valor > meta * 1.05;
    return (
        <div>
            <div className="flex justify-between text-xs mb-1">
                <span className="font-bold text-slate-700">{etiqueta}</span>
                <span className="tabular-nums text-slate-500"><b className="text-slate-900">{fmt(valor, 0)}</b> / {fmt(meta, 0)} {unidad}{paso ? ' · te pasaste' : ''}</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100 overflow-hidden" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={etiqueta}>
                <div className={`h-full rounded-full ${paso ? 'bg-amber-500' : 'bg-slate-800 dark:bg-primary'}`} style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
};

// ===================================================================== PERFIL
const PerfilForm = ({ datos, onGuardado, onError, compacto }) => {
    const { perfil, opciones } = datos;
    const [f, setF] = useState({ estatura_cm: perfil.estatura_cm || '', nivel_actividad: perfil.nivel_actividad, objetivo: perfil.objetivo, peso_meta_kg: perfil.peso_meta_kg ?? '' });
    const [guardando, setGuardando] = useState(false);
    const set = (k, v) => setF(p => ({ ...p, [k]: v }));

    const guardar = async (e) => {
        e.preventDefault();
        setGuardando(true);
        try {
            const r = await guardarPerfil({ ...f, estatura_cm: Number(f.estatura_cm), peso_meta_kg: f.peso_meta_kg === '' ? null : Number(f.peso_meta_kg) });
            onGuardado(r.message);
        } catch (err) { onError(handleApiError(err, 'No se pudieron guardar tus datos')); } finally { setGuardando(false); }
    };

    return (
        <form onSubmit={guardar} className={`grid grid-cols-2 ${compacto ? 'md:grid-cols-5' : 'md:grid-cols-4'} gap-3 items-end`}>
            <div><label className={labelCls}>Estatura (cm) *</label><input type="number" min="100" max="250" value={f.estatura_cm} onChange={e => set('estatura_cm', e.target.value)} className={inputCls} placeholder="170" required /></div>
            <div><label className={labelCls}>Peso meta (kg)</label><input type="number" min="30" max="300" step="0.5" value={f.peso_meta_kg} onChange={e => set('peso_meta_kg', e.target.value)} className={inputCls} placeholder="Opcional" /></div>
            <div><label className={labelCls}>Actividad</label>
                <select value={f.nivel_actividad} onChange={e => set('nivel_actividad', e.target.value)} className={inputCls}>{opciones.actividad.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
            <div><label className={labelCls}>Objetivo</label>
                <select value={f.objetivo} onChange={e => set('objetivo', e.target.value)} className={inputCls}>{opciones.objetivo.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
            <button disabled={guardando || !f.estatura_cm} className="col-span-2 md:col-span-1 py-2.5 bg-secondary text-primary rounded-lg font-black uppercase text-sm disabled:opacity-40">{guardando ? 'Guardando...' : 'Guardar'}</button>
        </form>
    );
};

// ===================================================================== MEDICIÓN
const MedicionForm = ({ onGuardado, onError }) => {
    const vacio = { fecha: aISO(new Date()), peso_kg: '', grasa_pct: '', notas: '' };
    const [f, setF] = useState(vacio);
    const [guardando, setGuardando] = useState(false);
    const set = (k, v) => setF(p => ({ ...p, [k]: v }));

    const guardar = async (e) => {
        e.preventDefault();
        setGuardando(true);
        try {
            const data = Object.fromEntries(Object.entries(f).map(([k, v]) => [k, v === '' ? null : (['fecha', 'notas'].includes(k) ? v : Number(v))]));
            const r = await guardarMedicion(data);
            setF(vacio);
            onGuardado(r.message);
        } catch (err) { onError(handleApiError(err, 'No se pudo guardar la medición')); } finally { setGuardando(false); }
    };

    return (
        <form onSubmit={guardar} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            <h3 className="font-black text-secondary uppercase text-sm">Nueva medición</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div><label className={labelCls}>Fecha *</label><input type="date" max={aISO(new Date())} value={f.fecha} onChange={e => set('fecha', e.target.value)} className={inputCls} required /></div>
                <div><label className={labelCls}>Peso (kg) *</label><input type="number" min="25" max="350" step="0.1" value={f.peso_kg} onChange={e => set('peso_kg', e.target.value)} className={inputCls} required autoFocus /></div>
                <div><label className={labelCls}>% de grasa</label><input type="number" min="2" max="70" step="0.1" value={f.grasa_pct} onChange={e => set('grasa_pct', e.target.value)} className={inputCls} placeholder="Si lo sabes" /></div>
                <div><label className={labelCls}>Notas</label><input value={f.notas} onChange={e => set('notas', e.target.value)} className={inputCls} maxLength={255} placeholder="Opcional" /></div>
            </div>
            <div className="flex justify-end">
                <button disabled={guardando || !f.peso_kg} className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-primary text-secondary rounded-lg font-black uppercase text-sm disabled:opacity-40">
                    <PlusIcon className="w-4 h-4" /> {guardando ? 'Guardando...' : 'Registrar'}
                </button>
            </div>
        </form>
    );
};

// ===================================================================== CALORÍAS
const DiarioCalorias = ({ plan, semana, onCambio, onError }) => {
    const hoy = aISO(new Date());
    const [fecha, setFecha] = useState(hoy);
    const [dia, setDia] = useState(null);
    const [frec, setFrec] = useState([]);
    const [f, setF] = useState({ tipo: 'desayuno', nombre: '', porcion: '', calorias: '', proteina_g: '', carbos_g: '', grasas_g: '' });
    const [guardando, setGuardando] = useState(false);
    const set = (k, v) => setF(p => ({ ...p, [k]: v }));

    const cargar = useCallback(async () => {
        try {
            const [r, fr] = await Promise.all([cargarComidas(fecha), cargarFrecuentes()]);
            setDia(r.data); setFrec(fr.data || []);
        } catch (err) { onError(handleApiError(err, 'No se pudo cargar el día')); }
    }, [fecha, onError]);
    useEffect(() => { cargar(); }, [cargar]);

    const agregar = async (datos) => {
        setGuardando(true);
        try {
            await agregarComida({ fecha, ...datos });
            setF(p => ({ ...p, nombre: '', porcion: '', calorias: '', proteina_g: '', carbos_g: '', grasas_g: '' }));
            await cargar(); onCambio();
        } catch (err) { onError(handleApiError(err, 'No se pudo agregar')); } finally { setGuardando(false); }
    };
    const quitar = async (id) => {
        try { await eliminarComida(id); await cargar(); onCambio(); } catch (err) { onError(handleApiError(err, 'No se pudo quitar')); }
    };

    const num = (v) => (v === '' ? null : Number(v));
    const t = dia?.totales || { calorias: 0, proteina_g: 0, carbos_g: 0, grasas_g: 0 };
    const restante = plan ? plan.meta_kcal - t.calorias : null;

    return (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            <div className="xl:col-span-2 space-y-5">
                {/* Día */}
                <div className="flex items-center justify-between gap-2">
                    <button onClick={() => setFecha(aISO(sumarDias(deISO(fecha), -1)))} className="p-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50" aria-label="Día anterior"><ChevronLeftIcon className="w-5 h-5" /></button>
                    <p className="font-black text-secondary uppercase">{fecha === hoy ? 'Hoy' : fechaLarga(fecha)}</p>
                    <button onClick={() => setFecha(aISO(sumarDias(deISO(fecha), 1)))} disabled={fecha >= hoy} className="p-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-30" aria-label="Día siguiente"><ChevronRightIcon className="w-5 h-5" /></button>
                </div>

                {/* Meta del día */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                    <div className="flex flex-wrap items-end justify-between gap-3">
                        <div>
                            <p className="text-[11px] font-black uppercase tracking-widest text-slate-500">Calorías del día</p>
                            <p className="text-4xl font-black text-slate-900 tabular-nums">{fmt(t.calorias, 0)}<span className="text-base font-bold text-slate-400"> / {plan ? fmt(plan.meta_kcal, 0) : '—'} kcal</span></p>
                        </div>
                        {plan && (
                            <p className={`text-sm font-black ${restante >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                {restante >= 0 ? `Te quedan ${fmt(restante, 0)} kcal` : `Te pasaste ${fmt(-restante, 0)} kcal`}
                            </p>
                        )}
                    </div>
                    {plan ? (
                        <div className="mt-4 space-y-3">
                            <Barra etiqueta="Calorías" valor={t.calorias} meta={plan.meta_kcal} unidad="kcal" />
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <Barra etiqueta="Proteína" valor={t.proteina_g} meta={plan.proteina_g} />
                                <Barra etiqueta="Carbohidratos" valor={t.carbos_g} meta={plan.carbos_g} />
                                <Barra etiqueta="Grasas" valor={t.grasas_g} meta={plan.grasas_g} />
                            </div>
                        </div>
                    ) : <p className="mt-2 text-sm text-slate-500">Registra tu estatura y una medición de peso para calcular tu meta diaria.</p>}
                </div>

                {/* Agregar */}
                <form onSubmit={(e) => { e.preventDefault(); agregar({ tipo: f.tipo, nombre: f.nombre.trim(), porcion: f.porcion.trim() || null, calorias: Number(f.calorias), proteina_g: num(f.proteina_g), carbos_g: num(f.carbos_g), grasas_g: num(f.grasas_g) }); }}
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
                    <h3 className="font-black text-secondary uppercase text-sm">Agregar comida</h3>
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                        <div className="col-span-2 md:col-span-1"><label className={labelCls}>Comida</label>
                            <select value={f.tipo} onChange={e => set('tipo', e.target.value)} className={inputCls}>{TIPOS_COMIDA.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>
                        <div className="col-span-2 md:col-span-3"><label className={labelCls}>¿Qué comiste? *</label><input value={f.nombre} onChange={e => set('nombre', e.target.value)} className={inputCls} maxLength={80} placeholder="Ej: Pollo a la plancha con arroz" required /></div>
                        <div className="col-span-2 md:col-span-2"><label className={labelCls}>Porción</label><input value={f.porcion} onChange={e => set('porcion', e.target.value)} className={inputCls} maxLength={40} placeholder="Ej: 1 plato, 150 g" /></div>
                        <div><label className={labelCls}>Kcal *</label><input type="number" min="0" max="5000" value={f.calorias} onChange={e => set('calorias', e.target.value)} className={inputCls} required /></div>
                        <div><label className={labelCls}>Prot. (g)</label><input type="number" min="0" step="0.1" value={f.proteina_g} onChange={e => set('proteina_g', e.target.value)} className={inputCls} /></div>
                        <div><label className={labelCls}>Carb. (g)</label><input type="number" min="0" step="0.1" value={f.carbos_g} onChange={e => set('carbos_g', e.target.value)} className={inputCls} /></div>
                        <div><label className={labelCls}>Grasa (g)</label><input type="number" min="0" step="0.1" value={f.grasas_g} onChange={e => set('grasas_g', e.target.value)} className={inputCls} /></div>
                        <div className="col-span-2 flex items-end">
                            <button disabled={guardando || !f.nombre.trim() || f.calorias === ''} className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 bg-primary text-secondary rounded-lg font-black uppercase text-sm disabled:opacity-40">
                                <PlusIcon className="w-4 h-4" /> Agregar
                            </button>
                        </div>
                    </div>
                    {frec.length > 0 && (
                        <div>
                            <p className="text-[11px] font-bold text-slate-500 uppercase mb-1.5">Tus frecuentes (un clic para agregar a {TIPOS_COMIDA.find(([k]) => k === f.tipo)?.[1].toLowerCase()})</p>
                            <div className="flex flex-wrap gap-1.5">
                                {frec.map(x => (
                                    <button type="button" key={x.nombre} disabled={guardando}
                                        onClick={() => agregar({ tipo: f.tipo, nombre: x.nombre, porcion: x.porcion, calorias: x.calorias, proteina_g: x.proteina_g, carbos_g: x.carbos_g, grasas_g: x.grasas_g })}
                                        className="px-2.5 py-1 rounded-full border border-slate-300 bg-white text-xs font-bold text-slate-700 hover:border-slate-500">
                                        + {x.nombre} <span className="font-normal text-slate-400">{x.calorias} kcal</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </form>

                {/* Lista del día */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100">
                    {TIPOS_COMIDA.map(([k, l]) => {
                        const items = (dia?.comidas || []).filter(c => c.tipo === k);
                        const sub = items.reduce((s, c) => s + c.calorias, 0);
                        return (
                            <div key={k} className="p-4">
                                <div className="flex justify-between items-baseline">
                                    <p className="text-sm font-black text-secondary uppercase">{l}</p>
                                    <p className="text-xs text-slate-500 tabular-nums">{fmt(sub, 0)} kcal</p>
                                </div>
                                {items.length === 0 ? <p className="text-xs text-slate-400 mt-1">Nada registrado.</p> : (
                                    <ul className="mt-2 space-y-1.5">
                                        {items.map(c => (
                                            <li key={c.id} className="flex items-center justify-between gap-2 text-sm">
                                                <span className="min-w-0 truncate text-slate-700">{c.nombre}{c.porcion ? <span className="text-slate-400"> · {c.porcion}</span> : null}</span>
                                                <span className="flex items-center gap-2 shrink-0">
                                                    <span className="text-xs text-slate-400 tabular-nums hidden sm:inline">P {fmt(c.proteina_g, 0)} · C {fmt(c.carbos_g, 0)} · G {fmt(c.grasas_g, 0)}</span>
                                                    <b className="tabular-nums text-slate-900">{c.calorias}</b>
                                                    <button onClick={() => quitar(c.id)} className="p-1 text-slate-400 hover:text-red-600" aria-label={`Quitar ${c.nombre}`}><TrashIcon className="w-4 h-4" /></button>
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 h-fit">
                <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500">Calorías · últimos 7 días</h3>
                <GraficoCalorias datos={semana} meta={plan?.meta_kcal} />
            </div>
        </div>
    );
};

// ===================================================================== PÁGINA
const Index = () => {
    const [datos, setDatos] = useState(null);
    const [alert, setAlert] = useState(null);
    const [pestana, setPestana] = useState('resumen');
    const [editandoPerfil, setEditandoPerfil] = useState(false);
    const [borrar, setBorrar] = useState(null);

    const cargar = useCallback(() => cargarResumen().then(r => setDatos(r.data)).catch(err => setAlert(handleApiError(err, 'No se pudo cargar tu progreso'))), []);
    useEffect(() => { cargar(); }, [cargar]);
    const ok = (msg) => { setAlert({ type: 'success', message: msg }); setEditandoPerfil(false); cargar(); };
    const mostrarError = useCallback((a) => setAlert(a), []);

    const serie = (campo) => (datos?.historial || []).map(h => ({ fecha: h.fecha, valor: h[campo] }));
    const historialDesc = useMemo(() => [...(datos?.historial || [])].reverse(), [datos]);

    if (!datos) return alert ? <div className="container mx-auto p-6"><AlertMessage type={alert.type} message={alert.message} details={alert.details} /></div> : <LoadingScreen />;

    const { perfil, actual, cambios, plan } = datos;
    const hayGrasa = datos.historial.some(h => h.grasa_pct !== null);

    return (
        <div className="container mx-auto p-4 sm:p-6">
            <PageHeader title="Mi progreso" subtitle="Tu peso, medidas, IMC y calorías" icon={ScaleIcon} />
            <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />

            {(!perfil.configurado || editandoPerfil) && (
                <div className="mb-5 bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                    <h3 className="font-black text-secondary uppercase text-sm mb-1">{perfil.configurado ? 'Tus datos' : 'Empecemos: tus datos'}</h3>
                    <p className="text-xs text-slate-500 mb-3">Con tu estatura, edad ({perfil.edad ?? '—'} años) y sexo calculamos tu IMC y cuántas calorías necesitas según tu objetivo.</p>
                    <PerfilForm datos={datos} onGuardado={ok} onError={mostrarError} />
                </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                <div className="inline-flex gap-1 p-1 bg-white border border-slate-200 rounded-xl" role="tablist">
                    {[['resumen', 'Resumen'], ['mediciones', 'Mediciones'], ['calorias', 'Calorías']].map(([k, l]) => (
                        <button key={k} role="tab" aria-selected={pestana === k} onClick={() => setPestana(k)}
                            className={`px-4 py-2 rounded-lg text-sm font-black uppercase ${pestana === k ? 'bg-secondary text-primary' : 'text-slate-500 hover:text-secondary'}`}>{l}</button>
                    ))}
                </div>
                {perfil.configurado && !editandoPerfil && (
                    <button onClick={() => setEditandoPerfil(true)} className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-secondary">
                        <Cog6ToothIcon className="w-4 h-4" /> {perfil.estatura_cm} cm · {datos.opciones.objetivo.find(o => o.value === perfil.objetivo)?.label}
                    </button>
                )}
            </div>

            {pestana === 'resumen' && (
                !actual ? (
                    <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center">
                        <ScaleIcon className="w-10 h-10 text-slate-300 mx-auto" />
                        <p className="mt-2 font-black text-secondary">Registra tu primera medición</p>
                        <p className="text-sm text-slate-500">Con tu peso (y si quieres, tus perímetros) verás tu IMC, tu % de grasa y tu evolución.</p>
                        <button onClick={() => setPestana('mediciones')} className="mt-4 inline-flex items-center gap-1.5 bg-primary text-secondary px-5 py-2.5 rounded-lg font-black uppercase text-sm"><PlusIcon className="w-4 h-4" /> Registrar medición</button>
                    </div>
                ) : (
                    <div className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <Tarjeta titulo="Peso" valor={fmt(actual.peso_kg)} unidad="kg">
                                <Cambio valor={cambios.vs_anterior.peso_kg} unidad=" kg" bajarEsBueno={perfil.objetivo !== 'subir'} desde={cambios.vs_anterior.desde && 'la anterior'} />
                                {cambios.falta_meta_kg !== null && <span className="text-[11px] text-slate-500">{cambios.falta_meta_kg === 0 ? '¡Llegaste a tu meta!' : `${fmt(Math.abs(cambios.falta_meta_kg))} kg para tu meta (${fmt(perfil.peso_meta_kg)} kg)`}</span>}
                            </Tarjeta>
                            <Tarjeta titulo="IMC" valor={fmt(actual.imc)} unidad="">
                                <Estado cat={actual.categoria_imc} />
                                {actual.peso_saludable && <span className="text-[11px] text-slate-500">Saludable para tu estatura: {fmt(actual.peso_saludable.min)}–{fmt(actual.peso_saludable.max)} kg</span>}
                            </Tarjeta>
                            <Tarjeta titulo="% de grasa" valor={fmt(actual.grasa_pct)} unidad="%">
                                {actual.grasa_pct !== null ? (
                                    <>
                                        <Estado cat={actual.categoria_grasa} />
                                        <span className="text-[11px] text-slate-500">{fmt(actual.masa_grasa_kg)} kg grasa · {fmt(actual.masa_magra_kg)} kg magra{actual.grasa_estimada ? ' · estimado' : ''}</span>
                                    </>
                                ) : <span className="text-[11px] text-slate-500">Si lo sabes (balanza o control), regístralo en tu medición</span>}
                            </Tarjeta>
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                            <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                                <div className="flex flex-wrap items-baseline justify-between gap-2">
                                    <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500">Peso (kg)</h3>
                                    <Cambio valor={cambios.desde_inicio.peso_kg} unidad=" kg" bajarEsBueno={perfil.objetivo !== 'subir'} desde={cambios.desde_inicio.desde && fechaLarga(cambios.desde_inicio.desde)} />
                                </div>
                                <GraficoLinea titulo="Peso" datos={serie('peso_kg')} unidad=" kg" referencia={perfil.peso_meta_kg ? { valor: perfil.peso_meta_kg, etiqueta: `Meta ${fmt(perfil.peso_meta_kg)}` } : null} />
                            </div>

                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                                <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5"><FireIcon className="w-4 h-4" /> Tu plan diario</h3>
                                {plan ? (
                                    <>
                                        <p className="mt-2 text-4xl font-black text-slate-900 tabular-nums">{fmt(plan.meta_kcal, 0)}<span className="text-base font-bold text-slate-400"> kcal/día</span></p>
                                        <p className="text-xs text-slate-500">{datos.opciones.objetivo.find(o => o.value === perfil.objetivo)?.label} · gastas ~{fmt(plan.gasto, 0)} kcal (basal {fmt(plan.tmb, 0)})</p>
                                        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                                            {[['Proteína', `${plan.proteina_g} g`], ['Carbohidratos', `${plan.carbos_g} g`], ['Grasas', `${plan.grasas_g} g`], ['Agua', `${fmt(plan.agua_ml / 1000)} L`]].map(([k, v]) => (
                                                <div key={k} className="rounded-lg bg-slate-50 border border-slate-100 p-2.5"><dt className="text-[11px] text-slate-500">{k}</dt><dd className="font-black text-slate-900 tabular-nums">{v}</dd></div>
                                            ))}
                                        </dl>
                                        <p className="mt-3 text-sm"><b className="tabular-nums">{fmt(datos.hoy.calorias, 0)}</b> <span className="text-slate-500">kcal registradas hoy ·</span> <button onClick={() => setPestana('calorias')} className="font-bold text-secondary underline">ver diario</button></p>
                                    </>
                                ) : <p className="mt-2 text-sm text-slate-500">Guarda tu estatura para calcularlo.</p>}
                                <p className="mt-3 text-[10px] text-slate-400">Valores orientativos (Mifflin-St Jeor y OMS). Consulta a un nutricionista para un plan personalizado.</p>
                            </div>
                        </div>

                        {hayGrasa && (
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                                <div className="flex flex-wrap items-baseline justify-between gap-2">
                                    <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500">% de grasa</h3>
                                    <Cambio valor={cambios.desde_inicio.grasa_pct} unidad=" %" />
                                </div>
                                <GraficoLinea titulo="% de grasa" datos={serie('grasa_pct')} unidad="%" />
                            </div>
                        )}
                    </div>
                )
            )}

            {pestana === 'mediciones' && (
                <div className="space-y-5">
                    {perfil.configurado ? <MedicionForm onGuardado={ok} onError={mostrarError} /> : <p className="text-sm text-slate-500">Primero guarda tu estatura (arriba).</p>}

                    {datos.historial.length > 1 && (
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500">Peso (kg)</h3>
                            <GraficoLinea titulo="Peso" datos={serie('peso_kg')} unidad=" kg" referencia={perfil.peso_meta_kg ? { valor: perfil.peso_meta_kg, etiqueta: `Meta ${fmt(perfil.peso_meta_kg)}` } : null} />
                        </div>
                    )}

                    {/* Tabla: todos los valores (la vista accesible de los gráficos) */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-200">
                                    <th className="text-left p-3 font-black">Fecha</th><th className="text-right p-3 font-black">Peso</th><th className="text-right p-3 font-black">IMC</th>
                                    <th className="text-right p-3 font-black">% grasa</th>
                                    <th className="p-3" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {historialDesc.length === 0 ? (
                                    <tr><td colSpan={5} className="p-6 text-center text-slate-400">Sin mediciones todavía.</td></tr>
                                ) : historialDesc.map(h => (
                                    <tr key={h.id}>
                                        <td className="p-3 whitespace-nowrap font-bold text-slate-700">{fechaLarga(h.fecha)}{h.notas && <p className="text-[11px] font-normal text-slate-400">{h.notas}</p>}</td>
                                        <td className="p-3 text-right tabular-nums font-black text-slate-900">{fmt(h.peso_kg)}</td>
                                        <td className="p-3 text-right tabular-nums">{fmt(h.imc)}</td>
                                        <td className="p-3 text-right tabular-nums">{fmt(h.grasa_pct)}{h.grasa_estimada ? '*' : ''}</td>
                                        <td className="p-3 text-right"><button onClick={() => setBorrar(h)} className="p-1 text-slate-400 hover:text-red-600" aria-label={`Eliminar la medición del ${h.fecha}`}><TrashIcon className="w-4 h-4" /></button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        
                    </div>
                </div>
            )}

            {pestana === 'calorias' && <DiarioCalorias plan={plan} semana={datos.semana} onCambio={cargar} onError={mostrarError} />}

            {borrar && (
                <ConfirmModal title="Eliminar medición" message={`¿Eliminar la medición del ${fechaLarga(borrar.fecha)} (${fmt(borrar.peso_kg)} kg)?`} confirmText="Sí, eliminar"
                    onCancel={() => setBorrar(null)}
                    onConfirm={async () => {
                        const h = borrar; setBorrar(null);
                        try { const r = await eliminarMedicion(h.id); ok(r.message); } catch (err) { mostrarError(handleApiError(err, 'No se pudo eliminar')); }
                    }} />
            )}
        </div>
    );
};

export default Index;
