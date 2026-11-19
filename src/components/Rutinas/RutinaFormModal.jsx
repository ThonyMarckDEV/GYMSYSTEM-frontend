import React, { useEffect, useMemo, useState } from 'react';
import { PlusIcon, TrashIcon, ArrowUpIcon, ArrowDownIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';
import { ejercicios as listarEjercicios, store, update } from 'services/rutinaService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';
import { Modal, errorDeAlerta } from 'components/Pagos/PagoUI';

const inputCls = 'w-full p-2 text-sm text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/40 outline-none bg-white';
const labelCls = 'block text-[11px] font-bold text-slate-600 uppercase mb-1';

export const OBJETIVOS = {
    hipertrofia: 'Ganar músculo', fuerza: 'Fuerza', resistencia: 'Resistencia', bajar_peso: 'Bajar de peso', general: 'Estar en forma',
};

const EJERCICIO_VACIO = { ejercicio_id: null, nombre: '', series: 3, repeticiones: '10', peso_kg: '', descanso_seg: 60, notas: '' };

/** Convierte la rutina del backend (show) al formato del formulario. */
const desdeRutina = (r) => ({
    nombre: r.nombre, objetivo: r.objetivo || '', descripcion: r.descripcion || '',
    dias: r.dias.map(d => ({
        nombre: d.nombre,
        ejercicios: d.lista.map(e => ({
            ejercicio_id: e.ejercicio_id, nombre: e.nombre, series: e.series, repeticiones: e.repeticiones,
            peso_kg: e.peso_kg ?? '', descanso_seg: e.descanso_seg ?? '', notas: e.notas || '',
        })),
    })),
});

/** Crear o editar una rutina: días (pestañas) y sus ejercicios. */
const RutinaFormModal = ({ rutina, limites, onClose, onGuardado }) => {
    const [form, setForm] = useState(() => rutina ? desdeRutina(rutina) : {
        nombre: '', objetivo: 'hipertrofia', descripcion: '', dias: [{ nombre: '', ejercicios: [{ ...EJERCICIO_VACIO }] }],
    });
    const [diaActivo, setDiaActivo] = useState(0);
    const [catalogo, setCatalogo] = useState([]);
    const [guardando, setGuardando] = useState(false);
    const [alert, setAlert] = useState(null);

    useEffect(() => { listarEjercicios().then(r => setCatalogo(r.data || [])).catch(() => setCatalogo([])); }, []);

    const grupos = useMemo(() => catalogo.reduce((acc, e) => { (acc[e.grupo_muscular] = acc[e.grupo_muscular] || []).push(e); return acc; }, {}), [catalogo]);

    const maxDias = limites?.dias || 7;
    const maxEj = limites?.ejercicios_dia || 15;
    const maxSeries = limites?.series || 10;
    const dia = form.dias[diaActivo];

    const setDia = (fn) => setForm(f => ({ ...f, dias: f.dias.map((d, i) => i === diaActivo ? fn(d) : d) }));
    const setEj = (idx, cambios) => setDia(d => ({ ...d, ejercicios: d.ejercicios.map((e, i) => i === idx ? { ...e, ...cambios } : e) }));
    const moverEj = (idx, delta) => setDia(d => {
        const lista = [...d.ejercicios];
        const j = idx + delta;
        if (j < 0 || j >= lista.length) return d;
        [lista[idx], lista[j]] = [lista[j], lista[idx]];
        return { ...d, ejercicios: lista };
    });

    const agregarDia = () => {
        if (form.dias.length >= maxDias) return;
        setForm(f => ({ ...f, dias: [...f.dias, { nombre: '', ejercicios: [{ ...EJERCICIO_VACIO }] }] }));
        setDiaActivo(form.dias.length);
    };
    const quitarDia = () => {
        if (form.dias.length <= 1) return;
        setForm(f => ({ ...f, dias: f.dias.filter((_, i) => i !== diaActivo) }));
        setDiaActivo(Math.max(0, diaActivo - 1));
    };

    /** Elegir del catálogo (valor = id) o escribir uno propio */
    const elegirEjercicio = (idx, valor) => {
        if (valor === '__otro') { setEj(idx, { ejercicio_id: null, nombre: '' }); return; }
        const e = catalogo.find(x => String(x.id) === valor);
        if (e) setEj(idx, { ejercicio_id: e.id, nombre: e.nombre });
    };

    const guardar = async () => {
        setGuardando(true); setAlert(null);
        try {
            const data = {
                ...form,
                objetivo: form.objetivo || null,
                dias: form.dias.map(d => ({
                    nombre: d.nombre,
                    ejercicios: d.ejercicios.map(e => ({
                        ...e,
                        series: Number(e.series), repeticiones: String(e.repeticiones).trim(),
                        peso_kg: e.peso_kg === '' ? null : Number(e.peso_kg),
                        descanso_seg: e.descanso_seg === '' ? null : Number(e.descanso_seg),
                    })),
                })),
            };
            const res = rutina ? await update(rutina.id, data) : await store(data);
            onGuardado(res.message);
        } catch (err) {
            setAlert(handleApiError(err, 'No se pudo guardar la rutina'));
        } finally {
            setGuardando(false);
        }
    };

    const valido = form.nombre.trim() && form.dias.every(d => d.ejercicios.length > 0 && d.ejercicios.every(e => e.nombre.trim() && Number(e.series) >= 1 && /^\d{1,3}(\s*-\s*\d{1,3})?$/.test(String(e.repeticiones).trim())));

    return (
        <Modal titulo={rutina ? `Editar ${rutina.nombre}` : 'Nueva rutina'} icon={ClipboardDocumentListIcon} onClose={onClose} ancho="max-w-4xl" error={errorDeAlerta(alert)}
            pie={<>
                <button onClick={onClose} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg font-bold uppercase text-sm">Cancelar</button>
                <button onClick={guardar} disabled={guardando || !valido} className="px-4 py-2 bg-secondary text-primary rounded-lg font-bold uppercase text-sm disabled:opacity-40">
                    {guardando ? 'Guardando...' : rutina ? 'Guardar cambios' : 'Crear rutina'}
                </button>
            </>}>
            <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                        <label className={labelCls}>Nombre *</label>
                        <input value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} className={inputCls} maxLength={60} placeholder="Ej: PUSH PULL LEGS" autoFocus />
                    </div>
                    <div>
                        <label className={labelCls}>Objetivo</label>
                        <select value={form.objetivo} onChange={e => setForm(f => ({ ...f, objetivo: e.target.value }))} className={inputCls}>
                            <option value="">Sin especificar</option>
                            {Object.entries(OBJETIVOS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select>
                    </div>
                </div>

                {/* DÍAS */}
                <div>
                    <div className="flex flex-wrap items-center gap-1.5 mb-3" role="tablist" aria-label="Días de la rutina">
                        {form.dias.map((d, i) => (
                            <button key={i} type="button" role="tab" aria-selected={i === diaActivo} onClick={() => setDiaActivo(i)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase border ${i === diaActivo ? 'bg-secondary text-primary border-secondary' : 'bg-white text-slate-600 border-slate-300 hover:border-slate-400'}`}>
                                {d.nombre.trim() || `Día ${i + 1}`} <span className="opacity-60">({d.ejercicios.length})</span>
                            </button>
                        ))}
                        {form.dias.length < maxDias && (
                            <button type="button" onClick={agregarDia} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-black uppercase border border-dashed border-slate-400 text-slate-600 hover:bg-slate-50">
                                <PlusIcon className="w-3.5 h-3.5" /> Día
                            </button>
                        )}
                    </div>

                    <div className="rounded-xl border border-slate-200 p-4 space-y-3">
                        <div className="flex items-end gap-3">
                            <div className="flex-1">
                                <label className={labelCls}>Nombre del día</label>
                                <input value={dia.nombre} onChange={e => setDia(d => ({ ...d, nombre: e.target.value }))} className={inputCls} maxLength={60} placeholder={`Ej: PECHO Y TRÍCEPS (si lo dejas vacío: DÍA ${diaActivo + 1})`} />
                            </div>
                            {form.dias.length > 1 && (
                                <button type="button" onClick={quitarDia} className="px-3 py-2 text-xs font-bold text-red-700 border border-red-200 rounded-lg hover:bg-red-50">Quitar día</button>
                            )}
                        </div>

                        {dia.ejercicios.map((e, idx) => (
                            <div key={idx} className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
                                <div className="flex items-start gap-2">
                                    <span className="mt-2 w-6 h-6 shrink-0 rounded-full bg-secondary text-primary text-xs font-black flex items-center justify-center">{idx + 1}</span>
                                    <div className="flex-1 grid grid-cols-2 md:grid-cols-12 gap-2">
                                        <div className="col-span-2 md:col-span-5">
                                            <label className={labelCls}>Ejercicio *</label>
                                            <select value={e.ejercicio_id ? String(e.ejercicio_id) : '__otro'} onChange={ev => elegirEjercicio(idx, ev.target.value)} className={inputCls}>
                                                <option value="__otro">✏️ Escribir otro ejercicio...</option>
                                                {Object.entries(grupos).map(([g, lista]) => (
                                                    <optgroup key={g} label={g}>
                                                        {lista.map(x => <option key={x.id} value={x.id}>{x.nombre}{x.equipo ? ` (${x.equipo.toLowerCase()})` : ''}</option>)}
                                                    </optgroup>
                                                ))}
                                            </select>
                                            {!e.ejercicio_id && (
                                                <input value={e.nombre} onChange={ev => setEj(idx, { nombre: ev.target.value })} className={`${inputCls} mt-1.5`} maxLength={80} placeholder="Nombre del ejercicio" />
                                            )}
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className={labelCls}>Series</label>
                                            <input type="number" min="1" max={maxSeries} value={e.series} onChange={ev => setEj(idx, { series: ev.target.value })} className={`${inputCls} tabular-nums`} />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className={labelCls}>Reps</label>
                                            <input value={e.repeticiones} onChange={ev => setEj(idx, { repeticiones: ev.target.value })} className={`${inputCls} tabular-nums`} maxLength={15} placeholder="10 u 8-12" />
                                        </div>
                                        <div className="md:col-span-1">
                                            <label className={labelCls}>Kg</label>
                                            <input type="number" min="0" step="0.5" value={e.peso_kg} onChange={ev => setEj(idx, { peso_kg: ev.target.value })} className={`${inputCls} tabular-nums px-1.5`} />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className={labelCls}>Descanso (s)</label>
                                            <input type="number" min="0" max="600" step="15" value={e.descanso_seg} onChange={ev => setEj(idx, { descanso_seg: ev.target.value })} className={`${inputCls} tabular-nums`} />
                                        </div>
                                        <div className="col-span-2 md:col-span-12">
                                            <input value={e.notas} onChange={ev => setEj(idx, { notas: ev.target.value })} className={inputCls} maxLength={150} placeholder="Notas (opcional): técnica, tempo, agarre..." />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1 mt-5">
                                        <button type="button" onClick={() => moverEj(idx, -1)} disabled={idx === 0} className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30" aria-label="Subir"><ArrowUpIcon className="w-4 h-4" /></button>
                                        <button type="button" onClick={() => moverEj(idx, 1)} disabled={idx === dia.ejercicios.length - 1} className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30" aria-label="Bajar"><ArrowDownIcon className="w-4 h-4" /></button>
                                        <button type="button" onClick={() => setDia(d => ({ ...d, ejercicios: d.ejercicios.filter((_, i) => i !== idx) }))} disabled={dia.ejercicios.length === 1}
                                            className="p-1 text-slate-400 hover:text-red-600 disabled:opacity-30" aria-label="Quitar ejercicio"><TrashIcon className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {dia.ejercicios.length < maxEj ? (
                            <button type="button" onClick={() => setDia(d => ({ ...d, ejercicios: [...d.ejercicios, { ...EJERCICIO_VACIO }] }))}
                                className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-lg border-2 border-dashed border-slate-300 text-sm font-bold text-slate-600 hover:border-slate-400 hover:bg-slate-50">
                                <PlusIcon className="w-4 h-4" /> Agregar ejercicio
                            </button>
                        ) : <p className="text-xs text-slate-500 text-center">Llegaste al máximo de {maxEj} ejercicios en este día.</p>}
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default RutinaFormModal;
