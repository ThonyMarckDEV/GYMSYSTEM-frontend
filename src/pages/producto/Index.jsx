import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { index, store, update, cambiarEstado, kardex, movimiento } from 'services/productoService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';
import { useAuth } from 'context/AuthContext';
import Table from 'components/Shared/Tables/Table';
import PageHeader from 'components/Shared/Headers/PageHeader';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import SucursalSelect from 'components/Shared/Comboboxes/SucursalSelect';
import EstadoToggle, { SinAcciones } from 'components/Shared/Tables/EstadoToggle';
import { Modal, errorDeAlerta, soles } from 'components/Pagos/PagoUI';
import { KpiTile } from 'components/Dashboard/Charts';
import {
    ShoppingBagIcon, PencilSquareIcon, ArrowsUpDownIcon, ClipboardDocumentListIcon,
    ExclamationTriangleIcon, CubeIcon, ArrowsRightLeftIcon, ChevronLeftIcon, ChevronRightIcon
} from '@heroicons/react/24/outline';

const inputCls = 'w-full p-2.5 text-sm text-secondary border border-slate-300 rounded-lg focus:ring-1 focus:ring-primary outline-none bg-white';
const labelCls = 'block text-xs font-bold text-slate-700 uppercase mb-1';
const FILTROS_INICIALES = { search: '', categoria: '', estado: '', sucursal_id: '', bajo_stock: '' };

// Tipos del kardex: texto + color (el signo de la cantidad también lo indica)
export const TIPOS_KARDEX = {
    entrada:          { label: 'Entrada',          cls: 'bg-green-50 text-green-700 border-green-200' },
    salida:           { label: 'Salida',           cls: 'bg-red-50 text-red-700 border-red-200' },
    ajuste:           { label: 'Ajuste',           cls: 'bg-amber-50 text-amber-800 border-amber-200' },
    venta:            { label: 'Venta',            cls: 'bg-slate-100 text-slate-700 border-slate-200' },
    anulacion:        { label: 'Anulación',        cls: 'bg-blue-50 text-blue-700 border-blue-200' },
    traslado_salida:  { label: 'Traslado (sale)',  cls: 'bg-violet-50 text-violet-700 border-violet-200' },
    traslado_entrada: { label: 'Traslado (entra)', cls: 'bg-violet-50 text-violet-700 border-violet-200' },
};

