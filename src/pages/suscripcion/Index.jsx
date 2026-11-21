import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useIndex } from 'hooks/suscripcion/useIndex';

import Table from 'components/Shared/Tables/Table';
import PageHeader from 'components/Shared/Headers/PageHeader';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import ConfirmModal from 'components/Shared/Modals/ConfirmModal';

import { RocketLaunchIcon, PencilSquareIcon, BuildingOffice2Icon } from '@heroicons/react/24/outline';

const limite = (v) => (v === null || v === undefined ? 'Ilimitado' : v);

const Index = () => {
    const {
        loading, planes, paginationInfo, filters, alert, setAlert,
        showConfirm, setShowConfirm, setIdToToggle,
        fetchPlanes, handleAskToggle, handleConfirmToggle,
        handleFilterChange, handleFilterSubmit, handleFilterClear
    } = useIndex();

    const filterConfig = useMemo(() => [
        { name: 'search', type: 'text', label: 'Buscar por nombre', placeholder: 'Ej: PRO', colSpan: 'col-span-12 md:col-span-6' },
        { name: 'estado', type: 'select', label: 'Estado', colSpan: 'col-span-12 md:col-span-4',
            options: [{ value: '', label: 'Todos' }, { value: '1', label: 'Activos' }, { value: '0', label: 'Inactivos' }] }
    ], []);

    const columns = useMemo(() => [
        {
            header: 'Plan',
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full border bg-primary-light border-primary/30">
                        <RocketLaunchIcon className="w-6 h-6 text-secondary" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-slate-800 text-sm">{row.nombre}</span>
                        <span className="text-xs text-slate-500 truncate max-w-[240px]">{row.descripcion || 'Sin descripción'}</span>
                    </div>
                </div>
            )
        },
        {
            header: 'Precio / mes',
            render: (row) => <span className="text-sm font-black text-secondary">S/ {Number(row.precio_mensual).toFixed(2)}</span>
        },
        {
            header: 'Límites',
            render: (row) => (
                <div className="text-xs text-slate-600 leading-5">
                    <div><b>{limite(row.max_sucursales)}</b> sucursales · <b>{limite(row.max_cajas_por_sucursal)}</b> cajas c/u</div>
                    <div><b>{limite(row.max_clientes)}</b> clientes</div>
                    <div><b>{limite(row.max_empleados)}</b> empleados · <b>{limite(row.max_productos)}</b> productos</div>
                </div>
            )
        },
        {
            header: 'Empresas',
            render: (row) => (
                <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
                    <BuildingOffice2Icon className="w-4 h-4 text-slate-400" /> {row.empresas_count}
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
                    {row.estado ? 'Activo' : 'Inactivo'}
                </button>
            )
        },
        {
            header: 'Acciones',
            render: (row) => (
                <Link to={`/suscripcion/editar/${row.id}`}
                    className="inline-flex p-2 text-slate-500 hover:text-secondary hover:bg-primary-light rounded-lg transition-all">
                    <PencilSquareIcon className="w-5 h-5" />
                </Link>
            )
        }
    ], [handleAskToggle]);

    return (
        <div className="container mx-auto p-6">
            <PageHeader
                title="Planes del Sistema"
                subtitle="Lo que cada gimnasio contrata: precio y límites"
                icon={RocketLaunchIcon}
                buttonText="+ Nuevo Plan"
                buttonLink="/suscripcion/agregar"
            />

            <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />

            <Table
                columns={columns} data={planes} loading={loading}
                filterConfig={filterConfig} filters={filters}
                onFilterChange={handleFilterChange}
                onFilterSubmit={handleFilterSubmit}
                onFilterClear={handleFilterClear}
                pagination={{ ...paginationInfo, onPageChange: fetchPlanes }}
            />

            {showConfirm && (
                <ConfirmModal
                    message="¿Cambiar el estado de este plan? Un plan inactivo no se puede asignar a nuevas empresas (las que ya lo tienen lo conservan)."
                    confirmText="Sí, cambiar" cancelText="Cancelar"
                    onConfirm={handleConfirmToggle}
                    onCancel={() => { setShowConfirm(false); setIdToToggle(null); }}
                />
            )}
        </div>
    );
};

export default Index;
