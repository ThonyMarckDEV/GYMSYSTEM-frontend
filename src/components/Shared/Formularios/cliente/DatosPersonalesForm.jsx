import React from 'react';
import { IdentificationIcon, PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { onlyLetters, onlyNumbers, toUpper } from 'utilities/Validations/validations';

const DatosClienteForm = ({ data, handleNestedChange }) => {
    const c  = data.datos_cliente;
    const ct = data.contactos;

    const onC  = (field, value) => handleNestedChange('datos_cliente', field, value);
    const onCt = (field, value) => handleNestedChange('contactos', field, value);

    return (
        <div className="bg-white p-6 rounded-xl shadow-card border border-slate-200">
            <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2 mb-5 pb-3 border-b border-slate-100">
                <IdentificationIcon className="w-5 h-5" /> Información del Cliente
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">

                <div className="md:col-span-4">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">DNI <span className="text-red-500">*</span></label>
                    <input type="text" value={c.dni || ''}
                        onChange={(e) => onC('dni', onlyNumbers(e.target.value, 8))}
                        className="w-full p-2.5 text-sm text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none"
                        placeholder="8 dígitos" required />
                </div>

                <div className="md:col-span-4">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Fecha Nacimiento <span className="text-red-500">*</span></label>
                    <input type="date" value={c.fechaNacimiento || ''}
                        onChange={(e) => onC('fechaNacimiento', e.target.value)}
                        className="w-full p-2.5 text-sm text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none"
                        required />
                </div>

                <div className="md:col-span-4">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Sexo <span className="text-red-500">*</span></label>
                    <select value={c.sexo || ''} onChange={(e) => onC('sexo', e.target.value)}
                        className="w-full p-2.5 text-sm text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none bg-white" required>
                        <option value="">-- Seleccionar --</option>
                        <option value="Masculino">Masculino</option>
                        <option value="Femenino">Femenino</option>
                    </select>
                </div>

                <div className="md:col-span-4">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Nombres <span className="text-red-500">*</span></label>
                    <input type="text" value={c.nombre || ''}
                        onChange={(e) => onC('nombre', onlyLetters(e.target.value))}
                        className="w-full p-2.5 text-sm text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none"
                        required />
                </div>

                <div className="md:col-span-4">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Apellido Paterno <span className="text-red-500">*</span></label>
                    <input type="text" value={c.apellidoPaterno || ''}
                        onChange={(e) => onC('apellidoPaterno', onlyLetters(e.target.value))}
                        className="w-full p-2.5 text-sm text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none"
                        required />
                </div>

                <div className="md:col-span-4">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Apellido Materno <span className="text-red-500">*</span></label>
                    <input type="text" value={c.apellidoMaterno || ''}
                        onChange={(e) => onC('apellidoMaterno', onlyLetters(e.target.value))}
                        className="w-full p-2.5 text-sm text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none"
                        required />
                </div>

                <div className="md:col-span-6">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Teléfono Móvil <span className="text-red-500">*</span></label>
                    <div className="relative">
                        <PhoneIcon className="w-4 h-4 absolute left-3 top-3 text-gray-400"/>
                        <input type="text" value={ct.telefonoMovil || ''}
                            onChange={(e) => onCt('telefonoMovil', onlyNumbers(e.target.value, 9))}
                            className="w-full pl-9 p-2.5 text-sm text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none"
                            placeholder="999888777" required />
                    </div>
                </div>

                <div className="md:col-span-6">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Correo Electrónico</label>
                    <div className="relative">
                        <EnvelopeIcon className="w-4 h-4 absolute left-3 top-3 text-gray-400"/>
                        <input type="email" value={ct.correo || ''}
                            onChange={(e) => onCt('correo', toUpper(e.target.value))}
                            className="w-full pl-9 p-2.5 text-sm text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none"
                            placeholder="EJEMPLO@CORREO.COM" />
                    </div>
                </div>

            </div>
        </div>
    );
};

export default DatosClienteForm;