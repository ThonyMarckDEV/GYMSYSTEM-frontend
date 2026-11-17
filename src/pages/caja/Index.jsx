import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useCaja } from 'hooks/caja/useCaja';
import { useAuth } from 'context/AuthContext';
import PageHeader from 'components/Shared/Headers/PageHeader';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import LoadingScreen from 'components/Shared/LoadingScreen';
import CobroPanel from 'components/Caja/CobroPanel';
import ArqueoModal from 'components/Caja/ArqueoModal';
import { EstadoPago, BotonTicket, useTicket, soles, METODOS, errorDeAlerta } from 'components/Pagos/PagoUI';
import { KpiTile } from 'components/Dashboard/Charts';
import { BanknotesIcon, LockClosedIcon, LockOpenIcon, DevicePhoneMobileIcon, ReceiptPercentIcon, ArchiveBoxIcon } from '@heroicons/react/24/outline';

/** Abrir turno: el cajero elige una caja libre de su sede */
const AbrirCaja = ({ onAbrir, procesando, ultimoCierre, cajas }) => {
    const { sucursal } = useAuth();
    const [monto, setMonto] = useState('');
    const [cajaId, setCajaId] = useState('');

    // Si solo hay una caja libre, se selecciona sola
    useEffect(() => {
        if (cajas.length === 1) setCajaId(String(cajas[0].id));
    }, [cajas]);

    return (
        <div className="max-w-xl mx-auto space-y-6">
            {ultimoCierre && <ResumenCierre data={ultimoCierre} />}

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-black text-secondary flex items-center gap-2 mb-1"><LockOpenIcon className="w-5 h-5" /> Abrir caja</h3>
                <p className="text-sm text-slate-500 mb-5">Cuenta el efectivo con el que inicias el turno (sencillo para vuelto).</p>

                {sucursal && <p className="mb-4 text-sm text-slate-600">Sede: <b>{sucursal.nombre}</b></p>}

                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Caja *</label>
                {cajas.length === 0 ? (
                    <p className="mb-4 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3">
                        No hay cajas libres en tu sede. Todas están abiertas por otros cajeros o el administrador aún no registró cajas.
                    </p>
                ) : (
                    <div className="mb-4 grid grid-cols-2 sm:grid-cols-3 gap-2" role="radiogroup">
                        {cajas.map(c => {
                            const activo = String(c.id) === cajaId;
                            return (
                                <button key={c.id} type="button" role="radio" aria-checked={activo} onClick={() => setCajaId(String(c.id))}
                                    className={`p-3 rounded-lg border text-left transition-colors ${activo ? 'bg-secondary text-primary border-secondary' : 'bg-white border-slate-300 hover:border-slate-400'}`}>
                                    <p className="font-black text-sm">{c.nombre}</p>
                                    <p className={`text-[11px] ${activo ? 'text-primary/70' : 'text-slate-400'}`}>{sucursal ? (c.descripcion || 'Libre') : c.sucursal}</p>
                                </button>
                            );
                        })}
                    </div>
                )}

                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Monto de apertura (S/) *</label>
                <input type="number" min="0" step="0.10" value={monto} onChange={(e) => setMonto(e.target.value)}
                    className="w-full p-3 text-2xl font-black border border-slate-300 rounded-lg focus:ring-1 focus:ring-primary outline-none tabular-nums" placeholder="0.00" />

                <button disabled={procesando || monto === '' || !cajaId}
                    onClick={() => onAbrir({ caja_id: cajaId, monto_apertura: monto })}
                    className="mt-5 w-full py-3 bg-secondary text-primary rounded-lg font-black uppercase hover:bg-secondary/90 disabled:opacity-40">
                    {procesando ? 'Abriendo...' : 'Abrir caja'}
                </button>
            </div>
        </div>
    );
};

/** Resultado del arqueo al cerrar */
const ResumenCierre = ({ data }) => {
    const { caja, resumen } = data;
    const dif = Number(caja.diferencia);
    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide flex items-center gap-2"><LockClosedIcon className="w-4 h-4" /> {caja.caja_nombre} cerrada · turno #{caja.id}</h3>
            <p className="text-xs text-slate-400 mb-4">{caja.fecha_apertura} → {caja.fecha_cierre}</p>
            <div className="grid grid-cols-3 gap-3 text-center">
                <div><p className="text-[10px] uppercase font-bold text-slate-400">Esperado</p><p className="font-black tabular-nums">{soles(caja.monto_esperado)}</p></div>
                <div><p className="text-[10px] uppercase font-bold text-slate-400">Contado</p><p className="font-black tabular-nums">{soles(caja.monto_contado)}</p></div>
                <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Diferencia</p>
                    <p className={`font-black tabular-nums ${dif < 0 ? 'text-red-700' : dif > 0 ? 'text-amber-700' : 'text-green-700'}`}>
                        {dif === 0 ? 'Cuadra' : `${dif > 0 ? 'Sobra' : 'Falta'} ${soles(Math.abs(dif))}`}
                    </p>
                </div>
            </div>
            <p className="text-xs text-slate-500 mt-4">Total cobrado en el turno: <b>{soles(resumen.total_cobrado)}</b> en {resumen.cantidad_pagos} pagos.</p>
        </div>
    );
};