/** Registrar / editar producto. */
const ProductoFormModal = ({ producto, categorias, onClose, onGuardado }) => {
    const [form, setForm] = useState({
        nombre: producto?.nombre || '', codigo: producto?.codigo || '', categoria: producto?.categoria || '',
        precio_venta: producto?.precio_venta ?? '', costo: producto?.costo ?? '', stock_minimo: producto?.stock_minimo ?? 0,
        descripcion: producto?.descripcion || '',
    });
    const [guardando, setGuardando] = useState(false);
    const [alert, setAlert] = useState(null);
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const guardar = async () => {
        setGuardando(true); setAlert(null);
        try {
            const data = { ...form, costo: form.costo === '' ? null : form.costo, stock_minimo: form.stock_minimo === '' ? 0 : form.stock_minimo };
            const res = producto ? await update(producto.id, data) : await store(data);
            onGuardado(res.message);
        } catch (err) {
            setAlert(handleApiError(err, 'No se pudo guardar el producto'));
        } finally {
            setGuardando(false);
        }
    };

    return (
        <Modal titulo={producto ? `Editar ${producto.nombre}` : 'Nuevo producto'} icon={ShoppingBagIcon} onClose={onClose} ancho="max-w-2xl" error={errorDeAlerta(alert)}
            pie={<>
                <button onClick={onClose} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg font-bold uppercase text-sm">Cancelar</button>
                <button onClick={guardar} disabled={guardando || !form.nombre.trim() || !(Number(form.precio_venta) > 0)}
                    className="px-4 py-2 bg-secondary text-primary rounded-lg font-bold uppercase text-sm disabled:opacity-40">
                    {guardando ? 'Guardando...' : producto ? 'Guardar cambios' : 'Registrar producto'}
                </button>
            </>}>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <div className="md:col-span-4">
                    <label className={labelCls}>Nombre *</label>
                    <input value={form.nombre} onChange={e => set('nombre', e.target.value)} className={inputCls} maxLength={100} autoFocus placeholder="Ej: AGUA SAN LUIS 625 ML" />
                </div>
                <div className="md:col-span-2">
                    <label className={labelCls}>Código</label>
                    <input value={form.codigo} onChange={e => set('codigo', e.target.value)} className={inputCls} maxLength={40} placeholder="Ej: BEB-001" />
                </div>
                <div className="md:col-span-2">
                    <label className={labelCls}>Categoría</label>
                    <input value={form.categoria} onChange={e => set('categoria', e.target.value)} className={inputCls} maxLength={40} list="categorias-producto" placeholder="Ej: BEBIDAS" />
                    <datalist id="categorias-producto">{categorias.map(c => <option key={c} value={c} />)}</datalist>
                </div>
                <div className="md:col-span-2">
                    <label className={labelCls}>Precio de venta (S/) *</label>
                    <input type="number" min="0.1" step="0.10" value={form.precio_venta} onChange={e => set('precio_venta', e.target.value)} className={`${inputCls} font-bold tabular-nums`} />
                </div>
                <div className="md:col-span-2">
                    <label className={labelCls}>Costo (S/)</label>
                    <input type="number" min="0" step="0.10" value={form.costo} onChange={e => set('costo', e.target.value)} className={`${inputCls} tabular-nums`} placeholder="Referencial" />
                </div>
                <div className="md:col-span-2">
                    <label className={labelCls}>Stock mínimo</label>
                    <input type="number" min="0" value={form.stock_minimo} onChange={e => set('stock_minimo', e.target.value)} className={`${inputCls} tabular-nums`} />
                    <p className="mt-1 text-[11px] text-slate-400">Avisa cuando quede esto o menos.</p>
                </div>
                <div className="md:col-span-4">
                    <label className={labelCls}>Descripción</label>
                    <input value={form.descripcion} onChange={e => set('descripcion', e.target.value)} className={inputCls} maxLength={255} />
                </div>
                {!producto && (
                    <p className="md:col-span-6 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg p-3">
                        El producto empieza sin stock. Luego registra una <b>entrada</b> en cada sede (botón <ArrowsUpDownIcon className="w-3.5 h-3.5 inline" />).
                    </p>
                )}
            </div>
        </Modal>
    );
};

