import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import LoginForm from './components/LoginForm';
import ForgotPasswordForm from './components/ForgotPasswordForm';
import authService from 'services/authService';
import { useAuth } from 'context/AuthContext';
import Marca from 'components/Shared/Marca';
import { APP_NAME } from 'config/app';

const PUNTOS = ['Membresías, caja y pagos en un solo lugar', 'Clases, reservas y asistencia', 'Reportes al instante'];

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [dni, setDni] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await authService.login(username, password, rememberMe);
      const { access_token } = result;

      document.cookie = `access_token=${access_token}; path=/; Secure; SameSite=Strict`;

      login();
      navigate('/home');
      toast.success(`Bienvenido al sistema`);

    } catch (error) {
      const msg = error.response?.data?.message || 'Credenciales inválidas';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    toast.info("Enlace enviado si el DNI existe.");
  };

  return (
    <div className="min-h-[100dvh] grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] bg-white">

      {/* Panel de marca (solo en pantallas grandes) */}
      <aside className="hidden lg:flex relative flex-col justify-between p-12 bg-secondary overflow-hidden">
        {/* Brillo sutil */}
        <div className="absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '48px 48px' }} />

        <Marca claro className="relative" />

        <div className="relative max-w-md">
          <h1 className="text-4xl font-semibold text-white leading-tight tracking-tight">
            Gestiona tu gimnasio<br />
            <span className="text-primary">sin complicaciones.</span>
          </h1>
          <ul className="mt-8 space-y-3">
            {PUNTOS.map(p => (
              <li key={p} className="flex items-center gap-3 text-zinc-400 text-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" /> {p}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-zinc-500">© {new Date().getFullYear()} {APP_NAME}</p>
      </aside>

      {/* Formulario */}
      <main className="flex flex-col justify-center px-6 py-10 sm:px-12">
        <div className="w-full max-w-sm mx-auto">
          <Marca className="lg:hidden mb-10" />

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-8 h-8 border-[3px] border-slate-200 border-t-secondary rounded-full animate-spin" />
              <p className="text-sm text-slate-500">Ingresando…</p>
            </div>
          ) : showForgotPassword ? (
            <ForgotPasswordForm
              dni={dni}
              setDni={setDni}
              handleForgotPassword={handleForgotPassword}
              setShowForgotPassword={setShowForgotPassword}
            />
          ) : (
            <LoginForm
              username={username}
              setUsername={setUsername}
              password={password}
              setPassword={setPassword}
              handleLogin={handleLogin}
              rememberMe={rememberMe}
              setRememberMe={setRememberMe}
              setShowForgotPassword={setShowForgotPassword}
            />
          )}

          <p className="lg:hidden mt-12 text-center text-xs text-slate-400">© {new Date().getFullYear()} {APP_NAME}</p>
        </div>
      </main>
    </div>
  );
};

export default Login;
