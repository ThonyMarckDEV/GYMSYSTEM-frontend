import React from 'react';
import { IdentificationIcon, PhoneIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { onlyLetters, onlyNumbers, toUpper } from 'utilities/Validations/validations';

const DatosPersonalesForm = ({ data, handleNestedChange }) => {
    const valores = data.datos_empleado;

    const onChange = (field, value) => handleNestedChange('datos_empleado', field, value);

    return (
        <div className="bg-white p-6 rounded-xl shadow-card border border-slate-200">
            <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2 mb-5 pb-3 border-b border-slate-100">
                <IdentificationIcon className="w-5 h-5" /> Información Personal
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                
                {/* DNI: Solo 8 números */}
                <div className="md:col-span-4">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        DNI <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={valores.dni || ''}
                        onChange={(e) => onChange('dni', onlyNumbers(e.target.value, 8))}
                        className="w-full p-2.5 text-sm text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none"
                        placeholder="8 dígitos"
                    />
                </div>

                {/* Fecha Nacimiento */}
                <div className="md:col-span-4">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Fecha Nacimiento <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="date"
                        value={valores.fechaNacimiento || ''}
                        onChange={(e) => onChange('fechaNacimiento', e.target.value)}
                        className="w-full p-2.5 text-sm text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none"
                    />
                </div>

                {/* Sexo */}
                <div className="md:col-span-4">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Sexo <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={valores.sexo || ''}
                        onChange={(e) => onChange('sexo', e.target.value)}
                        className="w-full p-2.5 text-sm text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none bg-white font-medium"
                    >
                        <option value="">-- Seleccionar --</option>
                        <option value="Masculino">Masculino</option>
                        <option value="Femenino">Femenino</option>
                    </select>
                </div>

                {/* Nombres: Solo letras */}
                <div className="md:col-span-4">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Nombres <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={valores.nombre || ''}
                        onChange={(e) => onChange('nombre', onlyLetters(e.target.value))}
                        className="w-full p-2.5 text-sm text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none"
                        placeholder="Nombres completos"
                    />
                </div>

                {/* Apellido Paterno: Solo letras */}
                <div className="md:col-span-4">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Apellido Paterno <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={valores.apellidoPaterno || ''}
                        onChange={(e) => onChange('apellidoPaterno', onlyLetters(e.target.value))}
                        className="w-full p-2.5 text-sm text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none"
                    />
                </div>

                {/* Apellido Materno: Solo letras */}
                <div className="md:col-span-4">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Apellido Materno <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={valores.apellidoMaterno || ''}
                        onChange={(e) => onChange('apellidoMaterno', onlyLetters(e.target.value))}
                        className="w-full p-2.5 text-sm text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none"
                    />
                </div>

                {/* Teléfono: Solo 9 números */}
                <div className="md:col-span-4">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Teléfono <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <PhoneIcon className="w-4 h-4 absolute left-3 top-3 text-gray-400"/>
                        <input
                            type="text"
                            value={valores.telefono || ''}
                            onChange={(e) => onChange('telefono', onlyNumbers(e.target.value, 9))}
                            className="w-full pl-9 p-2.5 text-sm text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none"
                            placeholder="999888777"
                        />
                    </div>
                </div>

                {/* Estado Civil */}
                <div className="md:col-span-4">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Estado Civil <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={valores.estadoCivil || ''}
                        onChange={(e) => onChange('estadoCivil', e.target.value)}
                        className="w-full p-2.5 text-sm text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none bg-white font-medium"
                    >
                        <option value="">-- Seleccionar --</option>
                        <option value="Soltero">Soltero(a)</option>
                        <option value="Casado">Casado(a)</option>
                        <option value="Divorciado">Divorciado(a)</option>
                        <option value="Viudo">Viudo(a)</option>
                        <option value="Conviviente">Conviviente</option>
                    </select>
                </div>

                {/* Dirección */}
                <div className="md:col-span-12">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Dirección <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <MapPinIcon className="w-4 h-4 absolute left-3 top-3 text-gray-400"/>
                        <input
                            type="text"
                            value={valores.direccion || ''}
                            onChange={(e) => onChange('direccion', toUpper(e.target.value))}
                            className="w-full pl-9 p-2.5 text-sm text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none"
                            placeholder="Calle, Número, Distrito..."
                        />
                    </div>
                </div>

            </div>
        </div>
    );
};

export default DatosPersonalesForm;