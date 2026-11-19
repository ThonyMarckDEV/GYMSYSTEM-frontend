import React, { useState } from 'react';
import Pagination, { PorPaginaSelect } from '../Pagination';
import { porPagina, setPorPagina } from 'utilities/Paginacion/porPagina';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

const Table = ({ 
    columns, 
    data, 
    loading = false, 
    pagination = null, 
    filterConfig = [], 
    filters = {},       
    onFilterChange,    
    onFilterSubmit,    
    onFilterClear,     
    searchPlaceholder = "Buscar..."
}) => {

    // Filas por página: se recuerda por tabla (pagination.clave) y recarga desde la página 1
    const [filasPorPagina, setFilasPorPagina] = useState(() => porPagina(pagination?.clave));
    const cambiarPorPagina = (n) => {
        setPorPagina(pagination.clave, n);
        setFilasPorPagina(n);
        pagination.onPageChange(1);
    };
    const total = pagination?.total ?? data.length ?? 0;
    const pagina = pagination?.currentPage || 1;
    const desde = total === 0 ? 0 : (pagina - 1) * filasPorPagina + 1;
    const hasta = Math.min(pagina * filasPorPagina, total);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            onFilterSubmit();
        }
    };

    const renderFilterInput = (config) => {
        const baseClass = "block w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary disabled:bg-gray-50 transition-all";

        if (config.type === 'custom' || config.render) {
            return config.render ? config.render() : null;
        }

        switch (config.type) {
            case 'select':
                return (
                    <select
                        name={config.name}
                        value={filters[config.name] || ''}
                        onChange={(e) => onFilterChange(config.name, e.target.value)}
                        disabled={loading}
                        className={`${baseClass} bg-white cursor-pointer h-[38px]`}
                    >
                        {config.options.map((opt) => (
                            <option key={opt.value} value={opt.value} className="text-secondary">
                                {opt.label}
                            </option>
                        ))}
                    </select>
                );
            case 'date':
                return (
                    <input
                        type="date"
                        name={config.name}
                        value={filters[config.name] || ''}
                        onChange={(e) => onFilterChange(config.name, e.target.value)}
                        disabled={loading}
                        className={`${baseClass} h-[38px]`}
                    />
                );
            case 'text':
            default:
                return (
                    <div className="relative w-full">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon className="h-4 w-4 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            name={config.name}
                            placeholder={config.placeholder || searchPlaceholder}
                            className={`${baseClass} pl-10 h-[38px]`}
                            value={filters[config.name] || ''}
                            onChange={(e) => onFilterChange(config.name, e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={loading}
                        />
                    </div>
                );
        }
    };

    return (
        <div className="w-full flex flex-col gap-4">
            
            {/* --- SECCIÓN DE FILTROS --- */}
            {filterConfig.length > 0 && (
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-card">
                    <div className="grid grid-cols-12 gap-3 md:gap-4 items-end">
                        {filterConfig.map((config, index) => (
                            <div key={index} className={config.colSpan || "col-span-12 md:col-span-3"}>
                                {config.label && config.type !== 'custom' && (
                                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                                        {config.label}
                                    </label>
                                )}
                                {renderFilterInput(config)}
                            </div>
                        ))}
                        <div className="col-span-12 md:col-span-2 flex gap-2">
                            <button
                                onClick={onFilterSubmit}
                                disabled={loading}
                                className="flex-1 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-black/80 transition-colors text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2 h-[38px]"
                            >
                                <MagnifyingGlassIcon className="h-4 w-4" />
                                Buscar
                            </button>

                            <button
                                type="button"
                                onClick={onFilterClear}
                                disabled={loading}
                                className="px-2.5 py-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-300 bg-white transition-all h-[38px]"
                                title="Limpiar filtros"
                                aria-label="Limpiar filtros"
                            >
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- TABLA RESPONSIVA (CARDS EN MÓVIL) --- */}
            <div className={`transition-opacity duration-300 md:bg-white md:border md:border-slate-200 md:rounded-xl md:shadow-card md:overflow-x-auto ${loading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                <table className="min-w-full w-full block md:table">

                    <thead className="hidden md:table-header-group bg-slate-50 border-b border-slate-200">
                        <tr>
                            {columns.map((col, index) => (
                                <th key={index} className="px-5 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody className="block md:table-row-group md:divide-y md:divide-slate-100 bg-transparent md:bg-white">
                        {data.length > 0 ? (
                            data.map((row, rowIndex) => (
                                <tr
                                    key={row.id || rowIndex}
                                    className="block md:table-row mb-3 md:mb-0 border border-slate-200 md:border-none rounded-xl md:rounded-none shadow-card md:shadow-none bg-white md:hover:bg-slate-50 transition-colors"
                                >
                                    {columns.map((col, colIndex) => (
                                        <td
                                            key={`${rowIndex}-${colIndex}`}
                                            className="flex md:table-cell justify-between items-center gap-3 px-4 py-3 md:px-5 md:py-3.5 text-sm text-slate-700 border-b border-slate-100 last:border-b-0 md:border-b-0 align-middle"
                                        >
                                            <span className="font-medium text-slate-400 text-xs md:hidden flex-shrink-0">
                                                {col.header}
                                            </span>

                                            <span className="text-right md:text-left truncate max-w-[70%] md:max-w-none">
                                                {col.render ? col.render(row) : row[col.accessor]}
                                            </span>
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr className="block md:table-row bg-white rounded-xl border border-slate-200 md:border-none p-4 md:p-0">
                                <td colSpan={columns.length} className="block md:table-cell px-6 py-14 text-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center">
                                            <MagnifyingGlassIcon className="w-5 h-5 text-slate-400" />
                                        </div>
                                        <span className="text-sm font-medium text-slate-700">Sin resultados</span>
                                        <span className="text-xs text-slate-400">Prueba con otros filtros o crea un registro nuevo.</span>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* --- PIE: FILAS POR PÁGINA, RANGO MOSTRADO Y PÁGINAS --- */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-3 mt-1">
                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
                    {pagination?.clave && (
                        <PorPaginaSelect value={filasPorPagina} onChange={cambiarPorPagina} disabled={loading} />
                    )}
                    <p className="text-xs text-slate-500">
                        {pagination?.clave && total > 0
                            ? <>Mostrando <b className="font-semibold text-slate-700 tabular-nums">{desde}–{hasta}</b> de <b className="font-semibold text-slate-700 tabular-nums">{total}</b></>
                            : <><b className="font-semibold text-slate-700 tabular-nums">{total}</b> {total === 1 ? 'registro' : 'registros'}</>}
                    </p>
                </div>

                {pagination && (
                    <Pagination
                        currentPage={pagination.currentPage}
                        totalPages={pagination.totalPages}
                        onPageChange={pagination.onPageChange}
                        disabled={loading}
                    />
                )}
            </div>

        </div>
    );
};

export default Table;