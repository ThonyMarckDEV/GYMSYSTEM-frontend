import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useIndex } from 'hooks/empresa/useIndex';
import { useAuth } from 'context/AuthContext';

import Table from 'components/Shared/Tables/Table';
import PageHeader from 'components/Shared/Headers/PageHeader';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import ConfirmModal from 'components/Shared/Modals/ConfirmModal';

import {
    BuildingOffice2Icon, PencilSquareIcon, UsersIcon,
    ArrowRightEndOnRectangleIcon, CheckCircleIcon
} from '@heroicons/react/24/outline';

const Index = () => {
    const {
        loading, empresas, paginationInfo, filters, alert, setAlert,
        showConfirm, setShowConfirm, setIdToToggle,
        fetchEmpresas, handleAskToggle, handleConfirmToggle,
        handleFilterChange, handleFilterSubmit, handleFilterClear
    } = useIndex();

    const { empresaActiva, cambiarEmpresa } = useAuth();

    const filterConfig = useMemo(() => [
        { name: 'search', type: 'text', label: 'Buscar por razón social, nombre o RUC', placeholder: 'Ej: Iron Fit, 20601234567...', colSpan: 'col-span-12 md:col-span-6' },
        { name: 'estado', type: 'select', label: 'Estado', colSpan: 'col-span-12 md:col-span-4',
            options: [{ value: '', label: 'Todos' }, { value: '1', label: 'Activas' }, { value: '0', label: 'Inactivas' }] }
    ], []);

    const columns = useMemo(() => [
        {
            header: 'Empresa',
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full border bg-primary-light border-primary/30">
                        <BuildingOffice2Icon className="w-6 h-6 text-secondary" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-slate-800 text-sm">{row.nombre_comercial}</span>
                        <span className="text-xs text-slate-500 truncate max-w-[220px]">{row.razon_social}</span>
                    </div>
                </div>
            )
        },
        {
            header: 'RUC',
            render: (row) => <span className="text-sm font-bold text-slate-600">{row.ruc}</span>
        },
        {
            header: 'Plan',
            render: (row) => (
                <div className="flex flex-col items-start gap-0.5">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-slate-900 text-white">{row.plan || 'Sin plan'}</span>
                    {row.suscripcion_vence && <span className="text-[10px] text-slate-400 font-bold">Vence: {row.suscripcion_vence}</span>}
                </div>
            )
        },
        {
            header: 'Usuarios',
            render: (row) => (
                <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
                    <UsersIcon className="w-4 h-4 text-slate-400" />
                    {row.clientes_count} clientes · {row.empleados_count} empleados
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
            render: (row) => {
                const esActiva = empresaActiva?.id === row.id;
                return (
                    <div className="flex items-center gap-2">
                        <Link to={`/empresa/editar/${row.id}`}
                            className="p-2 text-slate-500 hover:text-secondary hover:bg-primary-light rounded-lg transition-all"
                            title="Editar">
                            <PencilSquareIcon className="w-5 h-5" />
                        </Link>
                        {esActiva ? (
                            <span className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-green-700 bg-green-50 border border-green-200 rounded-lg">
                                <CheckCircleIcon className="w-4 h-4" /> Trabajando aquí
                            </span>
                        ) : (
                            <button
                                disabled={!row.estado}
                                onClick={() => cambiarEmpresa({ id: row.id, nombre_comercial: row.nombre_comercial })}
                                className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 text-white hover:bg-slate-700 rounded-lg text-xs font-bold transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                                title={row.estado ? 'Trabajar con esta empresa' : 'Empresa inactiva'}>
                                <ArrowRightEndOnRectangleIcon className="w-4 h-4" /> Entrar
                            </button>
                        )}
                    </div>
                );
            }
        }
    ], [handleAskToggle, empresaActiva, cambiarEmpresa]);

    return (
        <div className="container mx-auto p-6">
            <PageHeader
                title="Gestión de Empresas"
                icon={BuildingOffice2Icon}
                buttonText="+ Nueva Empresa"
                buttonLink="/empresa/agregar"
            />

            <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />

            <Table
                columns={columns} data={empresas} loading={loading}
                filterConfig={filterConfig} filters={filters}
                onFilterChange={handleFilterChange}
                onFilterSubmit={handleFilterSubmit}
                onFilterClear={handleFilterClear}
                pagination={{ ...paginationInfo, onPageChange: fetchEmpresas }}
            />

            {showConfirm && (
                <ConfirmModal
                    message="¿Estás seguro de cambiar el estado de esta empresa? Si la desactivas, sus usuarios no podrán ingresar al sistema."
                    confirmText="Sí, cambiar" cancelText="Cancelar"
                    onConfirm={handleConfirmToggle}
                    onCancel={() => { setShowConfirm(false); setIdToToggle(null); }}
                />
            )}
        </div>
    );
};

export default Index;
