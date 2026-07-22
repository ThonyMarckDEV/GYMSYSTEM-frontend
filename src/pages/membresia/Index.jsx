import React from 'react';
import { useParams } from 'react-router-dom';
import { useIndex } from 'hooks/membresia/useIndex';
import PageHeader from 'components/Shared/Headers/PageHeader';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import LoadingScreen from 'components/Shared/LoadingScreen';
import ConfirmModal from 'components/Shared/Modals/ConfirmModal';
import CongelarModal from 'components/Shared/Modals/CongelarModal';
import AsignarMembresiaModal from 'components/Shared/Modals/AsignarMembresiaModal';
import {
    IdentificationIcon, PhoneIcon, EnvelopeIcon,
    CalendarDaysIcon, TagIcon, CreditCardIcon, ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';
import { Snowflake, PlayCircle, Ban, IdCardIcon } from 'lucide-react';

const ESTADO_BADGES = {
    pendiente: 'bg-amber-100 text-amber-700 border-amber-200',
    activa:    'bg-green-100 text-green-700 border-green-200',
    vencida:   'bg-slate-100 text-slate-600 border-slate-200',
    cancelada: 'bg-red-100 text-red-600 border-red-200',
    congelada: 'bg-blue-100 text-blue-700 border-blue-200',
    rechazada: 'bg-red-100 text-red-600 border-red-200',
};

const ESTADO_LABEL = {
    pendiente: 'Pendiente', activa: 'Activa', vencida: 'Vencida',
    cancelada: 'Cancelada', congelada: 'Congelada', rechazada: 'Rechazada',
};

const Index = () => {
    const { id } = useParams();
    const {
        loading, data, alert, setAlert, planes, descuentos,
        isAsignarOpen, setIsAsignarOpen, handleAsignar,
        isCongelarOpen, setIsCongelarOpen, handleConfirmCongelar,
        confirmAction, setConfirmAction, handleAskConfirm, handleConfirmAction,
        actionLoading,
    } = useIndex(id);

    if (loading) return <LoadingScreen />;
    if (!data) return null;

    const { cliente, membresia_actual, historial } = data;

    const puedeAsignar = !membresia_actual || membresia_actual.estado === 'vencida' || membresia_actual.estado === 'cancelada' ||
        (membresia_actual.estado === 'activa' && membresia_actual.fecha_fin);

    const confirmMensajes = {
        reanudar: '¿Reanudar esta membresía congelada?',
        cancelar: '¿Cancelar esta membresía? Esta acción no se puede deshacer.',
    };

    return (
        <div className="container mx-auto p-6">
            <PageHeader
                title="Panel de Membresía"
                icon={IdCardIcon}
                buttonText="← Volver al listado"
                buttonLink="/cliente/listar"
            />

            <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />

            <div className="max-w-5xl mx-auto space-y-4">

                {/* Barra de identificación del cliente — compacta, tipo header administrativo */}
                <div className="bg-secondary rounded-lg px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                        <p className="text-primary font-black text-lg">{cliente.nombre_completo}</p>
                        <div className="flex flex-wrap gap-4 mt-1 text-xs text-white/60">
                            <span className="flex items-center gap-1"><IdentificationIcon className="w-3.5 h-3.5"/> {cliente.dni}</span>
                            {cliente.telefonoMovil && <span className="flex items-center gap-1"><PhoneIcon className="w-3.5 h-3.5"/> {cliente.telefonoMovil}</span>}
                            {cliente.correo && <span className="flex items-center gap-1"><EnvelopeIcon className="w-3.5 h-3.5"/> {cliente.correo}</span>}
                        </div>
                    </div>
                    {puedeAsignar && (
                        <button onClick={() => setIsAsignarOpen(true)}
                            className="bg-primary text-secondary px-4 py-2 rounded-md font-black uppercase text-xs hover:bg-primary-hover transition-colors shrink-0">
                            + Asignar Membresía
                        </button>
                    )}
                </div>

                {/* Membresía actual — tabla-panel, denso */}
                {membresia_actual && (
                    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                            <h3 className="text-xs font-black text-slate-600 uppercase tracking-wide flex items-center gap-2">
                                <CreditCardIcon className="w-4 h-4" /> Membresía Vigente
                            </h3>
                            <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase border ${ESTADO_BADGES[membresia_actual.estado]}`}>
                                {ESTADO_LABEL[membresia_actual.estado]}
                            </span>
                        </div>

                        <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <p className="text-[10px] uppercase text-slate-400 font-bold">Plan</p>
                                <p className="text-sm font-bold text-secondary flex items-center gap-1"><TagIcon className="w-3.5 h-3.5"/> {membresia_actual.plan?.nombre}</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase text-slate-400 font-bold">Vigencia</p>
                                <p className="text-sm font-bold text-secondary flex items-center gap-1"><CalendarDaysIcon className="w-3.5 h-3.5"/> {membresia_actual.fecha_inicio} → {membresia_actual.fecha_fin}</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase text-slate-400 font-bold">Congelamientos</p>
                                <p className="text-sm font-bold text-secondary">{membresia_actual.congelamientos_usados} / {membresia_actual.plan?.congelamientos_permitidos}</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase text-slate-400 font-bold">Precio pagado</p>
                                <p className="text-sm font-black text-secondary">S/ {Number(membresia_actual.precio_final).toFixed(2)}</p>
                            </div>
                        </div>

                        {membresia_actual.descuento && (
                            <div className="px-5 pb-3 -mt-2">
                                <span className="text-[11px] text-green-700 font-bold bg-green-50 px-2 py-0.5 rounded">
                                    Descuento aplicado: {membresia_actual.descuento.nombre} (-S/ {Number(membresia_actual.monto_descuento).toFixed(2)})
                                </span>
                            </div>
                        )}

                        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center gap-2">
                            {membresia_actual.estado === 'activa' && (
                                <>
                                    <button onClick={() => setIsCongelarOpen(true)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-xs font-bold hover:bg-blue-100 transition-colors">
                                        <Snowflake className="w-3.5 h-3.5" /> Congelar
                                    </button>
                                    <button onClick={() => handleAskConfirm('cancelar')}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded text-xs font-bold hover:bg-red-100 transition-colors">
                                        <Ban className="w-3.5 h-3.5" /> Cancelar
                                    </button>
                                </>
                            )}
                            {membresia_actual.estado === 'congelada' && (
                                <button onClick={() => handleAskConfirm('reanudar')}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded text-xs font-bold hover:bg-green-100 transition-colors">
                                    <PlayCircle className="w-3.5 h-3.5" /> Reanudar
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Historial — tabla compacta */}
                <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                    <div className="px-5 py-3 bg-slate-50 border-b border-slate-200">
                        <h3 className="text-xs font-black text-slate-600 uppercase tracking-wide flex items-center gap-2">
                            <ClipboardDocumentListIcon className="w-4 h-4" /> Historial de Membresías
                        </h3>
                    </div>

                    {historial.length === 0 ? (
                        <p className="text-slate-400 text-sm p-5">Este cliente aún no tiene membresías registradas.</p>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-[10px] uppercase text-slate-400 font-bold border-b border-slate-100">
                                    <td className="px-5 py-2">Plan</td>
                                    <td className="px-5 py-2">Vigencia</td>
                                    <td className="px-5 py-2">Descuento</td>
                                    <td className="px-5 py-2 text-right">Precio</td>
                                    <td className="px-5 py-2 text-right">Estado</td>
                                </tr>
                            </thead>
                            <tbody>
                                {historial.map(m => (
                                    <tr key={m.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                                        <td className="px-5 py-2.5 font-bold text-slate-700">{m.plan?.nombre}</td>
                                        <td className="px-5 py-2.5 text-slate-500 text-xs">{m.fecha_inicio || 'Sin definir'} → {m.fecha_fin || 'Sin definir'}</td>
                                        <td className="px-5 py-2.5 text-green-700 text-xs font-bold">
                                            {m.descuento ? `${m.descuento.nombre} (-S/ ${Number(m.monto_descuento).toFixed(2)})` : '—'}
                                        </td>
                                        <td className="px-5 py-2.5 text-right font-bold text-secondary">S/ {Number(m.precio_final).toFixed(2)}</td>
                                        <td className="px-5 py-2.5 text-right">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border ${ESTADO_BADGES[m.estado]}`}>
                                                {ESTADO_LABEL[m.estado]}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

            </div>

            <AsignarMembresiaModal
                isOpen={isAsignarOpen}
                onClose={() => setIsAsignarOpen(false)}
                onConfirm={handleAsignar}
                planes={planes}
                descuentos={descuentos}
                loading={actionLoading}
            />

            <CongelarModal
                isOpen={isCongelarOpen}
                onClose={() => setIsCongelarOpen(false)}
                onConfirm={handleConfirmCongelar}
                loading={actionLoading}
            />

            {confirmAction && (
                <ConfirmModal
                    message={confirmMensajes[confirmAction]}
                    confirmText="Sí, continuar" cancelText="Cancelar"
                    onConfirm={handleConfirmAction}
                    onCancel={() => setConfirmAction(null)}
                />
            )}
        </div>
    );
};

export default Index;