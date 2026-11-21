import { useState, useCallback, useRef, useEffect } from 'react';
import { useRefrescarLista } from 'hooks/useRefrescarLista';
import { index, toggleStatus } from 'services/empresaService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';

export const useIndex = () => {
    const [loading, setLoading]               = useState(true);
    const [empresas, setEmpresas]             = useState([]);
    const [paginationInfo, setPaginationInfo] = useState({ currentPage: 1, totalPages: 1, total: 0 });
    const [filters, setFilters]               = useState({ search: '', estado: '' });
    const filtersRef                          = useRef(filters);
    const [alert, setAlert]                   = useState(null);

    const [showConfirm, setShowConfirm] = useState(false);
    const [idToToggle, setIdToToggle]   = useState(null);

    const fetchEmpresas = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const response = await index(page, filtersRef.current);
            setEmpresas(response.data || []);
            setPaginationInfo({
                currentPage: response.current_page,
                totalPages:  response.last_page,
                total:       response.total
            });
        } catch (err) {
            setAlert(handleApiError(err, 'Error al cargar las empresas'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchEmpresas(1); }, [fetchEmpresas]);

    const handleAskToggle = (id) => { setIdToToggle(id); setShowConfirm(true); };

    const handleConfirmToggle = async () => {
        setShowConfirm(false);
        setLoading(true);
        try {
            await toggleStatus(idToToggle);
            setAlert({ type: 'success', message: 'Estado de la empresa actualizado correctamente.' });
            await fetchEmpresas(paginationInfo.currentPage);
        } catch (err) {
            setAlert(handleApiError(err, 'Error al cambiar el estado'));
        } finally {
            setLoading(false);
            setIdToToggle(null);
        }
    };

    const handleFilterChange  = (name, val) => setFilters(prev => ({ ...prev, [name]: val }));
    const handleFilterSubmit  = () => { filtersRef.current = filters; fetchEmpresas(1); };
    const handleFilterClear   = () => {
        const reset = { search: '', estado: '' };
        setFilters(reset); filtersRef.current = reset; fetchEmpresas(1);
    };

    // Se cerró el panel de crear/editar: recargar la página actual
    useRefrescarLista(() => fetchEmpresas(paginationInfo.currentPage));

    return {
        loading, empresas, paginationInfo, filters, setFilters, alert, setAlert,
        showConfirm, setShowConfirm, setIdToToggle,
        fetchEmpresas, handleAskToggle, handleConfirmToggle,
        handleFilterChange, handleFilterSubmit, handleFilterClear
    };
};
