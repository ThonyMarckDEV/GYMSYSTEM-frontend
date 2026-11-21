import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { OPCIONES_POR_PAGINA } from 'utilities/Paginacion/porPagina';

const DOTS = '...';

const getPaginationRange = ({ totalPages, currentPage, siblingCount = 1 }) => {
  const range = (start, end) => Array.from({ length: end - start + 1 }, (_, idx) => idx + start);

  const totalPageNumbers = siblingCount + 5;
  if (totalPages <= totalPageNumbers) return range(1, totalPages);

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);
  const shouldShowLeftDots = leftSiblingIndex > 2;
  const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

  if (!shouldShowLeftDots && shouldShowRightDots) {
    return [...range(1, 3 + 2 * siblingCount), DOTS, totalPages];
  }
  if (shouldShowLeftDots && !shouldShowRightDots) {
    const rightItemCount = 3 + 2 * siblingCount;
    return [1, DOTS, ...range(totalPages - rightItemCount + 1, totalPages)];
  }
  if (shouldShowLeftDots && shouldShowRightDots) {
    return [1, DOTS, ...range(leftSiblingIndex, rightSiblingIndex), DOTS, totalPages];
  }
  return range(1, totalPages);
};

const btnBase = 'h-9 min-w-[36px] px-2.5 text-xs md:text-sm font-medium rounded-lg border transition-colors disabled:opacity-40 disabled:cursor-not-allowed';

/** Selector de filas por página (5, 10, 15, 20, 25, 50, 100). */
export const PorPaginaSelect = ({ value, onChange, disabled = false }) => (
  <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-500">
    Mostrar
    <select value={value} onChange={(e) => onChange(Number(e.target.value))} disabled={disabled}
      className="h-9 px-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none cursor-pointer"
      aria-label="Filas por página">
      {OPCIONES_POR_PAGINA.map(n => <option key={n} value={n}>{n}</option>)}
    </select>
    por página
  </label>
);

/** Botones de página (solo si hay más de una). */
const Pagination = ({ currentPage, totalPages, onPageChange, disabled = false }) => {
  if (!totalPages || totalPages <= 1) return null;
  const paginationRange = getPaginationRange({ currentPage, totalPages });

  return (
    <nav className="flex flex-wrap justify-center items-center gap-1.5" aria-label="Paginación">
      <button type="button" onClick={() => onPageChange(currentPage - 1)} disabled={disabled || currentPage === 1}
        className={`${btnBase} bg-white text-slate-600 border-slate-200 hover:bg-slate-50`} aria-label="Página anterior">
        <ChevronLeftIcon className="w-4 h-4 mx-auto" />
      </button>

      {paginationRange.map((pageNumber, index) => pageNumber === DOTS ? (
        <span key={`dots-${index}`} className="px-1 text-sm font-medium text-slate-400">…</span>
      ) : (
        <button type="button" key={pageNumber} onClick={() => onPageChange(pageNumber)} disabled={disabled}
          aria-current={currentPage === pageNumber ? 'page' : undefined}
          className={`${btnBase} ${currentPage === pageNumber
            ? 'bg-secondary text-white border-secondary font-semibold'
            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'}`}>
          {pageNumber}
        </button>
      ))}

      <button type="button" onClick={() => onPageChange(currentPage + 1)} disabled={disabled || currentPage === totalPages}
        className={`${btnBase} bg-white text-slate-600 border-slate-200 hover:bg-slate-50`} aria-label="Página siguiente">
        <ChevronRightIcon className="w-4 h-4 mx-auto" />
      </button>
    </nav>
  );
};

export default Pagination;
