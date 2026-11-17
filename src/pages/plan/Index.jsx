import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useIndex } from 'hooks/plan/useIndex';

import Table from 'components/Shared/Tables/Table';
import PageHeader from 'components/Shared/Headers/PageHeader';
import { useAuth } from 'context/AuthContext';
import EstadoToggle, { SinAcciones } from 'components/Shared/Tables/EstadoToggle';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import ConfirmModal from 'components/Shared/Modals/ConfirmModal';

import {
    TagIcon, PencilSquareIcon, ClockIcon,
    CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { ThermometerSnowflakeIcon } from 'lucide-react';

const Index = () => {
    const { can } = useAuth();
    const {
        loading, planes, paginationInfo, filters, alert, setAlert,
        showConfirm, setShowConfirm, setIdToToggle,
        fetchPlanes, handleAskToggle, handleConfirmToggle,
        handleFilterChange, handleFilterSubmit, handleFilterClear
    } = useIndex();

    const filterConfig = useMemo(() => [
        { name: 'search', type: 'text', label: 'Buscar por nombre', placeholder: 'Ej: Mensual, Trimestral...', colSpan: 'col-span-12 md:col-span-6' },
        { name: 'estado', type: 'select', label: 'Estado', colSpan: 'col-span-12 md:col-span-4',
            options: [{ value: '', label: 'Todos' }, { value: '1', label: 'Activos' }, { value: '0', label: 'Inactivos' }] }
    ], []);

    const columns = useMemo(() => [
        {
            header: 'Plan',
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full border bg-primary-light border-primary/30">
                        <TagIcon className="w-6 h-6 text-secondary" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-slate-800 text-sm">{row.nombre}</span>
                        <span className="text-xs text-slate-500 truncate max-w-[200px]">{row.descripcion || 'Sin descripción'}</span>
                    </div>
                </div>
            )
        },
        {
            header: 'Duración',
            render: (row) => (
                <span className="text-sm font-bold text-slate-600 flex items-center gap-1">
                    <ClockIcon className="w-4 h-4 text-slate-400"/> {row.duracion_dias} días
                </span>
            )
        },
        {
            header: 'Precio',
            render: (row) => (
                <span className="text-sm font-black text-secondary flex items-center gap-1">
                    <CurrencyDollarIcon className="w-4 h-4 text-slate-400"/> S/ {Number(row.precio).toFixed(2)}
                </span>
            )
        },
        {
            header: 'Congelamientos',
            render: (row) => (
                <span className="text-sm font-bold text-slate-600 flex items-center gap-1">
                    <ThermometerSnowflakeIcon className="w-4 h-4 text-slate-400"/> {row.congelamientos_permitidos ?? 0}
                </span>
            )
        },
       {
            header: 'Estado',
            render: (row) => (
                <EstadoToggle activo={row.estado} si="Activo" no="Inactivo" puede={can('plan.status')} onClick={() => handleAskToggle(row.id)} />
            )
        },
        {
            header: 'Acciones',
            render: (row) => !can('plan.update') ? <SinAcciones /> : (
                <div className="flex items-center gap-2">
                    <Link to={`/plan/editar/${row.id}`} title="Editar"
                        className="p-2 text-slate-500 hover:text-secondary hover:bg-primary-light rounded-lg transition-all">
                        <PencilSquareIcon className="w-5 h-5" />
                    </Link>
                </div>
            )
        }
    ], [handleAskToggle, can]);

    return (
        <div className="container mx-auto p-6">
            <PageHeader
                title="Gestión de Planes"
                icon={TagIcon}
                buttonText={can('plan.store') ? '+ Nuevo Plan' : null}
                buttonLink="/plan/agregar"
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
                    message="¿Estás seguro de cambiar el estado de este plan?"
                    confirmText="Sí, cambiar" cancelText="Cancelar"
                    onConfirm={handleConfirmToggle}
                    onCancel={() => { setShowConfirm(false); setIdToToggle(null); }}
                />
            )}
        </div>
    );
};

export default Index;