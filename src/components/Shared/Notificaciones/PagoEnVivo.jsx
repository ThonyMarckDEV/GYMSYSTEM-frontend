import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { useEventoEnVivo } from 'context/NotificacionesContext';

const soles = (n) => `S/ ${Number(n || 0).toFixed(2)}`;
const CHISPAS = Array.from({ length: 10 }, (_, i) => {
    const ang = (i / 10) * Math.PI * 2;
    return { dx: `${Math.cos(ang) * 46}px`, dy: `${Math.sin(ang) * 46}px`, color: i % 2 ? '#FFC700' : '#22c55e' };
});

/**
 * Cliente: tarjeta flotante con el estado de su pago EN VIVO.
 *  1) "Están revisando tu pago" (recepción abrió el comprobante) — animación de revisión
 *  2) "¡Pago verificado!" (check con chispas) o "Pago rechazado" (con el motivo)
 */
const PagoEnVivo = () => {
    const navigate = useNavigate();
    const [estado, setEstado] = useState(null); // { fase, pagoId, titulo, mensaje }

    useEventoEnVivo('gym:pago-revisando', (d) => {
        setEstado({
            fase: 'revisando', pagoId: d.pago_id,
            titulo: 'Están revisando tu pago',
            mensaje: `${d.revisa || 'Recepción'} está verificando tu pago de ${soles(d.monto)}${d.descripcion ? ` (${d.descripcion})` : ''}.`,
        });
    });

    useEventoEnVivo('gym:notificacion', (n) => {
        if (n.tipo === 'pago_verificado') setEstado({ fase: 'verificado', pagoId: n.datos?.pago_id, titulo: n.titulo, mensaje: n.mensaje });
        if (n.tipo === 'pago_rechazado') setEstado({ fase: 'rechazado', pagoId: n.datos?.pago_id, titulo: n.titulo, mensaje: n.mensaje });
    });

    // El resultado se cierra solo; "revisando" espera el resultado (máx. 3 min)
    useEffect(() => {
        if (!estado) return;
        const t = setTimeout(() => setEstado(null), estado.fase === 'revisando' ? 180000 : 9000);
        return () => clearTimeout(t);
    }, [estado]);

    if (!estado) return null;

    const revisando = estado.fase === 'revisando';
    const ok = estado.fase === 'verificado';

    return (
        <div className="fixed bottom-4 right-4 left-4 sm:left-auto z-[55] sm:w-[360px]" role="status" aria-live="polite">
            <div key={estado.fase} className={`aparecer-abajo relative overflow-hidden rounded-2xl shadow-2xl border p-4 pr-10 flex items-center gap-4
                ${revisando ? 'bg-secondary text-white border-primary/40' : ok ? 'bg-white border-green-300' : 'bg-white border-red-300'}`}>

                {/* Ícono animado */}
                <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
                    {revisando ? (
                        <>
                            <span className="anillo-pulso absolute inset-0 rounded-full bg-primary/40" />
                            <span className="anillo-pulso-2 absolute inset-0 rounded-full bg-primary/30" />
                            <span className="relative w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                                <MagnifyingGlassIcon className="lupa-revisa w-6 h-6 text-secondary" />
                            </span>
                        </>
                    ) : (
                        <>
                            {ok && CHISPAS.map((c, i) => (
                                <span key={i} className="chispa absolute w-2 h-2 rounded-full" style={{ '--dx': c.dx, '--dy': c.dy, backgroundColor: c.color }} />
                            ))}
                            <span className={`icono-pop relative w-12 h-12 rounded-full flex items-center justify-center ${ok ? 'bg-green-500' : 'bg-red-500'}`}>
                                {ok ? <CheckIcon className="w-7 h-7 text-white" /> : <XMarkIcon className="w-7 h-7 text-white" />}
                            </span>
                        </>
                    )}
                </div>

                <div className="min-w-0">
                    <p className={`font-black leading-tight ${revisando ? 'text-primary' : ok ? 'text-green-700' : 'text-red-700'}`}>{estado.titulo}</p>
                    <p className={`text-xs mt-0.5 ${revisando ? 'text-white/80' : 'text-slate-600'}`}>{estado.mensaje}</p>
                    {!revisando && (
                        <button onClick={() => { setEstado(null); navigate('/mis-pagos'); }} className={`mt-1.5 text-xs font-black uppercase ${ok ? 'text-green-700' : 'text-red-700'} hover:underline`}>
                            Ver mis pagos →
                        </button>
                    )}
                </div>

                <button onClick={() => setEstado(null)} aria-label="Cerrar" className={`absolute top-2 right-2 p-1 rounded-md ${revisando ? 'text-white/50 hover:text-white' : 'text-slate-400 hover:text-slate-700'}`}>
                    <XMarkIcon className="w-4 h-4" />
                </button>

                {/* Barra de "trabajando" mientras revisan */}
                {revisando && (
                    <span className="absolute left-0 bottom-0 h-1 w-full bg-white/10 overflow-hidden">
                        <span className="barra-barrido block h-full w-1/3 bg-primary" />
                    </span>
                )}
            </div>
        </div>
    );
};

export default PagoEnVivo;
