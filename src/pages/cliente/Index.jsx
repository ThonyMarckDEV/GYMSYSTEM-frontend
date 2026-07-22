import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useIndex } from 'hooks/cliente/useIndex';

import Table from 'components/Shared/Tables/Table';
import PageHeader from 'components/Shared/Headers/PageHeader';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import ConfirmModal from 'components/Shared/Modals/ConfirmModal';
import ViewModal from 'components/Shared/Modals/ViewModal';

import {
    UserGroupIcon, PencilSquareIcon, IdentificationIcon,
    BriefcaseIcon, EyeIcon, PhoneIcon,
    CalendarDaysIcon, UserIcon, EnvelopeIcon
} from '@heroicons/react/24/outline';

const Index = () => {
    const {
        loading, clientes, paginationInfo, filters, alert, setAlert,
        isViewOpen, setIsViewOpen, viewData, viewLoading,
        showConfirm, setShowConfirm, setIdToToggle,
        fetchClientes, handleView, handleAskToggle, handleConfirmToggle,
        handleFilterChange, handleFilterSubmit, handleFilterClear
    } = useIndex();

    const filterConfig = useMemo(() => [
        { name: 'search', type: 'text', label: 'Buscar (Nombre/DNI)', placeholder: 'Ej: Juan, 12345678...', colSpan: 'col-span-12 md:col-span-8' },
        { name: 'estado', type: 'select', label: 'Estado', colSpan: 'col-span-12 md:col-span-4',
          options: [{ value: '', label: 'Todos' }, { value: '1', label: 'Activos' }, { value: '0', label: 'Inactivos' }] }
    ], []);

    const columns = useMemo(() => [
        {
            header: 'Cliente',
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full border bg-slate-100 border-slate-200">
                        <UserIcon className="w-6 h-6 text-slate-600" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-slate-800 text-sm">{row.nombre_completo}</span>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                            <BriefcaseIcon className="w-3 h-3"/> {row.usuario || 'Sin usuario'}
                        </span>
                    </div>
                </div>
            )
        },
        {
            header: 'DNI',
            render: (row) => (
                <span className="text-sm font-bold text-slate-600 flex items-center gap-1">
                    <IdentificationIcon className="w-4 h-4 text-slate-400"/>
                    {row.dni || 'S/N'}
                </span>
            )
        },
        {
            header: 'Registro',
            render: (row) => (
                <span className="text-xs text-slate-500 flex items-center gap-1">
                    <CalendarDaysIcon className="w-4 h-4"/> {row.created_at?.split(' ')[0]}
                </span>
            )
        },
        {
            header: 'Acceso Sistema',
            render: (row) => (
                <button
                    onClick={() => handleAskToggle(row.id)}
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase cursor-pointer hover:scale-105 transition-transform shadow-sm
                        ${row.estado ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-600 border border-red-200'}`}
                >
                    {row.estado ? 'Activo' : 'Bloqueado'}
                </button>
            )
        },
        {
            header: 'Acciones',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <button onClick={() => handleView(row.id)}
                        className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all">
                        <EyeIcon className="w-5 h-5" />
                    </button>
                    <Link to={`/cliente/editar/${row.id}`}
                        className="p-2 text-slate-500 hover:text-black hover:bg-slate-50 rounded-lg transition-all">
                        <PencilSquareIcon className="w-5 h-5" />
                    </Link>
                </div>
            )
        }
    ], [handleAskToggle, handleView]);

    return (
        <div className="container mx-auto p-6">
            <PageHeader
                title="Gestión de Clientes"
                icon={UserGroupIcon}
                buttonText="+ Nuevo Cliente"
                buttonLink="/cliente/agregar"
            />

            <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />

            <Table
                columns={columns} data={clientes} loading={loading}
                filterConfig={filterConfig} filters={filters}
                onFilterChange={handleFilterChange}
                onFilterSubmit={handleFilterSubmit}
                onFilterClear={handleFilterClear}
                pagination={{ ...paginationInfo, onPageChange: fetchClientes }}
            />

            {showConfirm && (
                <ConfirmModal
                    message="¿Estás seguro de cambiar el acceso al sistema de este cliente?"
                    confirmText="Sí, cambiar" cancelText="Cancelar"
                    onConfirm={handleConfirmToggle}
                    onCancel={() => { setShowConfirm(false); setIdToToggle(null); }}
                />
            )}

            <ViewModal isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Ficha del Cliente" isLoading={viewLoading}>
                {viewData && (
                    <div className="space-y-6">
                        <div className="flex flex-col md:flex-row gap-6 border-b border-gray-100 pb-6">
                            <div className="w-16 h-16 rounded-full flex items-center justify-center border shrink-0 bg-slate-100 border-slate-200">
                                <UserGroupIcon className="w-8 h-8 text-slate-400"/>
                            </div>
                            <div className="flex-1">
                                <p className="text-gray-800 font-black text-xl leading-tight">
                                    {viewData.nombre} {viewData.apellidoPaterno} {viewData.apellidoMaterno}
                                </p>
                                <div className="flex flex-wrap gap-3 mt-3">
                                    <span className="flex items-center gap-1 text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                                        <IdentificationIcon className="w-4 h-4 text-gray-400"/>
                                        DNI: {viewData.dni}
                                    </span>
                                    {viewData.contacto?.telefonoMovil && (
                                        <span className="flex items-center gap-1 text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                                            <PhoneIcon className="w-4 h-4 text-gray-400"/> {viewData.contacto.telefonoMovil}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                            <div>
                                <h4 className="text-xs font-bold text-gray-400 uppercase mb-1">Fecha Nacimiento</h4>
                                <div className="flex items-center gap-2 text-gray-800 font-medium">
                                    <CalendarDaysIcon className="w-4 h-4 text-gray-400"/> {viewData.fechaNacimiento}
                                </div>
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-gray-400 uppercase mb-1">Sexo</h4>
                                <p className="text-gray-800 font-medium">{viewData.sexo}</p>
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-gray-400 uppercase mb-1">Correo</h4>
                                <div className="flex items-center gap-2 text-gray-800 font-medium">
                                    <EnvelopeIcon className="w-4 h-4 text-gray-400"/> {viewData.contacto?.correo || 'No registrado'}
                                </div>
                            </div>
                        </div>

                        {viewData.usuario && (
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mt-2">
                                <div className="flex justify-between items-start mb-3">
                                    <h4 className="text-sm font-black text-slate-700 uppercase flex items-center gap-2">
                                        <BriefcaseIcon className="w-4 h-4"/> Credenciales del Sistema
                                    </h4>
                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                                        viewData.usuario.estado ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                                    }`}>
                                        {viewData.usuario.estado ? 'Cuenta Activa' : 'Cuenta Bloqueada'}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 mb-0.5">Usuario (Login)</p>
                                    <p className="font-bold text-slate-800">{viewData.usuario.username}</p>
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