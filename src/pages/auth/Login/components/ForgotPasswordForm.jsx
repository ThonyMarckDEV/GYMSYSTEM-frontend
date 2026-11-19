import React from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const ForgotPasswordForm = ({ dni, setDni, handleForgotPassword, setShowForgotPassword }) => {
  return (
    <div className="w-full">
      <button
        type="button"
        onClick={() => setShowForgotPassword(false)}
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-4"
      >
        <ArrowLeftIcon className="w-4 h-4" /> Volver
      </button>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">Restablecer contraseña</h2>
        <p className="text-sm text-slate-500 mt-1">Ingresa tu DNI para validar tu identidad</p>
      </div>

      <form onSubmit={handleForgotPassword} className="space-y-4">
        <div>
          <label htmlFor="dni" className="block text-sm font-medium text-slate-700 mb-1.5">DNI</label>
          <input
            type="text"
            id="dni"
            inputMode="numeric"
            value={dni}
            onChange={(e) => setDni(e.target.value)}
            className="block w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 tracking-widest placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
            placeholder="8 dígitos"
            maxLength="8"
            pattern="\d*"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full py-2.5 px-4 bg-secondary text-white text-sm font-semibold rounded-lg hover:bg-black/80 transition"
        >
          Validar
        </button>
      </form>
    </div>
  );
};

export default ForgotPasswordForm;
