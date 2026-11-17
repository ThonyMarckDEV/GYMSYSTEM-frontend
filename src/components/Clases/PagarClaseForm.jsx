import React, { useEffect, useState } from 'react';
import { ArrowUpTrayIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { opcionesPago } from 'services/perfilService';
import { pagar } from 'services/claseService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';
import { QrPago, soles, METODOS } from 'components/Pagos/PagoUI';

const inputCls = 'w-full p-2.5 text-sm text-secondary border border-slate-300 rounded-lg focus:ring-1 focus:ring-primary outline-none bg-white';
const labelCls = 'block text-xs font-bold text-slate-700 uppercase mb-1';

/**
 * El cliente paga una clase o evento con costo: escanea el QR (Yape/Plin) y sube
 * su comprobante. Su lugar queda reservado mientras recepción verifica el pago.
 */
const PagarClaseForm = ({ clase, onEnviado, onCancelar, onError }) => {
    const [metodos, setMetodos] = useState(null);
    const [metodo, setMetodo] = useState('yape');
    const [operacion, setOperacion] = useState('');
    const [archivo, setArchivo] = useState(null);
    const [preview, setPreview] = useState(null);
    const [enviando, setEnviando] = useState(false);

    useEffect(() => {
        opcionesPago().then(r => setMetodos(r.data?.metodos || {})).catch(err => onError?.(handleApiError(err, 'No se pudo cargar el QR de pago')));
    }, [onError]);

    useEffect(() => {
        if (!archivo) { setPreview(null); return; }
        const url = URL.createObjectURL(archivo);
        setPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [archivo]);

    const enviar = async (e) => {
        e.preventDefault();
        setEnviando(true);
        try {
            const fd = new FormData();
            fd.append('metodo_pago', metodo);
            fd.append('numero_operacion', operacion.trim());
            fd.append('comprobante', archivo);
            const res = await pagar(clase.id, fd);
            onEnviado(res.message);
        } catch (err) {
            onError?.(handleApiError(err, 'No se pudo enviar tu pago'));
        } finally {
            setEnviando(false);
        }
    };

    return (
        <form onSubmit={enviar} className="mt-4 space-y-4 rounded-xl border border-slate-200 p-4">
            <div>
                <p className={labelCls}>1. Escanea el QR y paga {soles(clase.precio)}</p>
                <div className="flex gap-2 mb-3" role="radiogroup">
                    {['yape', 'plin'].map(m => (
                        <button type="button" key={m} role="radio" aria-checked={metodo === m} onClick={() => setMetodo(m)}
                            className={`flex-1 py-2 rounded-lg border text-sm font-bold ${metodo === m ? 'bg-secondary text-primary border-secondary' : 'border-slate-300 text-slate-600'}`}>
                            {METODOS[m]}
                        </button>
                    ))}
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    {metodos ? <QrPago tipo={metodo} datos={metodos[metodo]} /> : <p className="text-sm text-slate-400 text-center">Cargando QR...</p>}
                </div>
            </div>

            <div className="space-y-3">
                <p className={labelCls}>2. Sube tu comprobante</p>
                <div>
                    <label className={labelCls} htmlFor="op-clase">N° de operación *</label>
                    <input id="op-clase" value={operacion} onChange={(e) => setOperacion(e.target.value)} className={inputCls} placeholder="Aparece en tu constancia de Yape/Plin" required />
                </div>
                <label className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-slate-300 cursor-pointer hover:border-slate-400 bg-white">
                    {preview ? (
                        <img src={preview} alt="Vista previa del comprobante" className="max-h-48 object-contain rounded-lg" />
                    ) : (
                        <>
                            <PhotoIcon className="w-8 h-8 text-slate-400" />
                            <span className="text-sm font-bold text-slate-600">Toca para subir la captura</span>
                            <span className="text-[11px] text-slate-400">PNG o JPG, máximo 4 MB</span>
                        </>
                    )}
                    <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => setArchivo(e.target.files?.[0] || null)} />
                </label>
            </div>

            <div className="flex gap-3 justify-end">
                <button type="button" onClick={onCancelar} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg font-bold uppercase text-sm">Volver</button>
                <button type="submit" disabled={enviando || !archivo || !operacion.trim()}
                    className="inline-flex items-center gap-2 px-5 py-2 bg-secondary text-primary rounded-lg font-black uppercase text-sm disabled:opacity-40">
                    <ArrowUpTrayIcon className="w-4 h-4" /> {enviando ? 'Enviando...' : 'Enviar y reservar'}
                </button>
            </div>
        </form>
    );
};

export default PagarClaseForm;
