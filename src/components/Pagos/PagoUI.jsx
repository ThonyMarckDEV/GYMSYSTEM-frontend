import React, { Suspense, lazy, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
    XMarkIcon, CheckCircleIcon, XCircleIcon, KeyIcon, PrinterIcon,
    PhotoIcon, ExclamationTriangleIcon, ClockIcon, NoSymbolIcon, MagnifyingGlassPlusIcon
} from '@heroicons/react/24/outline';
import { obtenerArchivoUrl } from 'js/archivoAutenticado';
import { comprobanteUrl, ticketUrl } from 'services/pagoService';
import { qrUrl } from 'services/metodoPagoService';
// El visor de PDF es pesado: se descarga solo al abrir un ticket
const PdfModal = lazy(() => import('components/Shared/Modals/PdfModal'));

// ---------------------------------------------------------------------------
// Etiquetas
// ---------------------------------------------------------------------------
export const METODOS = {
    efectivo: 'Efectivo', yape: 'Yape', plin: 'Plin', tarjeta: 'Tarjeta', transferencia: 'Transferencia',
};

export const soles = (n) => `S/ ${Number(n || 0).toFixed(2)}`;

const ESTADOS = {
    pendiente:  { label: 'Pendiente',  icon: ClockIcon,        cls: 'bg-amber-50 text-amber-800 border-amber-200' },
    verificado: { label: 'Verificado', icon: CheckCircleIcon,  cls: 'bg-green-50 text-green-700 border-green-200' },
    rechazado:  { label: 'Rechazado',  icon: XCircleIcon,      cls: 'bg-red-50 text-red-700 border-red-200' },
    anulado:    { label: 'Anulado',    icon: NoSymbolIcon,     cls: 'bg-slate-100 text-slate-600 border-slate-300' },
};

