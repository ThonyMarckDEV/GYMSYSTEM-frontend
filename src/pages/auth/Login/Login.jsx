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
      
      {/* Capa de fondo con imagen de gym - MENOS DIFUMINADO */}
      <div className="absolute inset-0 z-0">
        <img 
          src={background}
          alt="Fondo de gimnasio premium en blanco y negro"
          className="w-full h-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50"></div>
      </div>

      {/* Línea decorativa sutil */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent z-10 opacity-60"></div>

      {/* Contenedor Principal - Fondo AMARILLO */}
      <div className="w-full max-w-md bg-primary rounded-sm shadow-elegant-gold p-8 sm:p-12 border border-secondary/10 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-10 pb-8 border-b border-secondary/15">
          <h2 className="text-[10px] font-bold text-secondary tracking-[0.4em] uppercase mb-6">
             38 GYM
          </h2>
          
          {/* Isotipo */}
          <div className="h-20 w-20 flex items-center justify-center mb-6 relative">
             <div className="absolute inset-0 rounded-full border border-secondary/40"></div>
             <div className="absolute inset-[3px] rounded-full border border-secondary/20"></div>
             
             <img 
               src={logo}
               alt="Logotipo de gimnasio"
               className="h-12 w-12 relative z-10 object-contain"
             />
          </div>

          <h1 className="text-xs font-semibold text-secondary/90 tracking-[0.3em] uppercase">
            BY Emily Diaz
          </h1>
        </div>

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
        
        {/* Footer */}
        <div className="mt-10 text-center border-t border-secondary/15 pt-5">
            <p className="text-[9px] text-secondary/60 font-medium uppercase tracking-[0.2em]">
                © {new Date().getFullYear()} Gimnasio. Todos los derechos reservados.
            </p>
        </div>
      </div>
    </div>
  );
};

export default Login;