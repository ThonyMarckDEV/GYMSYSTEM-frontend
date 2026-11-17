import React, { useCallback, useEffect, useState } from 'react';
import { MagnifyingGlassIcon, UserIcon, ClockIcon, MapPinIcon, XMarkIcon, TicketIcon } from '@heroicons/react/24/outline';
import { buscarCliente, clasesDePago, cobrarClase } from 'services/cajaSesionService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import { soles } from 'components/Pagos/PagoUI';
import { colorClase } from 'components/Clases/ClaseUI';
import { fechaLarga } from 'utilities/Fechas/fechas';
import MetodoCobro, { COBRO_INICIAL, TotalCobro, CobroExitoso, cobroValido, datosCobro } from 'components/Caja/MetodoCobro';

/** Por qué no se puede cobrar esa clase a este cliente (o null). */
const bloqueoClase = (c) => {
    if (c.inscrito) return 'Ya está inscrito';
    if (c.pago_pendiente) return 'Pagó en línea: verifícalo en Pagos';
    if (c.disponibles === 0) return 'Llena';
    return null;
};

/**
 * Cobro de clases y eventos con costo: se busca al cliente por DNI, se elige la
 * clase y se cobra; el cliente queda inscrito en el acto.
 */
const CobroClasePanel = ({ metodos, onCobrado, onTicket }) => {
    const [dni, setDni] = useState('');
    const [cliente, setCliente] = useState(null);       // { cliente, membresia_actual }
    const [clases, setClases] = useState([]);
    const [claseId, setClaseId] = useState(null);
    const [cobro, setCobro] = useState(COBRO_INICIAL);
    const [resultado, setResultado] = useState(null);
    const [procesando, setProcesando] = useState(false);
    const [alert, setAlert] = useState(null);

    const cargarClases = useCallback(async (clienteId = '') => {
        try {
            const r = await clasesDePago(clienteId);
            setClases(r.data || []);
        } catch (err) {
            setAlert(handleApiError(err, 'No se pudieron cargar las clases'));
        }
    }, []);

    useEffect(() => { cargarClases(); }, [cargarClases]);

    const buscar = async (e) => {
        e.preventDefault();
        if (!/^\d{8}$/.test(dni)) return;
        setProcesando(true); setAlert(null); setResultado(null); setClaseId(null);
        try {
            const r = await buscarCliente(dni);
            setCliente(r.data);
            await cargarClases(r.data.cliente.id);
        } catch (err) {
            setCliente(null);
            setAlert(handleApiError(err, 'Cliente no encontrado'));
        } finally {
            setProcesando(false);
        }
    };

    const limpiar = () => {
        setCliente(null); setDni(''); setClaseId(null); setCobro(COBRO_INICIAL); setResultado(null);
        cargarClases();
    };

    const clase = clases.find(c => c.id === claseId);
    const total = clase ? Number(clase.precio) : 0;

    const cobrar = async () => {
        setProcesando(true); setAlert(null);
        try {
            const r = await cobrarClase(cliente.cliente.id, { clase_id: clase.id, ...datosCobro(cobro, total) });
            setResultado(r.data);
            setClaseId(null); setCobro(COBRO_INICIAL);
            await cargarClases(cliente.cliente.id);
            onCobrado?.();
        } catch (err) {
            setAlert(handleApiError(err, 'No se pudo cobrar la clase'));
        } finally {
            setProcesando(false);
        }
    };

    const sinMembresia = cliente && !cliente.membresia_actual;

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />

            {/* 1. CLIENTE */}
            {!cliente ? (
                <form onSubmit={buscar} className="flex gap-2">
                    <div className="relative flex-1">
                        <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-3 text-slate-400" />
                        <input value={dni} onChange={(e) => setDni(e.target.value.replace(/\D/g, '').slice(0, 8))}
                            inputMode="numeric" placeholder="DNI del cliente (8 dígitos)"
                            className="w-full pl-10 p-3 text-lg font-bold tracking-widest text-secondary border border-slate-300 rounded-lg focus:ring-1 focus:ring-primary outline-none tabular-nums" />
                    </div>
                    <button type="submit" disabled={dni.length !== 8 || procesando}
                        className="px-5 bg-secondary text-primary rounded-lg font-black uppercase text-sm hover:bg-secondary/90 disabled:opacity-40">
                        Buscar
                    </button>
                </form>
            ) : (
                <div className="flex items-start justify-between gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 rounded-full bg-white border border-slate-200"><UserIcon className="w-6 h-6 text-slate-500" /></div>
                        <div className="min-w-0">
                            <p className="font-black text-slate-800 truncate">{cliente.cliente.nombre_completo}</p>
                            <p className="text-xs text-slate-500">
                                DNI {cliente.cliente.dni} · {cliente.membresia_actual
                                    ? `Membresía ${cliente.membresia_actual.plan} hasta el ${cliente.membresia_actual.fecha_fin}`
                                    : 'Sin membresía activa'}
                            </p>
                        </div>
                    </div>
                    <button onClick={limpiar} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white" title="Cambiar de cliente" aria-label="Cambiar de cliente">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>
            )}

            {resultado && <CobroExitoso resultado={resultado} onTicket={onTicket} onNuevo={limpiar} />}

            {/* 2. CLASES CON COSTO */}
            <div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                    Clases y eventos con costo · próximos 30 días
                </h4>
                {clases.length === 0 ? (
                    <p className="text-sm text-slate-400 py-6 text-center border border-dashed border-slate-200 rounded-xl">
                        No hay clases ni eventos con costo programados en tu sede.
                    </p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        {clases.map(c => {
                            const bloqueo = cliente ? bloqueoClase(c) : null;
                            const activa = c.id === claseId;
                            return (
                                <button key={c.id} type="button" disabled={!cliente || !!bloqueo} aria-pressed={activa}
                                    onClick={() => { setClaseId(activa ? null : c.id); setResultado(null); }}
                                    className={`text-left p-3 rounded-xl border transition-colors disabled:cursor-not-allowed
                                        ${activa ? 'bg-secondary text-white border-secondary' : 'bg-white border-slate-200 hover:border-slate-400'} ${bloqueo ? 'opacity-60' : ''}`}
                                    style={{ borderLeftWidth: 5, borderLeftColor: colorClase(c.nombre) }}>
                                    <div className="flex items-start justify-between gap-2">
                                        <p className="font-black text-sm truncate">{c.nombre}</p>
                                        <p className={`font-black tabular-nums shrink-0 ${activa ? 'text-primary' : 'text-secondary'}`}>{soles(c.precio)}</p>
                                    </div>
                                    <p className={`text-xs mt-0.5 flex items-center gap-1 ${activa ? 'text-white/70' : 'text-slate-500'}`}>
                                        <ClockIcon className="w-3.5 h-3.5 shrink-0" /> {fechaLarga(c.fecha)} · {c.hora_inicio}–{c.hora_fin}
                                    </p>
                                    <p className={`text-xs flex items-center gap-1 ${activa ? 'text-white/70' : 'text-slate-500'}`}>
                                        <MapPinIcon className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">{c.lugar || c.sucursal?.nombre}</span>
                                    </p>
                                    <p className={`mt-1 text-[11px] font-bold ${activa ? 'text-primary' : bloqueo ? 'text-amber-700' : 'text-slate-400'}`}>
                                        {bloqueo || `${c.disponibles} cupos libres${c.requiere_membresia ? ' · exige membresía' : ' · abierto a todos'}`}
                                    </p>
                                </button>
                            );
                        })}
                    </div>
                )}
                {!cliente && clases.length > 0 && <p className="mt-2 text-[11px] text-slate-400">Busca al cliente por DNI para cobrarle una clase.</p>}
            </div>

            {/* 3. COBRO */}
            {clase && (
                <div className="space-y-4 pt-2 border-t border-slate-100">
                    {sinMembresia && clase.requiere_membresia && (
                        <p className="text-sm text-amber-900 bg-amber-50 border border-amber-200 rounded-lg p-3">
                            Esta clase exige membresía activa ese día y el cliente no tiene una. Véndele un plan primero.
                        </p>
                    )}
                    <MetodoCobro cobro={cobro} onChange={setCobro} total={total} metodos={metodos} />
                    <TotalCobro detalle={`${clase.nombre} · ${fechaLarga(clase.fecha)} ${clase.hora_inicio}`} total={total} />
                    <div className="flex justify-end">
                        <button onClick={cobrar} disabled={procesando || !cobroValido(cobro, total)}
                            className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-secondary rounded-lg font-black uppercase shadow hover:bg-primary-hover disabled:opacity-40">
                            <TicketIcon className="w-5 h-5" /> {procesando ? 'Cobrando...' : `Cobrar e inscribir ${soles(total)}`}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CobroClasePanel;
