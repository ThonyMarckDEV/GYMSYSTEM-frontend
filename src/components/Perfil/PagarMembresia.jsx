import React, { useEffect, useState, useCallback } from 'react';
import { opcionesPago, pagar } from 'services/perfilService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import { QrPago, soles, METODOS } from 'components/Pagos/PagoUI';
import { CreditCardIcon, ClockIcon, XCircleIcon, ArrowUpTrayIcon, CheckCircleIcon, PhotoIcon } from '@heroicons/react/24/outline';

const inputCls = 'w-full p-2.5 text-sm text-secondary border border-slate-300 rounded-lg focus:ring-1 focus:ring-primary outline-none bg-white';
const labelCls = 'block text-xs font-bold text-slate-700 uppercase mb-1';

/**
 * El cliente paga su membresía en línea:
 * 1) elige plan  2) escanea el QR de Yape/Plin del gimnasio  3) sube su comprobante.
 * Si ya tiene un pago en revisión, no puede enviar otro.
 */
const PagarMembresia = ({ onPagoEnviado }) => {
    const [opciones, setOpciones] = useState(null);
    const [form, setForm] = useState({ plan_id: '', metodo_pago: 'yape', numero_operacion: '' });
    const [archivo, setArchivo] = useState(null);
    const [preview, setPreview] = useState(null);
    const [enviando, setEnviando] = useState(false);
    const [alert, setAlert] = useState(null);
    const [abierto, setAbierto] = useState(false);

    const cargar = useCallback(() => {
        opcionesPago().then(r => setOpciones(r.data)).catch(err => setAlert(handleApiError(err, 'No se pudieron cargar las opciones de pago')));
    }, []);

    useEffect(() => { cargar(); }, [cargar]);

    useEffect(() => {
        if (!archivo) { setPreview(null); return; }
        const url = URL.createObjectURL(archivo);
        setPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [archivo]);

    if (!opciones) return alert ? <AlertMessage type={alert.type} message={alert.message} details={alert.details} /> : null;

    const { planes, metodos, bloqueo, ultimo_pago_web: ultimo } = opciones;
    const plan = planes.find(p => String(p.id) === String(form.plan_id));
    const enRevision = ultimo?.estado === 'pendiente';

    const enviar = async (e) => {
        e.preventDefault();
        setEnviando(true);
        setAlert(null);
        try {
            const fd = new FormData();
            fd.append('plan_id', form.plan_id);
            fd.append('metodo_pago', form.metodo_pago);
            fd.append('numero_operacion', form.numero_operacion.trim());
            fd.append('comprobante', archivo);
            await pagar(fd);
            setAlert({ type: 'success', message: 'Comprobante enviado. Te avisaremos cuando caja lo verifique.' });
            setForm({ plan_id: '', metodo_pago: 'yape', numero_operacion: '' });
            setArchivo(null);
            setAbierto(false);
            cargar();
            onPagoEnviado?.();
        } catch (err) {
            setAlert(handleApiError(err, 'No se pudo enviar tu pago'));
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

            {/* FORMULARIO DE PAGO */}
            {!bloqueo && (
                !abierto ? (
                    <button onClick={() => setAbierto(true)}
                        className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-secondary rounded-2xl font-black uppercase shadow-lg hover:bg-primary-hover">
                        <CreditCardIcon className="w-5 h-5" /> Pagar / renovar membresía en línea
                    </button>
                ) : (
                    <form onSubmit={enviar} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
                        <h3 className="text-lg font-black text-secondary flex items-center gap-2"><CreditCardIcon className="w-5 h-5" /> Pagar membresía</h3>

                        {/* 1. PLAN */}
                        <div>
                            <p className={labelCls}>1. Elige tu plan</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {planes.map(p => {
                                    const activo = String(form.plan_id) === String(p.id);
                                    return (
                                        <button type="button" key={p.id} onClick={() => setForm(f => ({ ...f, plan_id: p.id }))}
                                            aria-pressed={activo}
                                            className={`text-left p-3 rounded-xl border transition-colors ${activo ? 'border-secondary bg-secondary text-white' : 'border-slate-200 hover:border-slate-400'}`}>
                                            <p className="font-black">{p.nombre}</p>
                                            <p className={`text-xs ${activo ? 'text-white/70' : 'text-slate-500'}`}>{p.duracion_dias} días</p>
                                            <p className={`text-lg font-black tabular-nums ${activo ? 'text-primary' : 'text-secondary'}`}>{soles(p.precio)}</p>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* 2. QR */}
                        {plan && (
                            <div>
                                <p className={labelCls}>2. Escanea el QR y paga {soles(plan.precio)}</p>
                                <div className="flex gap-2 mb-3" role="radiogroup">
                                    {['yape', 'plin'].map(m => (
                                        <button type="button" key={m} role="radio" aria-checked={form.metodo_pago === m}
                                            onClick={() => setForm(f => ({ ...f, metodo_pago: m }))}
                                            className={`flex-1 py-2 rounded-lg border text-sm font-bold ${form.metodo_pago === m ? 'bg-secondary text-primary border-secondary' : 'border-slate-300 text-slate-600'}`}>
                                            {METODOS[m]}
                                        </button>
                                    ))}
                                </div>
                                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                                    <QrPago tipo={form.metodo_pago} datos={metodos[form.metodo_pago]} />
                                </div>
                            </div>
                        )}

                        {/* 3. COMPROBANTE */}
                        {plan && (
                            <div className="space-y-3">
                                <p className={labelCls}>3. Sube tu comprobante</p>
                                <div>
                                    <label className={labelCls}>N° de operación *</label>
                                    <input value={form.numero_operacion} onChange={(e) => setForm(f => ({ ...f, numero_operacion: e.target.value }))}
                                        className={inputCls} placeholder="Aparece en tu constancia de Yape/Plin" required />
                                </div>
                                <label className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-slate-300 cursor-pointer hover:border-slate-400 bg-white">
                                    {preview ? (
                                        <img src={preview} alt="Vista previa del comprobante" className="max-h-56 object-contain rounded-lg" />
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
                        )}

                        <div className="flex gap-3 justify-end">
                            <button type="button" onClick={() => setAbierto(false)} className="px-5 py-2.5 bg-slate-100 text-slate-600 rounded-lg font-bold uppercase text-sm">Cancelar</button>
                            <button type="submit" disabled={enviando || !plan || !archivo || !form.numero_operacion.trim()}
                                className="inline-flex items-center gap-2 px-6 py-2.5 bg-secondary text-primary rounded-lg font-black uppercase text-sm disabled:opacity-40">
                                <ArrowUpTrayIcon className="w-4 h-4" /> {enviando ? 'Enviando...' : 'Enviar comprobante'}
                            </button>
                        </div>
                    </form>
                )
            )}
        </div>
    );
};

export default PagarMembresia;