/** Estado del pago: siempre con ícono + texto (no solo color). */
export const EstadoPago = ({ estado }) => {
    const e = ESTADOS[estado] || { label: estado, icon: ClockIcon, cls: 'bg-slate-100 text-slate-600 border-slate-200' };
    const Icon = e.icon;
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${e.cls}`}>
            <Icon className="w-3.5 h-3.5" /> {e.label}
        </span>
    );
};

// ---------------------------------------------------------------------------
// Imagen protegida (se pide con token y se muestra como blob)
// ---------------------------------------------------------------------------
export const ImagenProtegida = ({ url, alt, className = '', vacio = 'Imagen no disponible', onAbrir }) => {
    const [src, setSrc] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        let objectUrl = null;
        let activo = true;
        setSrc(null); setError(null);
        obtenerArchivoUrl(url)
            .then(u => { objectUrl = u; if (activo) setSrc(u); else URL.revokeObjectURL(u); })
            .catch(e => activo && setError(e.message));
        return () => { activo = false; if (objectUrl) URL.revokeObjectURL(objectUrl); };
    }, [url]);

    if (error) {
        return (
            <div className={`flex flex-col items-center justify-center gap-1 bg-slate-50 border border-dashed border-slate-300 rounded-lg text-slate-400 text-xs p-4 ${className}`}>
                <PhotoIcon className="w-6 h-6" /> {vacio}
            </div>
        );
    }
    if (!src) return <div className={`bg-slate-100 animate-pulse rounded-lg ${className}`} />;
    if (!onAbrir) return <img src={src} alt={alt} className={`object-contain ${className}`} />;

    return (
        <button type="button" onClick={() => onAbrir(src)} title="Ver imagen completa"
            className={`group relative block cursor-zoom-in overflow-hidden ${className}`}>
            <img src={src} alt={alt} className="w-full h-full object-contain" />
            <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 px-2 py-1 rounded-md bg-black/70 text-white text-[11px] font-bold opacity-80 group-hover:opacity-100">
                <MagnifyingGlassPlusIcon className="w-4 h-4" /> Ver completa
            </span>
        </button>
    );
};

/** Imagen a pantalla completa. Se cierra con clic, con la X o con Esc. */
export const VisorImagen = ({ src, alt, onClose }) => {
    useEffect(() => {
        const alPresionar = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', alPresionar);
        return () => window.removeEventListener('keydown', alPresionar);
    }, [onClose]);

    // Portal al <body>: así ningún contenedor del modal lo recorta
    return createPortal(
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4 cursor-zoom-out"
            onClick={onClose} role="dialog" aria-label={alt}>
            <button onClick={onClose} aria-label="Cerrar"
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20">
                <XMarkIcon className="w-7 h-7" />
            </button>
            <img src={src} alt={alt} className="max-w-full max-h-full object-contain" onClick={(e) => e.stopPropagation()} />
        </div>,
        document.body
    );
};

// ---------------------------------------------------------------------------
// QR de Yape / Plin del gimnasio
// ---------------------------------------------------------------------------
export const QrPago = ({ tipo, datos }) => {
    const nombre = tipo === 'yape' ? 'Yape' : 'Plin';
    return (
        <div className="flex flex-col items-center text-center">
            {datos?.tiene_qr ? (
                <div className="p-2 bg-white rounded-xl border border-slate-200 shadow-sm">
                    <ImagenProtegida url={qrUrl(tipo)} alt={`QR de ${nombre}`} className="w-44 h-44" vacio="QR no disponible" />
                </div>
            ) : (
                <div className="w-44 h-44 flex flex-col items-center justify-center gap-1 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-xs text-slate-400 p-3">
                    <PhotoIcon className="w-7 h-7" /> El gimnasio aún no subió su QR de {nombre}
                </div>
            )}
            {datos?.numero ? (
                <div className="mt-2">
                    <p className="text-[10px] uppercase font-bold text-slate-400">{nombre} al número</p>
                    <p className="text-lg font-black text-secondary tabular-nums tracking-wider">{datos.numero}</p>
                    {datos.titular && <p className="text-xs text-slate-500">{datos.titular}</p>}
                </div>
            ) : (
                <p className="mt-2 text-xs text-slate-400">Número de {nombre} no configurado</p>
            )}
        </div>
    );
};

// ---------------------------------------------------------------------------
// Modal base
// ---------------------------------------------------------------------------
export const Modal = ({ titulo, icon: Icon, onClose, children, pie, ancho = 'max-w-lg', error }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className={`bg-white rounded-xl shadow-elegant-gold w-full ${ancho} max-h-[92vh] flex flex-col overflow-hidden border border-primary/20`}>
            <div className="flex justify-between items-center px-6 py-4 border-b border-primary/20 bg-secondary">
                <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                    {Icon && <Icon className="w-5 h-5" />} {titulo}
                </h3>
                <button onClick={onClose} className="text-primary/60 hover:text-primary transition-colors" aria-label="Cerrar">
                    <XMarkIcon className="w-6 h-6" />
                </button>
            </div>
            <div className="p-6 overflow-y-auto">
                {error && (
                    <p role="alert" className="mb-4 text-sm font-bold text-red-800 bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2">
                        <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0" /> {error}
                    </p>
                )}
                {children}
            </div>
            {pie && <div className="px-6 py-4 bg-primary-light/40 border-t border-primary/20 flex justify-end gap-3">{pie}</div>}
        </div>
    </div>
);

const btn = 'px-4 py-2 rounded-lg font-bold uppercase text-sm transition-colors disabled:opacity-50';

// ---------------------------------------------------------------------------
// Comprobante (con verificar / rechazar)
// ---------------------------------------------------------------------------
export const ComprobanteModal = ({ pago, onClose, onVerificar, onRechazar, loading = false, error }) => {
    const [rechazando, setRechazando] = useState(false);
    const [motivo, setMotivo] = useState('');
    const [ampliada, setAmpliada] = useState(null); // URL de la imagen a pantalla completa
    const puedeRevisar = pago.estado === 'pendiente' && (onVerificar || onRechazar);

    return (
        <Modal titulo={`Comprobante del pago #${pago.id}`} icon={PhotoIcon} onClose={onClose} ancho="max-w-2xl lg:max-w-5xl" error={error}
            pie={puedeRevisar && (rechazando ? (
                <>
                    <button className={`${btn} bg-slate-100 text-slate-600 hover:bg-slate-200`} onClick={() => setRechazando(false)} disabled={loading}>Volver</button>
                    <button className={`${btn} bg-red-600 text-white hover:bg-red-700`} disabled={loading || !motivo.trim()}
                        onClick={() => onRechazar(motivo.trim())}>{loading ? 'Rechazando...' : 'Confirmar rechazo'}</button>
                </>
            ) : (
                <>
                    {onRechazar && <button className={`${btn} bg-red-50 text-red-700 border border-red-200 hover:bg-red-100`} onClick={() => setRechazando(true)} disabled={loading}>Rechazar</button>}
                    {onVerificar && <button className={`${btn} bg-green-600 text-white hover:bg-green-700`} onClick={onVerificar} disabled={loading}>
                        {loading ? 'Verificando...' : 'Verificar y activar membresía'}
                    </button>}
                </>
            ))}
        >
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3">
                    <ImagenProtegida url={comprobanteUrl(pago.id)} alt="Comprobante de pago" onAbrir={setAmpliada}
                        className="w-full h-80 lg:h-[62vh] rounded-lg bg-slate-50 border border-slate-200" vacio="Sin comprobante" />
                    <p className="mt-1.5 text-[11px] text-slate-400 text-center">Haz clic en la imagen para verla completa</p>
                </div>
                <dl className="text-sm space-y-3 lg:col-span-2">
                    <div><dt className="text-[10px] uppercase font-bold text-slate-400">Cliente</dt><dd className="font-bold text-slate-800">{pago.cliente}</dd><dd className="text-xs text-slate-500">DNI {pago.dni}</dd></div>
                    <div><dt className="text-[10px] uppercase font-bold text-slate-400">{pago.concepto === 'clase' ? 'Clase / evento' : pago.concepto === 'producto' ? 'Productos' : 'Plan'}</dt><dd className="font-bold text-slate-800">{pago.plan}</dd></div>
                    <div><dt className="text-[10px] uppercase font-bold text-slate-400">Monto a verificar</dt><dd className="text-2xl font-black text-secondary tabular-nums">{soles(pago.monto)}</dd></div>
                    <div><dt className="text-[10px] uppercase font-bold text-slate-400">Método · N° operación</dt><dd className="font-bold text-slate-800">{METODOS[pago.metodo_pago]} · {pago.numero_operacion || '—'}</dd></div>
                    <div><dt className="text-[10px] uppercase font-bold text-slate-400">Estado</dt><dd><EstadoPago estado={pago.estado} /></dd></div>
                    {puedeRevisar && !rechazando && (
                        <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-2.5 flex gap-1.5">
                            <ExclamationTriangleIcon className="w-4 h-4 flex-shrink-0" />
                            Revisa en tu app de Yape/Plin que el monto y el N° de operación hayan llegado antes de verificar.
                        </p>
                    )}
                    {rechazando && (
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Motivo del rechazo *</label>
                            <textarea rows={3} value={motivo} onChange={e => setMotivo(e.target.value)} autoFocus
                                className="w-full p-2.5 text-sm border border-slate-300 rounded-lg focus:ring-1 focus:ring-primary outline-none resize-none"
                                placeholder="Ej: El monto no coincide / no llegó el pago" />
                            <p className="text-[11px] text-slate-400 mt-1">El cliente verá este motivo en su perfil.</p>
                        </div>
                    )}
                </dl>
            </div>
            {ampliada && <VisorImagen src={ampliada} alt="Comprobante de pago" onClose={() => setAmpliada(null)} />}
        </Modal>
    );
};

