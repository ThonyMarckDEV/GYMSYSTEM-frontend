import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { calendario } from 'services/claseService';
import { combobox as sucursalesCombobox } from 'services/sucursalService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';
import { useAuth } from 'context/AuthContext';
import PageHeader from 'components/Shared/Headers/PageHeader';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import { ClaseCard, ClaseFila } from 'components/Clases/ClaseUI';
import ClaseDetalleModal from 'components/Clases/ClaseDetalleModal';
import ClaseFormModal from 'components/Clases/ClaseFormModal';
import { aISO, inicioSemana, diasDeSemana, sumarDias, esHoy, nombreDia, fechaCorta, rangoSemana } from 'utilities/Fechas/fechas';
import { CalendarDaysIcon, ChevronLeftIcon, ChevronRightIcon, PlusIcon } from '@heroicons/react/24/outline';

/**
 * Calendario semanal de clases grupales.
 * - Cliente: ve las clases de todas las sedes y se inscribe.
 * - Instructor: crea y gestiona sus clases, toma asistencia.
 * - Admin: gestiona todas las clases.
 *
 * Pantallas anchas (xl+): la semana en 7 columnas.
 * Pantallas medianas y celular: tira de 7 días + agenda del día elegido.
 */
const Index = () => {
    const { can, sucursal, role } = useAuth();
    const esCliente = can('clase.inscribir');
    const puedeCrear = can('clase.store');
    const esInstructor = role === 'instructor';

    const [lunes, setLunes] = useState(() => inicioSemana(new Date()));
    const [clases, setClases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState(null);
    const [filtros, setFiltros] = useState({ sucursal_id: '', mias: false });
    const [sucursales, setSucursales] = useState([]);
    const [detalle, setDetalle] = useState(null);
    const [form, setForm] = useState(null); // { clase?, fecha? }

    const dias = useMemo(() => diasDeSemana(lunes), [lunes]);
    const hoyISO = aISO(new Date());

    // Día abierto en la vista agenda: hoy si cae en la semana mostrada; si no, el lunes
    const [diaSel, setDiaSel] = useState(hoyISO);
    useEffect(() => {
        const hoy = aISO(new Date());
        setDiaSel(dias.some(d => aISO(d) === hoy) ? hoy : aISO(dias[0]));
    }, [dias]);

    // El personal con sede fija solo ve su sede; el cliente puede filtrar por sede
    const puedeFiltrarSede = esCliente || !sucursal;

    useEffect(() => {
        if (puedeFiltrarSede) sucursalesCombobox().then(r => setSucursales(r.data || [])).catch(() => {});
    }, [puedeFiltrarSede]);

    const cargar = useCallback(async () => {
        setLoading(true);
        try {
            const r = await calendario(aISO(lunes), aISO(sumarDias(lunes, 6)), filtros);
            setClases(r.data.clases || []);
        } catch (err) {
            setAlert(handleApiError(err, 'No se pudo cargar el calendario'));
        } finally {
            setLoading(false);
        }
    }, [lunes, filtros]);

    useEffect(() => { cargar(); }, [cargar]);

    const porDia = useMemo(() => {
        const m = {};
        clases.forEach(c => { (m[c.fecha] = m[c.fecha] || []).push(c); });
        return m;
    }, [clases]);

    const alCambiar = (msg) => {
        if (msg) setAlert({ type: 'success', message: msg });
        cargar();
    };

    const misInscritas = clases.filter(c => c.inscrito && c.estado !== 'cancelada' && !c.terminada).length;

    const diaActual = dias.find(x => aISO(x) === diaSel) || dias[0];
    const listaDia = porDia[diaSel] || [];

    return (
        <div className="container mx-auto p-4 sm:p-6">
            <PageHeader title="Clases" subtitle={esCliente ? 'Elige tu clase y resérvala' : 'Calendario de clases grupales'} icon={CalendarDaysIcon} />
            <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />

            {/* Barra: navegación de semana + filtros */}
            <div className="flex flex-wrap items-center gap-3 mb-5 text-secondary">
                <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
                    <button onClick={() => setLunes(sumarDias(lunes, -7))} className="p-2 rounded-md hover:bg-slate-100" aria-label="Semana anterior"><ChevronLeftIcon className="w-5 h-5" /></button>
                    <button onClick={() => setLunes(inicioSemana(new Date()))} className="px-3 py-1.5 rounded-md text-xs font-black uppercase hover:bg-slate-100">Hoy</button>
                    <button onClick={() => setLunes(sumarDias(lunes, 7))} className="p-2 rounded-md hover:bg-slate-100" aria-label="Semana siguiente"><ChevronRightIcon className="w-5 h-5" /></button>
                </div>
                <h2 className="text-lg font-black tabular-nums">{rangoSemana(lunes)}</h2>

                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto sm:ml-auto">
                    {puedeFiltrarSede && (
                        <select value={filtros.sucursal_id} onChange={e => setFiltros(f => ({ ...f, sucursal_id: e.target.value }))}
                            className="flex-1 sm:flex-none py-2 px-3 text-sm font-semibold border border-slate-300 rounded-lg bg-white focus:ring-1 focus:ring-primary outline-none">
                            <option value="">Todas las sedes</option>
                            {sucursales.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                        </select>
                    )}
                    {esInstructor && (
                        <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
                            <input type="checkbox" checked={filtros.mias} onChange={e => setFiltros(f => ({ ...f, mias: e.target.checked }))} className="w-4 h-4 accent-black" />
                            Solo mis clases
                        </label>
                    )}
                    {puedeCrear && (
                        <button onClick={() => setForm({})}
                            className="inline-flex items-center gap-1.5 bg-primary text-secondary px-4 py-2 rounded-lg font-black uppercase text-sm shadow hover:bg-primary-hover">
                            <PlusIcon className="w-4 h-4" /> Nueva clase
                        </button>
                    )}
                </div>
            </div>

            {esCliente && misInscritas > 0 && (
                <p className="mb-4 text-sm font-bold text-green-700">Esta semana tienes {misInscritas} {misInscritas === 1 ? 'clase reservada' : 'clases reservadas'}.</p>
            )}

            <div className={`transition-opacity ${loading ? 'opacity-50' : ''}`}>
                {/* ---------- Pantallas medianas y celular: tira de días + agenda del día ---------- */}
                <div className="xl:hidden">
                    <div className="grid grid-cols-7 gap-1.5 mb-5" role="tablist" aria-label="Días de la semana">
                        {dias.map(d => {
                            const iso = aISO(d);
                            const activo = iso === diaSel;
                            const hoy = esHoy(d);
                            const n = (porDia[iso] || []).filter(c => c.estado !== 'cancelada').length;
                            return (
                                <button key={iso} role="tab" aria-selected={activo} onClick={() => setDiaSel(iso)}
                                    className={`flex flex-col items-center py-2 rounded-xl border transition-colors ${activo
                                        ? 'bg-secondary border-secondary text-primary'
                                        : hoy ? 'bg-primary-light/40 border-secondary text-secondary' : 'bg-white border-slate-200 text-secondary hover:border-slate-400'}`}>
                                    <span className={`text-[10px] font-black uppercase tracking-wider ${activo ? 'text-primary/80' : 'text-slate-500'}`}>{nombreDia(d, true)}</span>
                                    <span className="text-lg sm:text-xl font-black leading-tight tabular-nums">{d.getDate()}</span>
                                    <span className={`mt-0.5 text-[10px] font-bold ${activo ? 'text-primary/80' : n ? 'text-slate-600' : 'text-slate-300'}`}>
                                        {n ? <><span className="sm:hidden">{n}</span><span className="hidden sm:inline">{n} {n === 1 ? 'clase' : 'clases'}</span></> : '—'}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    <section>
                        <header className="flex items-center justify-between gap-2 mb-3 text-secondary">
                            <h3 className="text-base font-black uppercase">
                                {nombreDia(diaActual)} {fechaCorta(diaActual)}
                                {esHoy(diaActual) && <span className="ml-2 align-middle px-2 py-0.5 rounded-full bg-secondary text-primary text-[10px] font-black">HOY</span>}
                            </h3>
                            {puedeCrear && diaSel >= hoyISO && (
                                <button onClick={() => setForm({ fecha: diaSel })}
                                    className="inline-flex items-center gap-1 text-xs font-black uppercase px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:border-slate-500 shrink-0">
                                    <PlusIcon className="w-4 h-4" /> Clase este día
                                </button>
                            )}
                        </header>
                        {listaDia.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-slate-300 bg-white py-10 text-center text-sm text-slate-400">No hay clases este día.</div>
                        ) : (
                            <div className="space-y-2.5">
                                {listaDia.map(c => <ClaseFila key={c.id} clase={c} onClick={setDetalle} />)}
                            </div>
                        )}
                    </section>
                </div>

                {/* ---------- Pantallas anchas: semana completa en 7 columnas ---------- */}
                <div className="hidden xl:grid grid-cols-7 gap-2.5">
                    {dias.map(d => {
                        const iso = aISO(d);
                        const lista = porDia[iso] || [];
                        const hoy = esHoy(d);
                        return (
                            <section key={iso} className={`min-w-0 rounded-xl border p-2 min-h-[420px] ${hoy ? 'border-secondary bg-primary-light/40' : 'border-slate-200 bg-slate-50/60'}`}>
                                <header className="flex items-start justify-between gap-1 px-1 mb-2">
                                    <div className="min-w-0">
                                        <p className={`text-[11px] font-black uppercase tracking-wider ${hoy ? 'text-secondary' : 'text-slate-500'}`}>
                                            {nombreDia(d, true)}
                                            {hoy && <span className="ml-1.5 px-1.5 py-px rounded-full bg-secondary text-primary text-[9px]">HOY</span>}
                                        </p>
                                        <p className={`text-lg font-black leading-tight whitespace-nowrap ${hoy ? 'text-secondary' : 'text-slate-800'}`}>{fechaCorta(d)}</p>
                                    </div>
                                    {puedeCrear && iso >= hoyISO && (
                                        <button onClick={() => setForm({ fecha: iso })} className="p-1 rounded-md text-slate-400 hover:text-slate-900 hover:bg-white shrink-0" title="Nueva clase este día" aria-label={`Nueva clase el ${nombreDia(d)}`}>
                                            <PlusIcon className="w-4 h-4" />
                                        </button>
                                    )}
                                </header>
                                <div className="space-y-2">
                                    {lista.length === 0 ? (
                                        <p className="text-[11px] text-slate-400 text-center py-4">Sin clases</p>
                                    ) : lista.map(c => <ClaseCard key={c.id} clase={c} onClick={setDetalle} />)}
                                </div>
                            </section>
                        );
                    })}
                </div>
            </div>

            {detalle && (
                <ClaseDetalleModal clase={detalle} esCliente={esCliente}
                    onClose={() => setDetalle(null)} onCambio={alCambiar}
                    onEditar={(c) => { setDetalle(null); setForm({ clase: c }); }} />
            )}
            {form && (
                <ClaseFormModal clase={form.clase} fechaInicial={form.fecha}
                    onClose={() => setForm(null)}
                    onGuardado={(msg) => { setForm(null); alCambiar(msg); }} />
            )}
        </div>
    );
};

export default Index;
