import { useState, useCallback, useEffect } from 'react';
import { index } from 'services/perfilService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';

export const useMiPerfil = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData]       = useState(null);
    const [alert, setAlert]     = useState(null);

    const fetchMiPerfil = useCallback(async () => {
        setLoading(true);
        try {
            const response = await index();
            setData(response.data || response);
        } catch (err) {
            setAlert(handleApiError(err, 'Error al cargar tu perfil'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchMiPerfil(); }, [fetchMiPerfil]);

    return { loading, data, alert, setAlert, fetchMiPerfil };
};