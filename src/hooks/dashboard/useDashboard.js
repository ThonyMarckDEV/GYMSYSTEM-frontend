import { useState, useEffect, useCallback } from 'react';
import { index } from 'services/dashboardService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';

export const useDashboard = () => {
    const [loading, setLoading]   = useState(true);
    const [data, setData]         = useState(null);
    const [alert, setAlert]       = useState(null);
    const [sucursalId, setSucursalId] = useState('');

    const fetchDashboard = useCallback(async (sucursal = '') => {
        setLoading(true);
        try {
            const response = await index({ sucursal_id: sucursal });
            setData(response.data);
        } catch (err) {
            setAlert(handleApiError(err, 'Error al cargar el dashboard'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchDashboard(''); }, [fetchDashboard]);

    const cambiarSucursal = (valor) => {
        setSucursalId(valor);
        fetchDashboard(valor);
    };

    return { loading, data, alert, setAlert, sucursalId, cambiarSucursal, recargar: () => fetchDashboard(sucursalId) };
};
