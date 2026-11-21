import React, { useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const inputCls = 'block w-full px-3.5 py-3 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary';

const LoginForm = ({
  username,
  setUsername,
  password,
  setPassword,
  handleLogin,
  rememberMe,
  setRememberMe,
  setShowForgotPassword
}) => {
  const [verClave, setVerClave] = useState(false);

  return (
    <div className="w-full">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">Iniciar sesión</h2>
        <p className="text-sm text-slate-500 mt-1.5">Usa el usuario que te dio tu gimnasio.</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-1.5">Usuario</label>
          <input
            type="text"
            id="username"
            autoComplete="username"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={inputCls}
            placeholder="Usuario"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">Contraseña</label>
          <div className="relative">
            <input
              type={verClave ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${inputCls} pr-10`}
              placeholder="Contraseña"
              required
            />
            <button type="button" onClick={() => setVerClave(v => !v)}
              className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-400 hover:text-slate-700"
              aria-label={verClave ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
              {verClave ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label htmlFor="remember-me" className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none">
            <input
              id="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 cursor-pointer accent-secondary"
            />
            Recordarme
          </label>
          <button
            type="button"
            onClick={() => setShowForgotPassword(true)}
            className="text-sm font-medium text-slate-600 hover:text-slate-900 hover:underline underline-offset-4"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>

        <button
          type="submit"
          className="w-full py-3 px-4 mt-2 bg-secondary text-white text-sm font-semibold rounded-lg hover:bg-black/80 active:scale-[0.99] transition"
        >
          Ingresar
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
