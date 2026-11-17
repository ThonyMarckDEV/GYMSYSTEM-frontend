import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { misPagos, comprobanteUrl, ticketUrl } from 'services/perfilService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';
import { useEventoEnVivo } from 'context/NotificacionesContext';
import Table from 'components/Shared/Tables/Table';
import PageHeader from 'components/Shared/Headers/PageHeader';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import { KpiTile } from 'components/Dashboard/Charts';
import { Modal, ImagenProtegida, VisorImagen, EstadoPago, BotonTicket, useTicket, soles, METODOS } from 'components/Pagos/PagoUI';
import { ReceiptPercentIcon, BanknotesIcon, ClockIcon, PhotoIcon, GlobeAltIcon, BuildingStorefrontIcon } from '@heroicons/react/24/outline';

const CONCEPTOS = { membresia: 'Membresía', clase: 'Clase / evento', producto: 'Compra' };
const FILTROS_INICIALES = { estado: '', concepto: '' };

/** La captura del comprobante que subió el cliente (ampliable). */
const ComprobanteModal = ({ pago, onClose }) => {
    const [ampliada, setAmpliada] = useState(null);
    return (
        <>
            <Modal titulo={`Comprobante del pago #${pago.id}`} icon={PhotoIcon} onClose={onClose} ancho="max-w-2xl">
                <p className="text-sm text-slate-600 mb-3">
                    {CONCEPTOS[pago.concepto]}: <b>{pago.descripcion}</b> · {soles(pago.monto)} por {METODOS[pago.metodo_pago]}
                    {pago.numero_operacion ? ` (op. ${pago.numero_operacion})` : ''}
                </p>
                <ImagenProtegida url={comprobanteUrl(pago.id)} alt={`Comprobante del pago ${pago.id}`}
                    className="w-full h-[60vh] rounded-xl border border-slate-200 bg-slate-50" vacio="No se pudo cargar la captura" onAbrir={setAmpliada} />
            </Modal>
            {ampliada && <VisorImagen src={ampliada} alt="Comprobante" onClose={() => setAmpliada(null)} />}
        </>
    );
};