// ---------------------------------------------------------------------------
// Anular con PIN
// ---------------------------------------------------------------------------
export const AnularPagoModal = ({ pago, onClose, onConfirm, loading = false, error }) => {
    const [pin, setPin] = useState('');
    const [motivo, setMotivo] = useState('');
    const valido = /^\d{6}$/.test(pin) && motivo.trim().length >= 5;

    return (
        <Modal titulo={`Anular pago #${pago.id}`} icon={KeyIcon} onClose={onClose} error={error}
            pie={<>
                <button className={`${btn} bg-slate-100 text-slate-600 hover:bg-slate-200`} onClick={onClose} disabled={loading}>Cancelar</button>
                <button className={`${btn} bg-red-600 text-white hover:bg-red-700`} disabled={loading || !valido}
                    onClick={() => onConfirm(pin, motivo.trim())}>{loading ? 'Anulando...' : 'Anular pago'}</button>
            </>}
        >
            <p className="text-sm text-slate-600 mb-4">
                Vas a anular el pago de <b>{pago.cliente}</b> por <b>{soles(pago.monto)}</b> ({METODOS[pago.metodo_pago]}).
                Su membresía quedará cancelada. Necesitas un <b>PIN de autorización</b> generado por tu administrador.
            </p>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">PIN de autorización *</label>
            <input type="password" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={pin}
                onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full p-3 text-center text-2xl tracking-[0.6em] font-black border border-slate-300 rounded-lg focus:ring-1 focus:ring-primary outline-none"
                placeholder="••••••" />
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1 mt-4">Motivo *</label>
            <textarea rows={2} value={motivo} onChange={e => setMotivo(e.target.value)}
                className="w-full p-2.5 text-sm border border-slate-300 rounded-lg focus:ring-1 focus:ring-primary outline-none resize-none"
                placeholder="Ej: Se cobró el plan equivocado" />
        </Modal>
    );
};

