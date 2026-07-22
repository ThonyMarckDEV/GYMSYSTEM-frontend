import React, { useEffect } from 'react';
import { HiOutlineArrowLongLeft } from 'react-icons/hi2';
import { PiBarbellBold } from 'react-icons/pi';
import { HiOutlineLockClosed } from 'react-icons/hi2';

const UnauthorizedPage = () => {
  useEffect(() => {
    const elementsToAnimate = document.querySelectorAll('.animate-in');
    elementsToAnimate.forEach((element, index) => {
      setTimeout(() => {
        element.classList.add('animate-show');
      }, 150 * index);
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-secondary text-primary font-sans p-4 relative overflow-hidden">

      <div
        className="absolute inset-0 opacity-[0.06] z-0"
        style={{
          backgroundImage: 'linear-gradient(#FFC700 1px, transparent 1px), linear-gradient(90deg, #FFC700 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      ></div>

      <div className="relative z-10 text-center max-w-lg">

        <div className="animate-in opacity-0 translate-y-4 transition-all duration-700 ease-out mb-8">
          <div className="relative inline-block border-2 border-primary p-6 rounded-full">
            <PiBarbellBold className="text-5xl text-primary" />
            <HiOutlineLockClosed className="text-xl text-secondary bg-primary rounded-full p-1.5 absolute -bottom-1 -right-1 border-2 border-secondary" />
          </div>
        </div>

        <h1 className="animate-in opacity-0 translate-y-4 transition-all duration-700 ease-out text-7xl font-black tracking-tighter text-primary mb-2">
          401
        </h1>

        <h2 className="animate-in opacity-0 translate-y-4 transition-all duration-700 ease-out text-xs font-black uppercase tracking-[0.3em] text-white mb-6">
          Acceso Restringido
        </h2>

        <p className="animate-in opacity-0 translate-y-4 transition-all duration-700 ease-out mb-10 leading-relaxed text-base font-medium text-white/60">
          No tienes membresía activa para acceder a esta zona del gimnasio. Verifica tu suscripción o consulta con recepción.
        </p>

        <div className="animate-in opacity-0 translate-y-4 transition-all duration-700 ease-out">
          <a
            href="/"
            className="group inline-flex items-center gap-3 px-10 py-4 bg-primary text-secondary border-2 border-primary font-black uppercase text-xs tracking-[0.2em] hover:bg-secondary hover:text-primary transition-all duration-300"
          >
            <HiOutlineArrowLongLeft className="text-xl group-hover:-translate-x-2 transition-transform duration-300" />
            Regresar
          </a>
        </div>

      </div>

      <style jsx>{`
        .animate-in {
          opacity: 0;
          transform: translateY(20px);
        }
        .animate-show {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
      `}</style>
    </div>
  );
};

export default UnauthorizedPage;