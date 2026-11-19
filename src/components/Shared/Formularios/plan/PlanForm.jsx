import React from 'react';
import { TagIcon, ClockIcon, CurrencyDollarIcon, ShieldCheckIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { ThermometerSnowflakeIcon } from 'lucide-react';
import { toUpper } from 'utilities/Validations/validations';

const PlanForm = ({ formData, handleChange }) => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-card border border-slate-200">
            <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2 mb-5 pb-3 border-b border-slate-100">
                <TagIcon className="w-5 h-5" /> Información del Plan
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">

                <div className="md:col-span-8">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Nombre del Plan <span className="text-red-500">*</span></label>
                    <input type="text" value={formData.nombre || ''}
                        onChange={(e) => handleChange('nombre', toUpper(e.target.value))}
                        className="w-full p-2.5 text-sm text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none"
                        placeholder="Ej: Plan Mensual" required />
                </div>

                <div className="md:col-span-4">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Precio (S/) <span className="text-red-500">*</span></label>
                    <div className="relative">
                        <CurrencyDollarIcon className="w-4 h-4 absolute left-3 top-3 text-gray-400"/>
                        <input type="number" step="0.01" min="0" value={formData.precio || ''}
                            onChange={(e) => handleChange('precio', e.target.value)}
                            className="w-full pl-9 p-2.5 text-sm text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none"
                            placeholder="0.00" required />
                    </div>
                </div>

                <div className="md:col-span-12">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Descripción</label>
                    <div className="relative">
                        <DocumentTextIcon className="w-4 h-4 absolute left-3 top-3 text-gray-400"/>
                        <textarea value={formData.descripcion || ''}
                            onChange={(e) => handleChange('descripcion', e.target.value)}
                            rows={2}
                            className="w-full pl-9 p-2.5 text-sm text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none resize-none"
                            placeholder="Beneficios o detalles del plan (opcional)" />
                    </div>
                </div>

                <div className="md:col-span-4">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Duración (días) <span className="text-red-500">*</span></label>
                    <div className="relative">
                        <ClockIcon className="w-4 h-4 absolute left-3 top-3 text-gray-400"/>
                        <input type="number" min="1" value={formData.duracion_dias || ''}
                            onChange={(e) => handleChange('duracion_dias', e.target.value)}
                            className="w-full pl-9 p-2.5 text-sm text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none"
                            placeholder="30" required />
                    </div>
                </div>

                <div className="md:col-span-4">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Días de Gracia</label>
                    <div className="relative">
                        <ShieldCheckIcon className="w-4 h-4 absolute left-3 top-3 text-gray-400"/>
                        <input type="number" min="0" value={formData.dias_gracia || ''}
                            onChange={(e) => handleChange('dias_gracia', e.target.value)}
                            className="w-full pl-9 p-2.5 text-sm text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none"
                            placeholder="0" />
                    </div>
                </div>

                <div className="md:col-span-4">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Congelamientos Permitidos</label>
                    <div className="relative">
                        <ThermometerSnowflakeIcon className="w-4 h-4 absolute left-3 top-3 text-gray-400"/>
                        <input type="number" min="0" value={formData.congelamientos_permitidos || ''}
                            onChange={(e) => handleChange('congelamientos_permitidos', e.target.value)}
                            className="w-full pl-9 p-2.5 text-sm text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none"
                            placeholder="0" />
                    </div>
                </div>

            </div>
        </div>
    );
};

export default PlanForm;