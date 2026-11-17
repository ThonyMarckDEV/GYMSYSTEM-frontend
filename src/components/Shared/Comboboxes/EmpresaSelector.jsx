import React, { useEffect, useState } from 'react';
import { BuildingOffice2Icon, BuildingStorefrontIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import { combobox } from 'services/empresaService';
import { useAuth } from 'context/AuthContext';

/**
 * Selector de empresa activa (multitenant).
 * - Superadmin: puede elegir con qué empresa trabajar o quedarse en modo global.
 * - Resto de usuarios: solo muestra el nombre de su empresa.
 */
const EmpresaSelector = ({ isCollapsed }) => {
    const { esSuperAdmin, empresaActual, empresaActiva, cambiarEmpresa, sucursal } = useAuth();
    const [empresas, setEmpresas] = useState([]);

    useEffect(() => {
        if (!esSuperAdmin) return;
        combobox()
            .then(res => setEmpresas(res.data || []))
            .catch(() => setEmpresas([]));
    }, [esSuperAdmin]);

    const handleChange = (e) => {
        const id = Number(e.target.value);
        const empresa = empresas.find(emp => emp.id === id) || null;
        cambiarEmpresa(empresa);
    };

    const Icon = esSuperAdmin && !empresaActiva ? GlobeAltIcon : BuildingOffice2Icon;
    const titulo = empresaActual?.nombre_comercial || 'Todas las empresas';

    if (isCollapsed) {
        return (
            <div className="hidden md:flex justify-center py-3 border-b border-black/10" title={titulo}>
                <Icon className="w-6 h-6 text-secondary/70" />
            </div>
        );
    }

    return (
        <div className="px-4 py-3 border-b border-black/10">
            <div className="text-[10px] font-bold text-secondary/50 uppercase tracking-widest mb-1">
                Empresa
            </div>

            {esSuperAdmin ? (
                <div className="relative">
                    <Icon className="w-4 h-4 absolute left-2.5 top-2.5 text-secondary/60 pointer-events-none" />
                    <select
                        value={empresaActiva?.id || ''}
                        onChange={handleChange}
                        className="w-full pl-8 pr-2 py-2 text-sm font-semibold rounded-lg bg-black/5 text-secondary border border-black/10 focus:outline-none focus:ring-1 focus:ring-secondary/40 cursor-pointer"
                    >
                        <option value="">Todas (modo global)</option>
                        {empresas.map(emp => (
                            <option key={emp.id} value={emp.id}>{emp.nombre_comercial}</option>
                        ))}
                        {/* La empresa activa podría estar inactiva y no venir en el combobox */}
                        {empresaActiva && !empresas.some(e => e.id === empresaActiva.id) && (
                            <option value={empresaActiva.id}>{empresaActiva.nombre_comercial}</option>
                        )}
                    </select>
                </div>
            ) : (
                <div className="flex items-center gap-2 text-sm font-semibold text-secondary truncate">
                    <Icon className="w-4 h-4 flex-shrink-0 text-secondary/60" />
                    <span className="truncate">{titulo}</span>
                </div>
            )}

            {!esSuperAdmin && (
                <div className="flex items-center gap-2 mt-1 text-xs text-secondary/70 truncate">
                    <BuildingStorefrontIcon className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{sucursal ? `Sede: ${sucursal.nombre}` : 'Todas las sedes'}</span>
                </div>
            )}
        </div>
    );
};

export default EmpresaSelector;
