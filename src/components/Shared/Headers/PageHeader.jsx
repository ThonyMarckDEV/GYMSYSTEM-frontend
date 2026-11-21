import React from 'react';
import { Link } from 'react-router-dom';
import { useEnPanel } from 'components/Shared/PanelLateral';

/**
 * Encabezado de cada pantalla: ícono, título, descripción y acción principal opcional.
 * Dentro del panel lateral se muestra compacto y sin el botón (se cierra con la X).
 */
const PageHeader = ({ title, subtitle, buttonText, buttonLink, icon: Icon }) => {
  const enPanel = useEnPanel();

  if (enPanel) {
    return (
      <div className="flex items-center gap-3 mb-5 pr-12">
        {Icon && (
          <div className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-lg bg-secondary text-primary">
            <Icon className="w-[18px] h-[18px]" />
          </div>
        )}
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-slate-900 leading-tight truncate">{title}</h2>
          {subtitle && <p className="text-sm text-slate-500 truncate">{subtitle}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-5 border-b border-slate-200">
      <div className="flex items-center gap-3.5 min-w-0">
        {Icon && (
          <div className="hidden sm:flex w-11 h-11 flex-shrink-0 items-center justify-center rounded-xl bg-secondary text-primary shadow-card">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <div className="min-w-0">
          <h1 className="text-2xl md:text-[1.75rem] font-bold text-slate-900 tracking-tight leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>

      {buttonText && buttonLink && (
        <Link
          to={buttonLink}
          className="inline-flex items-center justify-center gap-2 w-full md:w-auto px-4 py-2.5 rounded-lg bg-primary text-secondary text-sm font-semibold shadow-card hover:bg-primary-hover active:scale-[0.98] transition"
        >
          {buttonText}
        </Link>
      )}
    </div>
  );
};

export default PageHeader;
