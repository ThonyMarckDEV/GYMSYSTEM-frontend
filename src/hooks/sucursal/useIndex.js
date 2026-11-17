import { useState, useCallback, useRef, useEffect } from 'react';
import { index, toggleStatus } from 'services/sucursalService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';

export const useIndex = () => {
    const [loading, setLoading]               = useState(true);
    const [sucursales, setSucursales]             = useState([]);
    const [paginationInfo, setPaginationInfo] = useState({ currentPage: 1, totalPages: 1, total: 0 });
    const [filters, setFilters]               = useState({ search: '', estado: '' });
    const filtersRef                          = useRef(filters);
    const [alert, setAlert]                   = useState(null);

    const [showConfirm, setShowConfirm] = useState(false);
    const [idToToggle, setIdToToggle]   = useState(null);

    const fetchSucursales = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const response = await index(page, filtersRef.current);
            setSucursales(response.data || []);
            setPaginationInfo({
                currentPage: response.current_page,
                totalPages:  response.last_page,
                total:       response.total
            });
        } catch (err) {
            setAlert(handleApiError(err, 'Error al cargar las sucursales'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchSucursales(1); }, [fetchSucursales]);

    const handleAskToggle = (id) => { setIdToToggle(id); setShowConfirm(true); };

    const handleConfirmToggle = async () => {
        setShowConfirm(false);
        setLoading(true);
        try {
            await toggleStatus(idToToggle);
            setAlert({ type: 'success', message: 'Estado de la sucursal actualizado correctamente.' });
            await fetchSucursales(paginationInfo.currentPage);
        } catch (err) {
            setAlert(handleApiError(err, 'Error al cambiar el estado'));
        } finally {
            setLoading(false);
            setIdToToggle(null);
        }
    };

    const handleFilterChange  = (name, val) => setFilters(prev => ({ ...prev, [name]: val }));
    const handleFilterSubmit  = () => { filtersRef.current = filters; fetchSucursales(1); };
    const handleFilterClear   = () => {
        const reset = { search: '', estado: '' };
        setFilters(reset); filtersRef.current = reset; fetchSucursales(1);
    };

    return {
        loading, sucursales, paginationInfo, filters, setFilters, alert, setAlert,
        showConfirm, setShowConfirm, setIdToToggle,
        fetchSucursales, handleAskToggle, handleConfirmToggle,
        handleFilterChange, handleFilterSubmit, handleFilterClear
    };
};
