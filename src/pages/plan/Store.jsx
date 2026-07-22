import React from 'react';
import { useStore } from 'hooks/plan/useStore';
import PlanForm from 'components/Shared/Formularios/plan/PlanForm';
import PageHeader from 'components/Shared/Headers/PageHeader';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import { TagIcon } from '@heroicons/react/24/outline';

const Store = () => {
    const { formData, loading, alert, setAlert, handleChange, handleSubmit } = useStore();

    return (
        <div className="container mx-auto p-6">
            <PageHeader
                title="Registrar Nuevo Plan"
                icon={TagIcon}
                buttonText="Volver al Listado"
                buttonLink="/plan/listar"
            />
            <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
                <PlanForm formData={formData} handleChange={handleChange} />
                <div className="mt-8 flex justify-end">
                    <button type="submit" disabled={loading}
                        className="bg-secondary text-primary px-8 py-3 rounded-lg font-black uppercase hover:bg-secondary/90 transition-colors disabled:opacity-50 shadow-lg">
                        {loading ? 'Guardando...' : 'Registrar Plan'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Store;