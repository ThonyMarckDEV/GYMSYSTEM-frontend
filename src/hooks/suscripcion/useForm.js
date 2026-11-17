import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { show, store, update } from 'services/suscripcionService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';

const FORM_INICIAL = {
    nombre: '',
    descripcion: '',
    precio_mensual: '',
    max_sucursales: '',
    max_cajas_por_sucursal: '',
    max_clientes: '',
    max_empleados: '',
};

/**
 * Store y Update de planes del sistema en un solo hook
 * (si la URL trae :id, edita; si no, registra).
 */
export const useForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = !!id;

    const [loading, setLoading] = useState(isEditing);
    const [saving, setSaving]   = useState(false);
    const [alert, setAlert]     = useState(null);
    const [formData, setFormData] = useState(FORM_INICIAL);

    useEffect(() => {
        if (!isEditing) return;
        show(id)
            .then(res => {
                const d = res.data || res;
                setFormData({
                    nombre:         d.nombre || '',
                    descripcion:    d.descripcion || '',
                    precio_mensual: d.precio_mensual ?? '',
                    max_sucursales: d.max_sucursales ?? '',
                    max_cajas_por_sucursal: d.max_cajas_por_sucursal ?? '',
                    max_clientes:   d.max_clientes ?? '',
                    max_empleados:  d.max_empleados ?? '',
                });
            })
            .catch(err => setAlert(handleApiError(err, 'No se pudo cargar el plan.')))
            .finally(() => setLoading(false));
    }, [id, isEditing]);

    const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setAlert(null);
        try {
            if (isEditing) await update(id, formData);
            else await store(formData);
            setAlert({ type: 'success', message: `Plan ${isEditing ? 'actualizado' : 'registrado'} correctamente. Redirigiendo...` });
            setTimeout(() => navigate('/suscripcion/listar'), 1500);
        } catch (err) {
            setAlert(handleApiError(err, 'Error al guardar el plan'));
        } finally {
            setSaving(false);
        }
    };

    return { formData, loading, saving, alert, setAlert, handleChange, handleSubmit, isEditing, navigate };
};
