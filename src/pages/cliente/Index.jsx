import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useIndex } from 'hooks/cliente/useIndex';

import Table from 'components/Shared/Tables/Table';
import PageHeader from 'components/Shared/Headers/PageHeader';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import ConfirmModal from 'components/Shared/Modals/ConfirmModal';

import {
    UserGroupIcon, PencilSquareIcon, IdentificationIcon,
    BriefcaseIcon, EyeIcon, CalendarDaysIcon, UserIcon
} from '@heroicons/react/24/outline';

const Index = () => {
    const navigate = useNavigate();
    const {
        loading, clientes, paginationInfo, filters, alert, setAlert,
        showConfirm, setShowConfirm, setIdToToggle,
        fetchClientes, handleAskToggle, handleConfirmToggle,
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
                    <button onClick={() => navigate(`/perfil/${row.id}`)}
                        className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all" title="Ver perfil / Membresía">
                        <EyeIcon className="w-5 h-5" />
                    </button>
                    <Link to={`/cliente/editar/${row.id}`}
                        className="p-2 text-slate-500 hover:text-black hover:bg-slate-50 rounded-lg transition-all">
                        <PencilSquareIcon className="w-5 h-5" />
                    </Link>
                </div>
            )
        }
    ], [handleAskToggle, navigate]);

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
        </div>
    );
};

export default Index;