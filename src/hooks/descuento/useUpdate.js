import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { show, update } from 'services/descuentoService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';

export const useUpdate = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving,  setSaving]  = useState(false);
    const [alert,   setAlert]   = useState(null);

    const [formData, setFormData] = useState({
        nombre: '',
        codigo: '',
        tipo: 'porcentaje',
        valor: '',
        fecha_inicio: '',
        fecha_fin: '',
        usos_maximos: ''
    });

    useEffect(() => {
        const loadDescuento = async () => {
            try {
                const response = await show(id);
                const data = response.data || response;
                setFormData({
                    nombre:        data.nombre        || '',
                    codigo:        data.codigo         || '',
                    tipo:          data.tipo           || 'porcentaje',
                    valor:         data.valor          || '',
                    fecha_inicio:  data.fecha_inicio    ? data.fecha_inicio.split('T')[0]  : '',
                    fecha_fin:     data.fecha_fin       ? data.fecha_fin.split('T')[0]     : '',
                    usos_maximos:  data.usos_maximos    || '',
                });
            } catch (err) {
                setAlert(handleApiError(err, 'No se pudo cargar la información del descuento.'));
            } finally {
                setLoading(false);
            }
        };
        if (id) loadDescuento();
    }, [id]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setAlert(null);
        try {
            await update(id, formData);
            setAlert({ type: 'success', message: 'Descuento actualizado correctamente.' });
            setTimeout(() => navigate('/descuento/listar'), 1500);
        } catch (err) {
            setAlert(handleApiError(err, 'Error al actualizar el descuento'));
        } finally {
            setSaving(false);
        }
    };

    return { formData, setFormData, loading, saving, alert, setAlert, handleChange, handleSubmit, navigate };
};