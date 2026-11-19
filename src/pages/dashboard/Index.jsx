import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDashboard } from 'hooks/dashboard/useDashboard';
import { useAuth } from 'context/AuthContext';
import PageHeader from 'components/Shared/Headers/PageHeader';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import { BarrasVerticales, BarrasHorizontales, KpiTile, Panel, formatSoles } from 'components/Dashboard/Charts';
import {
    ChartBarIcon, UsersIcon, CheckBadgeIcon, ClockIcon, BanknotesIcon,
    ShoppingCartIcon, BuildingStorefrontIcon, TableCellsIcon
} from '@heroicons/react/24/outline';
import { Snowflake } from 'lucide-react';

const TITULO_MODO = {
    global:   'Todas las sucursales',
    sucursal: 'Sucursal',
};

/** Pequeña tabla accesible con los mismos datos del gráfico de ingresos. */
const TablaIngresos = ({ data }) => (
    <table className="w-full text-xs mt-4">
        <thead>
            <tr className="text-[10px] uppercase text-slate-400 font-bold border-b border-slate-100">
                <th className="text-left py-1.5">Mes</th><th className="text-right py-1.5">Pagos</th><th className="text-right py-1.5">Ingresos</th>
            </tr>
        </thead>
        <tbody>
            {data.map(m => (
                <tr key={m.mes} className="border-b border-slate-50 last:border-0">
                    <td className="py-1.5 text-slate-600">{m.label} {m.mes.slice(0, 4)}</td>
                    <td className="py-1.5 text-right tabular-nums text-slate-600">{m.pagos}</td>
                    <td className="py-1.5 text-right tabular-nums font-bold text-slate-900">{formatSoles(m.total)}</td>
                </tr>
            ))}
        </tbody>
    </table>
);

