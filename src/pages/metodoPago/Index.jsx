import React, { useEffect, useState } from 'react';
import { index, update } from 'services/metodoPagoService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';
import PageHeader from 'components/Shared/Headers/PageHeader';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import LoadingScreen from 'components/Shared/LoadingScreen';
import { QrPago } from 'components/Pagos/PagoUI';
import { DevicePhoneMobileIcon, ArrowUpTrayIcon, TrashIcon } from '@heroicons/react/24/outline';

const inputCls = 'w-full p-2.5 text-sm text-secondary border border-slate-300 rounded-lg focus:ring-1 focus:ring-primary outline-none';
const labelCls = 'block text-xs font-bold text-slate-700 uppercase mb-1';

const Tarjeta = ({ tipo, datos, form, setForm, archivo, setArchivo, quitar, setQuitar, version }) => {
    const nombre = tipo === 'yape' ? 'Yape' : 'Plin';
    const [preview, setPreview] = useState(null);

    useEffect(() => {
        if (!archivo) { setPreview(null); return; }
        const url = URL.createObjectURL(archivo);
        setPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [archivo]);

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-black text-secondary mb-4">{nombre}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
                <div className="flex flex-col items-center gap-2">
                    {preview ? (
                        <img src={preview} alt={`Nuevo QR de ${nombre}`} className="w-44 h-44 object-contain p-2 bg-white rounded-xl border border-slate-200" />
                    ) : (
                        <QrPago key={version} tipo={tipo} datos={quitar ? { ...datos, tiene_qr: false, numero: null } : { ...datos, numero: null }} />
                    )}
                    <label className="inline-flex items-center gap-1 px-3 py-2 text-xs font-bold rounded-lg border border-slate-300 cursor-pointer hover:bg-slate-50">
                        <ArrowUpTrayIcon className="w-4 h-4" /> {datos?.tiene_qr || preview ? 'Cambiar QR' : 'Subir QR'}
                        <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden"
                            onChange={(e) => { setArchivo(e.target.files?.[0] || null); setQuitar(false); }} />
                    </label>
                    {(datos?.tiene_qr && !quitar && !preview) && (
                        <button onClick={() => setQuitar(true)} className="inline-flex items-center gap-1 text-xs font-bold text-red-700 hover:underline">
                            <TrashIcon className="w-3.5 h-3.5" /> Quitar QR
                        </button>
                    )}
                </div>
                <div className="space-y-4">
                    <div>
                        <label className={labelCls}>Número de {nombre}</label>
                        <input inputMode="numeric" value={form[`${tipo}_numero`] || ''} maxLength={9}
                            onChange={(e) => setForm(f => ({ ...f, [`${tipo}_numero`]: e.target.value.replace(/\D/g, '').slice(0, 9) }))}
                            className={inputCls} placeholder="987654321" />
                    </div>
                    <div>
                        <label className={labelCls}>Titular</label>
                        <input value={form[`${tipo}_titular`] || ''}
                            onChange={(e) => setForm(f => ({ ...f, [`${tipo}_titular`]: e.target.value }))}
                            className={inputCls} placeholder="Nombre que aparece al yapear" />
                    </div>
                    <p className="text-[11px] text-slate-400">El cliente verá este QR y número al pagar desde su perfil, y el cajero al cobrar con {nombre}.</p>
                </div>
            </div>
        </div>
    );
};

/** Configuración de Yape / Plin de la empresa. */
const Index = () => {
    const [loading, setLoading] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [alert, setAlert] = useState(null);
    const [datos, setDatos] = useState(null);
    const [form, setForm] = useState({});
    const [archivos, setArchivos] = useState({ yape: null, plin: null });
    const [quitar, setQuitar] = useState({ yape: false, plin: false });
    const [version, setVersion] = useState(0);

    const cargar = (d) => {
        setDatos(d);
        setForm({ yape_numero: d.yape.numero, yape_titular: d.yape.titular, plin_numero: d.plin.numero, plin_titular: d.plin.titular });
        setArchivos({ yape: null, plin: null });
        setQuitar({ yape: false, plin: false });
        setVersion(v => v + 1);
    };

    useEffect(() => {
        index().then(r => cargar(r.data)).catch(err => setAlert(handleApiError(err, 'Error al cargar los métodos de pago'))).finally(() => setLoading(false));
    }, []);

    const guardar = async () => {
        setGuardando(true);
        setAlert(null);
        try {
            const fd = new FormData();
            Object.entries(form).forEach(([k, v]) => fd.append(k, v ?? ''));
            ['yape', 'plin'].forEach(t => {
                if (archivos[t]) fd.append(`qr_${t}`, archivos[t]);
                if (quitar[t]) fd.append(`quitar_qr_${t}`, '1');
            });
            const res = await update(fd);
            cargar(res.data);
            setAlert({ type: 'success', message: 'Métodos de pago guardados.' });
        } catch (err) {
            setAlert(handleApiError(err, 'No se pudieron guardar los métodos de pago'));
        } finally {
            setGuardando(false);
        }
    };

    if (loading) return <LoadingScreen />;

    return (
        <div className="container mx-auto p-6">
            <PageHeader title="Métodos de Pago" subtitle="Yape y Plin de tu gimnasio" icon={DevicePhoneMobileIcon} />
            <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />

            {datos && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 max-w-6xl">
                    {['yape', 'plin'].map(t => (
                        <Tarjeta key={t} tipo={t} datos={datos[t]} form={form} setForm={setForm} version={version}
                            archivo={archivos[t]} setArchivo={(f) => setArchivos(a => ({ ...a, [t]: f }))}
                            quitar={quitar[t]} setQuitar={(v) => setQuitar(q => ({ ...q, [t]: v }))} />
                    ))}
                </div>
            )}

            <div className="mt-8 flex justify-end max-w-6xl">
                <button onClick={guardar} disabled={guardando}
                    className="bg-secondary text-primary px-10 py-3 rounded-lg font-black uppercase shadow-lg hover:bg-secondary/90 disabled:opacity-50">
                    {guardando ? 'Guardando...' : 'Guardar cambios'}
                </button>
            </div>
        </div>
    );
};

export default Index;
