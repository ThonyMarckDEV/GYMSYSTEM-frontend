import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
    MagnifyingGlassIcon, UserIcon, ExclamationTriangleIcon, BanknotesIcon,
    DevicePhoneMobileIcon, CreditCardIcon, CheckCircleIcon, PhotoIcon, NoSymbolIcon
} from '@heroicons/react/24/outline';
import { QrPago, ComprobanteModal, BotonTicket, soles, METODOS } from 'components/Pagos/PagoUI';

const METODOS_CAJA = [
    { key: 'efectivo', label: 'Efectivo', icon: BanknotesIcon },
    { key: 'yape',     label: 'Yape',     icon: DevicePhoneMobileIcon },
    { key: 'plin',     label: 'Plin',     icon: DevicePhoneMobileIcon },
    { key: 'tarjeta',  label: 'Tarjeta',  icon: CreditCardIcon },
];

const inputCls = 'w-full p-2.5 text-sm text-secondary border border-slate-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none bg-white';
const labelCls = 'block text-xs font-bold text-slate-700 uppercase mb-1';

/**
 * Cobro en caja: buscar al cliente por DNI → si ya subió comprobante se verifica,
 * si no, se elige plan y se cobra en efectivo (con vuelto), Yape/Plin al momento o tarjeta.
 */
