import React, { useEffect, useState } from 'react';
import { BuildingStorefrontIcon } from '@heroicons/react/24/outline';
import { combobox } from 'services/sucursalService';

/**
 * Select de sucursales activas de la empresa actual.
 * @param {string}  value        sucursal_id seleccionado ('' = ninguna)
 * @param {func}    onChange     recibe el nuevo sucursal_id ('' si se elige la opción vacía)
 * @param {string}  emptyLabel   texto de la opción vacía (ej: "Todas las sucursales")
 * @param {boolean} required     si es obligatorio elegir una
 */
const SucursalSelect = ({ value, onChange, label = 'Sucursal', emptyLabel = '-- Seleccionar sucursal --', required = false, help }) => {
    const [sucursales, setSucursales] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        combobox()
            .then(res => setSucursales(res.data || []))
            .catch(() => setSucursales([]))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
                <BuildingStorefrontIcon className="w-4 h-4 absolute left-3 top-3 text-gray-400 pointer-events-none" />
                <select
                    value={value ?? ''}
                    onChange={(e) => onChange(e.target.value)}
                    required={required}
                    disabled={loading}
                    className="w-full pl-9 p-2.5 text-sm text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none bg-white disabled:opacity-60"
                >
                    <option value="">{loading ? 'Cargando...' : emptyLabel}</option>
                    {sucursales.map(s => (
                        <option key={s.id} value={s.id}>{s.nombre}</option>
                    ))}
                </select>
            </div>
            {help && <p className="mt-1 text-[11px] text-slate-400">{help}</p>}
        </div>
    );
};

export default SucursalSelect;
