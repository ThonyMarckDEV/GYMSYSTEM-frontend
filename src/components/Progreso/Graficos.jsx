import React, { useMemo, useRef, useState } from 'react';

// Una sola serie: el mismo color que las barras del dashboard (negro en claro, amarillo en oscuro).
const SERIE = 'var(--color-barra, #27272a)';
const SUPERFICIE = 'var(--sup-1, #ffffff)';   // anillo de los puntos (color del fondo de la tarjeta)
const GRILLA = 'var(--linea-1, #e2e8f0)';
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

const fechaCorta = (iso) => { const [, m, d] = iso.split('-').map(Number); return `${d} ${MESES[m - 1]}`; };
const fmt = (v, dec = 1) => Number(v).toLocaleString('es-PE', { maximumFractionDigits: dec });

/** Ticks "redondos" para el eje Y */
const ticksRedondos = (min, max, cuantos = 4) => {
    const rango = max - min || 1;
    const paso0 = rango / cuantos;
    const mag = 10 ** Math.floor(Math.log10(paso0));
    const paso = [1, 2, 2.5, 5, 10].map(f => f * mag).find(p => p >= paso0) || paso0;
    const ini = Math.floor(min / paso) * paso;
    const fin = Math.ceil(max / paso) * paso;
    const t = [];
    for (let v = ini; v <= fin + paso / 2; v += paso) t.push(Number(v.toFixed(6)));
    return t;
};

/**
 * Evolución de una medida en el tiempo (una sola serie).
 * datos: [{ fecha: 'YYYY-MM-DD', valor: number }] · referencia: { valor, etiqueta } (ej. peso meta)
 */
