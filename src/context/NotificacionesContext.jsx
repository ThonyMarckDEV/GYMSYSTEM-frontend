import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from 'context/AuthContext';
import { conectarEcho, desconectarEcho, estadoConexion } from 'js/echo';
import { index, leer as leerApi, leerTodas as leerTodasApi, eliminar as eliminarApi } from 'services/notificacionService';

/**
 * Notificaciones del usuario (la campanita):
 *  - carga inicial y "ver más"
 *  - en vivo por Reverb (canal privado usuario.{id}): llegan al instante con un aviso
 *  - si no hay conexión en vivo, se recargan cada 45 s
 * Además reenvía los eventos como eventos del navegador para que las páginas
 * se actualicen solas:  gym:notificacion  ·  gym:pago-revisando
 */
const NotificacionesContext = createContext(null);

const RECARGA_SIN_CONEXION_MS = 45000;
const TOAST_TIPO = { exito: 'success', error: 'error', alerta: 'warning', info: 'info' };

// Estos avisos ya los muestra la tarjeta animada de PagoEnVivo (abajo a la derecha): sin toast duplicado
const SIN_TOAST = ['pago_verificado', 'pago_rechazado'];

const AvisoToast = ({ n }) => (
    <div>
        <p className="font-black text-sm leading-tight">{n.titulo}</p>
        <p className="text-xs mt-0.5 opacity-80 line-clamp-3">{n.mensaje}</p>
    </div>
);

export const NotificacionesProvider = ({ children }) => {
    const { user } = useAuth();
    const usuarioId = user?.id;

    const [items, setItems] = useState([]);
    const [noLeidas, setNoLeidas] = useState(0);
    const [pagina, setPagina] = useState({ actual: 0, ultima: 1 });
    const [cargando, setCargando] = useState(false);
    const [enVivo, setEnVivo] = useState(false);
    const [nueva, setNueva] = useState(0); // contador para animar la campana
    const idsVistos = useRef(new Set());

    const cargar = useCallback(async (page = 1) => {
        setCargando(true);
        try {
            const r = await index(page);
            const lista = r.data || [];
            lista.forEach(n => idsVistos.current.add(n.id));
            setItems(prev => (page === 1 ? lista : [...prev, ...lista.filter(n => !prev.some(p => p.id === n.id))]));
            setNoLeidas(r.no_leidas ?? 0);
            setPagina({ actual: r.current_page, ultima: r.last_page });
        } catch { /* sin conexión: se reintenta luego */ } finally {
            setCargando(false);
        }
    }, []);

    // Carga inicial
    useEffect(() => { if (usuarioId) cargar(1); }, [usuarioId, cargar]);

    // En vivo (Reverb)
    useEffect(() => {
        if (!usuarioId) return;
        const echo = conectarEcho();
        if (!echo) return;

        const canal = echo.private(`usuario.${usuarioId}`);
        canal.listen('.notificacion', (n) => {
            if (idsVistos.current.has(n.id)) return;
            idsVistos.current.add(n.id);
            setItems(prev => [n, ...prev]);
            setNoLeidas(c => c + 1);
            setNueva(x => x + 1);
            if (!SIN_TOAST.includes(n.tipo)) {
                toast(<AvisoToast n={n} />, { type: TOAST_TIPO[n.nivel] || 'info', autoClose: 6000 });
            }
            window.dispatchEvent(new CustomEvent('gym:notificacion', { detail: n }));
        });
        canal.listen('.pago.revisando', (d) => {
            window.dispatchEvent(new CustomEvent('gym:pago-revisando', { detail: d }));
        });

        const pusher = echo.connector?.pusher;
        const alCambiar = ({ current }) => setEnVivo(current === 'connected');
        pusher?.connection.bind('state_change', alCambiar);
        setEnVivo(estadoConexion() === 'connected');

        return () => {
            pusher?.connection.unbind('state_change', alCambiar);
            echo.leave(`usuario.${usuarioId}`);
            desconectarEcho();
        };
    }, [usuarioId]);

    // Sin conexión en vivo: recarga periódica para no perder avisos
    useEffect(() => {
        if (!usuarioId || enVivo) return;
        const t = setInterval(() => cargar(1), RECARGA_SIN_CONEXION_MS);
        return () => clearInterval(t);
    }, [usuarioId, enVivo, cargar]);

    const leer = useCallback(async (n) => {
        if (n.leida) return;
        setItems(prev => prev.map(x => (x.id === n.id ? { ...x, leida: true } : x)));
        setNoLeidas(c => Math.max(0, c - 1));
        try { const r = await leerApi(n.id); setNoLeidas(r.data?.no_leidas ?? 0); } catch { /* se corrige al recargar */ }
    }, []);

    const leerTodas = useCallback(async () => {
        setItems(prev => prev.map(x => ({ ...x, leida: true })));
        setNoLeidas(0);
        try { await leerTodasApi(); } catch { cargar(1); }
    }, [cargar]);

    const eliminar = useCallback(async (n) => {
        setItems(prev => prev.filter(x => x.id !== n.id));
        if (!n.leida) setNoLeidas(c => Math.max(0, c - 1));
        try { const r = await eliminarApi(n.id); setNoLeidas(r.data?.no_leidas ?? 0); } catch { cargar(1); }
    }, [cargar]);

    const verMas = useCallback(() => {
        if (pagina.actual < pagina.ultima && !cargando) cargar(pagina.actual + 1);
    }, [pagina, cargando, cargar]);

    return (
        <NotificacionesContext.Provider value={{
            items, noLeidas, cargando, enVivo, nueva, hayMas: pagina.actual < pagina.ultima,
            leer, leerTodas, eliminar, verMas, recargar: () => cargar(1),
        }}>
            {children}
        </NotificacionesContext.Provider>
    );
};

export const useNotificaciones = () => useContext(NotificacionesContext);

/** Escucha un evento en vivo del navegador (gym:notificacion, gym:pago-revisando). */
export const useEventoEnVivo = (nombre, alRecibir) => {
    const ref = useRef(alRecibir);
    ref.current = alRecibir;
    useEffect(() => {
        const h = (e) => ref.current?.(e.detail);
        window.addEventListener(nombre, h);
        return () => window.removeEventListener(nombre, h);
    }, [nombre]);
};
