// pages/membresia/Index.jsx
import React, { useMemo } from 'react';
import { useIndex } from 'hooks/membresia/useIndex';

import Table from 'components/Shared/Tables/Table';
import PageHeader from 'components/Shared/Headers/PageHeader';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import ConfirmModal from 'components/Shared/Modals/ConfirmModal';
import ViewModal from 'components/Shared/Modals/ViewModal';
import RechazarModal from 'components/Shared/Modals/RechazarModal';
import CongelarModal from 'components/Shared/Modals/CongelarModal';

import {
    CreditCardIcon, EyeIcon, CalendarDaysIcon,
    CheckCircleIcon, XCircleIcon, UserIcon, TagIcon,
    BanknotesIcon, PhotoIcon
} from '@heroicons/react/24/outline';
import { Snowflake, PlayCircle, Ban } from 'lucide-react';

const ESTADO_BADGES = {
    pendiente: 'bg-amber-100 text-amber-700 border-amber-200',
    activa:    'bg-green-100 text-green-700 border-green-200',
    vencida:   'bg-slate-100 text-slate-600 border-slate-200',
    cancelada: 'bg-red-100 text-red-600 border-red-200',
    congelada: 'bg-blue-100 text-blue-700 border-blue-200',
    rechazada: 'bg-red-100 text-red-600 border-red-200',
};

const ESTADO_LABEL = {
    pendiente: 'Pendiente',
    activa:    'Activa',
    vencida:   'Vencida',
    cancelada: 'Cancelada',
    congelada: 'Congelada',
    rechazada: 'Rechazada',
};