// ---------------------------------------------------------------------------
/** Texto de error de una alerta (para mostrarlo dentro de un modal). */
export const errorDeAlerta = (alert) =>
    alert?.type === 'error' ? ((Array.isArray(alert.details) && alert.details[0]) || alert.message) : null;

// ---------------------------------------------------------------------------
// Ticket PDF (Blade en el backend)
// ---------------------------------------------------------------------------
/** urlDe(id): de dónde sale el PDF (por defecto el endpoint del personal) */
export const useTicket = (urlDe = ticketUrl) => {
    const [ticket, setTicket] = useState(null); // { id, url }
    const [error, setError] = useState(null);

    const abrirTicket = async (id) => {
        setError(null);
        try {
            const url = await obtenerArchivoUrl(urlDe(id));
            setTicket({ id, url });
        } catch (e) {
            setError(e.message);
        }
    };

    const cerrarTicket = () => {
        if (ticket?.url) URL.revokeObjectURL(ticket.url);
        setTicket(null);
    };

    const TicketModal = () => ticket ? (
        <Suspense fallback={null}>
            <PdfModal isOpen onClose={cerrarTicket} title={`Ticket del pago #${ticket.id}`} pdfUrl={ticket.url} />
        </Suspense>
    ) : null;

    return { abrirTicket, TicketModal, errorTicket: error };
};

export const BotonTicket = ({ onClick, compacto = false }) => (
    <button onClick={onClick} title="Ver / imprimir ticket"
        className={`inline-flex items-center gap-1 rounded-lg font-bold text-slate-600 hover:text-secondary hover:bg-primary-light transition-all ${compacto ? 'p-2' : 'px-3 py-2 text-xs border border-slate-200'}`}>
        <PrinterIcon className="w-5 h-5" /> {!compacto && 'Ticket'}
    </button>
);
