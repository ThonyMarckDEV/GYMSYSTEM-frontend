import React, { useEffect, useState } from 'react';
import { BuildingOffice2Icon, BuildingStorefrontIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import { combobox } from 'services/sucursalService';
import { useAuth } from 'context/AuthContext';

/**
 * Sidebar: empresa y sucursal con la que se trabaja.
 * - Superadmin: elige modo global (todas las sucursales) o una sucursal.
 * - Resto de usuarios: muestra su sede fija (o "Todas las sedes").
 */
const SucursalSelector = ({ isCollapsed }) => {
    const { esSuperAdmin, empresa, sucursal, sucursalActiva, cambiarSucursal } = useAuth();
    const [sucursales, setSucursales] = useState([]);

    useEffect(() => {
        if (!esSuperAdmin) return;
        combobox()
            .then(res => setSucursales(res.data || []))
            .catch(() => setSucursales([]));
    }, [esSuperAdmin]);

    const handleChange = (e) => {
        const id = Number(e.target.value);
        cambiarSucursal(sucursales.find(s => s.id === id) || null);
    };

    const Icon = esSuperAdmin && !sucursalActiva ? GlobeAltIcon : BuildingStorefrontIcon;
    const titulo = sucursal?.nombre || 'Todas las sucursales';

    if (isCollapsed) {
        return (
            <div className="hidden md:flex justify-center py-3 border-b border-black/10" title={titulo}>
                <Icon className="w-6 h-6 text-secondary/70" />
            </div>
        );
    }

    return (
        <div className="px-4 py-3 border-b border-black/10">
            {empresa && (
                <div className="flex items-center gap-2 text-sm font-semibold text-secondary truncate mb-2">
                    <BuildingOffice2Icon className="w-4 h-4 flex-shrink-0 text-secondary/60" />
                    <span className="truncate">{empresa.nombre_comercial}</span>
                </div>
            )}

            {esSuperAdmin ? (
                <>
                    <div className="text-[10px] font-bold text-secondary/50 uppercase tracking-widest mb-1">Sucursal</div>
                    <div className="relative">
                        <Icon className="w-4 h-4 absolute left-2.5 top-2.5 text-secondary/60 pointer-events-none" />
                        <select
                            value={sucursalActiva?.id || ''}
                            onChange={handleChange}
                            className="w-full pl-8 pr-2 py-2 text-sm font-semibold rounded-lg bg-black/5 text-secondary border border-black/10 focus:outline-none focus:ring-1 focus:ring-secondary/40 cursor-pointer"
                        >
                            <option value="">Todas (modo global)</option>
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
            ) : (
                <div className="flex items-center gap-2 text-xs text-secondary/70 truncate">
                    <BuildingStorefrontIcon className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{sucursal ? `Sede: ${sucursal.nombre}` : 'Todas las sedes'}</span>
                </div>
            )}
        </div>
    );
};

export default SucursalSelector;
