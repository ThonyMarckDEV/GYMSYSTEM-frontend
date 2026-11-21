import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from 'components/Shared/Headers/PageHeader';
import { BarrasVerticales, BarrasHorizontales, KpiTile, Panel, formatSoles } from 'components/Dashboard/Charts';
import {
    ChartBarIcon, BanknotesIcon, ArrowTrendingUpIcon, BuildingOffice2Icon, BuildingStorefrontIcon,
    CalendarDaysIcon, ExclamationTriangleIcon, NoSymbolIcon, ReceiptPercentIcon, TableCellsIcon, UsersIcon,
} from '@heroicons/react/24/outline';

const METODOS = { transferencia: 'Transferencia', yape: 'Yape', plin: 'Plin', efectivo: 'Efectivo', tarjeta: 'Tarjeta' };
const fecha = (d) => (d ? new Date(`${d}T00:00:00`).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');

/** Situación de la suscripción: texto + color (nunca solo color). */
const SITUACION = {
    al_dia:          ['Al día', 'bg-emerald-50 text-emerald-700 border-emerald-200'],
    por_vencer:      ['Por vencer', 'bg-amber-50 text-amber-800 border-amber-200'],
    en_gracia:       ['En gracia', 'bg-amber-50 text-amber-800 border-amber-200'],
    bloqueada:       ['Bloqueada', 'bg-red-50 text-red-700 border-red-200'],
    sin_vencimiento: ['Sin vencimiento', 'bg-slate-50 text-slate-500 border-slate-200'],
};
const Situacion = ({ s }) => {
    const [txt, cls] = SITUACION[s] || SITUACION.sin_vencimiento;
    return <span className={`inline-block text-[11px] font-bold border rounded-full px-2 py-0.5 whitespace-nowrap ${cls}`}>{txt}</span>;
};

const diasTexto = (d) => (d > 0 ? `En ${d} días` : d === 0 ? 'Vence hoy' : `Venció hace ${Math.abs(d)} días`);

/** Superadmin sin empresa seleccionada: lo que le pagan las empresas a la plataforma. */
const DashboardPlataforma = ({ data, loading }) => {
    const [verTabla, setVerTabla] = useState(false);
    const { kpis, ingresos_mensuales, por_plan, metodos_pago, vencimientos, ultimos_pagos, por_empresa } = data;

    const variacion = kpis.variacion_mes === null ? 'Sin pagos el mes anterior'
        : `${kpis.variacion_mes >= 0 ? '+' : ''}${kpis.variacion_mes}% vs mes anterior (${formatSoles(kpis.ingresos_mes_anterior)})`;
    const porCobrar = kpis.por_vencer + kpis.en_gracia;

    return (
        <div className={`container mx-auto p-6 transition-opacity ${loading ? 'opacity-60' : ''}`}>
            <PageHeader title="Dashboard" subtitle="Plataforma · lo que te pagan las empresas por su suscripción" icon={ChartBarIcon} />

            <p className="text-xs text-slate-500 mb-6">
                Los clientes y membresías los gestiona cada gimnasio. Para ver el detalle de una empresa, selecciónala en el menú lateral.
            </p>

            {/* INGRESOS DE LA PLATAFORMA */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <KpiTile destacado label="Cobrado este mes" valor={formatSoles(kpis.ingresos_mes)} icon={BanknotesIcon} ayuda={variacion} />
                <KpiTile label="Ingreso mensual recurrente" valor={formatSoles(kpis.mrr)} icon={ArrowTrendingUpIcon} ayuda={`Proyección anual: ${formatSoles(kpis.arr)}`} />
                <KpiTile label={`Cobrado en ${new Date().getFullYear()}`} valor={formatSoles(kpis.ingresos_anio)} icon={CalendarDaysIcon} ayuda={`Histórico: ${formatSoles(kpis.ingresos_total)}`} />
                <KpiTile label="Pagos del mes" valor={kpis.pagos_mes} icon={ReceiptPercentIcon}
                    ayuda={`Promedio ${formatSoles(kpis.ticket_promedio)} · hoy ${formatSoles(kpis.ingresos_hoy)}${kpis.anulados_mes ? ` · ${kpis.anulados_mes} anulados` : ''}`} />
            </div>

            {/* EMPRESAS */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <KpiTile label="Empresas activas" valor={kpis.empresas_activas} icon={BuildingOffice2Icon}
                    ayuda={`${kpis.empresas_nuevas_mes} nuevas este mes${kpis.empresas_inactivas ? ` · ${kpis.empresas_inactivas} inactivas` : ''}`} />
                <KpiTile label="Por cobrar" valor={porCobrar} icon={ExclamationTriangleIcon}
                    ayuda={`${kpis.por_vencer} vencen en 7 días · ${kpis.en_gracia} en gracia`} />
                <KpiTile label="Bloqueadas" valor={kpis.bloqueadas} icon={NoSymbolIcon} ayuda={`${kpis.al_dia} al día · ${kpis.sin_vencimiento} sin vencimiento`} />
                <KpiTile label="Sedes activas" valor={kpis.sucursales_activas} icon={BuildingStorefrontIcon} ayuda={<span className="inline-flex items-center gap-1"><UsersIcon className="w-3.5 h-3.5" /> {kpis.usuarios} usuarios en las empresas</span>} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <Panel className="lg:col-span-2" titulo="Cobros de suscripción" subtitulo="Últimos 12 meses · pagos no anulados"
                    accion={
                        <button onClick={() => setVerTabla(v => !v)} className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-900">
                            <TableCellsIcon className="w-4 h-4" /> {verTabla ? 'Ocultar tabla' : 'Ver tabla'}
                        </button>
                    }>
                    <BarrasVerticales data={ingresos_mensuales} />
                    {verTabla && (
                        <table className="w-full text-xs mt-4">
                            <thead>
                                <tr className="text-[10px] uppercase text-slate-400 font-bold border-b border-slate-100">
                                    <th className="text-left py-1.5">Mes</th><th className="text-right py-1.5">Pagos</th><th className="text-right py-1.5">Cobrado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ingresos_mensuales.map(m => (
                                    <tr key={m.mes} className="border-b border-slate-50 last:border-0">
                                        <td className="py-1.5 text-slate-600">{m.label} {m.mes.slice(0, 4)}</td>
                                        <td className="py-1.5 text-right tabular-nums text-slate-600">{m.pagos}</td>
                                        <td className="py-1.5 text-right tabular-nums font-bold text-slate-900">{formatSoles(m.total)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </Panel>

                <div className="space-y-6">
                    <Panel titulo="Empresas por plan" subtitulo="Empresas activas y su aporte mensual">
                        <BarrasHorizontales
                            data={por_plan.map(p => ({ nombre: p.plan, valor: p.empresas, detalle: `${formatSoles(p.mrr)}/mes` }))}
                            formato={(v) => `${v} ${v === 1 ? 'empresa' : 'empresas'}`}
                            vacio="Aún no hay empresas" />
                    </Panel>
                    <Panel titulo="Métodos de pago" subtitulo="Últimos 12 meses">
                        <BarrasHorizontales
                            data={metodos_pago.map(m => ({ nombre: METODOS[m.metodo] || m.metodo, valor: m.total, detalle: `${m.pagos} pagos` }))}
                            formato={formatSoles}
                            vacio="Aún no hay pagos" />
                    </Panel>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <Panel titulo="Suscripciones por cobrar" subtitulo="Vencidas o que vencen en los próximos 15 días"
                    accion={<Link to="/suscripcion/cobros" className="text-xs font-bold text-slate-500 hover:text-slate-900 hover:underline">Registrar pagos</Link>}>
                    {vencimientos.length === 0 ? (
                        <p className="text-sm text-slate-400 py-6 text-center">Ninguna empresa por cobrar.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-[10px] uppercase text-slate-400 font-bold border-b border-slate-100">
                                        <th className="text-left py-2 pr-3">Empresa</th>
                                        <th className="text-left py-2 pr-3">Plan</th>
                                        <th className="text-right py-2">Vence</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {vencimientos.map(v => (
                                        <tr key={v.id} className="border-b border-slate-50 last:border-0">
                                            <td className="py-2 pr-3">
                                                <div className="font-bold text-slate-700">{v.nombre_comercial}</div>
                                                <Situacion s={v.situacion} />
                                            </td>
                                            <td className="py-2 pr-3 text-slate-600">
                                                {v.plan || '—'}
                                                {v.precio_mensual ? <div className="text-[11px] text-slate-400">{formatSoles(v.precio_mensual)}/mes</div> : null}
                                            </td>
                                            <td className="py-2 text-right whitespace-nowrap">
                                                <div className="font-bold text-slate-800 tabular-nums">{fecha(v.vence)}</div>
                                                <div className={`text-[11px] font-bold ${v.dias <= 3 ? 'text-red-700' : 'text-slate-400'}`}>{diasTexto(v.dias)}</div>
                                                {v.gracia_hasta && <div className="text-[11px] text-slate-400">Bloqueo el {fecha(v.gracia_hasta)}</div>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Panel>

                <Panel titulo="Últimos pagos" subtitulo="Lo que te pagaron las empresas"
                    accion={<Link to="/suscripcion/cobros" className="text-xs font-bold text-slate-500 hover:text-slate-900 hover:underline">Ver todos</Link>}>
                    {ultimos_pagos.length === 0 ? (
                        <p className="text-sm text-slate-400 py-6 text-center">Aún no hay pagos registrados.</p>
                    ) : (
                        <ul className="divide-y divide-slate-50">
                            {ultimos_pagos.map(p => (
                                <li key={p.id} className="py-2 flex items-center justify-between gap-3 text-sm">
                                    <div className="min-w-0">
                                        <div className={`font-bold truncate ${p.estado === 'anulado' ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{p.empresa?.nombre_comercial}</div>
                                        <div className="text-[11px] text-slate-400">
                                            {p.plan} · {p.meses} {p.meses === 1 ? 'mes' : 'meses'} · {METODOS[p.metodo_pago] || p.metodo_pago} · {p.created_at?.slice(0, 10)}
                                        </div>
                                    </div>
                                    <div className="text-right whitespace-nowrap">
                                        <div className={`font-black tabular-nums ${p.estado === 'anulado' ? 'text-slate-400 line-through' : 'text-slate-900'}`}>{formatSoles(p.monto)}</div>
                                        {p.estado === 'anulado' && <div className="text-[11px] font-bold text-slate-500">Anulado</div>}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </Panel>
            </div>

            <Panel titulo="Empresas" subtitulo="Plan, estado de la suscripción, consumo y lo que han pagado">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-[10px] uppercase text-slate-400 font-bold border-b border-slate-100">
                                <th className="text-left py-2 pr-3">Empresa</th>
                                <th className="text-left py-2 pr-3">Plan</th>
                                <th className="text-left py-2 pr-3">Suscripción</th>
                                <th className="text-right py-2 pr-3">Sedes</th>
                                <th className="text-right py-2 pr-3">Clientes</th>
                                <th className="text-right py-2 pr-3">Empleados</th>
                                <th className="text-right py-2 pr-3">Último pago</th>
                                <th className="text-right py-2">Total pagado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {por_empresa.map(e => {
                                const uso = (r) => `${r.usado} / ${r.limite ?? '∞'}`;
                                const celda = (r) => `py-2 pr-3 text-right tabular-nums ${r.excedido ? 'text-red-700 font-bold' : 'text-slate-600'}`;
                                return (
                                    <tr key={e.id} className="border-b border-slate-50 last:border-0">
                                        <td className="py-2 pr-3">
                                            <span className="font-bold text-slate-800 flex items-center gap-1.5">
                                                <BuildingOffice2Icon className="w-4 h-4 text-slate-400" /> {e.nombre_comercial}
                                            </span>
                                            {!e.estado && <span className="text-[10px] font-bold text-red-700 uppercase">Inactiva</span>}
                                        </td>
                                        <td className="py-2 pr-3">
                                            <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-slate-900 text-white">{e.plan || 'Sin plan'}</span>
                                            {e.precio_mensual ? <div className="text-[11px] text-slate-400 mt-0.5">{formatSoles(e.precio_mensual)}/mes</div> : null}
                                        </td>
                                        <td className="py-2 pr-3 whitespace-nowrap">
                                            <Situacion s={e.situacion} />
                                            {e.suscripcion_vence && <div className="text-[11px] text-slate-400 mt-0.5">Vence {fecha(e.suscripcion_vence)}</div>}
                                        </td>
                                        <td className={celda(e.recursos.sucursales)}>{uso(e.recursos.sucursales)}</td>
                                        <td className={celda(e.recursos.clientes)}>{uso(e.recursos.clientes)}</td>
                                        <td className={celda(e.recursos.empleados)}>{uso(e.recursos.empleados)}</td>
                                        <td className="py-2 pr-3 text-right whitespace-nowrap">
                                            {e.ultimo_pago ? (
                                                <>
                                                    <div className="tabular-nums text-slate-700">{formatSoles(e.ultimo_pago.monto)}</div>
                                                    <div className="text-[11px] text-slate-400">{fecha(e.ultimo_pago.fecha)}</div>
                                                </>
                                            ) : <span className="text-slate-400">—</span>}
                                        </td>
                                        <td className="py-2 text-right tabular-nums font-black text-slate-900">{formatSoles(e.total_pagado)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Panel>
        </div>
    );
};

export default DashboardPlataforma;
