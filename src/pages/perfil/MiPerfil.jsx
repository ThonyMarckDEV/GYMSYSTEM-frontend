import React from 'react';
import { useMiPerfil } from 'hooks/perfil/useMiPerfil';
import LoadingScreen from 'components/Shared/LoadingScreen';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import PagarMembresia from 'components/Perfil/PagarMembresia';
import { useAuth } from 'context/AuthContext';
import QRCode from 'react-qr-code';
import {
    IdentificationIcon, PhoneIcon, EnvelopeIcon,
    CalendarDaysIcon, ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

const ESTADO_BADGES = {
    activa:    'bg-green-100 text-green-700 border-green-200',
    vencida:   'bg-slate-100 text-slate-600 border-slate-200',
    cancelada: 'bg-red-100 text-red-600 border-red-200',
    congelada: 'bg-blue-100 text-blue-700 border-blue-200',
    pendiente: 'bg-amber-50 text-amber-800 border-amber-200',
    rechazada: 'bg-red-50 text-red-700 border-red-200',
};

const ESTADO_LABEL = {
    activa: 'Activa', vencida: 'Vencida', cancelada: 'Cancelada', congelada: 'Congelada',
    pendiente: 'En revisión', rechazada: 'Pago rechazado',
};

const MiPerfil = () => {
    const { loading, data, alert, setAlert, fetchMiPerfil } = useMiPerfil();
    const { can } = useAuth();

    if (loading) return <LoadingScreen />;
    if (!data) return null;

    const { cliente, membresia_actual, historial } = data;
    const iniciales = cliente.nombre_completo?.split(' ').slice(0, 2).map(p => p[0]).join('') || '?';

    // El QR (con el DNI) se genera en el navegador: el DNI no se envía a ningún servicio externo.
    const handleDescargarQR = () => {
        const svg = document.getElementById('qr-acceso');
        if (!svg) return;
        const datos = new XMLSerializer().serializeToString(svg);
        const img = new Image();
        img.onload = () => {
            const lado = 600, margen = 48;
            const canvas = document.createElement('canvas');
            canvas.width = lado; canvas.height = lado;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, lado, lado);
            ctx.drawImage(img, margen, margen, lado - margen * 2, lado - margen * 2);
            const a = document.createElement('a');
            a.href = canvas.toDataURL('image/png');
            a.download = `qr-acceso-${cliente.dni}.png`;
            a.click();
        };
        img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(datos);
    };

    return (
        <div className="p-6">
            <div className="max-w-3xl mx-auto space-y-5">

                <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />

                {/* Header + QR lado a lado */}
                <div className="bg-secondary rounded-2xl p-6 shadow-xl relative overflow-hidden">
                    <div className="absolute inset-0 opacity-[0.04]" style={{
                        backgroundImage: 'radial-gradient(circle, #FFC700 1px, transparent 1px)',
                        backgroundSize: '20px 20px'
                    }}></div>

                    <div className="relative flex flex-col sm:flex-row items-center gap-6">
                        <div className="flex-1 text-center sm:text-left">
                            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mx-auto sm:mx-0 mb-3 shadow-lg">
                                <span className="text-xl font-bold text-secondary">{iniciales}</span>
                            </div>
                            <h1 className="text-xl font-bold text-white tracking-tight">{cliente.nombre_completo}</h1>

                            <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-3">
                                <span className="flex items-center gap-1.5 text-xs text-white/90 bg-white/10 px-3 py-1 rounded-full font-medium">
                                    <IdentificationIcon className="w-3.5 h-3.5"/> {cliente.dni}
                                </span>
                                {cliente.telefonoMovil && (
                                    <span className="flex items-center gap-1.5 text-xs text-white/70 bg-white/10 px-3 py-1 rounded-full">
                                        <PhoneIcon className="w-3.5 h-3.5"/> {cliente.telefonoMovil}
                                    </span>
                                )}
                                {cliente.correo && (
                                    <span className="flex items-center gap-1.5 text-xs text-white/70 bg-white/10 px-3 py-1 rounded-full">
                                        <EnvelopeIcon className="w-3.5 h-3.5"/> {cliente.correo}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* QR compacto al costado */}
                        <div className="flex flex-col items-center shrink-0">
                            <div className="p-2 bg-white rounded-xl shadow-md">
                                <QRCode id="qr-acceso" value={String(cliente.dni)} size={112}
                                    title={`Código QR de acceso para el DNI ${cliente.dni}`} />
                            </div>
                            <button
                                onClick={handleDescargarQR}
                                className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-white/60 hover:text-white transition-colors"
                            >
                                <ArrowDownTrayIcon className="w-3 h-3" /> Descargar
                            </button>
                        </div>
                    </div>
                </div>

                {/* Membresía actual — compacta */}
                {membresia_actual ? (
                    <div className="bg-white rounded-2xl border-2 border-dashed border-primary/40 p-6 text-center shadow-sm">
                        <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase border ${ESTADO_BADGES[membresia_actual.estado]}`}>
                            {ESTADO_LABEL[membresia_actual.estado]}
                        </span>
                        <p className="font-black text-2xl text-secondary mt-3">{membresia_actual.plan?.nombre}</p>
                        <p className="text-sm text-slate-500 flex items-center justify-center gap-1 mt-1">
                            <CalendarDaysIcon className="w-4 h-4" />
                            {membresia_actual.fecha_inicio} al {membresia_actual.fecha_fin}
                        </p>

                        <div className="mt-4 pt-4 border-t border-dashed border-slate-200 flex items-center justify-center gap-8">
                            <div>
                                <p className="text-[10px] uppercase text-slate-400 font-bold">Congelamientos</p>
                                <p className="text-base font-black text-secondary">{membresia_actual.congelamientos_usados} / {membresia_actual.plan?.congelamientos_permitidos}</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase text-slate-400 font-bold">Pagaste</p>
                                <p className="text-base font-black text-primary">S/ {Number(membresia_actual.precio_final).toFixed(2)}</p>
                            </div>
                        </div>

                        {membresia_actual.descuento && (
                            <p className="text-xs text-green-700 font-bold mt-2">
                                Con descuento: {membresia_actual.descuento.nombre}
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-6 text-center">
                        <p className="text-slate-400 text-sm">Aún no tienes una membresía activa.</p>
                        <p className="text-slate-400 text-xs mt-1">Págala en línea aquí abajo o acércate a recepción.</p>
                    </div>
                )}

                {/* Pago en línea: QR Yape/Plin + comprobante */}
                {can('perfil.pagar') && <PagarMembresia onPagoEnviado={fetchMiPerfil} />}

                {/* Historial — timeline simple, discreto */}
                {historial.length > 0 && (
                    <div>
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-2">Tu historial</h3>
                        <div className="space-y-1.5">
                            {historial.map(m => (
                                <div key={m.id} className="flex items-center justify-between px-4 py-2.5 bg-white rounded-xl border border-slate-100">
                                    <div>
                                        <p className="font-bold text-slate-700 text-sm">{m.plan?.nombre}</p>
                                        <p className="text-xs text-slate-400">{m.fecha_inicio || 'Sin definir'} → {m.fecha_fin || 'Sin definir'}</p>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${ESTADO_BADGES[m.estado]}`}>
                                        {ESTADO_LABEL[m.estado]}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default MiPerfil;