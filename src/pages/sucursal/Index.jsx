import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useIndex } from 'hooks/sucursal/useIndex';
import { useColumnasConEmpresa } from 'hooks/useColumnasConEmpresa';

import Table from 'components/Shared/Tables/Table';
import PageHeader from 'components/Shared/Headers/PageHeader';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import ConfirmModal from 'components/Shared/Modals/ConfirmModal';

import { BuildingStorefrontIcon, PencilSquareIcon, MapPinIcon, UsersIcon } from '@heroicons/react/24/outline';

const Index = () => {
    const {
        loading, sucursales, paginationInfo, filters, alert, setAlert,
        showConfirm, setShowConfirm, setIdToToggle,
        fetchSucursales, handleAskToggle, handleConfirmToggle,
        handleFilterChange, handleFilterSubmit, handleFilterClear
    } = useIndex();

    const filterConfig = useMemo(() => [
        { name: 'search', type: 'text', label: 'Buscar por nombre o dirección', placeholder: 'Ej: Miraflores...', colSpan: 'col-span-12 md:col-span-6' },
        { name: 'estado', type: 'select', label: 'Estado', colSpan: 'col-span-12 md:col-span-4',
            options: [{ value: '', label: 'Todos' }, { value: '1', label: 'Activas' }, { value: '0', label: 'Inactivas' }] }
    ], []);

    const columns = useMemo(() => [
        {
            header: 'Sucursal',
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full border bg-primary-light border-primary/30">
                        <BuildingStorefrontIcon className="w-6 h-6 text-secondary" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-slate-800 text-sm">{row.nombre}</span>
                        <span className="text-xs text-slate-500 flex items-center gap-1 truncate max-w-[240px]">
                            <MapPinIcon className="w-3 h-3" /> {row.direccion || 'Sin dirección'}
                        </span>
                    </div>
                </div>
            )
        },
        {
            header: 'Teléfono',
            render: (row) => <span className="text-sm text-slate-600">{row.telefono || '—'}</span>
        },
        {
            header: 'Personal',
            render: (row) => (
                <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
                    <UsersIcon className="w-4 h-4 text-slate-400" /> {row.usuarios_count} asignados
                </span>
            )
        },
        {
            header: 'Estado',
            render: (row) => (
                <button
                    onClick={() => handleAskToggle(row.id)}
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase cursor-pointer hover:scale-105 transition-transform shadow-sm
                        ${row.estado ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-600 border border-red-200'}`}
                >
                    {row.estado ? 'Activa' : 'Inactiva'}
                </button>
            )
        },
        {
            header: 'Acciones',
            render: (row) => (
                <Link to={`/sucursal/editar/${row.id}`}
                    className="inline-flex p-2 text-slate-500 hover:text-secondary hover:bg-primary-light rounded-lg transition-all">
                    <PencilSquareIcon className="w-5 h-5" />
                </Link>
            )
        }
    ], [handleAskToggle]);

    // Multitenant: columna Empresa para el superadmin en modo global
    const columnasTabla = useColumnasConEmpresa(columns);

    return (
        <div className="container mx-auto p-6">
            <PageHeader
                title="Gestión de Sucursales"
                icon={BuildingStorefrontIcon}
                buttonText="+ Nueva Sucursal"
                buttonLink="/sucursal/agregar"
            />

            <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />

            <Table
                columns={columnasTabla} data={sucursales} loading={loading}
                filterConfig={filterConfig} filters={filters}
                onFilterChange={handleFilterChange}
                onFilterSubmit={handleFilterSubmit}
                onFilterClear={handleFilterClear}
                pagination={{ ...paginationInfo, onPageChange: fetchSucursales }}
            />

            {showConfirm && (
                <ConfirmModal
                    message="¿Estás seguro de cambiar el estado de esta sucursal? Si la desactivas, no se podrán registrar ventas en ella."
                    confirmText="Sí, cambiar" cancelText="Cancelar"
                    onConfirm={handleConfirmToggle}
                    onCancel={() => { setShowConfirm(false); setIdToToggle(null); }}
                />
            )}
        </div>
    );
};

export default Index;
