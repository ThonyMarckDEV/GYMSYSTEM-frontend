import React, { useEffect, useState } from 'react';
import { BuildingOffice2Icon, IdentificationIcon, MapPinIcon, PhoneIcon, EnvelopeIcon, RocketLaunchIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import { combobox as planesSistema } from 'services/suscripcionService';
import { toUpper } from 'utilities/Validations/validations';

const inputClass = "w-full pl-9 p-2.5 text-sm text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none";
const labelClass = "block text-sm font-medium text-slate-700 mb-1.5";
const iconClass  = "w-4 h-4 absolute left-3 top-3 text-gray-400";

/** conSuscripcion: muestra plan y vencimiento (solo el superadmin; no en "Mi empresa"). */
const EmpresaForm = ({ formData, handleChange, conSuscripcion = false }) => {
    const onlyDigits = (value, max) => value.replace(/\D/g, '').slice(0, max);

    return (
        <div className="bg-white p-6 rounded-xl shadow-card border border-slate-200">
            <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2 mb-5 pb-3 border-b border-slate-100">
                <BuildingOffice2Icon className="w-5 h-5" /> Información de la Empresa
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">

                <div className="md:col-span-8">
                    <label className={labelClass}>Razón Social <span className="text-red-500">*</span></label>
                    <div className="relative">
                        <BuildingOffice2Icon className={iconClass} />
                        <input type="text" value={formData.razon_social || ''}
                            onChange={(e) => handleChange('razon_social', toUpper(e.target.value))}
                            className={inputClass} placeholder="Ej: GIMNASIO DEL NORTE S.A.C." required />
                    </div>
                </div>

                <div className="md:col-span-4">
                    <label className={labelClass}>RUC <span className="text-red-500">*</span></label>
                    <div className="relative">
                        <IdentificationIcon className={iconClass} />
                        <input type="text" inputMode="numeric" value={formData.ruc || ''}
                            onChange={(e) => handleChange('ruc', onlyDigits(e.target.value, 11))}
                            className={inputClass} placeholder="20XXXXXXXXX" minLength={11} maxLength={11} required />
                    </div>
                </div>

                <div className="md:col-span-6">
                    <label className={labelClass}>Nombre Comercial <span className="text-red-500">*</span></label>
                    <div className="relative">
                        <BuildingOffice2Icon className={iconClass} />
                        <input type="text" value={formData.nombre_comercial || ''}
                            onChange={(e) => handleChange('nombre_comercial', toUpper(e.target.value))}
                            className={inputClass} placeholder="Ej: GYM NORTE" required />
                    </div>
                </div>

                <div className="md:col-span-6">
                    <label className={labelClass}>Dirección</label>
                    <div className="relative">
                        <MapPinIcon className={iconClass} />
                        <input type="text" value={formData.direccion || ''}
                            onChange={(e) => handleChange('direccion', toUpper(e.target.value))}
                            className={inputClass} placeholder="Av. Principal 123" />
                    </div>
                </div>

                <div className="md:col-span-6">
                    <label className={labelClass}>Teléfono</label>
                    <div className="relative">
                        <PhoneIcon className={iconClass} />
                        <input type="text" inputMode="numeric" value={formData.telefono || ''}
                            onChange={(e) => handleChange('telefono', onlyDigits(e.target.value, 15))}
                            className={inputClass} placeholder="987654321" />
                    </div>
                </div>

                <div className="md:col-span-6">
                    <label className={labelClass}>Correo</label>
                    <div className="relative">
                        <EnvelopeIcon className={iconClass} />
                        <input type="email" value={formData.correo || ''}
                            onChange={(e) => handleChange('correo', e.target.value)}
                            className={inputClass} placeholder="contacto@empresa.com" />
                    </div>
                </div>

            </div>

            {conSuscripcion && <SuscripcionCampos formData={formData} handleChange={handleChange} />}
        </div>
    );
};

/**
 * Plan del sistema y vencimiento (solo el superadmin, al crear o editar una empresa).
 * Para renovar lo normal es "Registrar pago" en Cobros de suscripción, que extiende el vencimiento solo.
 */
const SuscripcionCampos = ({ formData, handleChange }) => {
    const [planes, setPlanes] = useState([]);
    useEffect(() => { planesSistema().then(res => setPlanes(res.data || [])).catch(() => setPlanes([])); }, []);

    const limite = (v) => (v === null || v === undefined ? 'ilimitado' : v);
    const plan = planes.find(p => String(p.id) === String(formData.plan_suscripcion_id));

    return (
        <>
            <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2 mt-8 mb-5 pb-3 border-b border-slate-100">
                <RocketLaunchIcon className="w-5 h-5" /> Suscripción al sistema
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                <div className="md:col-span-8">
                    <label className={labelClass}>Plan contratado <span className="text-red-500">*</span></label>
                    <div className="relative">
                        <RocketLaunchIcon className={iconClass} />
                        <select value={formData.plan_suscripcion_id || ''}
                            onChange={(e) => handleChange('plan_suscripcion_id', e.target.value)}
                            className={`${inputClass} bg-white`} required>
                            <option value="">Seleccionar plan</option>
                            {planes.map(p => (
                                <option key={p.id} value={p.id}>{p.nombre} — S/ {Number(p.precio_mensual).toFixed(2)} / mes</option>
                            ))}
                        </select>
                    </div>
                    {plan && (
                        <p className="mt-1.5 text-xs text-slate-500">
                            {limite(plan.max_sucursales)} sucursales ({limite(plan.max_cajas_por_sucursal)} cajas c/u) · {limite(plan.max_clientes)} clientes · {limite(plan.max_empleados)} empleados · {limite(plan.max_productos)} productos
                        </p>
                    )}
                </div>

                <div className="md:col-span-4">
                    <label className={labelClass}>Vence el</label>
                    <div className="relative">
                        <CalendarDaysIcon className={iconClass} />
                        <input type="date" value={formData.suscripcion_vence || ''}
                            onChange={(e) => handleChange('suscripcion_vence', e.target.value)}
                            className={inputClass} />
                    </div>
                    <p className="mt-1.5 text-xs text-slate-500">Vacío = no vence. Al registrar un pago se extiende solo.</p>
                </div>
            </div>
        </>
    );
};

export default EmpresaForm;
