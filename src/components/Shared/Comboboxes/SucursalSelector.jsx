import React, { useEffect, useState } from 'react';
import { BuildingOffice2Icon, BuildingStorefrontIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import { combobox as sucursalesCombobox } from 'services/sucursalService';
import { combobox as empresasCombobox } from 'services/empresaService';
import { useAuth } from 'context/AuthContext';

const selectCls = 'w-full pl-8 pr-2 py-2 text-sm font-semibold rounded-lg bg-white/5 text-zinc-100 border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer [&>option]:text-slate-900';
const etiquetaCls = 'text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-1.5 mt-2';

/**
 * Sidebar: con qué empresa y sede se trabaja (SaaS).
 * - Superadmin: elige la empresa (o modo global) y, dentro de una empresa, la sede.
 * - Usuario sin sede fija (dueño/admin): su empresa con su plan y elige la sede.
 * - Usuario con sede fija: su empresa y su sede.
 */
const SucursalSelector = ({ isCollapsed }) => {
    const { esSuperAdmin, role, empresa, empresaActiva, cambiarEmpresa, sucursal, sedeFija, sucursalActiva, cambiarSucursal, suscripcion } = useAuth();
    const [empresas, setEmpresas] = useState([]);
    const [sucursales, setSucursales] = useState([]);
    const esCliente = role === 'cliente';

    // Elegir sede: el personal sin sede fija (el superadmin, solo dentro de una empresa).
    // El cliente nunca: siempre ve todo lo suyo de todas las sedes.
    // (la sede elegida aquí no es fija: el combobox sigue para cambiarla o volver a todas)
    const eligeSede = !esCliente && !sedeFija && (!esSuperAdmin || !!empresaActiva);

    useEffect(() => {
        if (!esSuperAdmin) return;
        empresasCombobox().then(res => setEmpresas(res.data || [])).catch(() => setEmpresas([]));
    }, [esSuperAdmin]);

    useEffect(() => {
        if (!eligeSede) return;
        sucursalesCombobox().then(res => setSucursales(res.data || [])).catch(() => setSucursales([]));
    }, [eligeSede]);

    const nombreEmpresa = esSuperAdmin ? (empresaActiva?.nombre_comercial || 'Todas las empresas') : empresa?.nombre_comercial;
    const Icon = esSuperAdmin && !empresaActiva ? GlobeAltIcon : BuildingOffice2Icon;

    if (isCollapsed) {
        return (
            <div className="hidden md:flex justify-center py-3 border-b border-white/5" title={nombreEmpresa}>
                <Icon className="w-5 h-5 text-zinc-400" />
            </div>
        );
    }

    return (
        <div className="px-4 py-3 border-b border-white/5">
            {esSuperAdmin ? (
                <>
                    <div className={`${etiquetaCls} mt-0`}>Empresa</div>
                    <div className="relative">
                        <Icon className="w-4 h-4 absolute left-2.5 top-2.5 text-zinc-400 pointer-events-none" />
                        <select value={empresaActiva?.id || ''} className={selectCls}
                            onChange={(e) => cambiarEmpresa(empresas.find(x => x.id === Number(e.target.value)) || null)}>
                            <option value="">Todas (modo global)</option>
                            {empresas.map(x => <option key={x.id} value={x.id}>{x.nombre_comercial}</option>)}
                            {/* La empresa activa podría estar inactiva y no venir en el combobox */}
                            {empresaActiva && !empresas.some(x => x.id === empresaActiva.id) && (
                                <option value={empresaActiva.id}>{empresaActiva.nombre_comercial}</option>
                            )}
                        </select>
                    </div>
                </>
            ) : (
                <div className="flex items-center gap-2 min-w-0">
                    <BuildingOffice2Icon className="w-4 h-4 flex-shrink-0 text-zinc-500" />
                    <span className="text-sm font-semibold text-white truncate">{nombreEmpresa}</span>
                    {empresa?.plan && (
                        <span className={`ml-auto flex-shrink-0 text-[10px] font-semibold rounded px-1.5 py-0.5 ${suscripcion?.vencida
                            ? 'bg-red-500/15 text-red-300' : 'bg-primary/15 text-primary'}`}
                            title={suscripcion?.vence ? `Suscripción hasta el ${suscripcion.vence}` : undefined}>
                            {suscripcion?.vencida ? 'VENCIDA' : empresa.plan.nombre}
                        </span>
                    )}
                </div>
            )}

            {eligeSede ? (
                <>
                    <div className={etiquetaCls}>Sucursal</div>
                    <div className="relative">
                        <BuildingStorefrontIcon className="w-4 h-4 absolute left-2.5 top-2.5 text-zinc-400 pointer-events-none" />
                        <select value={sucursalActiva?.id || ''} className={selectCls}
                            onChange={(e) => cambiarSucursal(sucursales.find(s => s.id === Number(e.target.value)) || null)}>
                            <option value="">Todas las sedes</option>
                            {sucursales.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                            {sucursalActiva && !sucursales.some(s => s.id === sucursalActiva.id) && (
                                <option value={sucursalActiva.id}>{sucursalActiva.nombre}</option>
                            )}
                        </select>
                    </div>
                </>
            ) : sedeFija && sucursal ? (
                <div className="flex items-center gap-2 text-xs text-zinc-400 truncate mt-1">
                    <BuildingStorefrontIcon className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">Sede: {sucursal.nombre}</span>
                </div>
            ) : null}
        </div>
    );
};

export default SucursalSelector;
