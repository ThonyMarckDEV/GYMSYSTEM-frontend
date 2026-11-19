import React, { useEffect } from 'react';
import { UserIcon, KeyIcon, LockClosedIcon, BuildingStorefrontIcon } from '@heroicons/react/24/outline';
import RolSearchSelect from 'components/Shared/Comboboxes/RolSearchSelect';
import SucursalSelect from 'components/Shared/Comboboxes/SucursalSelect';
import { useAuth } from 'context/AuthContext';

const UsuarioForm = ({ form, setForm, handleNestedChange, isEditing = false }) => {
  // Sede fija de quien registra (o superadmin en modo sucursal)
  const { sucursal: sedePropia } = useAuth();

  useEffect(() => {
    if (sedePropia && String(form.sucursal_id) !== String(sedePropia.id)) {
      setForm(prev => ({ ...prev, sucursal_id: sedePropia.id }));
    }
  }, [sedePropia, form.sucursal_id, setForm]);
  
  const pass = form.usuario.password || '';
  const confirm = form.usuario.password_confirmation || '';
  const noCoinciden = pass && confirm && pass !== confirm;

  return (
    <div className="bg-white p-6 rounded-xl shadow-card border border-slate-200 mt-6">
      <h3 className="text-lg font-black text-slate-800 flex items-center gap-2 mb-4 border-b border-slate-100 pb-2 uppercase">
        <UserIcon className="w-5 h-5" /> Credenciales y Acceso
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* COMBOBOX DE ROLES */}
        <div className="md:col-span-2">
            <RolSearchSelect 
                form={form} 
                setForm={setForm} 
            />
        </div>

        {/* SUCURSAL: quien tiene una sede fija solo registra en su sede; si trabaja en todas, elige */}
        <div className="md:col-span-2">
            {sedePropia ? (
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Sucursal</label>
                    <div className="flex items-center gap-2 p-2.5 text-sm rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
                        <BuildingStorefrontIcon className="w-4 h-4 text-slate-400" /> {sedePropia.nombre}
                    </div>
                    <p className="mt-1 text-[11px] text-slate-400">Estás a cargo de esta sede: el empleado se registra aquí.</p>
                </div>
            ) : (
                <SucursalSelect
                    value={form.sucursal_id}
                    onChange={(val) => setForm(prev => ({ ...prev, sucursal_id: val }))}
                    emptyLabel="Todas las sucursales"
                    help="Déjalo en Todas para administradores. Un recepcionista suele tener una sucursal fija."
                />
            )}
        </div>

        {/* Username */}
        <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Nombre de Usuario <span className="text-red-500">*</span>
            </label>
            <div className="relative">
                <UserIcon className="w-4 h-4 absolute left-3 top-3 text-gray-400"/>
                <input
                    type="text"
                    value={form.usuario.username || ''}
                    onChange={(e) => handleNestedChange('usuario', 'username', e.target.value)}
                    className="w-full pl-9 p-2.5 text-sm text-slate-900 border border-slate-300 rounded-lg focus:ring-1 focus:ring-black outline-none"
                    placeholder="Ej: jperez"
                    required
                />
            </div>
        </div>
        
        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Contraseña {isEditing && <span className="text-xs text-gray-400 font-normal normal-case">(Opcional al editar)</span>}
              {!isEditing && <span className="text-red-500">*</span>}
          </label>
          <div className="relative">
              <KeyIcon className="w-4 h-4 absolute left-3 top-3 text-gray-400"/>
              <input
                  type="password"
                  value={form.usuario.password || ''}
                  onChange={(e) => handleNestedChange('usuario', 'password', e.target.value)}
                  className="w-full pl-9 p-2.5 text-sm text-slate-900 border border-slate-300 rounded-lg focus:ring-1 focus:ring-black outline-none"
                  placeholder={isEditing ? "Dejar vacío para mantener" : "Mínimo 8 caracteres"}
                  required={!isEditing}
                  minLength={8}
              />
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Confirmar Contraseña {isEditing && <span className="text-xs text-gray-400 font-normal normal-case">(Opcional)</span>}
              {!isEditing && <span className="text-red-500">*</span>}
          </label>
          <div className="relative">
              <LockClosedIcon className="w-4 h-4 absolute left-3 top-3 text-gray-400"/>
              <input
                  type="password"
                  value={form.usuario.password_confirmation || ''}
                  onChange={(e) => handleNestedChange('usuario', 'password_confirmation', e.target.value)}
                  className={`w-full pl-9 p-2.5 text-sm text-secondary border rounded-lg focus:ring-1 outline-none ${
                      noCoinciden 
                      ? 'border-red-500 focus:ring-red-500 bg-red-50' 
                      : 'border-slate-300 focus:ring-black'
                  }`}
                  placeholder="Repita la contraseña"
                  required={!isEditing}
              />
          </div>
          {/* Mensaje de error visual en tiempo real */}
          {noCoinciden && (
              <p className="text-[10px] text-red-500 mt-1 font-bold animate-pulse">
                  Las contraseñas no coinciden.
              </p>
          )}
        </div>

      </div>
    </div>
  );
};

export default UsuarioForm;