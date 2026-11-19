import React from 'react';
import { Dumbbell } from 'lucide-react';
import { APP_NAME } from 'config/app';

/** Isotipo del sistema: una pesa sobre amarillo (sin logos de terceros). */
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

export default Marca;
