import React from 'react';
import { useForm } from 'hooks/suscripcion/useForm';
import SuscripcionForm from 'components/Shared/Formularios/suscripcion/SuscripcionForm';
import PageHeader from 'components/Shared/Headers/PageHeader';
import LoadingScreen from 'components/Shared/LoadingScreen';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import { RocketLaunchIcon, PencilSquareIcon } from '@heroicons/react/24/outline';

/** Registrar y editar planes del sistema (misma pantalla). */
const Form = () => {
    const { formData, loading, saving, alert, setAlert, handleChange, handleSubmit, isEditing, navigate } = useForm();

    if (loading) return <LoadingScreen />;

    return (
        <div className="container mx-auto p-6">
            <PageHeader
                title={isEditing ? 'Editar Plan del Sistema' : 'Nuevo Plan del Sistema'}
                subtitle={isEditing ? `Editando: ${formData.nombre}` : 'Define el precio y los límites que tendrá cada gimnasio'}
                icon={isEditing ? PencilSquareIcon : RocketLaunchIcon}
                buttonText="← Volver al listado"
                buttonLink="/suscripcion/listar"
            />
            <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
                <SuscripcionForm formData={formData} handleChange={handleChange} />
                <div className="flex justify-end gap-4 mt-8">
                    <button type="button" onClick={() => navigate('/suscripcion/listar')}
                        className="px-6 py-3 bg-slate-100 text-slate-600 rounded-lg font-bold hover:bg-slate-200 transition-colors uppercase text-sm">
                        Cancelar
                    </button>
                    <button type="submit" disabled={saving}
                        className="bg-secondary text-primary px-10 py-3 rounded-lg font-black uppercase shadow-lg hover:bg-secondary/90 transition-all disabled:opacity-50">
                        {saving ? 'Guardando...' : (isEditing ? 'Guardar Cambios' : 'Registrar Plan')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Form;
