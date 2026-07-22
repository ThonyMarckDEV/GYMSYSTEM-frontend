import React from 'react';
import { useMiPerfil } from 'hooks/perfil/useMiPerfil';
import LoadingScreen from 'components/Shared/LoadingScreen';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import {
    IdentificationIcon, PhoneIcon, EnvelopeIcon,
    CalendarDaysIcon, SparklesIcon
} from '@heroicons/react/24/outline';

const ESTADO_BADGES = {
    activa:    'bg-green-100 text-green-700 border-green-200',
    vencida:   'bg-slate-100 text-slate-600 border-slate-200',
    cancelada: 'bg-red-100 text-red-600 border-red-200',
    congelada: 'bg-blue-100 text-blue-700 border-blue-200',
};

const ESTADO_LABEL = {
    activa: 'Activa', vencida: 'Vencida', cancelada: 'Cancelada', congelada: 'Congelada',
};

const MiPerfil = () => {
    const { loading, data, alert, setAlert } = useMiPerfil();

    if (loading) return <LoadingScreen />;
    if (!data) return null;

    const { cliente, membresia_actual, historial } = data;
    const iniciales = cliente.nombre_completo?.split(' ').slice(0, 2).map(p => p[0]).join('') || '?';

    return (
        <div className="min-h-full bg-gradient-to-b from-primary-light/30 to-white p-6">
            <div className="max-w-3xl mx-auto space-y-6">

                <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />

                {/* Header estilo tarjeta de membresía / carnet */}
                <div className="bg-secondary rounded-2xl p-8 text-center shadow-xl relative overflow-hidden">
                    <div className="absolute inset-0 opacity-[0.04]" style={{
                        backgroundImage: 'radial-gradient(circle, #FFC700 1px, transparent 1px)',
                        backgroundSize: '20px 20px'
                    }}></div>

                    <div className="relative">
                        <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <span className="text-2xl font-black text-secondary">{iniciales}</span>
                        </div>
                        <h1 className="text-2xl font-black text-primary">{cliente.nombre_completo}</h1>
                        <p className="text-white/50 text-xs uppercase tracking-widest mt-1 flex items-center justify-center gap-1">
                            <SparklesIcon className="w-3 h-3" /> Miembro Iron System
                        </p>
                    </div>
                </div>

                {/* Datos de contacto en línea, sin card pesada */}
                <div className="flex flex-wrap justify-center gap-3">
                    <span className="flex items-center gap-2 text-sm text-secondary bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
                        <IdentificationIcon className="w-4 h-4 text-primary"/> DNI: {cliente.dni}
                    </span>
                    {cliente.telefonoMovil && (
                        <span className="flex items-center gap-2 text-sm text-secondary bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
                            <PhoneIcon className="w-4 h-4 text-primary"/> {cliente.telefonoMovil}
                        </span>
                    )}
                    {cliente.correo && (
                        <span className="flex items-center gap-2 text-sm text-secondary bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
                            <EnvelopeIcon className="w-4 h-4 text-primary"/> {cliente.correo}
                        </span>
                    )}
                </div>

                {/* Membresía actual — grande, centrada, tipo ticket */}
                {membresia_actual ? (
                    <div className="bg-white rounded-2xl border-2 border-dashed border-primary/40 p-8 text-center shadow-sm">
                        <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-black uppercase border ${ESTADO_BADGES[membresia_actual.estado]}`}>
                            {ESTADO_LABEL[membresia_actual.estado]}
                        </span>
                        <p className="font-black text-3xl text-secondary mt-4">{membresia_actual.plan?.nombre}</p>
                        <p className="text-sm text-slate-500 flex items-center justify-center gap-1 mt-2">
                            <CalendarDaysIcon className="w-4 h-4" />
                            Vigencia: {membresia_actual.fecha_inicio} al {membresia_actual.fecha_fin}
                        </p>

                        <div className="mt-6 pt-6 border-t border-dashed border-slate-200 flex items-center justify-center gap-8">
                            <div>
                                <p className="text-[10px] uppercase text-slate-400 font-bold">Congelamientos</p>
                                <p className="text-lg font-black text-secondary">{membresia_actual.congelamientos_usados} / {membresia_actual.plan?.congelamientos_permitidos}</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase text-slate-400 font-bold">Pagaste</p>
                                <p className="text-lg font-black text-primary">S/ {Number(membresia_actual.precio_final).toFixed(2)}</p>
                            </div>
                        </div>

                        {membresia_actual.descuento && (
                            <p className="text-xs text-green-700 font-bold mt-3">
                                🎉 Con descuento: {membresia_actual.descuento.nombre}
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-10 text-center">
                        <p className="text-slate-400 text-sm">Aún no tienes una membresía activa.</p>
                        <p className="text-slate-400 text-xs mt-1">Acércate a recepción para adquirir una.</p>
                    </div>
                )}

                {/* Historial — timeline simple, discreto */}
                {historial.length > 0 && (
                    <div>
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 px-2">Tu historial</h3>
                        <div className="space-y-2">
                            {historial.map(m => (
                                <div key={m.id} className="flex items-center justify-between px-4 py-3 bg-white rounded-xl border border-slate-100">
                                    <div>
                                        <p className="font-bold text-slate-700 text-sm">{m.plan?.nombre}</p>
                                        <p className="text-xs text-slate-400">{m.fecha_inicio || 'Sin definir'} → {m.fecha_fin || 'Sin definir'}</p>
                                    </div>
                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${ESTADO_BADGES[m.estado]}`}>
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