const CobroPanel = ({ errorModal, dniInicial = '', planes, descuentos, metodos, busqueda, ultimoCobro, procesando, onBuscar, onCobrar, onVerificar, onRechazar, onLimpiar, onTicket }) => {
    const [dni, setDni] = useState(dniInicial);

    // Llegó desde la ficha del cliente (/caja?dni=...): buscarlo automáticamente una vez
    const buscado = useRef(false);
    useEffect(() => {
        if (!buscado.current && /^\d{8}$/.test(dniInicial)) {
            buscado.current = true;
            onBuscar(dniInicial);
        }
    }, [dniInicial, onBuscar]);
    const [form, setForm] = useState({ plan_id: '', descuento_id: '', metodo_pago: 'efectivo', monto_recibido: '', numero_operacion: '' });
    const [verComprobante, setVerComprobante] = useState(false);

    // Nuevo cliente buscado → formulario limpio
    useEffect(() => {
        setForm({ plan_id: '', descuento_id: '', metodo_pago: 'efectivo', monto_recibido: '', numero_operacion: '' });
    }, [busqueda?.cliente?.id]);

    const plan = planes.find(p => String(p.id) === String(form.plan_id));
    const descuento = descuentos.find(d => String(d.id) === String(form.descuento_id));

    const { montoDescuento, total } = useMemo(() => {
        if (!plan) return { montoDescuento: 0, total: 0 };
        const precio = Number(plan.precio);
        const md = descuento
            ? (descuento.tipo === 'porcentaje' ? Math.round(precio * Number(descuento.valor)) / 100 : Math.min(Number(descuento.valor), precio))
            : 0;
        return { montoDescuento: md, total: Math.max(precio - md, 0) };
    }, [plan, descuento]);

    const recibido = form.monto_recibido === '' ? null : Number(form.monto_recibido);
    const vuelto = recibido !== null ? Math.round((recibido - total) * 100) / 100 : null;
    const esDigital = form.metodo_pago === 'yape' || form.metodo_pago === 'plin';

    const puedeCobrar = plan && !procesando
        && (form.metodo_pago !== 'efectivo' || recibido === null || recibido >= total)
        && (!esDigital || form.numero_operacion.trim());

    const buscar = (e) => {
        e.preventDefault();
        if (/^\d{8}$/.test(dni)) onBuscar(dni);
    };

    const cobrar = () => onCobrar({
        plan_id: form.plan_id,
        descuento_id: form.descuento_id || null,
        metodo_pago: form.metodo_pago,
        monto_recibido: form.metodo_pago === 'efectivo' ? (recibido ?? total) : null,
        numero_operacion: esDigital ? form.numero_operacion.trim() : null,
    });

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide mb-4">Cobrar membresía</h3>

            {/* 1. BUSCAR POR DNI */}
            <form onSubmit={buscar} className="flex gap-2">
                <div className="relative flex-1">
                    <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-3 text-slate-400" />
                    <input value={dni} onChange={(e) => setDni(e.target.value.replace(/\D/g, '').slice(0, 8))}
                        inputMode="numeric" autoFocus placeholder="DNI del cliente (8 dígitos)"
                        className="w-full pl-10 p-3 text-lg font-bold tracking-widest border border-slate-300 rounded-lg focus:ring-1 focus:ring-primary outline-none tabular-nums" />
                </div>
                <button type="submit" disabled={dni.length !== 8 || procesando}
                    className="px-5 bg-secondary text-primary rounded-lg font-black uppercase text-sm hover:bg-secondary/90 disabled:opacity-40">
                    Buscar
                </button>
            </form>

            {/* COBRO EXITOSO */}
            {ultimoCobro && !busqueda && (
                <div className="mt-5 p-4 rounded-xl bg-green-50 border border-green-200">
                    <p className="font-black text-green-800 flex items-center gap-2"><CheckCircleIcon className="w-5 h-5" /> Cobro registrado</p>
                    <p className="text-sm text-green-900 mt-1">
                        {ultimoCobro.cliente.nombre_completo} · {ultimoCobro.membresia.plan?.nombre} · <b>{soles(ultimoCobro.pago?.monto)}</b> en {METODOS[ultimoCobro.pago?.metodo_pago]}
                    </p>
                    {ultimoCobro.pago?.metodo_pago === 'efectivo' && Number(ultimoCobro.pago?.vuelto) > 0 && (
                        <p className="text-2xl font-black text-green-900 mt-2 tabular-nums">Vuelto: {soles(ultimoCobro.pago.vuelto)}</p>
                    )}
                    <p className="text-xs text-green-800 mt-1">Vigente del {ultimoCobro.membresia.fecha_inicio?.slice(0, 10)} al {ultimoCobro.membresia.fecha_fin?.slice(0, 10)}</p>
                    <div className="mt-3 flex gap-2">
                        {ultimoCobro.pago && <BotonTicket onClick={() => onTicket(ultimoCobro.pago.id)} />}
                        <button onClick={() => { onLimpiar(); setDni(''); }} className="px-3 py-2 text-xs font-bold rounded-lg border border-slate-200 text-slate-600 hover:bg-white">Nuevo cobro</button>
                    </div>
                </div>
            )}

            {/* 2. RESULTADO DE LA BÚSQUEDA */}
            {busqueda && (
                <div className="mt-5 space-y-4">
                    <div className="flex items-start justify-between gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-white border border-slate-200"><UserIcon className="w-6 h-6 text-slate-500" /></div>
                            <div>
                                <p className="font-black text-slate-800">{busqueda.cliente.nombre_completo}</p>
                                <p className="text-xs text-slate-500">DNI {busqueda.cliente.dni}{busqueda.cliente.telefono ? ` · ${busqueda.cliente.telefono}` : ''}</p>
                            </div>
                        </div>
                        <Link to={`/membresia/${busqueda.cliente.id}`} className="text-xs font-bold text-slate-500 hover:text-slate-900 whitespace-nowrap">Ver ficha →</Link>
                    </div>

                    {busqueda.membresia_actual && (
                        <p className="text-sm text-slate-600">
                            Membresía actual: <b>{busqueda.membresia_actual.plan}</b> ({busqueda.membresia_actual.estado}) hasta el <b>{busqueda.membresia_actual.fecha_fin}</b>
                            {busqueda.membresia_actual.dias !== null && ` · ${busqueda.membresia_actual.dias >= 0 ? `quedan ${busqueda.membresia_actual.dias} días` : 'vencida'}`}
                        </p>
                    )}

                    {/* YA PAGÓ POR LA WEB → verificar, no cobrar otra vez */}
                    {busqueda.pago_pendiente ? (
                        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                            <p className="font-black text-amber-900 flex items-center gap-2"><ExclamationTriangleIcon className="w-5 h-5" /> Este cliente ya pagó en línea</p>
                            <p className="text-sm text-amber-900 mt-1">
                                Envió un comprobante de <b>{soles(busqueda.pago_pendiente.monto)}</b> por {METODOS[busqueda.pago_pendiente.metodo_pago]} (op. {busqueda.pago_pendiente.numero_operacion}) para el plan <b>{busqueda.pago_pendiente.plan}</b>.
                                No le cobres de nuevo: revisa el comprobante y verifícalo.
                            </p>
                            <button onClick={() => setVerComprobante(true)}
                                className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-secondary text-primary rounded-lg font-bold text-sm hover:bg-secondary/90">
                                <PhotoIcon className="w-4 h-4" /> Ver comprobante y verificar
                            </button>
                        </div>
                    ) : busqueda.bloqueo ? (
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-700 flex gap-2">
                            <NoSymbolIcon className="w-5 h-5 flex-shrink-0 text-slate-500" /> {busqueda.bloqueo}
                        </div>
                    ) : (
                        /* 3. FORMULARIO DE COBRO */
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className={labelCls}>Plan *</label>
                                    <select value={form.plan_id} onChange={(e) => setForm(f => ({ ...f, plan_id: e.target.value }))} className={inputCls}>
                                        <option value="">-- Seleccionar plan --</option>
                                        {planes.map(p => <option key={p.id} value={p.id}>{p.nombre} — {soles(p.precio)} ({p.duracion_dias} días)</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelCls}>Descuento</label>
                                    <select value={form.descuento_id} onChange={(e) => setForm(f => ({ ...f, descuento_id: e.target.value }))} className={inputCls}>
                                        <option value="">Sin descuento</option>
                                        {descuentos.map(d => <option key={d.id} value={d.id}>{d.nombre} ({d.tipo === 'porcentaje' ? `${d.valor}%` : soles(d.valor)})</option>)}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className={labelCls}>Método de pago</label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" role="radiogroup">
                                    {METODOS_CAJA.map(m => {
                                        const Icon = m.icon;
                                        const activo = form.metodo_pago === m.key;
                                        return (
                                            <button key={m.key} type="button" role="radio" aria-checked={activo}
                                                onClick={() => setForm(f => ({ ...f, metodo_pago: m.key }))}
                                                className={`flex items-center justify-center gap-1.5 p-2.5 rounded-lg border text-sm font-bold transition-colors
                                                    ${activo ? 'bg-secondary text-primary border-secondary' : 'bg-white text-slate-600 border-slate-300 hover:border-slate-400'}`}>
                                                <Icon className="w-4 h-4" /> {m.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {form.metodo_pago === 'efectivo' && (
                                <div className="grid grid-cols-2 gap-4 items-end">
                                    <div>
                                        <label className={labelCls}>Recibido (S/)</label>
                                        <input type="number" min="0" step="0.10" value={form.monto_recibido}
                                            onChange={(e) => setForm(f => ({ ...f, monto_recibido: e.target.value }))}
                                            className={`${inputCls} text-lg font-bold tabular-nums`} placeholder={total ? total.toFixed(2) : '0.00'} />
                                    </div>
                                    <div className={`p-2.5 rounded-lg border text-center ${vuelto !== null && vuelto < 0 ? 'bg-red-50 border-red-200 text-red-800' : 'bg-slate-50 border-slate-200 text-slate-800'}`}>
                                        <p className="text-[10px] uppercase font-bold opacity-70">{vuelto !== null && vuelto < 0 ? 'Falta' : 'Vuelto'}</p>
                                        <p className="text-xl font-black tabular-nums">{soles(Math.abs(vuelto ?? 0))}</p>
                                    </div>
                                </div>
                            )}

                            {esDigital && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center p-4 rounded-xl bg-slate-50 border border-slate-200">
                                    <QrPago tipo={form.metodo_pago} datos={metodos?.[form.metodo_pago]} />
                                    <div>
                                        <p className="text-sm text-slate-600 mb-3">Muestra el QR al cliente. Cuando te enseñe la confirmación, escribe el N° de operación.</p>
                                        <label className={labelCls}>N° de operación *</label>
                                        <input value={form.numero_operacion} onChange={(e) => setForm(f => ({ ...f, numero_operacion: e.target.value }))}
                                            className={inputCls} placeholder="Ej: 12345678" />
                                    </div>
                                </div>
                            )}

                            {plan && (
                                <div className="flex items-center justify-between p-4 rounded-xl bg-secondary text-white">
                                    <div className="text-sm">
                                        <p className="text-white/70">{plan.nombre}{montoDescuento > 0 && ` · desc. -${soles(montoDescuento)}`}</p>
                                        <p className="text-[10px] uppercase font-bold text-primary">Total a cobrar</p>
                                    </div>
                                    <p className="text-3xl font-black tabular-nums">{soles(total)}</p>
                                </div>
                            )}

                            <div className="flex justify-end">
                                <button onClick={cobrar} disabled={!puedeCobrar}
                                    className="px-8 py-3 bg-primary text-secondary rounded-lg font-black uppercase shadow hover:bg-primary-hover disabled:opacity-40">
                                    {procesando ? 'Cobrando...' : `Cobrar ${plan ? soles(total) : ''}`}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {verComprobante && busqueda?.pago_pendiente && (
                <ComprobanteModal
                    pago={{ ...busqueda.pago_pendiente, cliente: busqueda.cliente.nombre_completo, dni: busqueda.cliente.dni, estado: 'pendiente' }}
                    loading={procesando}
                    error={errorModal}
                    onClose={() => setVerComprobante(false)}
                    onVerificar={async () => { if (await onVerificar(busqueda.pago_pendiente.id)) setVerComprobante(false); }}
                    onRechazar={async (motivo) => { if (await onRechazar(busqueda.pago_pendiente.id, motivo)) setVerComprobante(false); }}
                />
            )}
        </div>
    );
};

export default CobroPanel;
