import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import LoginForm from './components/LoginForm';
import ForgotPasswordForm from './components/ForgotPasswordForm';
import authService from 'services/authService';
import { useAuth } from 'context/AuthContext';
import Marca from 'components/Shared/Marca';
import background from 'assets/img/background.jpg';
import { APP_NAME } from 'config/app';

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
    <div className="min-h-[100dvh] bg-white lg:grid lg:grid-cols-[1.15fr_1fr]">

      {/* Foto del gimnasio */}
      <div className="relative h-56 sm:h-72 lg:h-auto lg:min-h-[100dvh] overflow-hidden bg-secondary">
        <img src={background} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />
        <div className="absolute left-6 right-6 bottom-6 lg:left-12 lg:right-12 lg:bottom-12">
          <Marca claro />
          <p className="hidden lg:block mt-5 max-w-sm text-lg text-white/80 leading-relaxed">
            Todo tu gimnasio en un solo lugar: socios, caja, clases y reportes.
          </p>
        </div>
      </div>

      {/* Formulario */}
      <main className="flex flex-col justify-center px-6 py-10 sm:px-12 lg:py-0">
        <div className="w-full max-w-sm mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-8 h-8 border-[3px] border-slate-200 border-t-slate-900 rounded-full animate-spin" />
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

          <p className="mt-12 text-xs text-slate-400">© {new Date().getFullYear()} {APP_NAME}</p>
        </div>
      </main>
    </div>
  );
};

export default Login;
