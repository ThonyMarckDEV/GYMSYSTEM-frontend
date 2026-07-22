import React from 'react';
import { useMiPerfil } from 'hooks/perfil/useMiPerfil';
import PageHeader from 'components/Shared/Headers/PageHeader';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import LoadingScreen from 'components/Shared/LoadingScreen';
import {
    UserGroupIcon, IdentificationIcon, PhoneIcon, EnvelopeIcon,
    CalendarDaysIcon, TagIcon, CreditCardIcon
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

    return (
        <div className="container mx-auto p-6">
            <PageHeader
                title="Mi Perfil"
                icon={UserGroupIcon}
            />

            <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />

            <div className="max-w-5xl mx-auto space-y-6">

                {/* Datos personales */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                        <div className="w-16 h-16 rounded-full bg-primary-light flex items-center justify-center border border-primary/30 shrink-0">
                            <UserGroupIcon className="w-8 h-8 text-secondary" />
                        </div>
                        <div className="flex-1">
                            <p className="text-gray-800 font-black text-xl">{cliente.nombre_completo}</p>
                            <div className="flex flex-wrap gap-3 mt-3">
                                <span className="flex items-center gap-1 text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                                    <IdentificationIcon className="w-4 h-4 text-gray-400"/> DNI: {cliente.dni}
                                </span>
                                {cliente.telefonoMovil && (
                                    <span className="flex items-center gap-1 text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                                        <PhoneIcon className="w-4 h-4 text-gray-400"/> {cliente.telefonoMovil}
                                    </span>
                                )}
                                {cliente.correo && (
                                    <span className="flex items-center gap-1 text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                                        <EnvelopeIcon className="w-4 h-4 text-gray-400"/> {cliente.correo}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Membresía actual */}
                {membresia_actual ? (
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="text-lg font-black text-secondary flex items-center gap-2 mb-4 border-b border-slate-100 pb-2 uppercase">
                            <CreditCardIcon className="w-5 h-5" /> Mi Membresía
                        </h3>

                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${ESTADO_BADGES[membresia_actual.estado]}`}>
                            {ESTADO_LABEL[membresia_actual.estado]}
                        </span>
                        <p className="font-black text-lg text-secondary mt-2 flex items-center gap-2">
                            <TagIcon className="w-4 h-4" /> {membresia_actual.plan?.nombre}
                        </p>
                        <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                            <CalendarDaysIcon className="w-4 h-4" />
                            {membresia_actual.fecha_inicio} → {membresia_actual.fecha_fin}
                        </p>
                        <p className="text-sm text-slate-500 mt-1">
                            Congelamientos usados: {membresia_actual.congelamientos_usados} / {membresia_actual.plan?.congelamientos_permitidos}
                        </p>
                    </div>
                ) : (
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 text-center">
                        <p className="text-slate-400 text-sm">Aún no tienes una membresía activa. Acércate a recepción para adquirir una.</p>
                    </div>
                )}

                {/* Historial */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-lg font-black text-secondary flex items-center gap-2 mb-4 border-b border-slate-100 pb-2 uppercase">
                        Historial de Membresías
                    </h3>

                    {historial.length === 0 ? (
                        <p className="text-slate-400 text-sm">Aún no tienes membresías registradas.</p>
                    ) : (
                        <div className="space-y-3">
                            {historial.map(m => (
                                <div key={m.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                                    <div>
                                        <p className="font-bold text-slate-700 text-sm">{m.plan?.nombre}</p>
                                        <p className="text-xs text-slate-500">{m.fecha_inicio || 'Sin definir'} → {m.fecha_fin || 'Sin definir'}</p>
                                    </div>
                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${ESTADO_BADGES[m.estado]}`}>
                                        {ESTADO_LABEL[m.estado]}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default MiPerfil;