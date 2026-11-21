import React, { useCallback, useEffect, useState } from 'react';
import { BanknotesIcon, BuildingOffice2Icon, NoSymbolIcon } from '@heroicons/react/24/outline';
import { index as listarEmpresas, combobox as empresasCombobox } from 'services/empresaService';
import { combobox as planesCombobox, pagos as listarPagos, registrarPago, simularPago, anularPago, reciboUrl } from 'services/suscripcionService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';
import PageHeader from 'components/Shared/Headers/PageHeader';
import Table from 'components/Shared/Tables/Table';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import ConfirmModal from 'components/Shared/Modals/ConfirmModal';
import { Modal, useTicket, BotonTicket } from 'components/Pagos/PagoUI';
import { KpiTile } from 'components/Dashboard/Charts';

const soles = (n) => `S/ ${Number(n || 0).toFixed(2)}`;
const fecha = (d) => (d ? new Date(`${d}T00:00:00`).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');
const METODOS = { transferencia: 'Transferencia', yape: 'Yape', plin: 'Plin', efectivo: 'Efectivo', tarjeta: 'Tarjeta' };
const inputCls = 'w-full p-2.5 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none';
const labelCls = 'block text-sm font-medium text-slate-700 mb-1.5';

/** Estado de la suscripción de una empresa (texto + color, nunca solo color). */
const Estado = ({ s }) => {
    if (!s?.vence) return <span className="text-xs text-slate-400">Sin vencimiento</span>;
    const [txt, cls] = s.bloqueada ? ['Bloqueada', 'bg-red-50 text-red-700 border-red-200']
        : s.vencida ? ['En gracia', 'bg-amber-50 text-amber-800 border-amber-200']
        : s.dias_restantes <= 7 ? [`Vence en ${s.dias_restantes} d`, 'bg-amber-50 text-amber-800 border-amber-200']
        : ['Al día', 'bg-emerald-50 text-emerald-700 border-emerald-200'];
    return <span className={`inline-block text-xs font-medium border rounded-full px-2 py-0.5 ${cls}`}>{txt}</span>;
};

/** Tipo de pago de suscripción (texto + color). */
const TIPOS_PAGO = {
    renovacion: ['Renovación', 'bg-slate-100 text-slate-600'],
    subida: ['Sube de plan', 'bg-sky-50 text-sky-700'],
    bajada: ['Baja de plan', 'bg-amber-50 text-amber-800'],
};
const TipoPago = ({ tipo }) => {
    const [txt, cls] = TIPOS_PAGO[tipo] || TIPOS_PAGO.renovacion;
    return <span className={`inline-block text-[11px] font-medium rounded-full px-2 py-0.5 whitespace-nowrap ${cls}`}>{txt}</span>;
};

/** Resultado de la simulación del backend: qué pasará con la empresa al registrar el pago. */
const VistaPrevia = ({ sim, cargando }) => {
    if (cargando && !sim) return <div className="h-20 rounded-lg bg-slate-100 animate-pulse" />;
    if (!sim) return null;
    return (
        <div className={`rounded-lg border p-3 space-y-2 text-sm ${cargando ? 'opacity-60' : ''} ${sim.tipo === 'bajada' ? 'bg-amber-50/60 border-amber-200' : sim.tipo === 'subida' ? 'bg-sky-50/60 border-sky-200' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex items-center gap-2 flex-wrap">
                <TipoPago tipo={sim.tipo} />
                <span className="text-xs text-slate-500">{sim.aplica_ya ? 'Se aplica hoy' : `Se aplica el ${fecha(sim.aplica_desde)}`}</span>
            </div>
            <p className="text-slate-700">{sim.mensaje}</p>
            {sim.tipo === 'subida' && sim.dias_restantes > 0 && (
                <dl className="grid grid-cols-3 gap-2 text-xs">
                    <div><dt className="text-slate-500">Días que le quedaban</dt><dd className="font-semibold text-slate-900 tabular-nums">{sim.dias_restantes}</dd></div>
                    <div><dt className="text-slate-500">Saldo a favor</dt><dd className="font-semibold text-slate-900 tabular-nums">{soles(sim.credito)}</dd></div>
                    <div><dt className="text-slate-500">Días de {sim.plan}</dt><dd className="font-semibold text-slate-900 tabular-nums">{sim.dias_credito}</dd></div>
                </dl>
            )}
            <p className="text-xs text-slate-500">Nuevo vencimiento: <b className="text-slate-900">{fecha(sim.periodo_hasta)}</b></p>
        </div>
    );
};

const RegistrarPagoModal = ({ empresa, planes, onClose, onGuardado }) => {
    const [form, setForm] = useState({ plan_suscripcion_id: empresa.plan_suscripcion_id || '', meses: 1, monto: '', metodo_pago: 'transferencia', numero_operacion: '', nota: '' });
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState(null);
    const [sim, setSim] = useState(null);
    const [simulando, setSimulando] = useState(false);
    const plan = planes.find(p => String(p.id) === String(form.plan_suscripcion_id));
    const sugerido = sim?.monto_sugerido ?? (plan ? Number(plan.precio_mensual) * Number(form.meses || 0) : 0);
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    // La vista previa la calcula el backend (mismas reglas que al guardar)
    useEffect(() => {
        const meses = Number(form.meses);
        if (!form.plan_suscripcion_id || !meses || meses < 1 || meses > 36) { setSim(null); return undefined; }
        let vigente = true;
        setSimulando(true);
        const t = setTimeout(() => {
            simularPago(empresa.id, { plan_suscripcion_id: form.plan_suscripcion_id, meses })
                .then(r => { if (vigente) { setSim(r.data); setError(null); } })
                .catch(err => { if (vigente) { setSim(null); const a = handleApiError(err, 'No se pudo calcular el pago'); setError(a.details?.[0] || a.details || a.message); } })
                .finally(() => { if (vigente) setSimulando(false); });
        }, 250);
        return () => { vigente = false; clearTimeout(t); };
    }, [empresa.id, form.plan_suscripcion_id, form.meses]);

    const enviar = async (e) => {
        e.preventDefault();
        setGuardando(true); setError(null);
        try {
            const res = await registrarPago(empresa.id, { ...form, monto: form.monto === '' ? null : form.monto });
            onGuardado(res.message);
        } catch (err) {
            const a = handleApiError(err, 'No se pudo registrar el pago');
            setError(a.details?.[0] || a.details || a.message);
        } finally {
            setGuardando(false);
        }
    };

    return (
        <Modal titulo={`Registrar pago — ${empresa.nombre_comercial}`} icon={BanknotesIcon} onClose={onClose} error={error} ancho="sm:max-w-lg" portal
            pie={<>
                <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium bg-white border border-slate-300 text-slate-700 hover:bg-slate-50">Cancelar</button>
                <button type="submit" form="form-pago-suscripcion" disabled={guardando || !plan || simulando || !sim}
                    className="px-4 py-2 rounded-lg text-sm font-semibold bg-secondary text-white hover:bg-black/80">
                    {guardando ? 'Guardando…' : `Registrar ${soles(form.monto === '' ? sugerido : form.monto)}`}
                </button>
            </>}>
            <form id="form-pago-suscripcion" onSubmit={enviar} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 sm:col-span-1">
                        <label className={labelCls}>Plan</label>
                        <select value={form.plan_suscripcion_id} onChange={(e) => set('plan_suscripcion_id', e.target.value)} className={inputCls} required>
                            <option value="">Elegir plan</option>
                            {planes.map(p => <option key={p.id} value={p.id}>{p.nombre} — {soles(p.precio_mensual)}/mes</option>)}
                        </select>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                        <label className={labelCls}>Meses</label>
                        <input type="number" min="1" max="36" value={form.meses} onChange={(e) => set('meses', e.target.value)} className={inputCls} required />
                    </div>
                    <div>
                        <label className={labelCls}>Monto (S/)</label>
                        <input type="number" min="0" step="0.01" value={form.monto} onChange={(e) => set('monto', e.target.value)} className={inputCls} placeholder={sugerido.toFixed(2)} />
                    </div>
                    <div>
                        <label className={labelCls}>Método</label>
                        <select value={form.metodo_pago} onChange={(e) => set('metodo_pago', e.target.value)} className={inputCls}>
                            {Object.entries(METODOS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                        </select>
                    </div>
                    <div className="col-span-2">
                        <label className={labelCls}>N° de operación <span className="text-slate-400 font-normal">(opcional)</span></label>
                        <input value={form.numero_operacion} onChange={(e) => set('numero_operacion', e.target.value)} className={inputCls} />
                    </div>
                    <div className="col-span-2">
                        <label className={labelCls}>Nota <span className="text-slate-400 font-normal">(opcional)</span></label>
                        <input value={form.nota} onChange={(e) => set('nota', e.target.value)} className={inputCls} placeholder="Ej: descuento por pago anual" />
                    </div>
                </div>
                {plan && <VistaPrevia sim={sim} cargando={simulando} />}
            </form>
        </Modal>
    );
};

const FILTROS_PAGOS = { empresa_id: '', estado: '', metodo_pago: '', desde: '', hasta: '' };

/** Superadmin: lo que le pagan las empresas. Estado de cada suscripción, registrar y anular pagos. */
const Cobros = () => {
    const [empresas, setEmpresas] = useState([]);
    const [pagEmpresas, setPagEmpresas] = useState({ currentPage: 1, totalPages: 1, total: 0 });
    const [pagos, setPagos] = useState([]);
    const [pagPagos, setPagPagos] = useState({ currentPage: 1, totalPages: 1, total: 0 });
    const [filtrosPagos, setFiltrosPagos] = useState(FILTROS_PAGOS);
    const [resumen, setResumen] = useState(null);
    const [listaEmpresas, setListaEmpresas] = useState([]);
    const [cargandoPagos, setCargandoPagos] = useState(true);
    const [planes, setPlanes] = useState([]);
    const [filtros, setFiltros] = useState({ search: '' });
    const [cargando, setCargando] = useState(true);
    const [cobrando, setCobrando] = useState(null);
    const [anulando, setAnulando] = useState(null);
    const [alert, setAlert] = useState(null);
    const { abrirTicket, TicketModal, errorTicket } = useTicket(reciboUrl, 'Recibo de suscripción');

    useEffect(() => { if (errorTicket) setAlert({ type: 'error', message: errorTicket }); }, [errorTicket]);

    const cargarEmpresas = useCallback(async (page = 1, f = filtros) => {
        setCargando(true);
        try {
            const r = await listarEmpresas(page, f);
            setEmpresas(r.data || []);
            setPagEmpresas({ currentPage: r.current_page, totalPages: r.last_page, total: r.total });
        } catch (err) { setAlert(handleApiError(err, 'No se pudieron cargar las empresas.')); }
        finally { setCargando(false); }
    }, [filtros]);

    const cargarPagos = useCallback(async (page = 1, f = filtrosPagos) => {
        setCargandoPagos(true);
        try {
            const r = await listarPagos(page, f);
            setPagos(r.data || []);
            setResumen(r.resumen || null);
            setPagPagos({ currentPage: r.current_page, totalPages: r.last_page, total: r.total });
        } catch (err) { setAlert(handleApiError(err, 'No se pudieron cargar los pagos.')); }
        finally { setCargandoPagos(false); }
    }, [filtrosPagos]);

    // Carga inicial (los filtros se aplican con "Buscar")
    useEffect(() => {
        cargarEmpresas(1); cargarPagos(1);
        planesCombobox().then(r => setPlanes(r.data || [])).catch(() => {});
        empresasCombobox().then(r => setListaEmpresas(r.data || [])).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const recargar = (msg) => {
        setCobrando(null); setAnulando(null);
        setAlert({ type: 'success', message: msg });
        cargarEmpresas(pagEmpresas.currentPage); cargarPagos(pagPagos.currentPage);
    };

    const confirmarAnular = async () => {
        try { const r = await anularPago(anulando.id); recargar(r.message); }
        catch (err) { setAnulando(null); setAlert(handleApiError(err, 'No se pudo anular el pago.')); }
    };

    const columnasEmpresas = [
        { header: 'Empresa', render: (e) => (
            <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0"><BuildingOffice2Icon className="w-5 h-5 text-slate-500" /></div>
                <div className="min-w-0"><p className="font-medium text-slate-900 truncate">{e.nombre_comercial}</p><p className="text-xs text-slate-500">RUC {e.ruc}</p></div>
            </div>
        ) },
        { header: 'Plan', render: (e) => (
            <span className="text-sm">
                {e.plan || '—'}{e.precio_mensual ? <span className="text-slate-400"> · {soles(e.precio_mensual)}/mes</span> : null}
                {e.suscripcion?.cambio_programado && (
                    <span className="block text-[11px] text-amber-700">Pasa a {e.suscripcion.cambio_programado.plan} el {fecha(e.suscripcion.cambio_programado.desde)}</span>
                )}
            </span>
        ) },
        { header: 'Vence', render: (e) => <span className="text-sm tabular-nums">{fecha(e.suscripcion_vence)}</span> },
        { header: 'Estado', render: (e) => (e.estado ? <Estado s={e.suscripcion} /> : <span className="text-xs text-slate-400">Empresa inactiva</span>) },
        { header: '', render: (e) => (
            <button onClick={() => setCobrando(e)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-primary text-secondary hover:bg-primary-hover">
                <BanknotesIcon className="w-4 h-4" /> Registrar pago
            </button>
        ) },
    ];

    const columnasPagos = [
        { header: 'Fecha', render: (p) => <span className="text-sm text-slate-500 whitespace-nowrap">{p.created_at?.slice(0, 16)}</span> },
        { header: 'Empresa', render: (p) => <span className="font-medium text-slate-900">{p.empresa?.nombre_comercial}</span> },
        { header: 'Periodo', render: (p) => <span className="text-sm whitespace-nowrap">{fecha(p.periodo_desde)} — {fecha(p.periodo_hasta)}</span> },
        { header: 'Plan · meses', render: (p) => (
            <span className="text-sm">
                {p.plan} · {p.meses}
                <span className="flex items-center gap-1 mt-0.5"><TipoPago tipo={p.tipo} />{p.dias_credito > 0 && <span className="text-[11px] text-slate-400">+{p.dias_credito} d de saldo</span>}</span>
            </span>
        ) },
        { header: 'Monto', render: (p) => <span className="font-semibold tabular-nums">{soles(p.monto)}</span> },
        { header: 'Método', render: (p) => <span className="text-sm">{METODOS[p.metodo_pago] || p.metodo_pago}{p.numero_operacion ? <span className="text-slate-400"> · {p.numero_operacion}</span> : null}</span> },
        { header: 'Registró', render: (p) => <span className="text-sm text-slate-500">{p.registrado_por || '—'}{p.nota ? <span className="block text-[11px] text-slate-400 max-w-[180px] truncate" title={p.nota}>{p.nota}</span> : null}</span> },
        { header: 'Estado', render: (p) => (p.estado === 'anulado'
            ? <span className="text-xs font-medium text-slate-500 bg-slate-100 rounded-full px-2 py-0.5">Anulado</span>
            : <span className="text-xs font-medium text-emerald-700 bg-emerald-50 rounded-full px-2 py-0.5">Pagado</span>) },
        { header: '', render: (p) => (
            <div className="flex items-center justify-end gap-1.5">
                <BotonTicket compacto onClick={() => abrirTicket(p.id)} />
                {p.anulable && (
                    <button onClick={() => setAnulando(p)} title="Solo se puede anular el último pago vigente de cada empresa"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-red-700 border border-red-200 hover:bg-red-50"><NoSymbolIcon className="w-4 h-4" /> Anular</button>
                )}
            </div>
        ) },
    ];

    return (
        <div className="container mx-auto p-6 space-y-8">
            <PageHeader title="Pagos de empresas" subtitle="Lo que cada gimnasio le paga a la plataforma: cada pago extiende su vencimiento" icon={BanknotesIcon} />
            <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />

            <section>
                <h2 className="text-base font-semibold text-slate-900 mb-3">Empresas</h2>
                <Table columns={columnasEmpresas} data={empresas} loading={cargando}
                    filterConfig={[{ name: 'search', type: 'text', label: 'Buscar empresa', placeholder: 'Nombre o RUC', colSpan: 'col-span-12 md:col-span-10' }]}
                    filters={filtros} onFilterChange={(n, v) => setFiltros(f => ({ ...f, [n]: v }))}
                    onFilterSubmit={() => cargarEmpresas(1, filtros)} onFilterClear={() => { const f = { search: '' }; setFiltros(f); cargarEmpresas(1, f); }}
                    pagination={{ ...pagEmpresas, clave: 'empresas', onPageChange: (p) => cargarEmpresas(p) }} />
            </section>

            <section>
                <h2 className="text-base font-semibold text-slate-900 mb-3">Historial de pagos</h2>
                {resumen && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <KpiTile destacado label="Cobrado" valor={soles(resumen.cobrado)} icon={BanknotesIcon} ayuda="Según los filtros" />
                        <KpiTile label="Pagos" valor={resumen.pagos} ayuda={resumen.pagos ? `Promedio ${soles(resumen.cobrado / resumen.pagos)}` : 'Sin pagos'} />
                        <KpiTile label="Anulados" valor={resumen.anulados} icon={NoSymbolIcon} ayuda={soles(resumen.anulado)} />
                        <KpiTile label="Empresas" valor={pagEmpresas.total} icon={BuildingOffice2Icon} ayuda="Registradas en la plataforma" />
                    </div>
                )}
                <Table columns={columnasPagos} data={pagos} loading={cargandoPagos}
                    filterConfig={[
                        { name: 'empresa_id', type: 'select', label: 'Empresa', colSpan: 'col-span-12 md:col-span-3',
                            options: [{ value: '', label: 'Todas' }, ...listaEmpresas.map(e => ({ value: String(e.id), label: e.nombre_comercial }))] },
                        { name: 'estado', type: 'select', label: 'Estado', colSpan: 'col-span-6 md:col-span-2',
                            options: [{ value: '', label: 'Todos' }, { value: 'pagado', label: 'Pagados' }, { value: 'anulado', label: 'Anulados' }] },
                        { name: 'metodo_pago', type: 'select', label: 'Método', colSpan: 'col-span-6 md:col-span-2',
                            options: [{ value: '', label: 'Todos' }, ...Object.entries(METODOS).map(([value, label]) => ({ value, label }))] },
                        { name: 'desde', type: 'date', label: 'Desde', colSpan: 'col-span-6 md:col-span-2' },
                        { name: 'hasta', type: 'date', label: 'Hasta', colSpan: 'col-span-6 md:col-span-2' },
                    ]}
                    filters={filtrosPagos} onFilterChange={(n, v) => setFiltrosPagos(f => ({ ...f, [n]: v }))}
                    onFilterSubmit={() => cargarPagos(1, filtrosPagos)} onFilterClear={() => { setFiltrosPagos(FILTROS_PAGOS); cargarPagos(1, FILTROS_PAGOS); }}
                    pagination={{ ...pagPagos, clave: 'cobros', onPageChange: (p) => cargarPagos(p) }} />
            </section>

            <TicketModal />
            {cobrando && <RegistrarPagoModal empresa={cobrando} planes={planes} onClose={() => setCobrando(null)} onGuardado={recargar} />}
            {anulando && (
                <ConfirmModal title="¿Anular este pago?"
                    message={`El vencimiento de ${anulando.empresa?.nombre_comercial} volverá al ${fecha(new Date(new Date(`${anulando.periodo_desde}T00:00:00`).getTime() - 86400000).toISOString().slice(0, 10))}.`}
                    confirmText="Sí, anular" onConfirm={confirmarAnular} onCancel={() => setAnulando(null)} />
            )}
        </div>
    );
};

export default Cobros;