const Index = () => {
    const c = useCaja();
    const [params] = useSearchParams();
    const dniInicial = (params.get('dni') || '').replace(/\D/g, '').slice(0, 8);
    const [cerrando, setCerrando] = useState(false);
    const { abrirTicket, TicketModal, errorTicket } = useTicket();

    if (c.loading) return <LoadingScreen />;

    return (
        <div className="container mx-auto p-6">
            <PageHeader title="Caja" subtitle={c.caja ? `${c.caja.caja.caja_nombre} · Sede ${c.caja.caja.sucursal} · abierta desde ${c.caja.caja.fecha_apertura?.slice(11, 16)}` : 'Sin caja abierta'} icon={BanknotesIcon} />

            <AlertMessage type={c.alert?.type} message={c.alert?.message} details={c.alert?.details} onClose={() => c.setAlert(null)} />
            {errorTicket && <AlertMessage type="error" message={errorTicket} />}

            {!c.caja ? (
                <AbrirCaja onAbrir={c.abrirCaja} procesando={c.procesando} ultimoCierre={c.ultimoCierre} cajas={c.cajasDisponibles} />
            ) : (
                <>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <KpiTile destacado label="Efectivo en caja" valor={soles(c.caja.resumen.efectivo_esperado)} icon={BanknotesIcon}
                            ayuda={`Apertura ${soles(c.caja.resumen.monto_apertura)} + efectivo ${soles(c.caja.resumen.por_metodo.efectivo.total)}`} />
                        <KpiTile label="Total cobrado" valor={soles(c.caja.resumen.total_cobrado)} icon={ReceiptPercentIcon} ayuda={`${c.caja.resumen.cantidad_pagos} pagos`} />
                        <KpiTile label="Yape / Plin" valor={soles(c.caja.resumen.por_metodo.yape.total + c.caja.resumen.por_metodo.plin.total)} icon={DevicePhoneMobileIcon}
                            ayuda={`Tarjeta ${soles(c.caja.resumen.por_metodo.tarjeta.total)}`} />
                        <KpiTile label="Anulados" valor={c.caja.resumen.anulados.cantidad} icon={ArchiveBoxIcon} ayuda={soles(c.caja.resumen.anulados.total)} />
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
                        <div className="xl:col-span-3">
                            <CobroPanel
                                errorModal={errorDeAlerta(c.alert)}
                                dniInicial={dniInicial}
                                planes={c.planes} descuentos={c.descuentos} metodos={c.metodos}
                                busqueda={c.busqueda} ultimoCobro={c.ultimoCobro} procesando={c.procesando}
                                onBuscar={c.buscar} onCobrar={c.cobrarCliente}
                                onVerificar={c.verificarPendiente} onRechazar={c.rechazarPendiente}
                                onLimpiar={() => { c.setBusqueda(null); c.setUltimoCobro(null); }}
                                onTicket={abrirTicket}
                            />
                        </div>

                        <div className="xl:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">Movimientos del turno</h3>
                                <button onClick={() => setCerrando(true)}
                                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-secondary text-primary rounded-lg text-xs font-black uppercase hover:bg-secondary/90">
                                    <LockClosedIcon className="w-4 h-4" /> Cerrar caja
                                </button>
                            </div>
                            {c.caja.pagos.length === 0 ? (
                                <p className="text-sm text-slate-400 py-8 text-center">Aún no hay cobros en este turno.</p>
                            ) : (
                                <ul className="divide-y divide-slate-100 max-h-[560px] overflow-y-auto">
                                    {c.caja.pagos.map(p => (
                                        <li key={p.id} className="py-2.5 flex items-center justify-between gap-2">
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-slate-800 truncate">{p.cliente}</p>
                                                <p className="text-[11px] text-slate-400">{p.hora} · {p.plan} · {METODOS[p.metodo_pago]}{p.origen === 'web' ? ' (en línea)' : ''}</p>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <div className="text-right">
                                                    <p className={`text-sm font-black tabular-nums ${p.estado === 'anulado' ? 'line-through text-slate-400' : 'text-slate-900'}`}>{soles(p.monto)}</p>
                                                    {p.estado !== 'verificado' && <EstadoPago estado={p.estado} />}
                                                </div>
                                                <BotonTicket compacto onClick={() => abrirTicket(p.id)} />
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            <p className="mt-3 text-[11px] text-slate-400">Para anular un cobro usa el módulo <Link to="/pago/listar" className="underline">Pagos</Link> (requiere PIN).</p>
                        </div>
                    </div>
                </>
            )}

            {cerrando && c.caja && (
                <ArqueoModal esperado={c.caja.resumen.efectivo_esperado} loading={c.procesando} error={errorDeAlerta(c.alert)}
                    onClose={() => setCerrando(false)}
                    onConfirm={async (data) => { if (await c.cerrarCaja(data)) setCerrando(false); }} />
            )}

            <TicketModal />
        </div>
    );
};

export default Index;