export const GraficoLinea = ({ datos, unidad = '', referencia = null, alto = 220, decimales = 1, titulo }) => {
    const ref = useRef(null);
    const [activo, setActivo] = useState(null);
    const ancho = 640;
    const m = { top: 16, right: 64, bottom: 28, left: 44 };

    const puntos = useMemo(() => datos.filter(d => d.valor !== null && d.valor !== undefined), [datos]);

    const escala = useMemo(() => {
        if (!puntos.length) return null;
        const vals = puntos.map(p => p.valor).concat(referencia?.valor != null ? [referencia.valor] : []);
        let min = Math.min(...vals), max = Math.max(...vals);
        const pad = (max - min) * 0.15 || Math.max(1, max * 0.05);
        const ticks = ticksRedondos(min - pad, max + pad);
        min = ticks[0]; max = ticks[ticks.length - 1];
        const t0 = new Date(puntos[0].fecha).getTime();
        const t1 = new Date(puntos[puntos.length - 1].fecha).getTime();
        const x = (f) => (t1 === t0 ? (m.left + (ancho - m.right)) / 2 : m.left + ((new Date(f).getTime() - t0) / (t1 - t0)) * (ancho - m.left - m.right));
        const y = (v) => m.top + (1 - (v - min) / (max - min || 1)) * (alto - m.top - m.bottom);
        return { x, y, ticks };
    }, [puntos, referencia, alto, m.left, m.right, m.top, m.bottom]);

    if (!puntos.length || !escala) {
        return <p className="text-sm text-slate-400 py-10 text-center">Aún no hay datos para graficar.</p>;
    }

    const { x, y, ticks } = escala;
    const linea = puntos.map((p, i) => `${i ? 'L' : 'M'}${x(p.fecha).toFixed(1)},${y(p.valor).toFixed(1)}`).join(' ');
    const area = `${linea} L${x(puntos[puntos.length - 1].fecha).toFixed(1)},${alto - m.bottom} L${x(puntos[0].fecha).toFixed(1)},${alto - m.bottom} Z`;
    const ultimo = puntos[puntos.length - 1];
    const etiquetasX = puntos.length <= 2 ? puntos : [puntos[0], puntos[Math.floor(puntos.length / 2)], ultimo];

    // El cursor se ajusta a la medición más cercana
    const alMover = (e) => {
        const r = ref.current.getBoundingClientRect();
        const px = ((e.clientX - r.left) / r.width) * ancho;
        let mejor = 0;
        puntos.forEach((p, i) => { if (Math.abs(x(p.fecha) - px) < Math.abs(x(puntos[mejor].fecha) - px)) mejor = i; });
        setActivo(mejor);
    };
    const pa = activo !== null ? puntos[activo] : null;

    return (
        <div className="relative">
            <svg ref={ref} viewBox={`0 0 ${ancho} ${alto}`} className="w-full h-auto select-none touch-none" role="img"
                aria-label={`${titulo || 'Evolución'}: ${fmt(puntos[0].valor, decimales)}${unidad} el ${fechaCorta(puntos[0].fecha)} a ${fmt(ultimo.valor, decimales)}${unidad} el ${fechaCorta(ultimo.fecha)}`}
                onPointerMove={alMover} onPointerLeave={() => setActivo(null)}>
                {/* Grilla y eje Y (recesivos) */}
                {ticks.map(t => (
                    <g key={t}>
                        <line x1={m.left} x2={ancho - m.right} y1={y(t)} y2={y(t)} stroke={GRILLA} strokeWidth="1" />
                        <text x={m.left - 8} y={y(t)} textAnchor="end" dominantBaseline="middle" className="fill-current text-slate-400" fontSize="11">{fmt(t, decimales)}</text>
                    </g>
                ))}
                {etiquetasX.map(p => (
                    <text key={p.fecha} x={x(p.fecha)} y={alto - 8} textAnchor="middle" className="fill-current text-slate-400" fontSize="11">{fechaCorta(p.fecha)}</text>
                ))}

                {/* Referencia (meta) */}
                {referencia?.valor != null && (
                    <g>
                        <line x1={m.left} x2={ancho - m.right} y1={y(referencia.valor)} y2={y(referencia.valor)} className="stroke-current text-slate-400" strokeWidth="1" />
                        <text x={ancho - m.right + 6} y={y(referencia.valor)} dominantBaseline="middle" className="fill-current text-slate-500" fontSize="11">{referencia.etiqueta}</text>
                    </g>
                )}

                {/* Serie */}
                <path d={area} fill={SERIE} opacity="0.1" />
                <path d={linea} fill="none" stroke={SERIE} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

                {/* Punto final con su valor */}
                <circle cx={x(ultimo.fecha)} cy={y(ultimo.valor)} r="5" fill={SERIE} stroke={SUPERFICIE} strokeWidth="2" />
                <text x={x(ultimo.fecha) + 10} y={y(ultimo.valor)} dominantBaseline="middle" className="fill-current text-slate-800" fontSize="12" fontWeight="700">
                    {fmt(ultimo.valor, decimales)}{unidad}
                </text>

                {/* Cursor */}
                {pa && (
                    <g>
                        <line x1={x(pa.fecha)} x2={x(pa.fecha)} y1={m.top} y2={alto - m.bottom} stroke={GRILLA} strokeWidth="1" />
                        <circle cx={x(pa.fecha)} cy={y(pa.valor)} r="5" fill={SERIE} stroke={SUPERFICIE} strokeWidth="2" />
                    </g>
                )}
            </svg>
            {pa && (
                <div className="pointer-events-none absolute top-0 -translate-x-1/2 px-2.5 py-1.5 rounded-md bg-white border border-slate-200 shadow-lg text-xs whitespace-nowrap"
                    style={{ left: `${(x(pa.fecha) / ancho) * 100}%` }}>
                    <p className="font-black text-slate-900 tabular-nums">{fmt(pa.valor, decimales)}{unidad}</p>
                    <p className="text-slate-500">{fechaCorta(pa.fecha)}</p>
                </div>
            )}
        </div>
    );
};

/**
 * Calorías de los últimos 7 días (columnas) con la meta diaria como referencia.
 * datos: [{ fecha, calorias }]
 */
