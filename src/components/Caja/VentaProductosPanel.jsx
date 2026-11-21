import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { MagnifyingGlassIcon, PlusIcon, MinusIcon, TrashIcon, ShoppingCartIcon, UserIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { productos as listarProductos, venderProductos, buscarCliente } from 'services/cajaSesionService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import { soles } from 'components/Pagos/PagoUI';
import MetodoCobro, { COBRO_INICIAL, TotalCobro, CobroExitoso, cobroValido, datosCobro, inputCls, labelCls } from 'components/Caja/MetodoCobro';

const redondear = (n) => Math.round(n * 100) / 100;

/**
 * Venta de productos en caja: se arma el carrito con el stock de la sede y se
 * cobra a público general (nombre opcional) o a un cliente registrado (por DNI).
 */
const VentaProductosPanel = ({ metodos, onCobrado, onTicket }) => {
    const [productos, setProductos] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [carrito, setCarrito] = useState([]);           // [{ producto, cantidad }]
    const [tipoCliente, setTipoCliente] = useState('general');
    const [nombreGeneral, setNombreGeneral] = useState('');
    const [dni, setDni] = useState('');
    const [cliente, setCliente] = useState(null);
    const [cobro, setCobro] = useState(COBRO_INICIAL);
    const [resultado, setResultado] = useState(null);
    const [procesando, setProcesando] = useState(false);
    const [alert, setAlert] = useState(null);

    const cargar = useCallback(async () => {
        try {
            const r = await listarProductos();
            setProductos(r.data || []);
        } catch (err) {
            setAlert(handleApiError(err, 'No se pudieron cargar los productos'));
        }
    }, []);

    useEffect(() => { cargar(); }, [cargar]);

    const filtrados = useMemo(() => {
        const t = busqueda.trim().toUpperCase();
        return t ? productos.filter(p => p.nombre.includes(t) || (p.codigo || '').includes(t) || (p.categoria || '').includes(t)) : productos;
    }, [productos, busqueda]);

    const enCarrito = (id) => carrito.find(i => i.producto.id === id)?.cantidad || 0;

    const agregar = (producto, delta = 1) => {
        setResultado(null);
        setCarrito(prev => {
            const actual = prev.find(i => i.producto.id === producto.id);
            const nueva = Math.min((actual?.cantidad || 0) + delta, producto.stock);
            if (nueva <= 0) return prev.filter(i => i.producto.id !== producto.id);
            return actual
                ? prev.map(i => i.producto.id === producto.id ? { ...i, cantidad: nueva } : i)
                : [...prev, { producto, cantidad: nueva }];
        });
    };

    const total = redondear(carrito.reduce((s, i) => s + i.producto.precio_venta * i.cantidad, 0));
    const unidades = carrito.reduce((s, i) => s + i.cantidad, 0);

    const buscarPorDni = async (e) => {
        e.preventDefault();
        if (!/^\d{8}$/.test(dni)) return;
        setProcesando(true); setAlert(null);
        try {
            const r = await buscarCliente(dni);
            setCliente(r.data.cliente);
        } catch (err) {
            setAlert(handleApiError(err, 'Cliente no encontrado'));
        } finally {
            setProcesando(false);
        }
    };

    const nuevaVenta = () => {
        setCarrito([]); setCobro(COBRO_INICIAL); setResultado(null);
        setCliente(null); setDni(''); setNombreGeneral(''); setTipoCliente('general');
    };

    const vender = async () => {
        setProcesando(true); setAlert(null);
        try {
            const r = await venderProductos({
                items: carrito.map(i => ({ producto_id: i.producto.id, cantidad: i.cantidad })),
                cliente_id: tipoCliente === 'cliente' ? cliente?.id : null,
                cliente_nombre: tipoCliente === 'general' ? nombreGeneral.trim() || null : null,
                ...datosCobro(cobro, total),
            });
            setResultado(r.data);
            setCarrito([]); setCobro(COBRO_INICIAL);
            await cargar();
            onCobrado?.();
        } catch (err) {
            setAlert(handleApiError(err, 'No se pudo registrar la venta'));
            cargar(); // el stock pudo cambiar
        } finally {
            setProcesando(false);
        }
    };

    const clienteListo = tipoCliente === 'general' || !!cliente;
    const puedeVender = carrito.length > 0 && clienteListo && cobroValido(cobro, total) && !procesando;

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />
            {resultado && <CobroExitoso resultado={resultado} onTicket={onTicket} onNuevo={nuevaVenta} />}

            {/* 1. PRODUCTOS */}
            <div>
                <div className="relative mb-3">
                    <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
                    <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar producto, código o categoría"
                        className={`${inputCls} pl-10`} />
                </div>
                {productos.length === 0 ? (
                    <p className="text-sm text-slate-400 py-6 text-center border border-dashed border-slate-200 rounded-xl">No hay productos activos para vender.</p>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-72 overflow-y-auto pr-1">
                        {filtrados.map(p => {
                            const usado = enCarrito(p.id);
                            const agotado = p.stock - usado <= 0;
                            return (
                                <button key={p.id} type="button" onClick={() => agregar(p)} disabled={agotado}
                                    className={`text-left p-2.5 rounded-xl border transition-colors disabled:cursor-not-allowed
                                        ${usado ? 'border-secondary bg-primary-light/40' : 'border-slate-200 bg-white hover:border-slate-400'} ${agotado && !usado ? 'opacity-50' : ''}`}>
                                    <p className="text-xs font-black text-slate-800 leading-tight line-clamp-2 min-h-[2rem]">{p.nombre}</p>
                                    <div className="mt-1 flex items-end justify-between gap-1">
                                        <span className="text-sm font-black tabular-nums text-secondary">{soles(p.precio_venta)}</span>
                                        <span className={`text-[10px] font-bold ${p.stock - usado <= 0 ? 'text-red-600' : 'text-slate-400'}`}>
                                            {p.stock <= 0 ? 'Sin stock' : `Stock ${p.stock - usado}`}
                                        </span>
                                    </div>
                                </button>
                            );
                        })}
                        {filtrados.length === 0 && <p className="col-span-full text-sm text-slate-400 text-center py-4">Ningún producto coincide.</p>}
                    </div>
                )}
            </div>

            {/* 2. CARRITO */}
            <div className="rounded-xl border border-slate-200">
                <h4 className="px-3 py-2 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                    <ShoppingCartIcon className="w-4 h-4" /> Carrito {unidades > 0 && `· ${unidades} ${unidades === 1 ? 'unidad' : 'unidades'}`}
                </h4>
                {carrito.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-5">Toca un producto para agregarlo.</p>
                ) : (
                    <ul className="divide-y divide-slate-100">
                        {carrito.map(({ producto: p, cantidad }) => (
                            <li key={p.id} className="flex items-center gap-2 px-3 py-2">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-slate-800 truncate">{p.nombre}</p>
                                    <p className="text-[11px] text-slate-400 tabular-nums">{soles(p.precio_venta)} c/u</p>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => agregar(p, -1)} className="p-1 rounded-md border border-slate-300 text-slate-600 hover:bg-slate-50" aria-label={`Quitar una unidad de ${p.nombre}`}><MinusIcon className="w-4 h-4" /></button>
                                    <span className="w-8 text-center text-sm font-black tabular-nums text-secondary">{cantidad}</span>
                                    <button onClick={() => agregar(p, 1)} disabled={cantidad >= p.stock} className="p-1 rounded-md border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-40" aria-label={`Agregar una unidad de ${p.nombre}`}><PlusIcon className="w-4 h-4" /></button>
                                </div>
                                <span className="w-20 text-right text-sm font-black tabular-nums text-slate-900">{soles(p.precio_venta * cantidad)}</span>
                                <button onClick={() => agregar(p, -cantidad)} className="p-1 text-slate-400 hover:text-red-600" aria-label={`Quitar ${p.nombre}`}><TrashIcon className="w-4 h-4" /></button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {carrito.length > 0 && (
                <div className="space-y-4">
                    {/* 3. CLIENTE */}
                    <div>
                        <label className={labelCls}>Cliente</label>
                        <div className="flex gap-2 mb-2" role="radiogroup">
                            {[['general', 'Público general'], ['cliente', 'Cliente registrado']].map(([k, l]) => (
                                <button key={k} type="button" role="radio" aria-checked={tipoCliente === k} onClick={() => setTipoCliente(k)}
                                    className={`flex-1 py-2 rounded-lg border text-sm font-bold ${tipoCliente === k ? 'bg-secondary text-primary border-secondary' : 'border-slate-300 text-slate-600 hover:border-slate-400'}`}>
                                    {l}
                                </button>
                            ))}
                        </div>
                        {tipoCliente === 'general' ? (
                            <input value={nombreGeneral} onChange={e => setNombreGeneral(e.target.value)} maxLength={120}
                                className={inputCls} placeholder="Nombre (opcional, sale en el ticket)" />
                        ) : cliente ? (
                            <div className="flex items-center justify-between gap-2 p-3 rounded-lg bg-slate-50 border border-slate-200">
                                <p className="text-sm text-slate-800 flex items-center gap-2 min-w-0"><UserIcon className="w-4 h-4 text-slate-400 shrink-0" /> <b className="truncate">{cliente.nombre_completo}</b> <span className="text-slate-500 shrink-0">DNI {cliente.dni}</span></p>
                                <button onClick={() => { setCliente(null); setDni(''); }} className="p-1 text-slate-400 hover:text-slate-700" aria-label="Cambiar de cliente"><XMarkIcon className="w-4 h-4" /></button>
                            </div>
                        ) : (
                            <form onSubmit={buscarPorDni} className="flex gap-2">
                                <input value={dni} onChange={(e) => setDni(e.target.value.replace(/\D/g, '').slice(0, 8))} inputMode="numeric"
                                    className={`${inputCls} tabular-nums tracking-widest font-bold`} placeholder="DNI (8 dígitos)" />
                                <button type="submit" disabled={dni.length !== 8 || procesando}
                                    className="px-4 bg-secondary text-primary rounded-lg font-black uppercase text-xs disabled:opacity-40">Buscar</button>
                            </form>
                        )}
                    </div>

                    {/* 4. COBRO */}
                    <MetodoCobro cobro={cobro} onChange={setCobro} total={total} metodos={metodos} />
                    <TotalCobro detalle={`${unidades} ${unidades === 1 ? 'producto' : 'productos'}`} total={total} />
                    <div className="flex justify-end">
                        <button onClick={vender} disabled={!puedeVender}
                            className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-secondary rounded-lg font-black uppercase shadow hover:bg-primary-hover disabled:opacity-40">
                            <ShoppingCartIcon className="w-5 h-5" /> {procesando ? 'Registrando...' : `Vender ${soles(total)}`}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VentaProductosPanel;
