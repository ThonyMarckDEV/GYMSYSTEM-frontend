import React, { useEffect, useState } from 'react';
import { BuildingOffice2Icon, BuildingStorefrontIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import { combobox } from 'services/sucursalService';
import { useAuth } from 'context/AuthContext';

/**
 * Sidebar: empresa y sede con la que se trabaja. El menú lateral MANDA:
 * las pantallas no tienen filtro de sede propio, muestran la sede elegida aquí.
 * - Personal sin sede fija (superadmin, admin): elige todas las sedes o una.
 * - Usuario con sede asignada: ve su sede (no la puede cambiar).
 * - Cliente: no elige sede (siempre ve todo lo suyo).
 */
const SucursalSelector = ({ isCollapsed }) => {
    const { role, empresa, sucursal, sedeFija, sucursalActiva, cambiarSucursal } = useAuth();
    const [sucursales, setSucursales] = useState([]);
    const esCliente = role === 'cliente';
    const eligeSede = !esCliente && !sedeFija;

    useEffect(() => {
        if (!eligeSede) return;
        combobox()
            .then(res => setSucursales(res.data || []))
            .catch(() => setSucursales([]));
    }, [eligeSede]);

    const handleChange = (e) => {
        const id = Number(e.target.value);
        cambiarSucursal(sucursales.find(s => s.id === id) || null);
    };

    const Icon = eligeSede && !sucursalActiva ? GlobeAltIcon : BuildingStorefrontIcon;
    const titulo = sucursal?.nombre || 'Todas las sucursales';

    if (isCollapsed) {
        return (
            <div className="hidden md:flex justify-center py-3 border-b border-white/5" title={titulo}>
                <Icon className="w-5 h-5 text-zinc-400" />
            </div>
        );
    }

    return (
        <div className="px-4 py-3 border-b border-white/5">
            {empresa && (
                <div className="flex items-center gap-2 text-sm font-semibold text-white truncate mb-1">
                    <BuildingOffice2Icon className="w-4 h-4 flex-shrink-0 text-zinc-500" />
                    <span className="truncate">{empresa.nombre_comercial}</span>
                </div>
            )}

            {eligeSede ? (
                <>
                    <div className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-1.5 mt-2">Sucursal</div>
                    <div className="relative">
                        <Icon className="w-4 h-4 absolute left-2.5 top-2.5 text-zinc-400 pointer-events-none" />
                        <select
                            value={sucursalActiva?.id || ''}
                            onChange={handleChange}
                            className="w-full pl-8 pr-2 py-2 text-sm font-semibold rounded-lg bg-white/5 text-zinc-100 border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer [&>option]:text-slate-900"
                        >
                            <option value="">Todas las sedes</option>
                            {sucursales.map(s => (
                                <option key={s.id} value={s.id}>{s.nombre}</option>
                            ))}
                            {/* La sucursal activa podría estar inactiva y no venir en el combobox */}
                            {sucursalActiva && !sucursales.some(s => s.id === sucursalActiva.id) && (
                                <option value={sucursalActiva.id}>{sucursalActiva.nombre}</option>
                            )}
                        </select>
                    </div>
                </>
            ) : sedeFija && sucursal ? (
                <div className="flex items-center gap-2 text-xs text-zinc-400 truncate">
                    <BuildingStorefrontIcon className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">Sede: {sucursal.nombre}</span>
                </div>
            ) : null}
        </div>
    );
};

export default SucursalSelector;
