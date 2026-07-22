// pages/membresia/Solicitar.jsx
import React from 'react';
import { useSolicitar } from 'hooks/membresia/useSolicitar';
import PageHeader from 'components/Shared/Headers/PageHeader';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import LoadingScreen from 'components/Shared/LoadingScreen';
import { CreditCardIcon, TagIcon, CheckCircleIcon, CloudArrowUpIcon, QrCodeIcon, BanknotesIcon } from '@heroicons/react/24/outline';
import qrYape from 'assets/img/qr-yape.png';
import qrPlin from 'assets/img/qr-plin.png';

const NUMERO_CUENTA_BANCARIA = '191-XXXXXXXX-0-XX'; // Reemplaza con tu cuenta real (BCP, etc.)
const TITULAR_CUENTA = 'IRON SYSTEM S.A.C.';

const Solicitar = () => {
    const {
        formData, loading, alert, setAlert,
        planes, loadingPlanes, preview,
        handleChange, handleSelectPlan, handleFileChange, handleSubmit
    } = useSolicitar();

    return (
        <div className="container mx-auto p-6">
            <PageHeader
                title="Adquirir Membresía"
                icon={CreditCardIcon}
                buttonText="Mis Solicitudes"
                buttonLink="/membresia/mis-solicitudes"
            />

            <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />

            <form onSubmit={handleSubmit} className="max-w-6xl mx-auto">

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

                    {/* ── IZQUIERDA: Selección de plan ── */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="text-lg font-black text-secondary flex items-center gap-2 mb-4 border-b border-slate-100 pb-2 uppercase">
                            <TagIcon className="w-5 h-5" /> Elige tu Plan
                        </h3>

                        {loadingPlanes ? (
                            <LoadingScreen />
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {planes.map((plan) => {
                                    const seleccionado = String(formData.plan_id) === String(plan.id);
                                    return (
                                        <button
                                            type="button"
                                            key={plan.id}
                                            onClick={() => handleSelectPlan(plan.id)}
                                            className={`relative text-left p-5 rounded-xl border-2 transition-all ${
                                                seleccionado
                                                    ? 'bg-secondary border-secondary text-primary shadow-lg'
                                                    : 'bg-white border-slate-200 text-secondary hover:border-primary/50'
                                            }`}
                                        >
                                            {seleccionado && (
                                                <CheckCircleIcon className="w-6 h-6 text-primary absolute top-3 right-3" />
                                            )}
                                            <p className="font-black text-lg">{plan.nombre}</p>
                                            <p className={`text-sm mt-1 ${seleccionado ? 'text-primary/70' : 'text-slate-500'}`}>
                                                {plan.duracion_dias} días
                                            </p>
                                            <p className="font-black text-2xl mt-3">S/ {Number(plan.precio).toFixed(2)}</p>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* ── DERECHA: Datos del pago ── */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="text-lg font-black text-secondary flex items-center gap-2 mb-4 border-b border-slate-100 pb-2 uppercase">
                            <CreditCardIcon className="w-5 h-5" /> Datos del Pago
                        </h3>

                        <div className="space-y-5">

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Método de Pago <span className="text-red-500">*</span></label>
                                <select value={formData.metodo_pago} onChange={(e) => handleChange('metodo_pago', e.target.value)}
                                    className="w-full p-2.5 text-sm text-secondary border border-slate-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none bg-white">
                                    <option value="yape">Yape</option>
                                    <option value="plin">Plin</option>
                                    <option value="transferencia">Transferencia Bancaria</option>
                                    <option value="tarjeta">Tarjeta</option>
                                    <option value="efectivo">Efectivo</option>
                                </select>
                            </div>

                            {/* ── QR: solo Yape/Plin ── */}
                            {(formData.metodo_pago === 'yape' || formData.metodo_pago === 'plin') && (
                                <div className="flex flex-col items-center gap-2 p-4 bg-primary-light/30 border border-primary/30 rounded-xl">
                                    <QrCodeIcon className="w-5 h-5 text-secondary mb-1" />
                                    <img
                                        src={formData.metodo_pago === 'yape' ? qrYape : qrPlin}
                                        alt={`Código QR de ${formData.metodo_pago === 'yape' ? 'Yape' : 'Plin'}`}
                                        className="w-48 h-48 object-contain rounded-lg border border-primary/20 bg-white p-2"
                                    />
                                    <p className="text-xs font-bold text-secondary uppercase">Escanea para pagar</p>
                                </div>
                            )}

                            {/* ── Cuenta bancaria: solo Transferencia ── */}
                            {formData.metodo_pago === 'transferencia' && (
                                <div className="flex items-start gap-3 p-4 bg-primary-light/30 border border-primary/30 rounded-xl">
                                    <BanknotesIcon className="w-6 h-6 text-secondary shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-xs font-bold text-slate-500 uppercase mb-0.5">N° de Cuenta</p>
                                        <p className="font-black text-secondary text-lg tracking-wide">{NUMERO_CUENTA_BANCARIA}</p>
                                        <p className="text-xs text-slate-500 mt-1">Titular: {TITULAR_CUENTA}</p>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">N° de Operación</label>
                                <input type="text" value={formData.numero_operacion}
                                    onChange={(e) => handleChange('numero_operacion', e.target.value)}
                                    className="w-full p-2.5 text-sm text-secondary border border-slate-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                                    placeholder="Opcional" />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Código de Descuento</label>
                                <input type="text" value={formData.codigo_descuento}
                                    onChange={(e) => handleChange('codigo_descuento', e.target.value.toUpperCase())}
                                    className="w-full p-2.5 text-sm text-secondary border border-slate-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                                    placeholder="Opcional" />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Captura del Pago <span className="text-red-500">*</span></label>

                                <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-primary/40 rounded-xl p-6 cursor-pointer hover:border-primary hover:bg-primary-light/30 transition-all">
                                    {preview ? (
                                        <img src={preview} alt="Vista previa del comprobante" className="max-h-40 rounded-lg object-contain" />
                                    ) : (
                                        <>
                                            <CloudArrowUpIcon className="w-8 h-8 text-primary" />
                                            <span className="text-sm font-bold text-secondary">Haz clic para subir tu captura</span>
                                            <span className="text-xs text-slate-400">JPG o PNG, máximo 4MB</span>
                                        </>
                                    )}
                                    <input type="file" accept="image/*" className="hidden"
                                        onChange={(e) => handleFileChange(e.target.files?.[0] || null)} />
                                </label>
                            </div>

                        </div>
                    </div>

                </div>

                <div className="flex justify-end mt-6">
                    <button type="submit" disabled={loading}
                        className="bg-secondary text-primary px-8 py-3 rounded-lg font-black uppercase hover:bg-secondary/90 transition-colors disabled:opacity-50 shadow-lg">
                        {loading ? 'Enviando...' : 'Enviar Solicitud'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Solicitar;