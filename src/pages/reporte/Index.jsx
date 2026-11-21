import React, { useState } from 'react';
import API_BASE_URL from 'js/urlHelper';
import { useAuth } from 'context/AuthContext';
import PageHeader from 'components/Shared/Headers/PageHeader';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import { descargarArchivo, query } from 'utilities/Archivos/descargar';
import { aISO, sumarDias } from 'utilities/Fechas/fechas';
import {
    DocumentArrowDownIcon, BanknotesIcon, IdentificationIcon, UserGroupIcon, InboxStackIcon,
    ShoppingBagIcon, ClipboardDocumentListIcon, CalendarDaysIcon, CubeTransparentIcon, ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

const inputCls = 'w-full p-2 text-sm text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/40 outline-none bg-white';
const labelCls = 'block text-[11px] font-bold text-slate-600 uppercase mb-1';

// Fechas en hora local (toISOString usaría UTC y en la noche daría el día siguiente)
const hoy = () => aISO(new Date());
const inicioMes = () => { const d = new Date(); return aISO(new Date(d.getFullYear(), d.getMonth(), 1)); };
const haceDias = (n) => aISO(sumarDias(new Date(), -n));

/**
 * Catálogo de reportes: qué incluye y qué filtros acepta.
 * filtros: 'fechas' | { name, label, options } (select)
 */
const REPORTES = [
    { key: 'ventas', titulo: 'Ventas y pagos', icon: BanknotesIcon,
      desc: 'Cada ticket con concepto, cliente, método, estado y quién cobró. Incluye hoja de resumen por concepto, método y sede.',
      fechas: () => ({ fecha_desde: inicioMes(), fecha_hasta: hoy() }),
      selects: [
        { name: 'concepto', label: 'Concepto', options: [['', 'Todos'], ['membresia', 'Membresías'], ['clase', 'Clases / eventos'], ['producto', 'Productos']] },
        { name: 'estado', label: 'Estado', options: [['', 'Todos'], ['verificado', 'Verificados'], ['pendiente', 'Pendientes'], ['rechazado', 'Rechazados'], ['anulado', 'Anulados']] },
        { name: 'metodo_pago', label: 'Método', options: [['', 'Todos'], ['efectivo', 'Efectivo'], ['yape', 'Yape'], ['plin', 'Plin'], ['tarjeta', 'Tarjeta']] },
      ] },
    { key: 'cajas', titulo: 'Turnos de caja', icon: InboxStackIcon,
      desc: 'Arqueos: fondo inicial, cobrado por concepto y método, efectivo esperado vs contado y diferencia.',
      fechas: () => ({ fecha_desde: inicioMes(), fecha_hasta: hoy() }) },
    { key: 'membresias', titulo: 'Membresías', icon: IdentificationIcon,
      desc: 'Plan, vigencia, días restantes, precio y descuento de cada membresía. Ideal para llamar a quienes están por vencer.',
      selects: [
        { name: 'estado', label: 'Estado', options: [['', 'Todas'], ['activa', 'Activas'], ['congelada', 'Congeladas'], ['vencida', 'Vencidas'], ['cancelada', 'Canceladas']] },
        { name: 'por_vencer', label: 'Vencen en', options: [['', 'Cualquier fecha'], ['7', 'Próximos 7 días'], ['15', 'Próximos 15 días'], ['30', 'Próximos 30 días']] },
      ] },
    { key: 'clientes', titulo: 'Clientes', icon: UserGroupIcon,
      desc: 'Datos de contacto, acceso al sistema, plan actual y cuántas membresías ha comprado cada cliente.' },
    { key: 'clases', titulo: 'Clases y asistencia', icon: CalendarDaysIcon,
      desc: 'Ocupación y asistencia por clase, más una hoja con el detalle de cada inscrito.',
      fechas: () => ({ fecha_desde: inicioMes(), fecha_hasta: hoy() }) },
    { key: 'productos', titulo: 'Stock de productos', icon: ShoppingBagIcon,
      desc: 'Stock por sede, alertas de stock bajo y valorizado al costo y a precio de venta.' },
    { key: 'kardex', titulo: 'Kardex', icon: ClipboardDocumentListIcon,
      desc: 'Todas las entradas, salidas, ventas, ajustes y traslados con el saldo resultante.',
      fechas: () => ({ fecha_desde: haceDias(30), fecha_hasta: hoy() }),
      selects: [
        { name: 'tipo', label: 'Movimiento', options: [['', 'Todos'], ['entrada', 'Entradas'], ['salida', 'Salidas'], ['ajuste', 'Ajustes'], ['venta', 'Ventas'], ['anulacion', 'Anulaciones'], ['traslado_salida', 'Traslados (salen)'], ['traslado_entrada', 'Traslados (entran)']] },
      ] },
    { key: 'inventario', titulo: 'Inventario de equipos', icon: CubeTransparentIcon,
      desc: 'Máquinas y accesorios por sede con su estado, costo y mantenimientos.',
      selects: [
        { name: 'estado', label: 'Estado', options: [['', 'Todos'], ['operativo', 'Operativos'], ['mantenimiento', 'En mantenimiento'], ['averiado', 'Averiados'], ['baja', 'De baja']] },
      ] },
];

/** La sede del reporte es la elegida en el menú lateral (no tiene filtro propio). */
const TarjetaReporte = ({ reporte }) => {
    const Icon = reporte.icon;
    const [filtros, setFiltros] = useState(() => ({ ...(reporte.fechas?.() || {}) }));
    const [descargando, setDescargando] = useState(false);
    const [error, setError] = useState(null);
    const set = (k, v) => setFiltros(f => ({ ...f, [k]: v }));

    const descargar = async () => {
        setDescargando(true); setError(null);
        try {
            await descargarArchivo(`${API_BASE_URL}/api/reporte/${reporte.key}${query(filtros)}`, `${reporte.key}.xlsx`);
        } catch (e) {
            setError(e.message);
        } finally {
            setDescargando(false);
        }
    };

    return (
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col">
            <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-primary-light text-secondary shrink-0"><Icon className="w-6 h-6" /></div>
                <div className="min-w-0">
                    <h3 className="font-black text-secondary uppercase text-sm">{reporte.titulo}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{reporte.desc}</p>
                </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
                {reporte.fechas && (
                    <>
                        <div>
                            <label className={labelCls}>Desde</label>
                            <input type="date" value={filtros.fecha_desde} max={filtros.fecha_hasta} onChange={e => set('fecha_desde', e.target.value)} className={inputCls} />
                        </div>
                        <div>
                            <label className={labelCls}>Hasta</label>
                            <input type="date" value={filtros.fecha_hasta} min={filtros.fecha_desde} onChange={e => set('fecha_hasta', e.target.value)} className={inputCls} />
                        </div>
                    </>
                )}
                {(reporte.selects || []).map(s => (
                    <div key={s.name}>
                        <label className={labelCls}>{s.label}</label>
                        <select value={filtros[s.name] || ''} onChange={e => set(s.name, e.target.value)} className={inputCls}>
                            {s.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                        </select>
                    </div>
                ))}
            </div>

            {error && <p className="mt-3 text-xs font-bold text-red-700">{error}</p>}

            <div className="mt-auto pt-4">
                <button onClick={descargar} disabled={descargando}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 bg-secondary text-primary rounded-lg font-black uppercase text-sm hover:bg-secondary/90 disabled:opacity-50">
                    <ArrowDownTrayIcon className="w-4 h-4" /> {descargando ? 'Generando...' : 'Descargar Excel'}
                </button>
            </div>
        </section>
    );
};

/** Reportes en Excel (cada uno visible solo con su permiso). */
const Index = () => {
    const { can, sucursal } = useAuth();
    const visibles = REPORTES.filter(r => can(`reporte.${r.key}`));

    return (
        <div className="container mx-auto p-4 sm:p-6">
            <PageHeader title="Reportes" subtitle="Descarga la información del gimnasio en Excel" icon={DocumentArrowDownIcon} />
            <p className="-mt-2 mb-4 text-sm text-slate-600">
                {sucursal ? <>Los reportes incluyen solo la sede <b>{sucursal.nombre}</b>.</> : <>Los reportes incluyen <b>todas las sedes</b>.</>}
            </p>
            {visibles.length === 0 ? (
                <AlertMessage type="info" message="No tienes reportes habilitados." />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-5">
                    {visibles.map(r => <TarjetaReporte key={r.key} reporte={r} />)}
                </div>
            )}
        </div>
    );
};

export default Index;
