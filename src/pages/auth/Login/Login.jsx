import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import LoadingScreen from 'components/Shared/LoadingScreen';
import LoginForm from './components/LoginForm';
import ForgotPasswordForm from './components/ForgotPasswordForm';
import authService from 'services/authService';
import { useAuth } from 'context/AuthContext';
import background from 'assets/img/background.jpg';
import logo from 'assets/img/logo.png';
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
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-secondary">

      {/* Fondo: foto del gimnasio, oscurecida para que la tarjeta destaque */}
      <div className="absolute inset-0 z-0">
        <img
          src={background}
          alt=""
          className="w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/80"></div>
      </div>

      <div className="w-full max-w-sm relative z-10">
        {/* Marca */}
        <div className="flex flex-col items-center mb-6">
          <div className="h-16 w-16 rounded-2xl overflow-hidden ring-1 ring-white/15 shadow-elegant mb-3">
            <img src={logo} alt="" className="w-full h-full object-cover" />
          </div>
          <p className="text-white text-lg font-bold tracking-tight">{APP_NAME}</p>
        </div>

      {/* Tarjeta */}
      <div className="bg-white rounded-2xl shadow-elegant-gold p-7 sm:p-8">

        <div>
          {loading ? (
             <div className="flex justify-center items-center h-64">
              <LoadingScreen />
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
        </div>
        
      </div>

        <p className="mt-6 text-center text-xs text-white/50">
          © {new Date().getFullYear()} {APP_NAME}
        </p>
      </div>
    </div>
  );
};

export default Login;