/** Entrada (compra), salida (merma) o ajuste por conteo físico. */
const MovimientoModal = ({ producto, sedeInicial, onClose, onGuardado }) => {
    const { sucursal } = useAuth();
    const [form, setForm] = useState({ tipo: 'entrada', sucursal_id: sucursal?.id || sedeInicial || '', cantidad: '', costo_unitario: producto.costo ?? '', motivo: '' });
    const [guardando, setGuardando] = useState(false);
    const [alert, setAlert] = useState(null);
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const stockSede = producto.stocks.find(s => String(s.sucursal_id) === String(form.sucursal_id))?.stock;
    const cant = form.cantidad === '' ? null : Number(form.cantidad);
    const resultado = cant === null || stockSede === undefined ? null
        : form.tipo === 'entrada' ? stockSede + cant : form.tipo === 'salida' ? stockSede - cant : cant;

    const guardar = async () => {
        setGuardando(true); setAlert(null);
        try {
            const res = await movimiento(producto.id, {
                tipo: form.tipo, sucursal_id: form.sucursal_id || null, cantidad: Number(form.cantidad),
                costo_unitario: form.tipo === 'entrada' && form.costo_unitario !== '' ? form.costo_unitario : null,
                motivo: form.motivo.trim() || null,
            });
            onGuardado(res.message);
        } catch (err) {
            setAlert(handleApiError(err, 'No se pudo registrar el movimiento'));
        } finally {
            setGuardando(false);
        }
    };

    const valido = form.sucursal_id && cant !== null && (form.tipo === 'ajuste' ? cant >= 0 : cant > 0)
        && (form.tipo === 'entrada' || form.motivo.trim()) && (resultado === null || resultado >= 0);

    return (
        <Modal titulo={`Stock de ${producto.nombre}`} icon={ArrowsUpDownIcon} onClose={onClose} error={errorDeAlerta(alert)}
            pie={<>
                <button onClick={onClose} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg font-bold uppercase text-sm">Cancelar</button>
                <button onClick={guardar} disabled={guardando || !valido} className="px-4 py-2 bg-secondary text-primary rounded-lg font-bold uppercase text-sm disabled:opacity-40">
                    {guardando ? 'Guardando...' : 'Registrar'}
                </button>
            </>}>
            <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Tipo de movimiento">
                    {[['entrada', 'Entrada', 'Llegó mercadería'], ['salida', 'Salida', 'Merma, vencido...'], ['ajuste', 'Ajuste', 'Conteo físico']].map(([k, l, d]) => (
                        <button key={k} type="button" role="radio" aria-checked={form.tipo === k} onClick={() => set('tipo', k)}
                            className={`p-2.5 rounded-lg border text-left ${form.tipo === k ? 'bg-secondary text-primary border-secondary' : 'border-slate-300 text-slate-700 hover:border-slate-400'}`}>
                            <p className="text-sm font-black">{l}</p>
                            <p className={`text-[11px] ${form.tipo === k ? 'text-primary/70' : 'text-slate-400'}`}>{d}</p>
                        </button>
                    ))}
                </div>

                {sucursal ? (
                    <p className="text-sm text-slate-600">Sede: <b>{sucursal.nombre}</b></p>
                ) : (
                    <SucursalSelect label="Sede" required value={form.sucursal_id} onChange={v => set('sucursal_id', v)} />
                )}

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelCls}>{form.tipo === 'ajuste' ? 'Stock contado *' : 'Cantidad *'}</label>
                        <input type="number" min={form.tipo === 'ajuste' ? 0 : 1} value={form.cantidad} onChange={e => set('cantidad', e.target.value)}
                            className={`${inputCls} text-lg font-bold tabular-nums`} autoFocus />
                    </div>
                    {form.tipo === 'entrada' && (
                        <div>
                            <label className={labelCls}>Costo unitario (S/)</label>
                            <input type="number" min="0" step="0.10" value={form.costo_unitario} onChange={e => set('costo_unitario', e.target.value)} className={`${inputCls} tabular-nums`} />
                        </div>
                    )}
                </div>

                {stockSede !== undefined && (
                    <p className={`text-sm ${resultado !== null && resultado < 0 ? 'text-red-700 font-bold' : 'text-slate-600'}`}>
                        Stock actual en la sede: <b className="tabular-nums">{stockSede}</b>
                        {resultado !== null && <> → quedará en <b className="tabular-nums">{resultado}</b>{resultado < 0 && ' (no alcanza)'}</>}
                    </p>
                )}

                <div>
                    <label className={labelCls}>Motivo {form.tipo !== 'entrada' && '*'}</label>
                    <input value={form.motivo} onChange={e => set('motivo', e.target.value)} className={inputCls} maxLength={255}
                        placeholder={form.tipo === 'entrada' ? 'Ej: Compra factura F001-123' : form.tipo === 'salida' ? 'Ej: 2 botellas vencidas' : 'Ej: Inventario de fin de mes'} />
                </div>
            </div>
        </Modal>
    );
};

