import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { calendario } from 'services/claseService';
import { combobox as sucursalesCombobox } from 'services/sucursalService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';
import { useAuth } from 'context/AuthContext';
import PageHeader from 'components/Shared/Headers/PageHeader';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import { ClaseCard } from 'components/Clases/ClaseUI';
import ClaseDetalleModal from 'components/Clases/ClaseDetalleModal';
import ClaseFormModal from 'components/Clases/ClaseFormModal';
import { aISO, inicioSemana, diasDeSemana, sumarDias, esHoy, nombreDia, fechaCorta, rangoSemana } from 'utilities/Fechas/fechas';
import { CalendarDaysIcon, ChevronLeftIcon, ChevronRightIcon, PlusIcon } from '@heroicons/react/24/outline';

/**
 * Calendario semanal de clases grupales.
 * - Cliente: ve las clases de todas las sedes y se inscribe.
 * - Instructor: crea y gestiona sus clases, toma asistencia.
 * - Admin: gestiona todas las clases.
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

    return (
        <div className="container mx-auto p-6">
            <PageHeader title="Clases" subtitle={esCliente ? 'Elige tu clase y resérvala' : 'Calendario de clases grupales'} icon={CalendarDaysIcon} />
            <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />

            {/* Barra: navegación de semana + filtros (una sola fila) */}
            <div className="flex flex-wrap items-center gap-3 mb-5">
                <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
                    <button onClick={() => setLunes(sumarDias(lunes, -7))} className="p-2 rounded-md hover:bg-slate-100" aria-label="Semana anterior"><ChevronLeftIcon className="w-5 h-5" /></button>
                    <button onClick={() => setLunes(inicioSemana(new Date()))} className="px-3 py-1.5 rounded-md text-xs font-black uppercase hover:bg-slate-100">Hoy</button>
                    <button onClick={() => setLunes(sumarDias(lunes, 7))} className="p-2 rounded-md hover:bg-slate-100" aria-label="Semana siguiente"><ChevronRightIcon className="w-5 h-5" /></button>
                </div>
                <h2 className="text-lg font-black text-secondary tabular-nums">{rangoSemana(lunes)}</h2>

                <div className="flex flex-wrap items-center gap-3 md:ml-auto">
                    {puedeFiltrarSede && (
                        <select value={filtros.sucursal_id} onChange={e => setFiltros(f => ({ ...f, sucursal_id: e.target.value }))}
                            className="py-2 px-3 text-sm font-semibold border border-slate-300 rounded-lg bg-white focus:ring-1 focus:ring-primary outline-none">
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

            {/* Semana: 7 columnas en PC, lista por día en celular */}
            <div className={`grid grid-cols-1 md:grid-cols-7 gap-3 transition-opacity ${loading ? 'opacity-50' : ''}`}>
                {dias.map(d => {
                    const iso = aISO(d);
                    const lista = porDia[iso] || [];
                    const hoy = esHoy(d);
                    const pasado = iso < aISO(new Date());
                    return (
                        <section key={iso} className={`rounded-xl border p-2 min-h-[120px] md:min-h-[420px] ${hoy ? 'border-secondary bg-primary-light/40' : 'border-slate-200 bg-slate-50/60'}`}>
                            <header className="flex items-center justify-between px-1 mb-2">
                                <div>
                                    <p className={`text-[11px] font-black uppercase tracking-wider ${hoy ? 'text-secondary' : 'text-slate-500'}`}>{nombreDia(d, true)}</p>
                                    <p className={`text-lg font-black leading-none ${hoy ? 'text-secondary' : 'text-slate-800'}`}>{fechaCorta(d)}</p>
                                </div>
                                {hoy && <span className="px-2 py-0.5 rounded-full bg-secondary text-primary text-[10px] font-black uppercase">Hoy</span>}
                                {puedeCrear && !pasado && (
                                    <button onClick={() => setForm({ fecha: iso })} className="p-1 rounded-md text-slate-400 hover:text-slate-900 hover:bg-white" title="Nueva clase este día" aria-label={`Nueva clase el ${nombreDia(d)}`}>
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
