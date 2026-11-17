import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { index, verificar, rechazar, anular } from 'services/pagoService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';
import { useAuth } from 'context/AuthContext';
import Table from 'components/Shared/Tables/Table';
import PageHeader from 'components/Shared/Headers/PageHeader';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import { ComprobanteModal, AnularPagoModal, EstadoPago, BotonTicket, useTicket, soles, METODOS, errorDeAlerta } from 'components/Pagos/PagoUI';
import { CreditCardIcon, PhotoIcon, NoSymbolIcon, GlobeAltIcon, BuildingStorefrontIcon } from '@heroicons/react/24/outline';

const FILTROS_INICIALES = { search: '', estado: '', metodo_pago: '', origen: '', fecha_desde: '', fecha_hasta: '' };

const Index = () => {
    const { can } = useAuth();
    const [loading, setLoading] = useState(true);
    const [procesando, setProcesando] = useState(false);
    const [pagos, setPagos] = useState([]);
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, total: 0 });
    const [filters, setFilters] = useState(FILTROS_INICIALES);
    const filtersRef = useRef(filters);
    const [alert, setAlert] = useState(null);
    const [comprobante, setComprobante] = useState(null);
    const [anulando, setAnulando] = useState(null);
    const { abrirTicket, TicketModal, errorTicket } = useTicket();

    const fetchPagos = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const res = await index(page, filtersRef.current);
            setPagos(res.data || []);
            setPagination({ currentPage: res.current_page, totalPages: res.last_page, total: res.total });
        } catch (err) {
            setAlert(handleApiError(err, 'Error al cargar los pagos'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchPagos(1); }, [fetchPagos]);

    const accion = useCallback(async (fn, mensaje, errorMsg) => {
        setProcesando(true);
        setAlert(null);
        try {
            await fn();
            setAlert({ type: 'success', message: mensaje });
            await fetchPagos(pagination.currentPage);
            return true;
        } catch (err) {
            setAlert(handleApiError(err, errorMsg));
            return false;
        } finally {
            setProcesando(false);
        }
    }, [fetchPagos, pagination.currentPage]);

    const filterConfig = useMemo(() => [
        { name: 'search', type: 'text', label: 'Cliente (nombre / DNI) o N° operación', placeholder: 'Ej: 45781989', colSpan: 'col-span-12 md:col-span-4' },
        { name: 'estado', type: 'select', label: 'Estado', colSpan: 'col-span-6 md:col-span-2',
            options: [{ value: '', label: 'Todos' }, { value: 'pendiente', label: 'Pendientes' }, { value: 'verificado', label: 'Verificados' }, { value: 'rechazado', label: 'Rechazados' }, { value: 'anulado', label: 'Anulados' }] },
        { name: 'metodo_pago', type: 'select', label: 'Método', colSpan: 'col-span-6 md:col-span-2',
            options: [{ value: '', label: 'Todos' }, ...Object.entries(METODOS).map(([value, label]) => ({ value, label }))] },
        { name: 'origen', type: 'select', label: 'Origen', colSpan: 'col-span-6 md:col-span-2',
            options: [{ value: '', label: 'Todos' }, { value: 'web', label: 'En línea' }, { value: 'manual', label: 'Caja' }] },
        { name: 'fecha_desde', type: 'date', label: 'Desde', colSpan: 'col-span-6 md:col-span-2' },
        { name: 'fecha_hasta', type: 'date', label: 'Hasta', colSpan: 'col-span-6 md:col-span-2' },
    ], []);

    const columns = useMemo(() => [
        { header: 'Pago', render: (r) => (
            <div>
                <p className="font-black text-slate-800 text-sm">#{r.id}</p>
                <p className="text-[11px] text-slate-400 tabular-nums">{r.created_at.slice(0, 16)}</p>
            </div>
        ) },
        { header: 'Cliente', render: (r) => (
            <div>
                <Link to={`/membresia/${r.cliente_id}`} className="font-bold text-slate-800 text-sm hover:underline">{r.cliente}</Link>
                <p className="text-xs text-slate-500">DNI {r.dni} · {r.plan}</p>
            </div>
        ) },
        { header: 'Monto', render: (r) => (
            <div>
                <p className={`font-black tabular-nums ${r.estado === 'anulado' || r.estado === 'rechazado' ? 'line-through text-slate-400' : 'text-secondary'}`}>{soles(r.monto)}</p>
                <p className="text-[11px] text-slate-500">{METODOS[r.metodo_pago]}{r.numero_operacion ? ` · op. ${r.numero_operacion}` : ''}</p>
            </div>
        ) },
        { header: 'Origen', render: (r) => (
            <span className="inline-flex items-center gap-1 text-xs text-slate-600">
                {r.origen === 'web' ? <GlobeAltIcon className="w-4 h-4" /> : <BuildingStorefrontIcon className="w-4 h-4" />}
                {r.origen === 'web' ? 'En línea' : 'Caja'}{r.sucursal ? ` · ${r.sucursal}` : ''}
            </span>
        ) },
        { header: 'Estado', render: (r) => (
            <div className="space-y-0.5">
                <EstadoPago estado={r.estado} />
                {r.estado === 'rechazado' && <p className="text-[11px] text-slate-500 max-w-[180px] truncate" title={r.motivo_rechazo}>{r.motivo_rechazo}</p>}
                {r.estado === 'anulado' && <p className="text-[11px] text-slate-500 max-w-[180px] truncate" title={r.motivo_anulacion}>{r.motivo_anulacion}</p>}
                {r.revisado_por && r.estado !== 'pendiente' && <p className="text-[10px] text-slate-400">por {r.revisado_por}</p>}
            </div>
        ) },
        { header: 'Acciones', render: (r) => (
            <div className="flex items-center gap-1">
                {r.tiene_comprobante && (
                    <button onClick={() => { setAlert(null); setComprobante(r); }} title={r.estado === 'pendiente' ? 'Revisar comprobante' : 'Ver comprobante'}
                        className={`inline-flex items-center gap-1 rounded-lg font-bold transition-all ${r.estado === 'pendiente'
                            ? 'px-3 py-2 text-xs bg-secondary text-primary hover:bg-secondary/90'
                            : 'p-2 text-slate-500 hover:text-secondary hover:bg-primary-light'}`}>
                        <PhotoIcon className="w-5 h-5" /> {r.estado === 'pendiente' && 'Revisar'}
                    </button>
                )}
                {r.estado !== 'pendiente' && can('pago.ticket') && <BotonTicket compacto onClick={() => abrirTicket(r.id)} />}
                {r.estado === 'verificado' && can('pago.anular') && (
                    <button onClick={() => { setAlert(null); setAnulando(r); }} title="Anular (requiere PIN)"
                        className="p-2 text-slate-500 hover:text-red-700 hover:bg-red-50 rounded-lg">
                        <NoSymbolIcon className="w-5 h-5" />
                    </button>
                )}
            </div>
        ) },
    ], [can, abrirTicket]);

    return (
        <div className="container mx-auto p-6">
            <PageHeader title="Pagos" subtitle="Comprobantes en línea, cobros en caja y anulaciones" icon={CreditCardIcon} />
            <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />
            {errorTicket && <AlertMessage type="error" message={errorTicket} />}

            <Table columns={columns} data={pagos} loading={loading}
                filterConfig={filterConfig} filters={filters}
                onFilterChange={(n, v) => setFilters(p => ({ ...p, [n]: v }))}
                onFilterSubmit={() => { filtersRef.current = filters; fetchPagos(1); }}
                onFilterClear={() => { setFilters(FILTROS_INICIALES); filtersRef.current = FILTROS_INICIALES; fetchPagos(1); }}
                pagination={{ ...pagination, onPageChange: fetchPagos }} />

            {comprobante && (
                <ComprobanteModal pago={comprobante} loading={procesando} error={errorDeAlerta(alert)} onClose={() => { setComprobante(null); setAlert(null); }}
                    onVerificar={can('pago.verificar') ? async () => {
                        if (await accion(() => verificar(comprobante.id), 'Pago verificado. La membresía del cliente quedó activa.', 'No se pudo verificar el pago')) setComprobante(null);
                    } : null}
                    onRechazar={can('pago.rechazar') ? async (motivo) => {
                        if (await accion(() => rechazar(comprobante.id, motivo), 'Comprobante rechazado.', 'No se pudo rechazar el pago')) setComprobante(null);
                    } : null}
                />
            )}

            {anulando && (
                <AnularPagoModal pago={anulando} loading={procesando} error={errorDeAlerta(alert)} onClose={() => { setAnulando(null); setAlert(null); }}
                    onConfirm={async (pin, motivo) => {
                        if (await accion(() => anular(anulando.id, pin, motivo), `Pago #${anulando.id} anulado.`, 'No se pudo anular el pago')) setAnulando(null);
                    }} />
            )}

            <TicketModal />
        </div>
    );
};

export default Index;
