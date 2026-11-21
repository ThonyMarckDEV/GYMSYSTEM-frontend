import { useState, useEffect, useCallback } from 'react';
import { index } from 'services/dashboardService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';

/**
 * Datos del dashboard. La sede NO se filtra aquí: es la sede elegida en el
 * menú lateral (header X-Sucursal-Id), así todo el sistema muestra la misma.
 */
export const useDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData]       = useState(null);
    const [alert, setAlert]     = useState(null);

    const fetchDashboard = useCallback(async () => {
        setLoading(true);
        try {
            const response = await index({});
            setData(response.data);
        } catch (err) {
            setAlert(handleApiError(err, 'Error al cargar el dashboard'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

    return { loading, data, alert, setAlert, recargar: fetchDashboard };
};
