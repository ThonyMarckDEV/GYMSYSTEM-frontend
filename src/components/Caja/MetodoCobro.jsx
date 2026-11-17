import React from 'react';
import { BanknotesIcon, DevicePhoneMobileIcon, CreditCardIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { QrPago, BotonTicket, soles, METODOS } from 'components/Pagos/PagoUI';

export const METODOS_CAJA = [
    { key: 'efectivo', label: 'Efectivo', icon: BanknotesIcon },
    { key: 'yape',     label: 'Yape',     icon: DevicePhoneMobileIcon },
    { key: 'plin',     label: 'Plin',     icon: DevicePhoneMobileIcon },
    { key: 'tarjeta',  label: 'Tarjeta',  icon: CreditCardIcon },
];

export const inputCls = 'w-full p-2.5 text-sm text-secondary border border-slate-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none bg-white';
export const labelCls = 'block text-xs font-bold text-slate-700 uppercase mb-1';

export const COBRO_INICIAL = { metodo_pago: 'efectivo', monto_recibido: '', numero_operacion: '' };

const esDigital = (m) => m === 'yape' || m === 'plin';

/** ¿Se puede cobrar con estos datos? (efectivo suficiente, N° de operación en Yape/Plin) */
export const cobroValido = (cobro, total) => {
    const recibido = cobro.monto_recibido === '' ? null : Number(cobro.monto_recibido);
    return (cobro.metodo_pago !== 'efectivo' || recibido === null || recibido >= total)
        && (!esDigital(cobro.metodo_pago) || cobro.numero_operacion.trim() !== '');
};

/** Datos del cobro listos para enviar al backend */
export const datosCobro = (cobro, total) => ({
    metodo_pago: cobro.metodo_pago,
    monto_recibido: cobro.metodo_pago === 'efectivo' ? (cobro.monto_recibido === '' ? total : Number(cobro.monto_recibido)) : null,
    numero_operacion: esDigital(cobro.metodo_pago) ? cobro.numero_operacion.trim() : null,
});

/** Método de pago en caja: efectivo (con vuelto), Yape/Plin (QR + N° de operación) o tarjeta. */
const MetodoCobro = ({ cobro, onChange, total, metodos }) => {
    const set = (cambios) => onChange({ ...cobro, ...cambios });
    const recibido = cobro.monto_recibido === '' ? null : Number(cobro.monto_recibido);
    const vuelto = recibido !== null ? Math.round((recibido - total) * 100) / 100 : null;

    return (
        <div className="space-y-4">
            <div>
                <label className={labelCls}>Método de pago</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" role="radiogroup">
                    {METODOS_CAJA.map(m => {
                        const Icon = m.icon;
                        const activo = cobro.metodo_pago === m.key;
                        return (
                            <button key={m.key} type="button" role="radio" aria-checked={activo} onClick={() => set({ metodo_pago: m.key })}
                                className={`flex items-center justify-center gap-1.5 p-2.5 rounded-lg border text-sm font-bold transition-colors
                                    ${activo ? 'bg-secondary text-primary border-secondary' : 'bg-white text-slate-600 border-slate-300 hover:border-slate-400'}`}>
                                <Icon className="w-4 h-4" /> {m.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {cobro.metodo_pago === 'efectivo' && (
                <div className="grid grid-cols-2 gap-4 items-end">
                    <div>
                        <label className={labelCls}>Recibido (S/)</label>
                        <input type="number" min="0" step="0.10" value={cobro.monto_recibido}
                            onChange={(e) => set({ monto_recibido: e.target.value })}
                            className={`${inputCls} text-lg font-bold tabular-nums`} placeholder={total ? total.toFixed(2) : '0.00'} />
                    </div>
                    <div className={`p-2.5 rounded-lg border text-center ${vuelto !== null && vuelto < 0 ? 'bg-red-50 border-red-200 text-red-800' : 'bg-slate-50 border-slate-200 text-slate-800'}`}>
                        <p className="text-[10px] uppercase font-bold opacity-70">{vuelto !== null && vuelto < 0 ? 'Falta' : 'Vuelto'}</p>
                        <p className="text-xl font-black tabular-nums">{soles(Math.abs(vuelto ?? 0))}</p>
                    </div>
                </div>
            )}

            {esDigital(cobro.metodo_pago) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <QrPago tipo={cobro.metodo_pago} datos={metodos?.[cobro.metodo_pago]} />
                    <div>
                        <p className="text-sm text-slate-600 mb-3">Muestra el QR al cliente. Cuando te enseñe la confirmación, escribe el N° de operación.</p>
                        <label className={labelCls}>N° de operación *</label>
                        <input value={cobro.numero_operacion} onChange={(e) => set({ numero_operacion: e.target.value })}
                            className={inputCls} placeholder="Ej: 12345678" />
                    </div>
                </div>
            )}
        </div>
    );
};

/** Barra negra con el total a cobrar. */
export const TotalCobro = ({ detalle, total }) => (
    <div className="flex items-center justify-between gap-3 p-4 rounded-xl bg-secondary text-white">
        <div className="text-sm min-w-0">
            <p className="text-white/70 truncate">{detalle}</p>
            <p className="text-[10px] uppercase font-bold text-primary">Total a cobrar</p>
        </div>
        <p className="text-3xl font-black tabular-nums shrink-0">{soles(total)}</p>
    </div>
);

/** Resultado de un cobro de clase o venta de productos (respuesta del backend). */
export const CobroExitoso = ({ resultado, onTicket, onNuevo }) => (
    <div className="p-4 rounded-xl bg-green-50 border border-green-200">
        <p className="font-black text-green-800 flex items-center gap-2"><CheckCircleIcon className="w-5 h-5" /> {resultado.concepto === 'producto' ? 'Venta registrada' : 'Cobro registrado'}</p>
        <p className="text-sm text-green-900 mt-1">
            {resultado.cliente} · {resultado.descripcion} · <b>{soles(resultado.monto)}</b> en {METODOS[resultado.metodo_pago]}
        </p>
        {resultado.metodo_pago === 'efectivo' && Number(resultado.vuelto) > 0 && (
            <p className="text-2xl font-black text-green-900 mt-2 tabular-nums">Vuelto: {soles(resultado.vuelto)}</p>
        )}
        <div className="mt-3 flex gap-2">
            <BotonTicket onClick={() => onTicket(resultado.pago_id)} />
            <button onClick={onNuevo} className="px-3 py-2 text-xs font-bold rounded-lg border border-slate-200 text-slate-600 hover:bg-white">
                {resultado.concepto === 'producto' ? 'Nueva venta' : 'Nuevo cobro'}
            </button>
        </div>
    </div>
);

export default MetodoCobro;
