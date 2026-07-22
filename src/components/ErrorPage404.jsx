import React, { useEffect } from 'react';
import { HiOutlineArrowLongLeft } from 'react-icons/hi2';
import { PiSneakerMoveBold } from 'react-icons/pi';

const NotFoundPage = () => {
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

      {/* Patrón de rejilla sutil dorado */}
      <div
        className="absolute inset-0 opacity-[0.06] z-0"
        style={{
          backgroundImage: 'linear-gradient(#FFC700 1px, transparent 1px), linear-gradient(90deg, #FFC700 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      ></div>

      <div className="relative z-10 text-center max-w-lg">

        {/* Icono animado */}
        <div className="animate-in opacity-0 translate-y-4 transition-all duration-700 ease-out mb-10">
          <div className="inline-flex items-center justify-center w-32 h-32 border-2 border-primary rounded-full mb-4 animate-float relative">
            <div className="absolute inset-2 border border-dashed border-primary/40 rounded-full"></div>
            <PiSneakerMoveBold className="text-6xl text-primary" />
          </div>
        </div>

        {/* Título */}
        <h1 className="animate-in opacity-0 translate-y-4 transition-all duration-700 ease-out text-8xl font-black tracking-tighter text-primary mb-2">
          404
        </h1>

        {/* Subtítulo */}
        <h2 className="animate-in opacity-0 translate-y-4 transition-all duration-700 ease-out text-sm font-black uppercase tracking-[0.4em] text-white mb-8">
          Rutina no encontrada
        </h2>

        {/* Descripción */}
        <p className="animate-in opacity-0 translate-y-4 transition-all duration-700 ease-out mb-12 px-6 leading-relaxed text-base font-medium text-white/60">
          La página que buscas se movió de estación o nunca existió. Volvamos al panel principal.
        </p>

        {/* Botón */}
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
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(2deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
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

export default NotFoundPage;