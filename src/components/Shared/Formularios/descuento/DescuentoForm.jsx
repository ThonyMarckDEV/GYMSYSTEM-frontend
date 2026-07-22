import React from 'react';
import { TagIcon, HashtagIcon, CalendarDaysIcon, ArrowPathRoundedSquareIcon, PercentBadgeIcon } from '@heroicons/react/24/outline';
import { toUpper, onlyNumbers } from 'utilities/Validations/validations';

const DescuentoForm = ({ formData, handleChange }) => {
    const esPorcentaje = formData.tipo === 'porcentaje';

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-black text-secondary flex items-center gap-2 mb-4 border-b border-slate-100 pb-2 uppercase">
                <TagIcon className="w-5 h-5" /> Información del Descuento
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">

                <div className="md:col-span-8">
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nombre <span className="text-red-500">*</span></label>
                    <input type="text" value={formData.nombre || ''}
                        onChange={(e) => handleChange('nombre', toUpper(e.target.value))}
                        className="w-full p-2.5 text-sm text-secondary border border-slate-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                        placeholder="Ej: Promo Verano" required />
                </div>

                <div className="md:col-span-4">
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Código (opcional)</label>
                    <div className="relative">
                        <HashtagIcon className="w-4 h-4 absolute left-3 top-3 text-gray-400"/>
                        <input type="text" value={formData.codigo || ''}
                            onChange={(e) => handleChange('codigo', toUpper(e.target.value))}
                            className="w-full pl-9 p-2.5 text-sm text-secondary border border-slate-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                            placeholder="Ej: VERANO25" />
                    </div>
                </div>

                <div className="md:col-span-4">
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Tipo de Descuento <span className="text-red-500">*</span></label>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => handleChange('tipo', 'porcentaje')}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg border-2 font-black text-xs uppercase transition-all ${
                                esPorcentaje ? 'bg-secondary text-primary border-secondary' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                            }`}
                        >
                            <PercentBadgeIcon className="w-4 h-4" /> %
                        </button>
                        <button
                            type="button"
                            onClick={() => handleChange('tipo', 'monto_fijo')}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg border-2 font-black text-xs uppercase transition-all ${
                                !esPorcentaje ? 'bg-primary text-secondary border-primary' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                            }`}
                        >
                            S/ Monto
                        </button>
                    </div>
                </div>

                <div className="md:col-span-4">
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Valor {esPorcentaje ? '(%)' : '(S/)'} <span className="text-red-500">*</span>
                    </label>
                    <input type="number" step="0.01" min="0" max={esPorcentaje ? 100 : undefined}
                        value={formData.valor || ''}
                        onChange={(e) => handleChange('valor', e.target.value)}
                        className="w-full p-2.5 text-sm text-secondary border border-slate-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                        placeholder={esPorcentaje ? '20' : '50.00'} required />
                </div>

                <div className="md:col-span-4">
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Usos Máximos</label>
                    <div className="relative">
                        <ArrowPathRoundedSquareIcon className="w-4 h-4 absolute left-3 top-3 text-gray-400"/>
                        <input type="text" inputMode="numeric" value={formData.usos_maximos || ''}
                            onChange={(e) => handleChange('usos_maximos', onlyNumbers(e.target.value))}
                            className="w-full pl-9 p-2.5 text-sm text-secondary border border-slate-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                            placeholder="Dejar vacío = ilimitado" />
                    </div>
                </div>

                <div className="md:col-span-6">
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Fecha Inicio</label>
                    <div className="relative">
                        <CalendarDaysIcon className="w-4 h-4 absolute left-3 top-3 text-gray-400"/>
                        <input type="date" value={formData.fecha_inicio || ''}
                            onChange={(e) => handleChange('fecha_inicio', e.target.value)}
                            className="w-full pl-9 p-2.5 text-sm text-secondary border border-slate-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none" />
                    </div>
                </div>

                <div className="md:col-span-6">
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Fecha Fin</label>
                    <div className="relative">
                        <CalendarDaysIcon className="w-4 h-4 absolute left-3 top-3 text-gray-400"/>
                        <input type="date" value={formData.fecha_fin || ''}
                            onChange={(e) => handleChange('fecha_fin', e.target.value)}
                            className="w-full pl-9 p-2.5 text-sm text-secondary border border-slate-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none" />
                    </div>
                </div>

            </div>
        </div>
    );
};

export default DescuentoForm;