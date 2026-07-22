import React from 'react';

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
  return (
    <div className="w-full">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-secondary mb-2 tracking-wide">
          Bienvenido de Nuevo
        </h2>
        <p className="text-xs text-secondary/70 font-medium tracking-wide">
          Ingresa tus credenciales para continuar
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-5">
        <div className="space-y-1">
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="block w-full px-4 py-3 bg-secondary/5 border border-secondary/20 text-secondary font-medium placeholder-secondary/50 focus:outline-none focus:ring-0 focus:border-secondary transition-colors sm:text-sm rounded-sm"
            placeholder="Usuario"
            required
          />
        </div>

        <div className="space-y-1">
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full px-4 py-3 bg-secondary/5 border border-secondary/20 text-secondary font-medium placeholder-secondary/50 focus:outline-none focus:ring-0 focus:border-secondary transition-colors sm:text-sm rounded-sm"
            placeholder="Contraseña"
            required
          />
        </div>
        
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 text-secondary bg-secondary/5 border-secondary/30 rounded-sm focus:ring-secondary/40 cursor-pointer accent-secondary"
            />
            <label htmlFor="remember-me" className="ml-2 block text-xs text-secondary/80 font-semibold cursor-pointer select-none tracking-wide">
              Recordar dispositivo
            </label>
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            className="w-full flex justify-center py-3.5 px-4 bg-secondary text-primary text-xs font-bold hover:bg-secondary/90 focus:outline-none transition-all duration-300 uppercase tracking-[0.2em] rounded-sm"
          >
            Ingresar al Sistema
          </button>
        </div>

        <div className="text-center mt-5">
          <button
            type="button"
            onClick={() => setShowForgotPassword(true)}
            className="text-xs font-semibold text-secondary/80 hover:text-secondary hover:underline underline-offset-4 transition-all tracking-wide"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;