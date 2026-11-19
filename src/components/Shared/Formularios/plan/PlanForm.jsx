import React from 'react';
import { TagIcon, ClockIcon, CurrencyDollarIcon, ShieldCheckIcon, DocumentTextIcon, GiftIcon } from '@heroicons/react/24/outline';
import { ThermometerSnowflakeIcon } from 'lucide-react';
import { toUpper } from 'utilities/Validations/validations';
import { textoDias } from 'utilities/Formato/dias';

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

            {/* BONO DE BIENVENIDA */}
            <BonoBienvenida formData={formData} handleChange={handleChange} />
        </div>
    );
};

const ATAJOS = [0, 30, 60, 90];

const BonoBienvenida = ({ formData, handleChange }) => {
    const bono = Number(formData.bono_bienvenida_dias) || 0;
    const duracion = Number(formData.duracion_dias) || 0;

    return (
        <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary-light text-amber-700 flex items-center justify-center flex-shrink-0">
                    <GiftIcon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900">Bono de bienvenida</p>
                    <p className="text-sm text-slate-500">Días de regalo para clientes nuevos (los que nunca tuvieron una membresía pagada). No aplica a renovaciones.</p>
                </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
                {ATAJOS.map(d => (
                    <button key={d} type="button" onClick={() => handleChange('bono_bienvenida_dias', d ? String(d) : '')}
                        aria-pressed={bono === d}
                        className={`px-3 py-1.5 rounded-lg border text-sm transition-colors ${bono === d
                            ? 'bg-secondary text-white border-secondary'
                            : 'bg-white text-slate-600 border-slate-300 hover:border-slate-400'}`}>
                        {d ? `+${textoDias(d)}` : 'Sin bono'}
                    </button>
                ))}
                <div className="relative w-32">
                    <input type="number" min="0" max="730" value={formData.bono_bienvenida_dias || ''}
                        onChange={(e) => handleChange('bono_bienvenida_dias', e.target.value)}
                        className="w-full pr-11 p-2 text-sm text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none"
                        placeholder="Otro" aria-label="Días de bono de bienvenida" />
                    <span className="absolute right-3 top-2 text-sm text-slate-400 pointer-events-none">días</span>
                </div>
            </div>

            {bono > 0 && duracion > 0 && (
                <p className="mt-3 text-sm text-slate-600">
                    Un cliente nuevo que compre este plan tendrá <b className="text-slate-900">{duracion} días + {textoDias(bono)} de regalo = {duracion + bono} días</b>.
                </p>
            )}
        </div>
    );
};

export default PlanForm;