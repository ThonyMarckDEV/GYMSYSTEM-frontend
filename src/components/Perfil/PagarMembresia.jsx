import React, { useEffect, useState, useCallback } from 'react';
import { opcionesPago, pagar } from 'services/perfilService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import { useEventoEnVivo } from 'context/NotificacionesContext';
import { QrPago, soles, METODOS, Modal } from 'components/Pagos/PagoUI';
import { CreditCardIcon, ClockIcon, XCircleIcon, ArrowUpTrayIcon, CheckCircleIcon, PhotoIcon, ArrowPathIcon, GiftIcon } from '@heroicons/react/24/outline';
import { textoDias } from 'utilities/Formato/dias';

const inputCls = 'w-full p-2.5 text-base sm:text-sm text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/40 outline-none bg-white';
const labelCls = 'block text-xs font-bold text-slate-700 uppercase mb-2';
const FORM_VACIO = { plan_id: '', metodo_pago: 'yape', numero_operacion: '' };

/**
 * El cliente paga su membresía en línea, en un modal (hoja desde abajo en celular):
 * 1) elige plan  2) escanea el QR de Yape/Plin del gimnasio  3) sube su comprobante.
 * Si ya tiene un pago en revisión, no puede enviar otro.
 */
const PagarMembresia = ({ onPagoEnviado }) => {
    const [opciones, setOpciones] = useState(null);
    const [form, setForm] = useState(FORM_VACIO);
    const [archivo, setArchivo] = useState(null);
    const [preview, setPreview] = useState(null);
    const [enviando, setEnviando] = useState(false);
    const [alert, setAlert] = useState(null);       // avisos fuera del modal (éxito, carga)
    const [errorModal, setErrorModal] = useState(null);
    const [abierto, setAbierto] = useState(false);

    const cargar = useCallback(() => {
        opcionesPago().then(r => setOpciones(r.data)).catch(err => setAlert(handleApiError(err, 'No se pudieron cargar las opciones de pago')));
    }, []);

    useEffect(() => { cargar(); }, [cargar]);
    // Verificaron o rechazaron su pago: se actualiza el estado sin recargar
    useEventoEnVivo('gym:notificacion', (n) => { if (n.tipo?.startsWith('pago_')) { cargar(); onPagoEnviado?.(); } });

    useEffect(() => {
        if (!archivo) { setPreview(null); return; }
        const url = URL.createObjectURL(archivo);
        setPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [archivo]);

    const cerrar = useCallback(() => { if (!enviando) { setAbierto(false); setErrorModal(null); } }, [enviando]);

    if (!opciones) return alert ? <AlertMessage type={alert.type} message={alert.message} details={alert.details} /> : null;

    const { planes, metodos, bloqueo, ultimo_pago_web: ultimo, membresia_actual: actual, es_nuevo: esNuevo } = opciones;
    const plan = planes.find(p => String(p.id) === String(form.plan_id));
    const enRevision = ultimo?.estado === 'pendiente';
    const listo = plan && archivo && form.numero_operacion.trim();

    const abrir = () => { setAlert(null); setErrorModal(null); setAbierto(true); };

    const enviar = async (e) => {
        e.preventDefault();
        if (!listo) return;
        setEnviando(true);
        setErrorModal(null);
        try {
            const fd = new FormData();
            fd.append('plan_id', form.plan_id);
            fd.append('metodo_pago', form.metodo_pago);
            fd.append('numero_operacion', form.numero_operacion.trim());
            fd.append('comprobante', archivo);
            await pagar(fd);
            setAlert({ type: 'success', message: 'Comprobante enviado. Te avisaremos cuando caja lo verifique.' });
            setForm(FORM_VACIO);
            setArchivo(null);
            setAbierto(false);
            cargar();
            onPagoEnviado?.();
        } catch (err) {
            const e2 = handleApiError(err, 'No se pudo enviar tu pago');
            setErrorModal(e2.details || e2.message);
        } finally {
            setEnviando(false);
        }
    };

    return (
        <div className="space-y-3">
            <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />

            {/* ESTADO DEL ÚLTIMO PAGO EN LÍNEA */}
            {enRevision && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                    <p className="font-black text-amber-900 flex items-center gap-2"><ClockIcon className="w-5 h-5" /> Tu pago está en revisión</p>
                    <p className="text-sm text-amber-900 mt-1">
                        Plan <b>{ultimo.plan}</b> · <b>{soles(ultimo.monto)}</b> por {METODOS[ultimo.metodo_pago]} (op. {ultimo.numero_operacion}).
                        Caja lo verificará y tu membresía se activará. No necesitas pagar otra vez en recepción.
                    </p>
                    <p className="text-[11px] text-amber-800 mt-1">Enviado el {ultimo.enviado_at}</p>
                </div>
            )}
            {ultimo?.estado === 'rechazado' && !bloqueo && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
                    <p className="font-black text-red-800 flex items-center gap-2"><XCircleIcon className="w-5 h-5" /> Tu último comprobante fue rechazado</p>
                    <p className="text-sm text-red-900 mt-1">Motivo: <b>{ultimo.motivo_rechazo}</b>. Puedes volver a enviar tu pago.</p>
                </div>
            )}
            {ultimo?.estado === 'verificado' && bloqueo && (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-sm text-green-900 flex gap-2">
                    <CheckCircleIcon className="w-5 h-5 flex-shrink-0" /> Tu último pago en línea ({ultimo.plan}, {soles(ultimo.monto)}) fue verificado.
                </div>
            )}

            {/* NO PUEDE PAGAR AHORA (ya tiene membresía vigente, congelada, etc.) */}
            {bloqueo && !enRevision && (
                <p className="text-xs text-slate-400 text-center px-4">{bloqueo}</p>
            )}

            {!bloqueo && (
                <button onClick={abrir}
                    className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-secondary rounded-2xl font-black uppercase shadow-lg hover:bg-primary-hover">
                    <CreditCardIcon className="w-5 h-5" /> Pagar / renovar membresía en línea
                </button>
            )}

            {abierto && (
                <Modal titulo={actual ? 'Renovar membresía' : 'Pagar membresía'} icon={actual ? ArrowPathIcon : CreditCardIcon}
                    onClose={cerrar} ancho="sm:max-w-3xl" error={errorModal} portal
                    pie={<>
                        <button type="button" onClick={cerrar} disabled={enviando}
                            className="flex-1 sm:flex-none px-5 py-3 sm:py-2.5 bg-slate-100 text-slate-600 rounded-lg font-bold uppercase text-sm">Cancelar</button>
                        <button type="submit" form="form-pagar-membresia" disabled={enviando || !listo}
                            className="flex-[2] sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 sm:py-2.5 bg-secondary text-primary rounded-lg font-black uppercase text-sm disabled:opacity-40">
                            <ArrowUpTrayIcon className="w-4 h-4" /> {enviando ? 'Enviando...' : plan ? `Enviar · ${soles(plan.precio)}` : 'Enviar comprobante'}
                        </button>
                    </>}>
                    <form id="form-pagar-membresia" onSubmit={enviar} className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                        {/* 1. PLAN */}
                        <div>
                            <p className={labelCls}>1. Elige tu plan</p>
                            <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
                                {planes.map(p => {
                                    const activo = String(form.plan_id) === String(p.id);
                                    return (
                                        <button type="button" key={p.id} onClick={() => setForm(f => ({ ...f, plan_id: p.id }))}
                                            aria-pressed={activo}
                                            className={`text-left p-3 rounded-xl border transition-colors md:flex md:items-center md:justify-between ${activo ? 'border-secondary bg-secondary text-white' : 'border-slate-200 hover:border-slate-400'}`}>
                                            <div className="min-w-0">
                                                <p className="font-black truncate">{p.nombre}</p>
                                                <p className={`text-xs ${activo ? 'text-white/70' : 'text-slate-500'}`}>{p.duracion_dias} días</p>
                                                {esNuevo && p.bono_bienvenida_dias > 0 && (
                                                    <p className={`mt-1 inline-flex items-center gap-1 text-[11px] font-semibold rounded-full px-2 py-0.5 ${activo ? 'bg-primary text-secondary' : 'bg-amber-50 text-amber-800 border border-amber-200'}`}>
                                                        <GiftIcon className="w-3.5 h-3.5" /> +{textoDias(p.bono_bienvenida_dias)} gratis
                                                    </p>
                                                )}
                                            </div>
                                            <p className={`text-lg font-black tabular-nums ${activo ? 'text-primary' : 'text-secondary'}`}>{soles(p.precio)}</p>
                                        </button>
                                    );
                                })}
                            </div>
                            {actual?.fecha_fin && (
                                <p className="text-[11px] text-slate-500 mt-2">
                                    Tu membresía actual vence el <b>{actual.fecha_fin}</b>; la nueva empieza al día siguiente, no pierdes días.
                                </p>
                            )}
                        </div>

                        {/* 2 y 3: QR + COMPROBANTE */}
                        {!plan ? (
                            <div className="hidden md:flex flex-col items-center justify-center text-center gap-2 rounded-xl border-2 border-dashed border-slate-200 p-6 text-slate-400">
                                <CreditCardIcon className="w-8 h-8" />
                                <p className="text-sm font-bold">Elige un plan para ver el QR de pago</p>
                            </div>
                        ) : (
                            <div className="space-y-5">
                                <div>
                                    <p className={labelCls}>2. Escanea el QR y paga {soles(plan.precio)}</p>
                                    <div className="flex gap-2 mb-3" role="radiogroup" aria-label="Método de pago">
                                        {['yape', 'plin'].map(m => (
                                            <button type="button" key={m} role="radio" aria-checked={form.metodo_pago === m}
                                                onClick={() => setForm(f => ({ ...f, metodo_pago: m }))}
                                                className={`flex-1 py-2.5 rounded-lg border text-sm font-bold ${form.metodo_pago === m ? 'bg-secondary text-primary border-secondary' : 'border-slate-300 text-slate-600'}`}>
                                                {METODOS[m]}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                                        <QrPago tipo={form.metodo_pago} datos={metodos[form.metodo_pago]} />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <p className={labelCls}>3. Sube tu comprobante</p>
                                    <div>
                                        <label htmlFor="num-operacion" className="block text-[11px] font-bold text-slate-500 uppercase mb-1">N° de operación *</label>
                                        <input id="num-operacion" inputMode="numeric" autoComplete="off"
                                            value={form.numero_operacion} onChange={(e) => setForm(f => ({ ...f, numero_operacion: e.target.value }))}
                                            className={inputCls} placeholder="Aparece en tu constancia de Yape/Plin" required />
                                    </div>
                                    <label className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-slate-300 cursor-pointer hover:border-slate-400 bg-white">
                                        {preview ? (
                                            <>
                                                <img src={preview} alt="Vista previa del comprobante" className="max-h-48 object-contain rounded-lg" />
                                                <span className="text-[11px] font-bold text-slate-500">Toca para cambiar la imagen</span>
                                            </>
                                        ) : (
                                            <>
                                                <PhotoIcon className="w-8 h-8 text-slate-400" />
                                                <span className="text-sm font-bold text-slate-600">Toca para subir la captura</span>
                                                <span className="text-[11px] text-slate-400">PNG o JPG, máximo 4 MB</span>
                                            </>
                                        )}
                                        <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden"
                                            onChange={(e) => setArchivo(e.target.files?.[0] || null)} />
                                    </label>
                                </div>
                            </div>
                        )}
                    </form>
                </Modal>
            )}
        </div>
    );
};

export default PagarMembresia;
