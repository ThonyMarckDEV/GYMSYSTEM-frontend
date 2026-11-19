import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { store } from 'services/sucursalService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';

export const SUCURSAL_FORM_INICIAL = {
    nombre: '',
    direccion: '',
    telefono: '',
};

export const useStore = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [alert, setAlert]     = useState(null);

    const [formData, setFormData] = useState(SUCURSAL_FORM_INICIAL);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setAlert(null);
        try {
            await store(formData);
            setAlert({ type: 'success', message: 'Sucursal registrada exitosamente. Redirigiendo...' });
            setTimeout(() => navigate('/sucursal/listar'), 900);
        } catch (err) {
            setAlert(handleApiError(err, 'Error al registrar la sucursal'));
        } finally {
            setLoading(false);
        }
    };

    return { formData, setFormData, loading, alert, setAlert, handleChange, handleSubmit };
};
