import React from 'react';

const ForgotPasswordForm = ({ dni, setDni, handleForgotPassword, setShowForgotPassword }) => {
  return (
    <div className="w-full">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-light text-white mb-2 tracking-wide">
          Restablecer
        </h2>
        <p className="text-xs text-white/50 tracking-wide">
          Ingresa tu DNI para validar tu identidad
        </p>
      </div>

      <form onSubmit={handleForgotPassword} className="space-y-5">
        <div>
          <input
            type="text"
            id="dni"
            value={dni}
            onChange={(e) => setDni(e.target.value)}
            className="block w-full px-4 py-3 bg-white/5 border border-white/15 text-white placeholder-white/30 focus:outline-none focus:ring-0 focus:border-primary transition-colors sm:text-sm rounded-sm text-center tracking-[0.3em] font-medium"
            placeholder="N° DE DNI"
            maxLength="8"
            pattern="\d*"
            required
          />
        </div>
        
        <div className="pt-2 space-y-3">
          <button
            type="submit"
            className="w-full flex justify-center py-3.5 px-4 bg-primary text-secondary text-xs font-semibold hover:bg-primary-hover focus:outline-none transition-all duration-300 uppercase tracking-[0.2em] rounded-sm"
          >
            Validar
          </button>
          
          <button
            type="button"
            onClick={() => setShowForgotPassword(false)}
            className="w-full flex justify-center py-3.5 px-4 border border-white/20 text-xs font-semibold text-white/70 bg-transparent hover:border-primary/50 hover:text-primary focus:outline-none transition-all duration-300 uppercase tracking-[0.2em] rounded-sm"
          >
            Volver
          </button>
        </div>
      </form>
    </div>
  );
};

export default ForgotPasswordForm;