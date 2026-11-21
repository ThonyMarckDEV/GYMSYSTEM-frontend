// Conexión en tiempo real con Laravel Reverb (laravel-echo + pusher-js).
// El canal privado usuario.{id} se autoriza con el mismo JWT de la API
// (fetchWithAuth renueva el token si venció).
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { fetchWithAuth } from 'js/authToken';
import API_BASE_URL from 'js/urlHelper';

window.Pusher = Pusher;

let echo = null;

export const conectarEcho = () => {
    if (echo) return echo;
    const key = process.env.REACT_APP_REVERB_APP_KEY;
    if (!key) return null; // sin configurar: la campanita funciona igual (recarga periódica)

    const puerto = Number(process.env.REACT_APP_REVERB_PORT || 6001);
    const seguro = (process.env.REACT_APP_REVERB_SCHEME || 'http') === 'https';

    echo = new Echo({
        broadcaster: 'reverb',
        key,
        wsHost: process.env.REACT_APP_REVERB_HOST || window.location.hostname,
        wsPort: puerto,
        wssPort: puerto,
        forceTLS: seguro,
        enabledTransports: ['ws', 'wss'],
        authorizer: (channel) => ({
            authorize: (socketId, callback) => {
                fetchWithAuth(`${API_BASE_URL}/api/broadcasting/auth`, {
                    method: 'POST',
                    body: JSON.stringify({ socket_id: socketId, channel_name: channel.name }),
                })
                    .then(async (r) => {
                        if (!r.ok) throw new Error(`No autorizado (${r.status})`);
                        callback(null, await r.json());
                    })
                    .catch((e) => callback(e, null));
            },
        }),
    });
    return echo;
};

export const desconectarEcho = () => {
    try { echo?.disconnect(); } catch { /* ya desconectado */ }
    echo = null;
};

/** 'connected' | 'connecting' | 'unavailable' | 'failed' | 'disconnected' */
export const estadoConexion = () => echo?.connector?.pusher?.connection?.state || 'disconnected';