/** Kardex del producto (de una sede o de todas). */
export const KardexModal = ({ producto, sedeInicial, onClose }) => {
    const { sucursal } = useAuth();
    const [sede, setSede] = useState(sedeInicial || '');
    const [datos, setDatos] = useState(null);
    const [page, setPage] = useState(1);
    const [alert, setAlert] = useState(null);

    useEffect(() => {
        kardex(producto.id, page, { sucursal_id: sede })
            .then(setDatos)
            .catch(err => setAlert(handleApiError(err, 'No se pudo cargar el kardex')));
    }, [producto.id, page, sede]);

    return (
        <Modal titulo={`Kardex · ${producto.nombre}`} icon={ClipboardDocumentListIcon} onClose={onClose} ancho="max-w-4xl" error={errorDeAlerta(alert)}>
            {!sucursal && (
                <div className="mb-4 max-w-xs">
                    <SucursalSelect label="Sede" emptyLabel="Todas las sedes" value={sede} onChange={v => { setSede(v); setPage(1); }} />
                </div>
            )}
            {!datos ? (
                <p className="text-sm text-slate-400 text-center py-8">Cargando...</p>
            ) : datos.data.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">Sin movimientos.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-200">
                                <th className="text-left py-2 pr-3 font-black">Fecha</th>
                                {!sede && !sucursal && <th className="text-left py-2 pr-3 font-black">Sede</th>}
                                <th className="text-left py-2 pr-3 font-black">Movimiento</th>
                                <th className="text-right py-2 pr-3 font-black">Cant.</th>
                                <th className="text-right py-2 pr-3 font-black">Saldo</th>
                                <th className="text-left py-2 pr-3 font-black">Detalle</th>
                                <th className="text-left py-2 font-black">Usuario</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {datos.data.map(m => {
                                const t = TIPOS_KARDEX[m.tipo] || { label: m.tipo, cls: 'bg-slate-100 text-slate-600 border-slate-200' };
                                return (
                                    <tr key={m.id}>
                                        <td className="py-2 pr-3 text-xs text-slate-500 tabular-nums whitespace-nowrap">{m.fecha.slice(0, 16)}</td>
                                        {!sede && !sucursal && <td className="py-2 pr-3 text-xs text-slate-600">{m.sucursal}</td>}
                                        <td className="py-2 pr-3"><span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase border whitespace-nowrap ${t.cls}`}>{t.label}</span></td>
                                        <td className={`py-2 pr-3 text-right font-black tabular-nums ${m.cantidad > 0 ? 'text-green-700' : 'text-red-700'}`}>{m.cantidad > 0 ? `+${m.cantidad}` : m.cantidad}</td>
                                        <td className="py-2 pr-3 text-right font-black tabular-nums text-slate-900">{m.stock_resultante}</td>
                                        <td className="py-2 pr-3 text-xs text-slate-600 max-w-[220px]">
                                            <span className="line-clamp-2">{m.motivo || '—'}{m.costo_unitario !== null ? ` · ${soles(m.costo_unitario)} c/u` : ''}</span>
                                        </td>
                                        <td className="py-2 text-xs text-slate-500 whitespace-nowrap">{m.usuario || '—'}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
            {datos && datos.last_page > 1 && (
                <div className="mt-4 flex items-center justify-end gap-2 text-sm">
                    <button onClick={() => setPage(p => p - 1)} disabled={page <= 1} className="p-1.5 rounded-md border border-slate-300 disabled:opacity-40" aria-label="Página anterior"><ChevronLeftIcon className="w-4 h-4" /></button>
                    <span className="tabular-nums text-slate-600">{page} / {datos.last_page}</span>
                    <button onClick={() => setPage(p => p + 1)} disabled={page >= datos.last_page} className="p-1.5 rounded-md border border-slate-300 disabled:opacity-40" aria-label="Página siguiente"><ChevronRightIcon className="w-4 h-4" /></button>
                </div>
            )}
        </Modal>
    );
};

/** Productos de venta: catálogo, stock por sede y kardex. */
const Index = () => {
    const { can, sucursal } = useAuth();
    const [loading, setLoading] = useState(true);
    const [productos, setProductos] = useState([]);
    const [resumen, setResumen] = useState(null);
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, total: 0 });
    const [filters, setFilters] = useState(FILTROS_INICIALES);
    const filtersRef = useRef(filters);
    const [alert, setAlert] = useState(null);
    const [editando, setEditando] = useState(null);
    const [moviendo, setMoviendo] = useState(null);
    const [viendoKardex, setViendoKardex] = useState(null);

    const fetchProductos = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const r = await index(page, filtersRef.current);
            setProductos(r.data || []);
            setResumen(r.resumen);
            setPagination({ currentPage: r.current_page, totalPages: r.last_page, total: r.total });
        } catch (err) {
            setAlert(handleApiError(err, 'Error al cargar los productos'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchProductos(1); }, [fetchProductos]);

    const aplicarFiltro = (cambios) => {
        const nuevo = { ...filtersRef.current, ...cambios };
        setFilters(nuevo); filtersRef.current = nuevo; fetchProductos(1);
    };

    const alternarEstado = useCallback(async (p) => {
        try {
            const r = await cambiarEstado(p.id);
            setAlert({ type: 'success', message: r.message });
            fetchProductos(pagination.currentPage);
        } catch (err) {
            setAlert(handleApiError(err, 'No se pudo cambiar el estado'));
        }
    }, [fetchProductos, pagination.currentPage]);

    const categorias = useMemo(() => resumen?.categorias || [], [resumen]);
    const verTodasLasSedes = !sucursal && !filters.sucursal_id;

    const filterConfig = useMemo(() => [
        { name: 'search', type: 'text', label: 'Nombre o código', placeholder: 'Ej: agua', colSpan: 'col-span-12 md:col-span-5' },
        { name: 'categoria', type: 'select', label: 'Categoría', colSpan: 'col-span-6 md:col-span-3',
            options: [{ value: '', label: 'Todas' }, ...categorias.map(c => ({ value: c, label: c }))] },
        { name: 'estado', type: 'select', label: 'Estado', colSpan: 'col-span-6 md:col-span-2',
            options: [{ value: '', label: 'Todos' }, { value: '1', label: 'Activos' }, { value: '0', label: 'Inactivos' }] },
    ], [categorias]);

    const columns = useMemo(() => [
        { header: 'Producto', render: (r) => (
            <div className="min-w-0">
                <p className="font-bold text-slate-800 text-sm">{r.nombre}</p>
                <p className="text-[11px] text-slate-500">{[r.codigo, r.categoria].filter(Boolean).join(' · ') || '—'}</p>
            </div>
        ) },
        { header: 'Precio', render: (r) => (
            <div className="tabular-nums">
                <p className="text-sm font-black text-slate-900">{soles(r.precio_venta)}</p>
                {r.costo !== null && <p className="text-[11px] text-slate-400">Costo {soles(r.costo)}</p>}
            </div>
        ) },
        { header: verTodasLasSedes ? 'Stock por sede' : 'Stock', render: (r) => (
            <div>
                <p className={`text-sm font-black tabular-nums inline-flex items-center gap-1 ${r.bajo_stock ? 'text-red-700' : 'text-slate-900'}`}>
                    {r.bajo_stock && <ExclamationTriangleIcon className="w-4 h-4" aria-label="Stock bajo" />}
                    {r.stock} <span className="text-[11px] font-semibold text-slate-400">{verTodasLasSedes ? 'en total' : 'unid.'}</span>
                </p>
                {verTodasLasSedes && (
                    <p className="text-[11px] text-slate-500">{r.stocks.map(s => `${s.sucursal} ${s.stock}`).join(' · ')}</p>
                )}
                <p className="text-[10px] text-slate-400">Mínimo {r.stock_minimo}</p>
            </div>
        ) },
        { header: 'Estado', render: (r) => <EstadoToggle activo={r.estado} puede={can('producto.status')} onClick={() => alternarEstado(r)} /> },
        { header: 'Acciones', render: (r) => !['producto.kardex', 'producto.ajustar', 'producto.update'].some(can) ? <SinAcciones /> : (
            <div className="flex items-center gap-1">
                {can('producto.ajustar') && (
                    <button onClick={() => setMoviendo(r)} title="Entrada, salida o ajuste de stock" className="p-2 text-slate-500 hover:text-secondary hover:bg-primary-light rounded-lg"><ArrowsUpDownIcon className="w-5 h-5" /></button>
                )}
                {can('producto.kardex') && (
                    <button onClick={() => setViendoKardex(r)} title="Ver kardex" className="p-2 text-slate-500 hover:text-secondary hover:bg-primary-light rounded-lg"><ClipboardDocumentListIcon className="w-5 h-5" /></button>
                )}
                {can('producto.update') && (
                    <button onClick={() => setEditando(r)} title="Editar" className="p-2 text-slate-500 hover:text-secondary hover:bg-primary-light rounded-lg"><PencilSquareIcon className="w-5 h-5" /></button>
                )}
            </div>
        ) },
    ], [can, alternarEstado, verTodasLasSedes]);

    const guardado = (msg, cerrar) => { cerrar(null); setAlert({ type: 'success', message: msg }); fetchProductos(pagination.currentPage); };

    return (
        <div className="container mx-auto p-4 sm:p-6">
            <PageHeader title="Productos" subtitle="Catálogo de venta, stock por sede y kardex" icon={ShoppingBagIcon} />

            <div className="flex flex-wrap items-end justify-between gap-3 -mt-2 mb-6">
                {!sucursal ? (
                    <div className="w-full sm:w-64">
                        <SucursalSelect label="Ver stock de" emptyLabel="Todas las sedes" value={filters.sucursal_id} onChange={v => aplicarFiltro({ sucursal_id: v })} />
                    </div>
                ) : <p className="text-sm text-slate-600">Stock de la sede <b>{sucursal.nombre}</b></p>}
                <div className="flex flex-wrap gap-2">
                    {can('traslado.index') && (
                        <Link to="/traslados" className="inline-flex items-center gap-1.5 px-5 py-3 rounded-lg border border-slate-300 bg-white text-secondary font-black uppercase text-sm hover:border-slate-500">
                            <ArrowsRightLeftIcon className="w-4 h-4" /> Traslados
                        </Link>
                    )}
                    {can('producto.store') && (
                        <button onClick={() => setEditando('nuevo')} className="bg-primary text-secondary px-6 py-3 rounded-lg font-black uppercase shadow-lg hover:bg-primary-hover">+ Nuevo producto</button>
                    )}
                </div>
            </div>

            <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />

            {resumen && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <KpiTile label="Productos activos" valor={resumen.productos} icon={ShoppingBagIcon} />
                    <KpiTile label="Unidades en stock" valor={resumen.unidades} icon={CubeIcon} ayuda={verTodasLasSedes ? 'Todas las sedes' : 'En esta sede'} />
                    <button type="button" onClick={() => aplicarFiltro({ bajo_stock: filtersRef.current.bajo_stock ? '' : '1' })}
                        className={`text-left rounded-2xl ${filters.bajo_stock ? 'ring-2 ring-secondary' : ''}`} title="Filtrar productos con stock bajo">
                        <KpiTile destacado label="Stock bajo" valor={resumen.bajo_stock} icon={ExclamationTriangleIcon}
                            ayuda={filters.bajo_stock ? 'Filtrando · clic para quitar' : 'En o bajo el mínimo · clic para ver'} />
                    </button>
                </div>
            )}

            <Table columns={columns} data={productos} loading={loading}
                filterConfig={filterConfig} filters={filters}
                onFilterChange={(n, v) => setFilters(p => ({ ...p, [n]: v }))}
                onFilterSubmit={() => { filtersRef.current = filters; fetchProductos(1); }}
                onFilterClear={() => { const f = { ...FILTROS_INICIALES, sucursal_id: filters.sucursal_id }; setFilters(f); filtersRef.current = f; fetchProductos(1); }}
                pagination={{ ...pagination, onPageChange: fetchProductos }} />

            {editando && (
                <ProductoFormModal producto={editando === 'nuevo' ? null : editando} categorias={categorias}
                    onClose={() => setEditando(null)} onGuardado={(msg) => guardado(msg, setEditando)} />
            )}
            {moviendo && (
                <MovimientoModal producto={moviendo} sedeInicial={filters.sucursal_id}
                    onClose={() => setMoviendo(null)} onGuardado={(msg) => guardado(msg, setMoviendo)} />
            )}
            {viendoKardex && <KardexModal producto={viendoKardex} sedeInicial={filters.sucursal_id} onClose={() => setViendoKardex(null)} />}
        </div>
    );
};

export default Index;
