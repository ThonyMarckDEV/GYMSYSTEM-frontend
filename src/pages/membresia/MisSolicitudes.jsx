// pages/membresia/MisSolicitudes.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useMisSolicitudes } from 'hooks/membresia/useMisSolicitudes';
import PageHeader from 'components/Shared/Headers/PageHeader';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import LoadingScreen from 'components/Shared/LoadingScreen';
import { ClipboardDocumentListIcon, CalendarDaysIcon, TagIcon } from '@heroicons/react/24/outline';

const ESTADO_BADGES = {
    pendiente: 'bg-amber-100 text-amber-700 border-amber-200',
    activa:    'bg-green-100 text-green-700 border-green-200',
    vencida:   'bg-slate-100 text-slate-600 border-slate-200',
    cancelada: 'bg-red-100 text-red-600 border-red-200',
    congelada: 'bg-blue-100 text-blue-700 border-blue-200',
    rechazada: 'bg-red-100 text-red-600 border-red-200',
};

const ESTADO_LABEL = {
    pendiente: 'En revisión',
    activa:    'Activa',
    vencida:   'Vencida',
    cancelada: 'Cancelada',
    congelada: 'Congelada',
    rechazada: 'Rechazada',
};

const MisSolicitudes = () => {
    const { loading, solicitudes, alert, setAlert } = useMisSolicitudes();

    return (
        <div className="container mx-auto p-6">
            <PageHeader
                title="Mis Solicitudes"
                icon={ClipboardDocumentListIcon}
                buttonText="+ Nueva Solicitud"
                buttonLink="/membresia/solicitar"
            />

            <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />

            {loading ? (
                <LoadingScreen />
            ) : solicitudes.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                    <ClipboardDocumentListIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium mb-4">Aún no tienes solicitudes de membresía.</p>
                    <Link to="/membresia/solicitar"
                        className="inline-block bg-secondary text-primary px-6 py-2.5 rounded-lg font-black uppercase text-sm hover:bg-secondary/90 transition-colors">
                        Adquirir mi primera membresía
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {solicitudes.map((s) => (
                        <div key={s.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-2">
                                    <TagIcon className="w-5 h-5 text-primary" />
                                    <span className="font-black text-secondary">{s.plan}</span>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${ESTADO_BADGES[s.estado]}`}>
                                    {ESTADO_LABEL[s.estado]}
                                </span>
                            </div>

                            <p className="text-2xl font-black text-secondary mb-2">S/ {Number(s.precio_final).toFixed(2)}</p>

                            {s.fecha_inicio && (
                                <p className="text-xs text-slate-500 flex items-center gap-1 mb-1">
                                    <CalendarDaysIcon className="w-4 h-4" /> {s.fecha_inicio.split('T')[0]} → {s.fecha_fin?.split('T')[0]}
                                </p>
                            )}

                            {s.motivo_rechazo && (
                                <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-2 mt-2">
                                    <strong>Motivo:</strong> {s.motivo_rechazo}
                                </p>
                            )}

                            <p className="text-[10px] text-slate-400 mt-3">Solicitado: {s.created_at}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MisSolicitudes;