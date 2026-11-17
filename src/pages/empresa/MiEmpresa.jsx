import React, { useEffect, useState } from 'react';
import { show, update } from 'services/empresaService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';
import EmpresaForm from 'components/Shared/Formularios/empresa/EmpresaForm';
import PageHeader from 'components/Shared/Headers/PageHeader';
import LoadingScreen from 'components/Shared/LoadingScreen';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import { BuildingOffice2Icon } from '@heroicons/react/24/outline';

const VACIO = { razon_social: '', nombre_comercial: '', ruc: '', direccion: '', telefono: '', correo: '' };

/** Datos del negocio (aparecen en tickets y comprobantes). Solo superadmin. */
const MiEmpresa = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [alert, setAlert] = useState(null);
    const [formData, setFormData] = useState(VACIO);

    useEffect(() => {
        show()
            .then(res => {
                const d = res.data || {};
                setFormData(Object.fromEntries(Object.keys(VACIO).map(k => [k, d[k] || ''])));
            })
            .catch(err => setAlert(handleApiError(err, 'No se pudieron cargar los datos de la empresa.')))
            .finally(() => setLoading(false));
    }, []);

    const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setAlert(null);
        try {
            await update(formData);
            setAlert({ type: 'success', message: 'Datos de la empresa actualizados.' });
        } catch (err) {
            setAlert(handleApiError(err, 'Error al guardar los datos de la empresa'));
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <LoadingScreen />;

    return (
        <div className="container mx-auto p-6">
            <PageHeader title="Datos de la Empresa" subtitle="Se muestran en tickets y comprobantes" icon={BuildingOffice2Icon} />
            <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
                <EmpresaForm formData={formData} handleChange={handleChange} />
                <div className="mt-8 flex justify-end">
                    <button type="submit" disabled={saving}
                        className="bg-secondary text-primary px-10 py-3 rounded-lg font-black uppercase shadow-lg hover:bg-secondary/90 disabled:opacity-50">
                        {saving ? 'Guardando...' : 'Guardar cambios'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default MiEmpresa;
