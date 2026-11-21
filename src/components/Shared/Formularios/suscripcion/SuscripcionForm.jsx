import React from 'react';
import { RocketLaunchIcon, CurrencyDollarIcon, DocumentTextIcon, BuildingStorefrontIcon, UsersIcon, UserGroupIcon, InboxStackIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import { toUpper } from 'utilities/Validations/validations';

const inputClass = "w-full pl-9 p-2.5 text-sm text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none";
const labelClass = "block text-sm font-medium text-slate-700 mb-1.5";
const iconClass  = "w-4 h-4 absolute left-3 top-3 text-gray-400";

const LimiteInput = ({ label, icon: Icon, value, onChange }) => (
    <div className="md:col-span-4">
        <label className={labelClass}>{label}</label>
        <div className="relative">
            <Icon className={iconClass} />
            <input type="number" min="1" value={value ?? ''}
                onChange={(e) => onChange(e.target.value)}
                className={inputClass} placeholder="Ilimitado" />
        </div>
    </div>
);

/**
 * Plan del sistema (SaaS). Todos los planes traen todas las funciones;
 * lo que cambia entre uno y otro son los límites.
 */
const SuscripcionForm = ({ formData, handleChange }) => (
    <div className="bg-white p-6 rounded-xl shadow-card border border-slate-200">
        <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2 mb-5 pb-3 border-b border-slate-100">
            <RocketLaunchIcon className="w-5 h-5" /> Plan del sistema
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            <div className="md:col-span-8">
                <label className={labelClass}>Nombre <span className="text-red-500">*</span></label>
                <div className="relative">
                    <RocketLaunchIcon className={iconClass} />
                    <input type="text" value={formData.nombre || ''}
                        onChange={(e) => handleChange('nombre', toUpper(e.target.value))}
                        className={inputClass} placeholder="Ej: BASICO, PRO, PREMIUM" required />
                </div>
            </div>

            <div className="md:col-span-4">
                <label className={labelClass}>Precio mensual (S/) <span className="text-red-500">*</span></label>
                <div className="relative">
                    <CurrencyDollarIcon className={iconClass} />
                    <input type="number" step="0.01" min="0" value={formData.precio_mensual ?? ''}
                        onChange={(e) => handleChange('precio_mensual', e.target.value)}
                        className={inputClass} placeholder="0.00" required />
                </div>
            </div>

            <div className="md:col-span-12">
                <label className={labelClass}>Descripción</label>
                <div className="relative">
                    <DocumentTextIcon className={iconClass} />
                    <input type="text" value={formData.descripcion || ''}
                        onChange={(e) => handleChange('descripcion', e.target.value)}
                        className={inputClass} placeholder="¿Para qué tipo de gimnasio es este plan?" />
                </div>
            </div>

            <div className="md:col-span-12 text-sm text-slate-500 -mb-2">
                <b className="text-slate-700">Límites</b> — deja el campo vacío para que sea <b className="text-slate-700">ilimitado</b>. Todas las funciones del sistema vienen en todos los planes.
            </div>
            <LimiteInput label="Máx. sucursales" icon={BuildingStorefrontIcon} value={formData.max_sucursales} onChange={(v) => handleChange('max_sucursales', v)} />
            <LimiteInput label="Máx. cajas por sucursal" icon={InboxStackIcon} value={formData.max_cajas_por_sucursal} onChange={(v) => handleChange('max_cajas_por_sucursal', v)} />
            <LimiteInput label="Máx. clientes"   icon={UsersIcon}              value={formData.max_clientes}   onChange={(v) => handleChange('max_clientes', v)} />
            <LimiteInput label="Máx. empleados"  icon={UserGroupIcon}          value={formData.max_empleados}  onChange={(v) => handleChange('max_empleados', v)} />
            <LimiteInput label="Máx. productos activos" icon={ShoppingBagIcon} value={formData.max_productos}  onChange={(v) => handleChange('max_productos', v)} />
        </div>
    </div>
);

export default SuscripcionForm;