const Index = () => {
    const {
        loading, membresias, paginationInfo, filters, alert, setAlert,
        isViewOpen, setIsViewOpen, viewData, viewLoading, handleView,
        isRechazarOpen, setIsRechazarOpen, handleAskRechazar, handleConfirmRechazar,
        isCongelarOpen, setIsCongelarOpen, handleAskCongelar, handleConfirmCongelar,
        confirmAction, setConfirmAction, handleAskConfirm, handleConfirmAction,
        actionLoading,
        fetchMembresias, handleFilterChange, handleFilterSubmit, handleFilterClear
    } = useIndex();

    const filterConfig = useMemo(() => [
        { name: 'search', type: 'text', label: 'Buscar cliente', placeholder: 'Nombre, DNI, RUC...', colSpan: 'col-span-12 md:col-span-6' },
        { name: 'estado', type: 'select', label: 'Estado', colSpan: 'col-span-12 md:col-span-6',
          options: [
              { value: '', label: 'Todos' },
              { value: 'pendiente', label: 'Pendientes' },
              { value: 'activa', label: 'Activas' },
              { value: 'vencida', label: 'Vencidas' },
              { value: 'congelada', label: 'Congeladas' },
              { value: 'cancelada', label: 'Canceladas' },
              { value: 'rechazada', label: 'Rechazadas' },
          ] }
    ], []);

    const columns = useMemo(() => [
        {
            header: 'Cliente',
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full border bg-primary-light border-primary/30">
                        <UserIcon className="w-5 h-5 text-secondary" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-slate-800 text-sm">{row.cliente}</span>
                        <span className="text-xs text-slate-500">{row.documento || 'S/N'}</span>
                    </div>
                </div>
            )
        },
        {
            header: 'Plan',
            render: (row) => (
                <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-bold text-slate-700 flex items-center gap-1">
                        <TagIcon className="w-4 h-4 text-slate-400"/> {row.plan}
                    </span>
                    <span className="text-xs text-slate-500">
                        S/ {Number(row.precio_final).toFixed(2)} {row.descuento && `(desc: ${row.descuento})`}
                    </span>
                </div>
            )
        },
        {
            header: 'Vigencia',
            render: (row) => (
                <span className="text-xs text-slate-500 flex items-center gap-1">
                    <CalendarDaysIcon className="w-4 h-4"/>
                    {row.fecha_inicio ? `${row.fecha_inicio.split('T')[0]} → ${row.fecha_fin?.split('T')[0]}` : 'Por definir'}
                </span>
            )
        },
        {
            header: 'Estado',
            render: (row) => (
                <div className="flex flex-col gap-1 items-start">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${ESTADO_BADGES[row.estado]}`}>
                        {ESTADO_LABEL[row.estado]}
                    </span>
                    {row.vencida && row.estado === 'activa' && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-amber-50 text-amber-700 border border-amber-200">
                            Por vencer/vencida
                        </span>
                    )}
                </div>
            )
        },
        {
            header: 'Acciones',
            render: (row) => (
                <div className="flex items-center gap-1.5 flex-wrap">
                    <button onClick={() => handleView(row.id)}
                        className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all" title="Ver detalle">
                        <EyeIcon className="w-5 h-5" />
                    </button>

                    {row.estado === 'pendiente' && (
                        <>
                            <button onClick={() => handleAskConfirm('aprobar', row.id)}
                                className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-all" title="Aprobar">
                                <CheckCircleIcon className="w-5 h-5" />
                            </button>
                            <button onClick={() => handleAskRechazar(row.id)}
                                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all" title="Rechazar">
                                <XCircleIcon className="w-5 h-5" />
                            </button>
                        </>
                    )}

                    {row.estado === 'activa' && (
                        <>
                            <button onClick={() => handleAskCongelar(row.id)}
                                className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all" title="Congelar">
                                <Snowflake className="w-5 h-5" />
                            </button>
                            <button onClick={() => handleAskConfirm('cancelar', row.id)}
                                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all" title="Cancelar">
                                <Ban className="w-5 h-5" />
                            </button>
                        </>
                    )}

                    {row.estado === 'congelada' && (
                        <button onClick={() => handleAskConfirm('reanudar', row.id)}
                            className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-all" title="Reanudar">
                            <PlayCircle className="w-5 h-5" />
                        </button>
                    )}
                </div>
            )
        }
    ], [handleView, handleAskConfirm, handleAskRechazar, handleAskCongelar]);

    const confirmMensajes = {
        aprobar:  '¿Aprobar esta solicitud? Se activará la membresía con fecha de inicio hoy.',
        reanudar: '¿Reanudar esta membresía congelada?',
        cancelar: '¿Cancelar esta membresía? Esta acción no se puede deshacer.',
    };

    return (
        <div className="container mx-auto p-6">
            <PageHeader
                title="Gestión de Membresías"
                icon={CreditCardIcon}
            />

            <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />

            <Table
                columns={columns} data={membresias} loading={loading}
                filterConfig={filterConfig} filters={filters}
                onFilterChange={handleFilterChange}
                onFilterSubmit={handleFilterSubmit}
                onFilterClear={handleFilterClear}
                pagination={{ ...paginationInfo, onPageChange: fetchMembresias }}
            />

            {confirmAction && (
                <ConfirmModal
                    message={confirmMensajes[confirmAction.type]}
                    confirmText="Sí, continuar" cancelText="Cancelar"
                    onConfirm={handleConfirmAction}
                    onCancel={() => setConfirmAction(null)}
                />
            )}

            <RechazarModal
                isOpen={isRechazarOpen}
                onClose={() => setIsRechazarOpen(false)}
                onConfirm={handleConfirmRechazar}
                loading={actionLoading}
            />

            <CongelarModal
                isOpen={isCongelarOpen}
                onClose={() => setIsCongelarOpen(false)}
                onConfirm={handleConfirmCongelar}
                loading={actionLoading}
            />

            <ViewModal isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Detalle de Membresía" isLoading={viewLoading}>
                {viewData && (
                    <div className="space-y-6">
                        <div className="flex flex-col md:flex-row gap-6 border-b border-gray-100 pb-6">
                            <div className="flex-1">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${ESTADO_BADGES[viewData.estado]}`}>
                                    {ESTADO_LABEL[viewData.estado]}
                                </span>
                                <p className="text-gray-800 font-black text-xl leading-tight mt-2">
                                    {viewData.datosCliente?.nombre_completo}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">Plan: <span className="font-bold text-secondary">{viewData.plan?.nombre}</span></p>
                                {viewData.motivo_rechazo && (
                                    <p className="text-sm text-red-600 mt-2 bg-red-50 border border-red-200 rounded-lg p-2">
                                        <strong>Motivo de rechazo:</strong> {viewData.motivo_rechazo}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                            <div>
                                <h4 className="text-xs font-bold text-gray-400 uppercase mb-1">Precio Original</h4>
                                <p className="text-gray-800 font-medium">S/ {Number(viewData.precio_original).toFixed(2)}</p>
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-gray-400 uppercase mb-1">Descuento Aplicado</h4>
                                <p className="text-gray-800 font-medium">
                                    {viewData.descuento ? `${viewData.descuento.nombre} (-S/ ${Number(viewData.monto_descuento).toFixed(2)})` : 'Sin descuento'}
                                </p>
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-gray-400 uppercase mb-1">Precio Final</h4>
                                <p className="text-secondary font-black text-lg">S/ {Number(viewData.precio_final).toFixed(2)}</p>
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-gray-400 uppercase mb-1">Vigencia</h4>
                                <p className="text-gray-800 font-medium flex items-center gap-1">
                                    <CalendarDaysIcon className="w-4 h-4 text-gray-400"/>
                                    {viewData.fecha_inicio ? `${viewData.fecha_inicio} → ${viewData.fecha_fin}` : 'Aún no definida'}
                                </p>
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-gray-400 uppercase mb-1">Congelamientos</h4>
                                <p className="text-gray-800 font-medium">
                                    {viewData.congelamientos_usados} / {viewData.plan?.congelamientos_permitidos}
                                </p>
                            </div>
                        </div>

                        {viewData.pagos?.length > 0 && (
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mt-2">
                                <h4 className="text-sm font-black text-slate-700 uppercase flex items-center gap-2 mb-3">
                                    <BanknotesIcon className="w-4 h-4"/> Comprobante de Pago
                                </h4>
                                <div className="flex flex-col md:flex-row gap-4 items-start">
                                    {viewData.pagos[0].comprobante_url ? (
                                        <a href={viewData.pagos[0].comprobante_url} target="_blank" rel="noreferrer"
                                           className="block w-40 h-40 rounded-lg overflow-hidden border-2 border-primary/30 shrink-0 hover:border-primary transition-colors">
                                            <img src={viewData.pagos[0].comprobante_url} alt="Comprobante de pago" className="w-full h-full object-cover" />
                                        </a>
                                    ) : (
                                        <div className="w-40 h-40 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 shrink-0">
                                            <PhotoIcon className="w-10 h-10" />
                                        </div>
                                    )}
                                    <div className="text-sm space-y-1">
                                        <p><span className="text-slate-500">Método:</span> <span className="font-bold text-slate-700 capitalize">{viewData.pagos[0].metodo_pago}</span></p>
                                        <p><span className="text-slate-500">N° operación:</span> <span className="font-bold text-slate-700">{viewData.pagos[0].numero_operacion || 'N/A'}</span></p>
                                        <p><span className="text-slate-500">Monto:</span> <span className="font-bold text-slate-700">S/ {Number(viewData.pagos[0].monto).toFixed(2)}</span></p>
                                        <p><span className="text-slate-500">Estado del pago:</span> <span className="font-bold text-slate-700 capitalize">{viewData.pagos[0].estado}</span></p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </ViewModal>
        </div>
    );
};

export default Index;