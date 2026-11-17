import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { index, show } from 'services/cajaSesionService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';
import Table from 'components/Shared/Tables/Table';
import PageHeader from 'components/Shared/Headers/PageHeader';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import { Modal, EstadoPago, BotonTicket, useTicket, soles, METODOS } from 'components/Pagos/PagoUI';
import { ArchiveBoxIcon, EyeIcon } from '@heroicons/react/24/outline';
import { useAuth } from 'context/AuthContext';
import { SinAcciones } from 'components/Shared/Tables/EstadoToggle';

const FILTROS_INICIALES = { estado: '', fecha_desde: '', fecha_hasta: '' };

const Diferencia = ({ valor }) => {
    if (valor === null || valor === undefined) return <span className="text-slate-400">—</span>;
    const v = Number(valor);
    if (v === 0) return <span className="font-bold text-green-700">Cuadra</span>;
    return <span className={`font-bold tabular-nums ${v < 0 ? 'text-red-700' : 'text-amber-700'}`}>{v > 0 ? 'Sobra' : 'Falta'} {soles(Math.abs(v))}</span>;
};

const Historial = () => {
    const { can } = useAuth();
    const [loading, setLoading] = useState(true);
    const [cajas, setCajas] = useState([]);
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, total: 0 });
    const [filters, setFilters] = useState(FILTROS_INICIALES);
    const filtersRef = useRef(filters);
    const [alert, setAlert] = useState(null);
    const [detalle, setDetalle] = useState(null);
    const { abrirTicket, TicketModal } = useTicket();

    const fetchCajas = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const res = await index(page, filtersRef.current);
            setCajas(res.data || []);
            setPagination({ currentPage: res.current_page, totalPages: res.last_page, total: res.total });
        } catch (err) {
            setAlert(handleApiError(err, 'Error al cargar el historial de cajas'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchCajas(1); }, [fetchCajas]);

    const verDetalle = async (id) => {
        try {
            const res = await show(id);
            setDetalle(res.data);
        } catch (err) {
            setAlert(handleApiError(err, 'No se pudo abrir la caja'));
        }
    };

    const filterConfig = useMemo(() => [
        { name: 'estado', type: 'select', label: 'Estado', colSpan: 'col-span-12 md:col-span-3',
            options: [{ value: '', label: 'Todas' }, { value: 'abierta', label: 'Abiertas' }, { value: 'cerrada', label: 'Cerradas' }] },
        { name: 'fecha_desde', type: 'date', label: 'Desde', colSpan: 'col-span-6 md:col-span-3' },
        { name: 'fecha_hasta', type: 'date', label: 'Hasta', colSpan: 'col-span-6 md:col-span-3' },
    ], []);

    const columns = useMemo(() => [
        { header: 'Caja', render: (r) => (
            <div>
                <p className="font-bold text-slate-800 text-sm">{r.caja_nombre} · {r.sucursal}</p>
                <p className="text-[11px] text-slate-400">Turno #{r.id}</p>
                <p className="text-xs text-slate-500">{r.usuario}</p>
            </div>
        ) },
        { header: 'Turno', render: (r) => (
            <div className="text-xs text-slate-600 tabular-nums">
                <p>{r.fecha_apertura}</p>
                <p className="text-slate-400">{r.fecha_cierre || 'Abierta'}</p>
            </div>
        ) },
        { header: 'Cobrado', render: (r) => (
            <div className="text-sm"><p className="font-black tabular-nums">{soles(r.total_cobrado)}</p><p className="text-[11px] text-slate-400">{r.cantidad_pagos} pagos · efectivo {soles(r.efectivo)}</p></div>
        ) },
        { header: 'Arqueo', render: (r) => (
            <div className="text-xs tabular-nums">
                <p>Esperado {soles(r.monto_esperado)}</p>
                <p>Contado {r.monto_contado !== null ? soles(r.monto_contado) : '—'}</p>
            </div>
        ) },
        { header: 'Diferencia', render: (r) => <Diferencia valor={r.diferencia} /> },
        { header: 'Estado', render: (r) => (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${r.estado === 'abierta' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>{r.estado}</span>
        ) },
        { header: 'Acciones', render: (r) => !can('cajaSesion.show') ? <SinAcciones /> : (
            <button onClick={() => verDetalle(r.id)} className="p-2 text-slate-500 hover:text-secondary hover:bg-primary-light rounded-lg" title="Ver detalle">
                <EyeIcon className="w-5 h-5" />
            </button>
        ) },
    ], [can]);

    return (
        <div className="container mx-auto p-6">
            <PageHeader title="Historial de Cajas" subtitle="Turnos: aperturas, cierres y arqueos de cada caja" icon={ArchiveBoxIcon} />
            <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />

            <Table columns={columns} data={cajas} loading={loading}
                filterConfig={filterConfig} filters={filters}
                onFilterChange={(n, v) => setFilters(p => ({ ...p, [n]: v }))}
                onFilterSubmit={() => { filtersRef.current = filters; fetchCajas(1); }}
                onFilterClear={() => { setFilters(FILTROS_INICIALES); filtersRef.current = FILTROS_INICIALES; fetchCajas(1); }}
                pagination={{ ...pagination, onPageChange: fetchCajas }} />

            {detalle && (
                <Modal titulo={`${detalle.caja.caja_nombre} · ${detalle.caja.sucursal} · turno #${detalle.caja.id}`} icon={ArchiveBoxIcon} onClose={() => setDetalle(null)} ancho="max-w-3xl">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5 text-center">
                        {[
                            ['Apertura', soles(detalle.caja.monto_apertura)],
                            ['Esperado', soles(detalle.caja.monto_esperado ?? detalle.resumen.efectivo_esperado)],
                            ['Contado', detalle.caja.monto_contado !== null ? soles(detalle.caja.monto_contado) : '—'],
                        ].map(([l, v]) => (
                            <div key={l} className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                                <p className="text-[10px] uppercase font-bold text-slate-400">{l}</p><p className="font-black tabular-nums">{v}</p>
                            </div>
                        ))}
                        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                            <p className="text-[10px] uppercase font-bold text-slate-400">Diferencia</p><Diferencia valor={detalle.caja.diferencia} />
                        </div>
                    </div>

                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Por método</h4>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-5">
                        {Object.entries(detalle.resumen.por_metodo).map(([m, v]) => (
                            <div key={m} className="p-2 rounded-lg border border-slate-200 text-center">
                                <p className="text-[11px] font-bold text-slate-500">{METODOS[m]}</p>
                                <p className="text-sm font-black tabular-nums">{soles(v.total)}</p>
                                <p className="text-[10px] text-slate-400">{v.cantidad} pagos</p>
                            </div>
                        ))}
                    </div>

                    {detalle.caja.desglose && (
                        <p className="text-xs text-slate-500 mb-4">
                            Desglose contado: {Object.entries(detalle.caja.desglose).map(([d, c]) => `${c} × S/ ${d}`).join(' · ')}
                        </p>
                    )}
                    {detalle.caja.observaciones && <p className="text-xs text-slate-600 mb-4 whitespace-pre-line"><b>Observaciones:</b> {detalle.caja.observaciones}</p>}

                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Pagos ({detalle.pagos.length})</h4>
                    <table className="w-full text-sm">
                        <tbody>
                            {detalle.pagos.map(p => (
                                <tr key={p.id} className="border-b border-slate-50 last:border-0">
                                    <td className="py-1.5 text-xs text-slate-400 tabular-nums">{p.hora}</td>
                                    <td className="py-1.5"><span className="font-bold text-slate-700">{p.cliente}</span> <span className="text-xs text-slate-400">{p.plan}</span></td>
                                    <td className="py-1.5 text-xs text-slate-500">{METODOS[p.metodo_pago]}</td>
                                    <td className="py-1.5 text-right font-black tabular-nums">{soles(p.monto)}</td>
                                    <td className="py-1.5 text-right"><EstadoPago estado={p.estado} /></td>
                                    <td className="py-1.5 text-right"><BotonTicket compacto onClick={() => abrirTicket(p.id)} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Modal>
            )}
            <TicketModal />
        </div>
    );
};

export default Historial;
