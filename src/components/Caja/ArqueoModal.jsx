import React, { useMemo, useState } from 'react';
import { CalculatorIcon } from '@heroicons/react/24/outline';
import { Modal, soles } from 'components/Pagos/PagoUI';

const BILLETES = ['200', '100', '50', '20', '10'];
const MONEDAS = ['5', '2', '1', '0.5', '0.2', '0.1'];

const etiqueta = (d) => (Number(d) < 1 ? `${Math.round(Number(d) * 100)} cént.` : `S/ ${d}`);

const Fila = ({ d, cantidad, onChange }) => (
    <label className="flex items-center justify-between gap-2 py-1">
        <span className="text-sm font-bold text-slate-700 w-20">{etiqueta(d)}</span>
        <span className="text-slate-400 text-xs">×</span>
        <input type="number" min="0" inputMode="numeric" value={cantidad ?? ''}
            onChange={(e) => onChange(e.target.value.replace(/\D/g, ''))}
            className="w-20 p-1.5 text-right text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-primary/40 outline-none tabular-nums"
            placeholder="0" aria-label={`Cantidad de ${etiqueta(d)}`} />
        <span className="w-20 text-right text-sm tabular-nums text-slate-600">{soles(Number(d) * (Number(cantidad) || 0))}</span>
    </label>
);

/** Cierre de caja: el cajero cuenta billetes y monedas y se compara con lo esperado. */
const ArqueoModal = ({ esperado, onClose, onConfirm, loading, error }) => {
    const [cantidades, setCantidades] = useState({});
    const [observaciones, setObservaciones] = useState('');

    const contado = useMemo(() =>
        Math.round(Object.entries(cantidades).reduce((t, [d, c]) => t + Number(d) * (Number(c) || 0), 0) * 100) / 100,
    [cantidades]);
    const diferencia = Math.round((contado - esperado) * 100) / 100;

    const estado = diferencia === 0
        ? { texto: 'Cuadra exacto', cls: 'bg-green-50 text-green-800 border-green-200' }
        : diferencia > 0
            ? { texto: `Sobrante de ${soles(diferencia)}`, cls: 'bg-amber-50 text-amber-800 border-amber-200' }
            : { texto: `Faltante de ${soles(Math.abs(diferencia))}`, cls: 'bg-red-50 text-red-800 border-red-200' };

    const fila = (d) => (
        <Fila key={d} d={d} cantidad={cantidades[d]}
            onChange={(v) => setCantidades(prev => ({ ...prev, [d]: v }))} />
    );

    const confirmar = () => {
        const desglose = Object.fromEntries(Object.entries(cantidades).filter(([, c]) => Number(c) > 0).map(([d, c]) => [d, Number(c)]));
        onConfirm(Object.keys(desglose).length ? { desglose, observaciones } : { monto_contado: 0, observaciones });
    };

    return (
        <Modal titulo="Cerrar caja · Arqueo" icon={CalculatorIcon} onClose={onClose} ancho="max-w-2xl" error={error}
            pie={<>
                <button onClick={onClose} disabled={loading} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg font-bold uppercase text-sm hover:bg-slate-200">Cancelar</button>
                <button onClick={confirmar} disabled={loading} className="px-4 py-2 bg-secondary text-primary rounded-lg font-bold uppercase text-sm hover:bg-secondary/90 disabled:opacity-50">
                    {loading ? 'Cerrando...' : 'Cerrar caja'}
                </button>
            </>}
        >
            <p className="text-sm text-slate-600 mb-4">Cuenta el efectivo que hay en el cajón (incluye el monto de apertura). Los pagos con Yape, Plin o tarjeta no se cuentan aquí.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Billetes</h4>
                    {BILLETES.map(fila)}
                </div>
                <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 mt-4 md:mt-0">Monedas</h4>
                    {MONEDAS.map(fila)}
                </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Esperado</p>
                    <p className="text-lg font-black tabular-nums text-slate-900">{soles(esperado)}</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Contado</p>
                    <p className="text-lg font-black tabular-nums text-slate-900">{soles(contado)}</p>
                </div>
                <div className={`p-3 rounded-lg border ${estado.cls}`}>
                    <p className="text-[10px] uppercase font-bold opacity-70">Diferencia</p>
                    <p className="text-sm font-black">{estado.texto}</p>
                </div>
            </div>

            <label className="block text-sm font-medium text-slate-700 mb-1.5 mt-5">Observaciones</label>
            <textarea rows={2} value={observaciones} onChange={e => setObservaciones(e.target.value)}
                className="w-full p-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/40 outline-none resize-none"
                placeholder={diferencia !== 0 ? 'Explica el sobrante o faltante' : 'Opcional'} />
        </Modal>
    );
};

export default ArqueoModal;
