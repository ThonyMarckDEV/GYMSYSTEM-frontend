import React, { useState } from 'react';

// ---------------------------------------------------------------------------
// Gráficos simples en HTML/CSS para el dashboard.
// - Una sola serie => un solo tono oscuro (el amarillo de marca no tiene
//   contraste suficiente sobre blanco para marcas de datos).
// - Tooltip al pasar el mouse o al enfocar con teclado.
// - Texto siempre en tinta de texto, nunca del color de la serie.
// ---------------------------------------------------------------------------

export const formatSoles = (n) =>
    `S/ ${Number(n || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatCompacto = (n) => {
    const v = Number(n || 0);
    if (v >= 1000) return `S/ ${(v / 1000).toLocaleString('es-PE', { maximumFractionDigits: 1 })}k`;
    return `S/ ${v.toLocaleString('es-PE', { maximumFractionDigits: 0 })}`;
};

/** Paso "bonito" para el eje (1, 2, 5 × 10^n). */
const ejeMaximo = (max) => {
    if (max <= 0) return 100;
    const pot = Math.pow(10, Math.floor(Math.log10(max)));
    return [1, 2, 2.5, 5, 10].find(m => m * pot >= max) * pot;
};

/**
 * Barras verticales de una serie (ej. ingresos por mes).
 * @param {Array<{label:string, total:number, pagos:number}>} data
 */
export const BarrasVerticales = ({ data = [], alto = 200 }) => {
    const [activo, setActivo] = useState(null);
    const max = ejeMaximo(Math.max(0, ...data.map(d => d.total)));
    const lineas = [1, 0.5, 0]; // grilla recesiva: máximo, mitad y base

    return (
        <div className="relative select-none">
            <div className="flex" style={{ height: alto }}>
                {/* Eje Y */}
                <div className="relative w-14 flex-shrink-0 text-[10px] text-slate-400 tabular-nums">
                    {lineas.map(l => (
                        <span key={l} className="absolute right-2 -translate-y-1/2" style={{ top: `${(1 - l) * 100}%` }}>
                            {formatCompacto(max * l)}
                        </span>
                    ))}
                </div>

                {/* Área de trazado */}
                <div className="relative flex-1">
                    {lineas.map(l => (
                        <div key={l} className={`absolute inset-x-0 border-t ${l === 0 ? 'border-slate-300' : 'border-slate-100'}`}
                            style={{ top: `${(1 - l) * 100}%` }} />
                    ))}

                    <div className="absolute inset-0 flex items-end gap-[2px]">
                        {data.map((d, i) => {
                            const h = max ? (d.total / max) * 100 : 0;
                            const esActivo = activo === i;
                            return (
                                <div key={d.mes || i}
                                    className="relative flex-1 h-full flex items-end justify-center cursor-default outline-none"
                                    tabIndex={0}
                                    onMouseEnter={() => setActivo(i)} onMouseLeave={() => setActivo(null)}
                                    onFocus={() => setActivo(i)} onBlur={() => setActivo(null)}
                                    aria-label={`${d.label}: ${formatSoles(d.total)}, ${d.pagos} pagos`}
                                >
                                    <div className="w-full max-w-[44px] rounded-t transition-opacity"
                                        style={{
                                            height: `${h}%`,
                                            minHeight: d.total > 0 ? 2 : 0,
                                            backgroundColor: 'var(--color-barra, #27272a)',
                                            opacity: activo === null || esActivo ? 1 : 0.45,
                                        }} />

                                    {esActivo && (
                                        <div className="absolute z-10 left-1/2 -translate-x-1/2 whitespace-nowrap px-2.5 py-1.5 rounded-md bg-white border border-slate-200 shadow-lg text-xs"
                                            style={{ bottom: `calc(${h}% + 6px)` }}>
                                            <div className="font-bold text-slate-500">{d.label}</div>
                                            <div className="font-black text-slate-900 tabular-nums">{formatSoles(d.total)}</div>
                                            <div className="text-slate-500">{d.pagos} pagos</div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Eje X */}
            <div className="flex pl-14 mt-1.5">
                {data.map((d, i) => (
                    <div key={d.mes || i} className={`flex-1 text-center text-[11px] ${activo === i ? 'text-slate-900 font-bold' : 'text-slate-500'}`}>
                        {d.label}
                    </div>
                ))}
            </div>
        </div>
    );
};

/**
 * Barras horizontales con etiqueta directa (ej. ingresos por sucursal).
 * @param {Array<{nombre:string, valor:number, detalle?:string}>} data
 */
export const BarrasHorizontales = ({ data = [], formato = (v) => v, vacio = 'Sin datos' }) => {
    const [activo, setActivo] = useState(null);
    const max = Math.max(0, ...data.map(d => d.valor));

    if (data.length === 0) return <p className="text-sm text-slate-400 py-6 text-center">{vacio}</p>;

    return (
        <ul className="space-y-3">
            {data.map((d, i) => (
                <li key={d.nombre}
                    tabIndex={0}
                    className="outline-none"
                    onMouseEnter={() => setActivo(i)} onMouseLeave={() => setActivo(null)}
                    onFocus={() => setActivo(i)} onBlur={() => setActivo(null)}
                    aria-label={`${d.nombre}: ${formato(d.valor)}${d.detalle ? `, ${d.detalle}` : ''}`}
                >
                    <div className="flex items-baseline justify-between gap-3 text-xs mb-1">
                        <span className={`font-bold truncate ${activo === i ? 'text-slate-900' : 'text-slate-700'}`}>{d.nombre}</span>
                        <span className="font-black text-slate-900 tabular-nums whitespace-nowrap">
                            {formato(d.valor)}
                            {d.detalle && <span className="ml-1.5 font-bold text-slate-400">{d.detalle}</span>}
                        </span>
                    </div>
                    <div className="h-2.5 rounded-full bg-slate-100">
                        <div className="h-full rounded-full transition-opacity"
                            style={{
                                width: `${max ? Math.max((d.valor / max) * 100, d.valor > 0 ? 2 : 0) : 0}%`,
                                backgroundColor: 'var(--color-barra, #27272a)',
                                opacity: activo === null || activo === i ? 1 : 0.45,
                            }} />
                    </div>
                </li>
            ))}
        </ul>
    );
};

/** Tarjeta de indicador (KPI). */
export const KpiTile = ({ label, valor, icon: Icon, ayuda, destacado = false }) => (
    <div className={`p-5 rounded-2xl border shadow-sm ${destacado ? 'bg-secondary border-secondary text-white' : 'bg-white border-slate-200'}`}>
        <div className={`flex items-center gap-2 text-[11px] font-black uppercase tracking-widest ${destacado ? 'text-primary' : 'text-slate-500'}`}>
            {Icon && <Icon className="w-4 h-4" />} {label}
        </div>
        <div className={`mt-2 text-3xl font-black tabular-nums leading-none ${destacado ? 'text-white' : 'text-slate-900'}`}>{valor}</div>
        {ayuda && <div className={`mt-1.5 text-xs ${destacado ? 'text-white/60' : 'text-slate-400'}`}>{ayuda}</div>}
    </div>
);

/** Contenedor de sección con título. */
export const Panel = ({ titulo, subtitulo, children, accion, className = '' }) => (
    <section className={`bg-white p-5 rounded-2xl border border-slate-200 shadow-sm ${className}`}>
        <div className="flex items-start justify-between gap-3 mb-4">
            <div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">{titulo}</h3>
                {subtitulo && <p className="text-xs text-slate-400 mt-0.5">{subtitulo}</p>}
            </div>
            {accion}
        </div>
        {children}
    </section>
);
