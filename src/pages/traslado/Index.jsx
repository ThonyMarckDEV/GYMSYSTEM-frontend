import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { index, store } from 'services/trasladoService';
import { combobox as productosCombobox } from 'services/productoService';
import { combobox as sucursalesCombobox } from 'services/sucursalService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';
import { useAuth } from 'context/AuthContext';
import Table from 'components/Shared/Tables/Table';
import PageHeader from 'components/Shared/Headers/PageHeader';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import { Modal, errorDeAlerta } from 'components/Pagos/PagoUI';
import { ArrowsRightLeftIcon, ArrowRightIcon, TrashIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';

const inputCls = 'w-full p-2.5 text-sm text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/40 outline-none bg-white';
const labelCls = 'block text-sm font-medium text-slate-700 mb-1.5';

/** Nuevo traslado: elegir origen y destino, y los productos con su cantidad. */
const TrasladoModal = ({ onClose, onGuardado }) => {
    const { sucursal } = useAuth();
    const [sedes, setSedes] = useState([]);
    const [origen, setOrigen] = useState(sucursal?.id ? String(sucursal.id) : '');
    const [destino, setDestino] = useState('');
    const [productos, setProductos] = useState([]);
    const [items, setItems] = useState([]);   // [{ producto, cantidad }]
    const [agregarId, setAgregarId] = useState('');
    const [observacion, setObservacion] = useState('');
    const [guardando, setGuardando] = useState(false);
    const [alert, setAlert] = useState(null);

    useEffect(() => {
        sucursalesCombobox().then(r => setSedes(r.data || [])).catch(() => setSedes([]));
    }, []);

    // Productos con el stock de la sede de origen
    useEffect(() => {
        setItems([]);
        if (!origen) { setProductos([]); return; }
        productosCombobox(origen).then(r => setProductos(r.data || [])).catch(err => setAlert(handleApiError(err, 'No se pudieron cargar los productos')));
    }, [origen]);

    const disponibles = productos.filter(p => p.stock > 0 && !items.some(i => i.producto.id === p.id));

    const agregar = (id) => {
        const p = productos.find(x => String(x.id) === String(id));
        if (p) setItems(prev => [...prev, { producto: p, cantidad: 1 }]);
        setAgregarId('');
    };

    const cambiarCantidad = (id, valor) => setItems(prev => prev.map(i => i.producto.id === id
        ? { ...i, cantidad: valor === '' ? '' : Math.max(1, Math.min(Number(valor), i.producto.stock)) } : i));

    const guardar = async () => {
        setGuardando(true); setAlert(null);
        try {
            const res = await store({
                origen_id: origen, destino_id: destino, observacion: observacion.trim() || null,
                items: items.map(i => ({ producto_id: i.producto.id, cantidad: Number(i.cantidad) })),
            });
            onGuardado(res.message);
        } catch (err) {
            setAlert(handleApiError(err, 'No se pudo registrar el traslado'));
        } finally {
            setGuardando(false);
        }
    };

    const unidades = items.reduce((s, i) => s + (Number(i.cantidad) || 0), 0);
    const valido = origen && destino && origen !== destino && items.length > 0 && items.every(i => Number(i.cantidad) >= 1);

    return (
        <Modal titulo="Nuevo traslado entre sedes" icon={ArrowsRightLeftIcon} onClose={onClose} ancho="max-w-2xl" error={errorDeAlerta(alert)}
            pie={<>
                <button onClick={onClose} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg font-bold uppercase text-sm">Cancelar</button>
                <button onClick={guardar} disabled={guardando || !valido} className="px-4 py-2 bg-secondary text-primary rounded-lg font-bold uppercase text-sm disabled:opacity-40">
                    {guardando ? 'Registrando...' : `Trasladar ${unidades || ''} ${unidades === 1 ? 'unidad' : 'unidades'}`}
                </button>
            </>}>
            <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-3 items-end">
                    <div>
                        <label className={labelCls}>Sale de *</label>
                        {sucursal ? (
                            <p className="p-2.5 text-sm rounded-lg bg-slate-50 border border-slate-200 text-slate-700">{sucursal.nombre}</p>
                        ) : (
                            <select value={origen} onChange={e => setOrigen(e.target.value)} className={inputCls}>
                                <option value="">-- Sede de origen --</option>
                                {sedes.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                            </select>
                        )}
                    </div>
                    <ArrowRightIcon className="hidden sm:block w-5 h-5 text-slate-400 mb-3" aria-hidden />
                    <div>
                        <label className={labelCls}>Llega a *</label>
                        <select value={destino} onChange={e => setDestino(e.target.value)} className={inputCls}>
                            <option value="">-- Sede de destino --</option>
                            {sedes.filter(s => String(s.id) !== String(origen)).map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                        </select>
                    </div>
                </div>

                {origen && (
                    <div>
                        <label className={labelCls}>Productos</label>
                        <select value={agregarId} onChange={e => agregar(e.target.value)} className={inputCls} disabled={disponibles.length === 0}>
                            <option value="">{disponibles.length ? '+ Agregar producto...' : 'No hay más productos con stock en el origen'}</option>
                            {disponibles.map(p => <option key={p.id} value={p.id}>{p.nombre} (hay {p.stock})</option>)}
                        </select>
                        {items.length > 0 && (
                            <ul className="mt-3 divide-y divide-slate-100 border border-slate-200 rounded-lg">
                                {items.map(({ producto: p, cantidad }) => (
                                    <li key={p.id} className="flex items-center gap-3 px-3 py-2">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-slate-800 truncate">{p.nombre}</p>
                                            <p className="text-[11px] text-slate-400">Hay {p.stock} en el origen</p>
                                        </div>
                                        <input type="number" min="1" max={p.stock} value={cantidad} onChange={e => cambiarCantidad(p.id, e.target.value)}
                                            className="w-20 p-1.5 text-sm text-right font-black tabular-nums text-secondary border border-slate-300 rounded-lg" aria-label={`Cantidad de ${p.nombre}`} />
                                        <button onClick={() => setItems(prev => prev.filter(i => i.producto.id !== p.id))} className="p-1 text-slate-400 hover:text-red-600" aria-label={`Quitar ${p.nombre}`}>
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}

                <div>
                    <label className={labelCls}>Observación</label>
                    <input value={observacion} onChange={e => setObservacion(e.target.value)} className={inputCls} maxLength={255} placeholder="Ej: Reposición para el fin de semana" />
                </div>
                <p className="text-[11px] text-slate-500">El stock sale del origen y entra al destino en el momento; ambos movimientos quedan en el kardex.</p>
            </div>
        </Modal>
    );
};

/** Historial de traslados de productos entre sedes. */
const Index = () => {
    const { can } = useAuth();
    const [loading, setLoading] = useState(true);
    const [traslados, setTraslados] = useState([]);
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, total: 0 });
    const [alert, setAlert] = useState(null);
    const [nuevo, setNuevo] = useState(false);

    const fetchTraslados = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const r = await index(page);
            setTraslados(r.data || []);
            setPagination({ currentPage: r.current_page, totalPages: r.last_page, total: r.total });
        } catch (err) {
            setAlert(handleApiError(err, 'Error al cargar los traslados'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchTraslados(1); }, [fetchTraslados]);

    const columns = useMemo(() => [
        { header: 'N°', render: (r) => <span className="text-sm font-black tabular-nums text-slate-700">#{r.id}</span> },
        { header: 'Fecha', render: (r) => <span className="text-xs text-slate-600 tabular-nums whitespace-nowrap">{r.fecha.slice(0, 16)}</span> },
        { header: 'Ruta', render: (r) => (
            <span className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-800 whitespace-nowrap">
                {r.origen} <ArrowRightIcon className="w-4 h-4 text-slate-400" /> {r.destino}
            </span>
        ) },
        { header: 'Productos', render: (r) => (
            <div className="text-xs text-slate-600 max-w-xs">
                {r.items.map(i => `${i.cantidad}× ${i.producto}`).join(', ')}
                {r.observacion && <p className="text-[11px] text-slate-400 italic mt-0.5">{r.observacion}</p>}
            </div>
        ) },
        { header: 'Unid.', render: (r) => <span className="text-sm font-black tabular-nums">{r.unidades}</span> },
        { header: 'Registró', render: (r) => <span className="text-xs text-slate-600">{r.registrado_por || '—'}</span> },
    ], []);

    return (
        <div className="container mx-auto p-4 sm:p-6">
            <PageHeader title="Traslados" subtitle="Envío de productos entre sedes" icon={ArrowsRightLeftIcon} />
            <div className="flex flex-wrap justify-end gap-2 -mt-2 mb-6">
                {can('producto.index') && (
                    <Link to="/productos" className="inline-flex items-center gap-1.5 px-5 py-3 rounded-lg border border-slate-300 bg-white text-secondary font-black uppercase text-sm hover:border-slate-500">
                        <ShoppingBagIcon className="w-4 h-4" /> Productos
                    </Link>
                )}
                {can('traslado.store') && (
                    <button onClick={() => setNuevo(true)} className="bg-primary text-secondary px-6 py-3 rounded-lg font-black uppercase shadow-lg hover:bg-primary-hover">+ Nuevo traslado</button>
                )}
            </div>

            <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />

            <Table columns={columns} data={traslados} loading={loading} pagination={{ clave: 'traslados', ...pagination, onPageChange: fetchTraslados }} />

            {nuevo && (
                <TrasladoModal onClose={() => setNuevo(false)}
                    onGuardado={(msg) => { setNuevo(false); setAlert({ type: 'success', message: msg }); fetchTraslados(1); }} />
            )}
        </div>
    );
};

export default Index;
