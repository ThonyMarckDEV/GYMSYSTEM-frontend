import React from 'react';
import { useStore } from 'hooks/descuento/useStore';
import DescuentoForm from 'components/Shared/Formularios/descuento/DescuentoForm';
import PageHeader from 'components/Shared/Headers/PageHeader';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import { TagIcon } from '@heroicons/react/24/outline';

const Store = () => {
    const { formData, loading, alert, setAlert, handleChange, handleSubmit } = useStore();

    return (
        <div className="container mx-auto p-6">
            <PageHeader
                title="Registrar Nuevo Descuento"
                icon={TagIcon}
                buttonText="Volver al Listado"
                buttonLink="/descuento/listar"
            />
            <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
                <DescuentoForm formData={formData} handleChange={handleChange} />
                <div className="mt-8 flex justify-end">
                    <button type="submit" disabled={loading}
                        className="bg-secondary text-primary px-8 py-3 rounded-lg font-black uppercase hover:bg-secondary/90 transition-colors disabled:opacity-50 shadow-lg">
                        {loading ? 'Guardando...' : 'Registrar Descuento'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Store;