const Index = () => {
    const { loading, data, alert, setAlert, sucursalId, cambiarSucursal } = useDashboard();
    const { esSuperAdmin } = useAuth();
    const [verTabla, setVerTabla] = useState(false);

    if (!data && loading) {
        return (
            <div className="container mx-auto p-6">
                <PageHeader title="Dashboard" icon={ChartBarIcon} />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(8)].map((_, i) => <div key={i} className="h-28 rounded-2xl bg-slate-100 animate-pulse" />)}
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="container mx-auto p-6">
                <PageHeader title="Dashboard" icon={ChartBarIcon} />
                <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />
            </div>
        );
    }

    const { contexto, kpis, ingresos_mensuales, planes_top, proximos_vencimientos, por_sucursal } = data;
    const modo = contexto.modo;
    const puedeFiltrarSucursal = !contexto.sucursal_fija && contexto.sucursales?.length > 0;

    const subtitulo = [
        contexto.empresa?.nombre_comercial,
        modo === 'sucursal' ? `Sede ${contexto.sucursal?.nombre}` : TITULO_MODO[modo],
    ].filter(Boolean).join(' · ');

    return (
        <div className={`container mx-auto p-6 transition-opacity ${loading ? 'opacity-60' : ''}`}>
            <PageHeader title="Dashboard" subtitle={subtitulo} icon={ChartBarIcon} />

            <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />

            {/* FILTROS — una sola fila sobre los gráficos */}
            <div className="flex flex-wrap items-end gap-3 mb-6">
                {puedeFiltrarSucursal && (
                    <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Sucursal</label>
                        <div className="relative">
                            <BuildingStorefrontIcon className="w-4 h-4 absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
                            <select value={sucursalId} onChange={(e) => cambiarSucursal(e.target.value)}
                                className="pl-9 pr-8 py-2 text-sm font-semibold border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-primary/40 outline-none">
                                <option value="">Todas las sucursales</option>
                                {contexto.sucursales.map(s => (
                                    <option key={s.id} value={s.id}>{s.nombre}{!s.estado ? ' (inactiva)' : ''}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}
                {contexto.sucursal_fija && (
                    <span className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg bg-slate-100 text-slate-600">
                        <BuildingStorefrontIcon className="w-4 h-4" />
                        {esSuperAdmin
                            ? `Modo sucursal: ${contexto.sucursal?.nombre} (cámbialo en el menú lateral)`
                            : `Estás viendo solo tu sede: ${contexto.sucursal?.nombre}`}
                    </span>
                )}
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <KpiTile destacado label="Ingresos del mes" valor={formatSoles(kpis.ingresos_mes)} icon={BanknotesIcon} ayuda={`Hoy: ${formatSoles(kpis.ingresos_hoy)}`} />
                <KpiTile label="Ventas del mes" valor={kpis.ventas_mes} icon={ShoppingCartIcon} ayuda="Membresías vendidas" />
                <KpiTile label="Membresías activas" valor={kpis.membresias_activas} icon={CheckBadgeIcon} />
                <KpiTile label={modo === 'sucursal' ? 'Clientes atendidos' : 'Clientes'} valor={kpis.clientes} icon={UsersIcon}
                    ayuda={modo === 'sucursal' ? 'Compraron en esta sede' : 'Registrados en la empresa'} />
                <KpiTile label="Por vencer (7 días)" valor={kpis.por_vencer_7_dias} icon={ClockIcon} ayuda="Oportunidad de renovación" />
                <KpiTile label="Congeladas" valor={kpis.membresias_congeladas} icon={Snowflake} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* INGRESOS 6 MESES */}
                <Panel className="lg:col-span-2" titulo="Ingresos de los últimos 6 meses" subtitulo="Pagos verificados"
                    accion={
                        <button onClick={() => setVerTabla(v => !v)}
                            className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-900">
                            <TableCellsIcon className="w-4 h-4" /> {verTabla ? 'Ocultar tabla' : 'Ver tabla'}
                        </button>
                    }>
                    <BarrasVerticales data={ingresos_mensuales} />
                    {verTabla && <TablaIngresos data={ingresos_mensuales} />}
                </Panel>

                {/* PLANES MÁS VENDIDOS */}
                <Panel titulo="Planes más vendidos" subtitulo="Este mes">
                    <BarrasHorizontales
                        data={planes_top.map(p => ({ nombre: p.plan, valor: p.ventas, detalle: formatSoles(p.ingresos) }))}
                        formato={(v) => `${v} ${v === 1 ? 'venta' : 'ventas'}`}
                        vacio="Aún no hay ventas este mes" />
                </Panel>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* COMPARATIVA POR SUCURSAL (empresa completa) */}
                {por_sucursal && (
                    <Panel className="lg:col-span-1" titulo="Ingresos por sucursal" subtitulo="Este mes">
                        <BarrasHorizontales
                            data={por_sucursal.map(s => ({ nombre: s.nombre, valor: s.ingresos_mes, detalle: `${s.ventas_mes} ventas` }))}
                            formato={formatSoles} />
                    </Panel>
                )}

                {/* PRÓXIMOS VENCIMIENTOS */}
                <Panel className={por_sucursal ? 'lg:col-span-2' : 'lg:col-span-3'} titulo="Próximos vencimientos" subtitulo="Clientes para contactar y renovar">
                    {proximos_vencimientos.length === 0 ? (
                        <p className="text-sm text-slate-400 py-6 text-center">No hay membresías activas por vencer.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-[10px] uppercase text-slate-400 font-bold border-b border-slate-100">
                                        <th className="text-left py-2 pr-3">Cliente</th>
                                        <th className="text-left py-2 pr-3">Plan</th>
                                        {modo !== 'sucursal' && <th className="text-left py-2 pr-3">Sede</th>}
                                        <th className="text-right py-2">Vence</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {proximos_vencimientos.map(v => (
                                        <tr key={v.id} className="border-b border-slate-50 last:border-0">
                                            <td className="py-2 pr-3">
                                                <Link to={`/membresia/${v.cliente_id}`} className="font-bold text-slate-700 hover:underline">{v.cliente}</Link>
                                                <div className="text-[11px] text-slate-400">DNI {v.dni}</div>
                                            </td>
                                            <td className="py-2 pr-3 text-slate-600">{v.plan}</td>
                                            {modo !== 'sucursal' && <td className="py-2 pr-3 text-slate-600">{v.sucursal || '—'}</td>}
                                            <td className="py-2 text-right whitespace-nowrap">
                                                <div className="font-bold text-slate-800 tabular-nums">{v.fecha_fin}</div>
                                                <div className={`text-[11px] font-bold ${v.dias <= 3 ? 'text-red-700' : 'text-slate-400'}`}>
                                                    {v.dias === 0 ? 'Vence hoy' : `En ${v.dias} días`}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Panel>
            </div>

        </div>
    );
};

export default Index;
