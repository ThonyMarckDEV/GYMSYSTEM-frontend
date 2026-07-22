// hooks/membresia/useMisSolicitudes.js — CLIENTE
import { useState, useCallback, useEffect } from 'react';
import { misSolicitudes } from 'services/membresiaClienteService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';

export const useMisSolicitudes = () => {
    const [loading, setLoading]           = useState(true);
    const [solicitudes, setSolicitudes]   = useState([]);
    const [alert, setAlert]               = useState(null);

    const fetchSolicitudes = useCallback(async () => {
        setLoading(true);
        try {
            const response = await misSolicitudes();
            setSolicitudes(response.data || response || []);
        } catch (err) {
            setAlert(handleApiError(err, 'Error al cargar tus solicitudes'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchSolicitudes(); }, [fetchSolicitudes]);

    return { loading, solicitudes, alert, setAlert, fetchSolicitudes };
};