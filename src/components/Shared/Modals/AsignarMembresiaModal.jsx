import React, { useState, useEffect } from 'react';
import { XMarkIcon, TagIcon, CreditCardIcon } from '@heroicons/react/24/outline';

const AsignarMembresiaModal = ({ isOpen, onClose, onConfirm, planes, descuentos, loading = false }) => {
    const [form, setForm] = useState({
        plan_id: '',
        descuento_id: '',
        metodo_pago: 'efectivo',
        numero_operacion: ''
    });

    useEffect(() => {
        if (isOpen) {
            setForm({ plan_id: '', descuento_id: '', metodo_pago: 'efectivo', numero_operacion: '' });
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const planSeleccionado = planes.find(p => String(p.id) === String(form.plan_id));
    const descuentoSeleccionado = descuentos.find(d => String(d.id) === String(form.descuento_id));

    // Calcula el monto de descuento y el total final en el front,
    // solo para mostrarlo antes de confirmar (el cálculo real y definitivo lo hace el backend).
    let montoDescuento = 0;
    let precioFinal = planSeleccionado ? Number(planSeleccionado.precio) : 0;

    if (planSeleccionado && descuentoSeleccionado) {
        montoDescuento = descuentoSeleccionado.tipo === 'porcentaje'
            ? Number(planSeleccionado.precio) * (Number(descuentoSeleccionado.valor) / 100)
            : Math.min(Number(descuentoSeleccionado.valor), Number(planSeleccionado.precio));

        precioFinal = Math.max(Number(planSeleccionado.precio) - montoDescuento, 0);
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-elegant-gold w-full max-w-lg overflow-hidden border border-primary/20">

                <div className="flex justify-between items-center px-6 py-4 border-b border-primary/20 bg-secondary">
                    <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                        <CreditCardIcon className="w-5 h-5" /> Asignar Membresía
                    </h3>
                    <button onClick={onClose} className="text-primary/60 hover:text-primary transition-colors">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 space-y-4">

                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                            Plan <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={form.plan_id}
                            onChange={(e) => setForm(prev => ({ ...prev, plan_id: e.target.value }))}
                            className="w-full p-2.5 text-sm text-secondary border border-slate-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none bg-white"
                        >
                            <option value="">-- Seleccionar plan --</option>
                            {planes.map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.nombre} — S/ {Number(p.precio).toFixed(2)} ({p.duracion_dias} días)
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                            Descuento (opcional)
                        </label>
                        <select
                            value={form.descuento_id}
                            onChange={(e) => setForm(prev => ({ ...prev, descuento_id: e.target.value }))}
                            className="w-full p-2.5 text-sm text-secondary border border-slate-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none bg-white"
                        >
                            <option value="">Sin descuento</option>
                            {descuentos.map(d => (
                                <option key={d.id} value={d.id}>
                                    {d.nombre} ({d.tipo === 'porcentaje' ? `${d.valor}%` : `S/ ${d.valor}`})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                Método de Pago
                            </label>
                            <select
                                value={form.metodo_pago}
                                onChange={(e) => setForm(prev => ({ ...prev, metodo_pago: e.target.value }))}
                                className="w-full p-2.5 text-sm text-secondary border border-slate-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none bg-white"
                            >
                                <option value="efectivo">Efectivo</option>
                                <option value="tarjeta">Tarjeta</option>
                                <option value="yape">Yape</option>
                                <option value="plin">Plin</option>
                                <option value="transferencia">Transferencia</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                N° Operación
                            </label>
                            <input
                                type="text"
                                value={form.numero_operacion}
                                onChange={(e) => setForm(prev => ({ ...prev, numero_operacion: e.target.value }))}
                                className="w-full p-2.5 text-sm text-secondary border border-slate-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                                placeholder="Opcional"
                            />
                        </div>
                    </div>

                    {planSeleccionado && (
                        <div className="p-3 bg-primary-light/40 border border-primary/30 rounded-lg text-sm space-y-1">
                            <div className="flex items-center justify-between">
                                <span className="text-slate-600">Precio del plan</span>
                                <span className={`font-bold ${montoDescuento > 0 ? 'line-through text-slate-400' : 'text-secondary'}`}>
                                    S/ {Number(planSeleccionado.precio).toFixed(2)}
                                </span>
                            </div>
                            {montoDescuento > 0 && (
                                <div className="flex items-center justify-between text-green-700">
                                    <span>Descuento ({descuentoSeleccionado.nombre})</span>
                                    <span className="font-bold">- S/ {montoDescuento.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex items-center justify-between pt-1 border-t border-primary/20">
                                <span className="flex items-center gap-1 text-secondary font-bold">
                                    <TagIcon className="w-4 h-4" /> Total a pagar
                                </span>
                                <span className="text-secondary font-black text-lg">S/ {precioFinal.toFixed(2)}</span>
                            </div>
                        </div>
                    )}

                </div>

                <div className="px-6 py-4 bg-primary-light/40 border-t border-primary/20 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg font-bold hover:bg-slate-200 transition-colors uppercase text-sm disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={() => onConfirm(form)}
                        disabled={loading || !form.plan_id}
                        className="px-4 py-2 bg-secondary text-primary rounded-lg hover:bg-secondary/90 font-bold uppercase tracking-wide text-sm transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Asignando...' : 'Asignar'}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default AsignarMembresiaModal;