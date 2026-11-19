import React, { useEffect, useState } from 'react';
import { Dumbbell } from 'lucide-react';
import { APP_NAME } from 'config/app';
import { useAuth } from 'context/AuthContext';
import { obtenerUrlFirmada } from 'js/archivoAutenticado';
import { logoUrl } from 'services/empresaService';

/** Isotipo del sistema: una pesa sobre amarillo (se usa si la empresa no subió logo). */
export const Isotipo = ({ tam = 'md', className = '' }) => {
    const t = {
        sm: 'w-8 h-8 rounded-lg [&>svg]:w-[18px] [&>svg]:h-[18px]',
        md: 'w-9 h-9 rounded-lg [&>svg]:w-5 [&>svg]:h-5',
        lg: 'w-12 h-12 rounded-xl [&>svg]:w-6 [&>svg]:h-6',
    }[tam];
    return (
        <div className={`${t} flex-shrink-0 bg-primary text-secondary flex items-center justify-center ${className}`}>
            <Dumbbell strokeWidth={2.25} aria-hidden />
        </div>
    );
};

/** Isotipo + nombre del sistema. */
const Marca = ({ tam = 'md', claro = false, className = '' }) => (
    <div className={`flex items-center gap-3 ${className}`}>
        <Isotipo tam={tam} />
        <span className={`font-bold tracking-tight ${tam === 'lg' ? 'text-xl' : 'text-[15px]'} ${claro ? 'text-white' : 'text-slate-900'}`}>
            {APP_NAME}
        </span>
    </div>
);

/** URL firmada del logo que la empresa subió en Configuración (null si no tiene). */
export const useLogoEmpresa = () => {
    const { empresa } = useAuth();
    const [src, setSrc] = useState(null);
    const tiene = !!empresa?.tiene_logo;
    const version = empresa?.logo_version || '';

    useEffect(() => {
        let activo = true;
        setSrc(null);
        if (!tiene) return undefined;
        obtenerUrlFirmada(logoUrl(version))
            .then(u => activo && setSrc(u))
            .catch(() => activo && setSrc(null));
        return () => { activo = false; };
    }, [tiene, version]);

    return src;
};

/** Marca del menú lateral: la pesa con el nombre del sistema. */
export const MarcaSidebar = ({ colapsado = false }) => (
    <div className="flex items-center gap-3 min-w-0">
        <Isotipo />
        {!colapsado && <span className="font-bold text-[15px] tracking-tight text-white truncate">{APP_NAME}</span>}
    </div>
);

export default Marca;
