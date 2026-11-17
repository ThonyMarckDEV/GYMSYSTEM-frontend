import React from 'react';
import { BuildingStorefrontIcon, MapPinIcon, PhoneIcon } from '@heroicons/react/24/outline';
import { toUpper } from 'utilities/Validations/validations';

const inputClass = "w-full pl-9 p-2.5 text-sm text-secondary border border-slate-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none";
const labelClass = "block text-xs font-bold text-slate-700 uppercase mb-1";
const iconClass  = "w-4 h-4 absolute left-3 top-3 text-gray-400";

const SucursalForm = ({ formData, handleChange }) => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-black text-secondary flex items-center gap-2 mb-4 border-b border-slate-100 pb-2 uppercase">
                <BuildingStorefrontIcon className="w-5 h-5" /> Información de la Sucursal
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">

                <div className="md:col-span-6">
                    <label className={labelClass}>Nombre <span className="text-red-500">*</span></label>
                    <div className="relative">
                        <BuildingStorefrontIcon className={iconClass} />
                        <input type="text" value={formData.nombre || ''}
                            onChange={(e) => handleChange('nombre', toUpper(e.target.value))}
                            className={inputClass} placeholder="Ej: MIRAFLORES" required />
                    </div>
                </div>

                <div className="md:col-span-6">
                    <label className={labelClass}>Teléfono</label>
                    <div className="relative">
                        <PhoneIcon className={iconClass} />
                        <input type="text" inputMode="numeric" value={formData.telefono || ''}
                            onChange={(e) => handleChange('telefono', e.target.value.replace(/\D/g, '').slice(0, 15))}
                            className={inputClass} placeholder="987654321" />
                    </div>
                </div>

                <div className="md:col-span-12">
                    <label className={labelClass}>Dirección</label>
                    <div className="relative">
                        <MapPinIcon className={iconClass} />
                        <input type="text" value={formData.direccion || ''}
                            onChange={(e) => handleChange('direccion', toUpper(e.target.value))}
                            className={inputClass} placeholder="Av. Larco 345, Miraflores" />
                    </div>
                </div>

            </div>
        </div>
    );
};

export default SucursalForm;