/** Mis pagos: el cliente ve solo sus pagos y la captura de sus comprobantes. */
const Index = () => {
    const [loading, setLoading] = useState(true);
    const [pagos, setPagos] = useState([]);
    const [resumen, setResumen] = useState(null);
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, total: 0 });
    const [filters, setFilters] = useState(FILTROS_INICIALES);
    const filtersRef = useRef(filters);
    const [alert, setAlert] = useState(null);
    const [viendo, setViendo] = useState(null);
    const { abrirTicket, TicketModal, errorTicket } = useTicket(ticketUrl);

    const fetchPagos = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const r = await misPagos(page, filtersRef.current);
            setPagos(r.data || []);
            setResumen(r.resumen);
            setPagination({ currentPage: r.current_page, totalPages: r.last_page, total: r.total });
        } catch (err) {
            setAlert(handleApiError(err, 'No se pudieron cargar tus pagos'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchPagos(1); }, [fetchPagos]);
    useEventoEnVivo('gym:notificacion', (n) => { if (n.tipo?.startsWith('pago_')) fetchPagos(pagination.currentPage); });

    const filterConfig = useMemo(() => [
        { name: 'estado', type: 'select', label: 'Estado', colSpan: 'col-span-6 md:col-span-4',
            options: [{ value: '', label: 'Todos' }, { value: 'verificado', label: 'Pagados' }, { value: 'pendiente', label: 'En revisión' }, { value: 'rechazado', label: 'Rechazados' }, { value: 'anulado', label: 'Anulados' }] },
        { name: 'concepto', type: 'select', label: 'Concepto', colSpan: 'col-span-6 md:col-span-4',
            options: [{ value: '', label: 'Todos' }, ...Object.entries(CONCEPTOS).map(([value, label]) => ({ value, label }))] },
    ], []);

    const columns = useMemo(() => [
        { header: 'Fecha', render: (r) => (
            <div className="tabular-nums whitespace-nowrap">
                <p className="text-sm font-bold text-slate-700">{r.fecha.slice(0, 10)}</p>
                <p className="text-[11px] text-slate-400">{r.fecha.slice(11, 16)} · #{r.id}</p>
            </div>
        ) },
        { header: 'Concepto', render: (r) => (
            <div className="max-w-[280px]">
                <p className="text-[10px] font-black uppercase text-slate-400">{CONCEPTOS[r.concepto] || 'Pago'}</p>
                <p className="text-sm font-bold text-slate-800 truncate" title={r.descripcion}>{r.descripcion}</p>
            </div>
        ) },
        { header: 'Monto', render: (r) => (
            <div>
                <p className={`font-black tabular-nums ${['anulado', 'rechazado'].includes(r.estado) ? 'line-through text-slate-400' : 'text-secondary'}`}>{soles(r.monto)}</p>
                <p className="text-[11px] text-slate-500">{METODOS[r.metodo_pago]}{r.numero_operacion ? ` · op. ${r.numero_operacion}` : ''}</p>
            </div>
        ) },
        { header: 'Dónde', render: (r) => (
            <span className="inline-flex items-center gap-1 text-xs text-slate-600">
                {r.origen === 'web' ? <GlobeAltIcon className="w-4 h-4" /> : <BuildingStorefrontIcon className="w-4 h-4" />}
                {r.origen === 'web' ? 'En línea' : `Recepción${r.sede ? ` · ${r.sede}` : ''}`}
            </span>
        ) },
        { header: 'Estado', render: (r) => (
            <div className="space-y-0.5">
                <EstadoPago estado={r.estado} />
                {r.motivo && <p className="text-[11px] text-slate-500 max-w-[200px]" title={r.motivo}>Motivo: {r.motivo}</p>}
            </div>
        ) },
        // Ticket PDF (como el de recepción) y, si pagó en línea con Yape/Plin, la captura que subió
        { header: 'Comprobante', render: (r) => (!r.tiene_ticket && !r.tiene_comprobante) ? <span className="text-xs text-slate-300">—</span> : (
            <div className="flex flex-wrap items-center gap-1.5">
                {r.tiene_ticket && <BotonTicket onClick={() => abrirTicket(r.id)} />}
                {r.tiene_comprobante && (
                    <button onClick={() => setViendo(r)} title="Ver la captura de tu Yape/Plin"
                        className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:text-secondary hover:bg-primary-light">
                        <PhotoIcon className="w-5 h-5" /> Captura
                    </button>
                )}
            </div>
        ) },
    ], [abrirTicket]);

    return (
        <div className="container mx-auto p-4 sm:p-6">
            <PageHeader title="Mis pagos" subtitle="Tus pagos de membresías, clases y compras" icon={ReceiptPercentIcon} />
            <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />
            {errorTicket && <AlertMessage type="error" message={errorTicket} />}

            {resumen && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <KpiTile destacado label="Total pagado" valor={soles(resumen.total_pagado)} icon={BanknotesIcon} />
                    <KpiTile label="Pagos realizados" valor={resumen.pagos} icon={ReceiptPercentIcon} />
                    <KpiTile label="En revisión" valor={resumen.en_revision} icon={ClockIcon} ayuda={resumen.en_revision ? 'Recepción los verificará pronto' : 'Nada pendiente'} />
                </div>
            )}

            <Table columns={columns} data={pagos} loading={loading}
                filterConfig={filterConfig} filters={filters}
                onFilterChange={(n, v) => setFilters(p => ({ ...p, [n]: v }))}
                onFilterSubmit={() => { filtersRef.current = filters; fetchPagos(1); }}
                onFilterClear={() => { setFilters(FILTROS_INICIALES); filtersRef.current = FILTROS_INICIALES; fetchPagos(1); }}
                pagination={{ clave: 'mispagos', ...pagination, onPageChange: fetchPagos }} />

            {viendo && <ComprobanteModal pago={viendo} onClose={() => setViendo(null)} />}
            <TicketModal />
        </div>
    );
};

export default Index;