export const GraficoCalorias = ({ datos, meta }) => {
    const [activo, setActivo] = useState(null);
    const ancho = 640, alto = 200;
    const m = { top: 20, right: 56, bottom: 26, left: 44 };
    const max = Math.max(meta || 0, ...datos.map(d => d.calorias), 500);
    const ticks = ticksRedondos(0, max * 1.1, 4);
    const tope = ticks[ticks.length - 1];
    const y = (v) => m.top + (1 - v / tope) * (alto - m.top - m.bottom);
    const banda = (ancho - m.left - m.right) / datos.length;
    const anchoBarra = Math.min(24, banda * 0.5);
    const DIAS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
    const etiquetaDia = (iso) => DIAS[new Date(`${iso}T12:00:00`).getDay()];
    const hoy = datos[datos.length - 1];

    return (
        <div className="relative">
            <svg viewBox={`0 0 ${ancho} ${alto}`} className="w-full h-auto select-none" role="img"
                aria-label={`Calorías de los últimos 7 días. Hoy ${hoy?.calorias ?? 0} de ${meta ?? '—'} kcal`}>
                {ticks.map(t => (
                    <g key={t}>
                        <line x1={m.left} x2={ancho - m.right} y1={y(t)} y2={y(t)} stroke={GRILLA} strokeWidth="1" />
                        <text x={m.left - 8} y={y(t)} textAnchor="end" dominantBaseline="middle" className="fill-current text-slate-400" fontSize="11">{fmt(t, 0)}</text>
                    </g>
                ))}
                {meta ? (
                    <g>
                        <line x1={m.left} x2={ancho - m.right} y1={y(meta)} y2={y(meta)} className="stroke-current text-slate-500" strokeWidth="1" />
                        <text x={ancho - m.right + 6} y={y(meta)} dominantBaseline="middle" className="fill-current text-slate-500" fontSize="11">Meta</text>
                    </g>
                ) : null}
                {datos.map((d, i) => {
                    const cx = m.left + banda * i + banda / 2;
                    const h = Math.max(0, y(0) - y(d.calorias));
                    const r = Math.min(4, h);
                    const x0 = cx - anchoBarra / 2, y0 = y(d.calorias);
                    // Columna con el extremo de datos redondeado (4 px) y la base recta
                    const path = h > 0
                        ? `M${x0},${y(0)} V${y0 + r} Q${x0},${y0} ${x0 + r},${y0} H${x0 + anchoBarra - r} Q${x0 + anchoBarra},${y0} ${x0 + anchoBarra},${y0 + r} V${y(0)} Z`
                        : null;
                    const esHoy = i === datos.length - 1;
                    return (
                        <g key={d.fecha} onPointerEnter={() => setActivo(i)} onPointerLeave={() => setActivo(null)}
                            onFocus={() => setActivo(i)} onBlur={() => setActivo(null)} tabIndex={0} aria-label={`${etiquetaDia(d.fecha)}: ${d.calorias} kcal`}>
                            {/* Área de interacción más grande que la columna */}
                            <rect x={m.left + banda * i} y={m.top} width={banda} height={alto - m.top - m.bottom} fill="transparent" />
                            {path && <path d={path} fill={SERIE} opacity={activo === null || activo === i ? 1 : 0.45} />}
                            {esHoy && d.calorias > 0 && (
                                <text x={cx} y={y0 - 6} textAnchor="middle" className="fill-current text-slate-800" fontSize="12" fontWeight="700">{fmt(d.calorias, 0)}</text>
                            )}
                            <text x={cx} y={alto - 8} textAnchor="middle" className={`fill-current ${esHoy ? 'text-slate-800' : 'text-slate-400'}`} fontSize="11" fontWeight={esHoy ? 700 : 400}>
                                {esHoy ? 'hoy' : etiquetaDia(d.fecha)}
                            </text>
                        </g>
                    );
                })}
            </svg>
            {activo !== null && (
                <div className="pointer-events-none absolute top-0 -translate-x-1/2 px-2.5 py-1.5 rounded-md bg-white border border-slate-200 shadow-lg text-xs whitespace-nowrap"
                    style={{ left: `${((m.left + banda * activo + banda / 2) / ancho) * 100}%` }}>
                    <p className="font-black text-slate-900 tabular-nums">{fmt(datos[activo].calorias, 0)} kcal</p>
                    <p className="text-slate-500">{fechaCorta(datos[activo].fecha)}{meta ? ` · meta ${fmt(meta, 0)}` : ''}</p>
                </div>
            )}
        </div>
    );
};
