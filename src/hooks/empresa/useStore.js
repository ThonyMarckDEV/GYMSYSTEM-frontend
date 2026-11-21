import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { store } from 'services/empresaService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';

export const EMPRESA_FORM_INICIAL = {
    razon_social: '',
    nombre_comercial: '',
    ruc: '',
    direccion: '',
    telefono: '',
    correo: '',
    plan_suscripcion_id: '',
    suscripcion_vence: '',
};

export const useStore = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [alert, setAlert]     = useState(null);

    const [formData, setFormData] = useState(EMPRESA_FORM_INICIAL);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setAlert(null);
        try {
            await store(formData);
            setAlert({ type: 'success', message: 'Empresa registrada exitosamente. Redirigiendo...' });
            setTimeout(() => navigate('/empresa/listar'), 900);
        } catch (err) {
            setAlert(handleApiError(err, 'Error al registrar la empresa'));
        } finally {
            setLoading(false);
        }
    };

    return { formData, setFormData, loading, alert, setAlert, handleChange, handleSubmit };
};
