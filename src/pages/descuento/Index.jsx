import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useIndex } from 'hooks/descuento/useIndex';

import Table from 'components/Shared/Tables/Table';
import PageHeader from 'components/Shared/Headers/PageHeader';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import ConfirmModal from 'components/Shared/Modals/ConfirmModal';

import {
    TagIcon, PencilSquareIcon, HashtagIcon,
    PercentBadgeIcon, CalendarDaysIcon
} from '@heroicons/react/24/outline';

const Index = () => {
    const {
        loading, descuentos, paginationInfo, filters, alert, setAlert,
        showConfirm, setShowConfirm, setIdToToggle,
        fetchDescuentos, handleAskToggle, handleConfirmToggle,
        handleFilterChange, handleFilterSubmit, handleFilterClear
    } = useIndex();

    const filterConfig = useMemo(() => [
        { name: 'search', type: 'text', label: 'Buscar por nombre o código', placeholder: 'Ej: Promo Verano, VERANO25...', colSpan: 'col-span-12 md:col-span-5' },
        { name: 'tipo',   type: 'select', label: 'Tipo', colSpan: 'col-span-12 md:col-span-3',
          options: [{ value: '', label: 'Todos' }, { value: 'porcentaje', label: 'Porcentaje' }, { value: 'monto_fijo', label: 'Monto Fijo' }] },
        { name: 'estado', type: 'select', label: 'Estado', colSpan: 'col-span-12 md:col-span-4',
          options: [{ value: '', label: 'Todos' }, { value: '1', label: 'Activos' }, { value: '0', label: 'Inactivos' }] }
    ], []);

    const columns = useMemo(() => [
        {
            header: 'Descuento',
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full border bg-primary-light border-primary/30">
                        <TagIcon className="w-6 h-6 text-secondary" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-slate-800 text-sm">{row.nombre}</span>
                        {row.codigo && (
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                                <HashtagIcon className="w-3 h-3"/> {row.codigo}
                            </span>
                        )}
                    </div>
                </div>
            )
        },
        {
            header: 'Valor',
            render: (row) => (
                <span className="text-sm font-black text-secondary flex items-center gap-1">
                    <PercentBadgeIcon className="w-4 h-4 text-slate-400"/>
                    {row.tipo === 'porcentaje' ? `${row.valor}%` : `S/ ${Number(row.valor).toFixed(2)}`}
                </span>
            )
        },
        {
            header: 'Vigencia',
            render: (row) => (
                <div className="flex flex-col gap-0.5 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                        <CalendarDaysIcon className="w-3.5 h-3.5"/>
                        {row.fecha_inicio ? row.fecha_inicio.split('T')[0] : 'Sin inicio'} → {row.fecha_fin ? row.fecha_fin.split('T')[0] : 'Sin fin'}
                    </span>
                    <span>Usos: {row.usos_actuales}{row.usos_maximos ? ` / ${row.usos_maximos}` : ' (ilimitado)'}</span>
                </div>
            )
        },
        {
            header: 'Estado',
            render: (row) => (
                <div className="flex flex-col gap-1 items-start">
                    <button
                        onClick={() => handleAskToggle(row.id)}
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase cursor-pointer hover:scale-105 transition-transform shadow-sm
                            ${row.estado ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-600 border border-red-200'}`}
                    >
                        {row.estado ? 'Activo' : 'Inactivo'}
                    </button>
                    {row.estado && !row.vigente && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-amber-50 text-amber-700 border border-amber-200">
                            No vigente
                        </span>
                    )}
                </div>
            )
        },
        {
            header: 'Acciones',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <Link to={`/descuento/editar/${row.id}`}
                        className="p-2 text-slate-500 hover:text-secondary hover:bg-primary-light rounded-lg transition-all">
                        <PencilSquareIcon className="w-5 h-5" />
                    </Link>
                </div>
            )
        }
    ], [handleAskToggle]);

    return (
        <div className="container mx-auto p-6">
            <PageHeader
                title="Gestión de Descuentos"
                icon={TagIcon}
                buttonText="+ Nuevo Descuento"
                buttonLink="/descuento/agregar"
            />

            <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />

            <Table
                columns={columns} data={descuentos} loading={loading}
                filterConfig={filterConfig} filters={filters}
                onFilterChange={handleFilterChange}
                onFilterSubmit={handleFilterSubmit}
                onFilterClear={handleFilterClear}
                pagination={{ ...paginationInfo, onPageChange: fetchDescuentos }}
            />

            {showConfirm && (
                <ConfirmModal
                    message="¿Estás seguro de cambiar el estado de este descuento?"
                    confirmText="Sí, cambiar" cancelText="Cancelar"
                    onConfirm={handleConfirmToggle}
                    onCancel={() => { setShowConfirm(false); setIdToToggle(null); }}
                />
            )}
        </div>
    );
};

export default Index;