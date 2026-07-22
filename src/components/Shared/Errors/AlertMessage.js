import React, { useEffect, useState, useRef, useCallback } from 'react';

const DURACION = 5000; // ms antes del autocierre

const AlertMessage = ({ type = 'info', message, details, onClose }) => {
    const [visible, setVisible] = useState(false); // controla animación de entrada
    const [cerrando, setCerrando] = useState(false); // controla animación de salida
    const pausadoRef = useRef(false);
    const restanteRef = useRef(DURACION);
    const inicioRef = useRef(null);
    const timerRef = useRef(null);

    // ── Cierre con animación de salida ────────────────────────────────────────
    const handleClose = useCallback(() => {
        setCerrando(true);
        setTimeout(() => onClose && onClose(), 300); // espera a que termine el slide-out
    }, [onClose]);

    // ── Temporizador con pausa en hover ───────────────────────────────────────
    const iniciarTimer = useCallback(() => {
        inicioRef.current = Date.now();
        timerRef.current = setTimeout(handleClose, restanteRef.current);
    }, [handleClose]);

    const pausarTimer = useCallback(() => {
        pausadoRef.current = true;
        clearTimeout(timerRef.current);
        restanteRef.current -= Date.now() - inicioRef.current;
    }, []);

    const reanudarTimer = useCallback(() => {
        pausadoRef.current = false;
        iniciarTimer();
    }, [iniciarTimer]);

    useEffect(() => {
        if (!message) return;

        // dispara la animación de entrada en el siguiente frame
        const raf = requestAnimationFrame(() => setVisible(true));

        restanteRef.current = DURACION;
        setCerrando(false);
        if (onClose) iniciarTimer();

        return () => {
            cancelAnimationFrame(raf);
            clearTimeout(timerRef.current);
        };
    }, [message, onClose, iniciarTimer]);

    if (!message) return null;

    const estilos = {
        success: {
            barra: 'bg-green-600',
            icono: '✓',
            iconoColor: 'text-green-600',
            borde: 'border-green-200',
            texto: 'text-green-800',
        },
        error: {
            barra: 'bg-red-700',
            icono: '✕',
            iconoColor: 'text-red-700',
            borde: 'border-red-200',
            texto: 'text-red-800',
        },
        info: {
            barra: 'bg-primary',
            icono: 'ℹ',
            iconoColor: 'text-secondary',
            borde: 'border-primary/30',
            texto: 'text-secondary',
        },
    };

    const s = estilos[type] || estilos.info;

    // entrando: visible y no cerrando → en pantalla; si no → desplazado a la derecha
    const animacion = visible && !cerrando
        ? 'translate-x-0 opacity-100'
        : 'translate-x-full opacity-0';

    return (
        <div className="fixed top-5 right-5 z-[9999] w-full max-w-sm pointer-events-none">
            <div
                onMouseEnter={onClose ? pausarTimer : undefined}
                onMouseLeave={onClose ? reanudarTimer : undefined}
                className={`pointer-events-auto relative overflow-hidden rounded-xl border bg-white shadow-elegant-gold
                    transition-all duration-300 ease-out ${s.borde} ${animacion}`}
            >
                <div className="flex items-start gap-3 p-4">
                    <span className={`text-lg font-bold leading-none mt-0.5 ${s.iconoColor}`}>
                        {s.icono}
                    </span>

                    <div className="flex-grow text-sm">
                        <p className={`${s.texto} ${details && details.length > 0 ? 'font-semibold' : 'font-medium'}`}>
                            {message}
                        </p>

                        {details && details.length > 0 && (
                            <ul className="list-disc pl-5 mt-2 space-y-1 text-secondary/60">
                                {details.map((item, index) => (
                                    <li key={index}>{item}</li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {onClose && (
                        <button
                            type="button"
                            onClick={handleClose}
                            className="ml-1 font-bold text-lg leading-none text-secondary/40 hover:text-secondary transition-colors"
                            aria-label="Cerrar"
                        >
                            &times;
                        </button>
                    )}
                </div>

                {/* Barra de progreso que se vacía durante la duración */}
                {onClose && (
                    <div className="absolute bottom-0 left-0 h-1 w-full bg-primary-light">
                        <div
                            className={`h-full ${s.barra}`}
                            style={{
                                animation: `alert-progress ${DURACION}ms linear forwards`,
                                animationPlayState: pausadoRef.current ? 'paused' : 'running',
                            }}
                        />
                    </div>
                )}
            </div>

            <style>{`
                @keyframes alert-progress {
                    from { width: 100%; }
                    to   { width: 0%; }
                }
            `}</style>
        </div>
    );
};

export default AlertMessage;