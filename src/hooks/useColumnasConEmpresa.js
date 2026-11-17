import { useMemo } from 'react';
import { useAuth } from 'context/AuthContext';

const columnaEmpresa = {
    header: 'Empresa',
    render: (row) => (
        <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-slate-100 text-slate-600 border border-slate-200">
            {row.empresa || '—'}
        </span>
    ),
};

/**
 * Multitenant: cuando el superadmin está en modo global (sin empresa seleccionada)
 * agrega una columna "Empresa" después de la primera columna de la tabla.
 * La fila debe traer el campo `empresa` (nombre comercial) desde el backend.
 */
export const useColumnasConEmpresa = (columns) => {
    const { esSuperAdmin, empresaActiva } = useAuth();
    const mostrarEmpresa = esSuperAdmin && !empresaActiva;

    return useMemo(() => {
        if (!mostrarEmpresa || columns.length === 0) return columns;
        return [columns[0], columnaEmpresa, ...columns.slice(1)];
    }, [columns, mostrarEmpresa]);
};
