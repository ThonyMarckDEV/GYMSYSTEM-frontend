import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { index, usuarios as usuariosPin, store, revocar } from 'services/pinService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';
import { useAuth } from 'context/AuthContext';
import Table from 'components/Shared/Tables/Table';
import PageHeader from 'components/Shared/Headers/PageHeader';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import ConfirmModal from 'components/Shared/Modals/ConfirmModal';
import SucursalSelect from 'components/Shared/Comboboxes/SucursalSelect';
import { Modal, errorDeAlerta } from 'components/Pagos/PagoUI';
import { KeyIcon, ClipboardDocumentIcon, CheckIcon, NoSymbolIcon } from '@heroicons/react/24/outline';

const VIGENCIAS = [
    { value: 15, label: '15 minutos' }, { value: 60, label: '1 hora' }, { value: 240, label: '4 horas' },
    { value: 720, label: '12 horas (un turno)' }, { value: 1440, label: '24 horas' }, { value: 10080, label: '7 días' },
];

const ESTADO_PIN = {
    activo:   'bg-green-50 text-green-700 border-green-200',
    agotado:  'bg-slate-100 text-slate-600 border-slate-200',
    vencido:  'bg-slate-100 text-slate-600 border-slate-200',
    revocado: 'bg-red-50 text-red-700 border-red-200',
};

const inputCls = 'w-full p-2.5 text-sm text-secondary border border-slate-300 rounded-lg focus:ring-1 focus:ring-primary outline-none bg-white';
const labelCls = 'block text-xs font-bold text-slate-700 uppercase mb-1';

/** Modal para generar un PIN. Al crearlo muestra el PIN una sola vez. */
const GenerarPinModal = ({ onClose, onCreado }) => {
    const { sucursal } = useAuth();
    const [form, setForm] = useState({ sucursal_id: '', usuario_id: '', minutos_vigencia: 720, max_usos: 1, descripcion: '' });
    const [usuarios, setUsuarios] = useState([]);
    const [creado, setCreado] = useState(null);
    const [copiado, setCopiado] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [alert, setAlert] = useState(null);

    const sucursalElegida = sucursal?.id || form.sucursal_id;

    useEffect(() => {
        if (!sucursalElegida) { setUsuarios([]); return; }
        usuariosPin(sucursalElegida).then(r => setUsuarios(r.data || [])).catch(() => setUsuarios([]));
    }, [sucursalElegida]);

    const generar = async () => {
        setGuardando(true);
        setAlert(null);
        try {
            const res = await store({ ...form, sucursal_id: form.sucursal_id || null });
            setCreado(res.data);
            onCreado();
        } catch (err) {
            setAlert(handleApiError(err, 'No se pudo generar el PIN'));
        } finally {
            setGuardando(false);
        }
    };

    const copiar = async () => {
        try { await navigator.clipboard.writeText(creado.pin); setCopiado(true); } catch { /* sin portapapeles */ }
    };

    if (creado) {
        return (
            <Modal titulo="PIN generado" icon={KeyIcon} onClose={onClose}
                pie={<button onClick={onClose} className="px-4 py-2 bg-secondary text-primary rounded-lg font-bold uppercase text-sm">Listo</button>}>
                <p className="text-sm text-slate-600 text-center">Entrega este PIN a <b>{creado.usuario}</b> ({creado.sucursal}).</p>
                <div className="my-5 flex items-center justify-center gap-3">
                    <span className="text-5xl font-black tracking-[0.3em] tabular-nums text-secondary">{creado.pin}</span>
                    <button onClick={copiar} className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50" title="Copiar">
                        {copiado ? <CheckIcon className="w-5 h-5 text-green-700" /> : <ClipboardDocumentIcon className="w-5 h-5 text-slate-500" />}
                    </button>
                </div>
                <p className="text-xs text-center text-slate-500">Vence el {creado.expira_at} · {creado.max_usos} {creado.max_usos === 1 ? 'uso' : 'usos'}</p>
                <p className="mt-4 text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-center">
                    Por seguridad este PIN no se volverá a mostrar. Si se pierde, revócalo y genera otro.
                </p>
            </Modal>
        );
    }

    return (
        <Modal titulo="Generar PIN de autorización" icon={KeyIcon} onClose={onClose} error={errorDeAlerta(alert)}
            pie={<>
                <button onClick={onClose} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg font-bold uppercase text-sm">Cancelar</button>
                <button onClick={generar} disabled={guardando || !form.usuario_id || !sucursalElegida}
                    className="px-4 py-2 bg-secondary text-primary rounded-lg font-bold uppercase text-sm disabled:opacity-40">
                    {guardando ? 'Generando...' : 'Generar PIN'}
                </button>
            </>}>
            <p className="text-sm text-slate-500 mb-4">El PIN permite a un usuario anular pagos en una sucursal. Solo esa persona puede usarlo, hasta que venza o se acaben sus usos.</p>
            <div className="space-y-4">
                {!sucursal && (
                    <SucursalSelect label="Sucursal" required value={form.sucursal_id}
                        onChange={(v) => setForm(f => ({ ...f, sucursal_id: v, usuario_id: '' }))} />
                )}
                <div>
                    <label className={labelCls}>Usuario *</label>
                    <select value={form.usuario_id} onChange={(e) => setForm(f => ({ ...f, usuario_id: e.target.value }))} className={inputCls} disabled={!sucursalElegida}>
                        <option value="">{sucursalElegida ? '-- Seleccionar usuario --' : 'Primero elige la sucursal'}</option>
                        {usuarios.map(u => <option key={u.id} value={u.id}>{u.username} — {u.rol} (sede: {u.sucursal})</option>)}
                    </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelCls}>Vigencia *</label>
                        <select value={form.minutos_vigencia} onChange={(e) => setForm(f => ({ ...f, minutos_vigencia: Number(e.target.value) }))} className={inputCls}>
                            {VIGENCIAS.map(v => <option key={v.value} value={v.value}>{v.label}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className={labelCls}>Límite de usos *</label>
                        <input type="number" min="1" max="50" value={form.max_usos}
                            onChange={(e) => setForm(f => ({ ...f, max_usos: e.target.value }))} className={inputCls} />
                    </div>
                </div>
                <div>
                    <label className={labelCls}>Descripción</label>
                    <input value={form.descripcion} onChange={(e) => setForm(f => ({ ...f, descripcion: e.target.value }))}
                        className={inputCls} placeholder="Ej: Turno mañana / anulación del pago #123" maxLength={150} />
                </div>
            </div>
        </Modal>
    );
};

const Index = () => {
    const [loading, setLoading] = useState(true);
    const [pines, setPines] = useState([]);
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, total: 0 });
    const [alert, setAlert] = useState(null);
    const [generando, setGenerando] = useState(false);
    const [aRevocar, setARevocar] = useState(null);

    const fetchPines = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const res = await index(page);
            setPines(res.data || []);
            setPagination({ currentPage: res.current_page, totalPages: res.last_page, total: res.total });
        } catch (err) {
            setAlert(handleApiError(err, 'Error al cargar los PINs'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchPines(1); }, [fetchPines]);

    const confirmarRevocar = async () => {
        const id = aRevocar;
        setARevocar(null);
        try {
            await revocar(id);
            setAlert({ type: 'success', message: 'PIN revocado.' });
            fetchPines(pagination.currentPage);
        } catch (err) {
            setAlert(handleApiError(err, 'No se pudo revocar el PIN'));
        }
    };

    const columns = useMemo(() => [
        { header: 'PIN', render: (r) => (
            <div>
                <p className="font-black text-slate-800 text-sm tracking-widest">••••••</p>
                <p className="text-[11px] text-slate-400 max-w-[200px] truncate">{r.descripcion || `#${r.id}`}</p>
            </div>
        ) },
        { header: 'Para', render: (r) => (
            <div><p className="font-bold text-slate-700 text-sm">{r.usuario}</p><p className="text-xs text-slate-500">Sede {r.sucursal}</p></div>
        ) },
        { header: 'Usos', render: (r) => <span className="text-sm font-bold tabular-nums">{r.usos} / {r.max_usos}</span> },
        { header: 'Vence', render: (r) => <span className="text-xs text-slate-600 tabular-nums">{r.expira_at}</span> },
        { header: 'Generado por', render: (r) => <span className="text-xs text-slate-500">{r.creado_por}<br />{r.created_at.slice(0, 16)}</span> },
        { header: 'Estado', render: (r) => (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${ESTADO_PIN[r.estado]}`}>{r.estado}</span>
        ) },
        { header: 'Acciones', render: (r) => r.estado === 'activo' ? (
            <button onClick={() => setARevocar(r.id)} title="Revocar" className="p-2 text-slate-500 hover:text-red-700 hover:bg-red-50 rounded-lg">
                <NoSymbolIcon className="w-5 h-5" />
            </button>
        ) : null },
    ], []);

    return (
        <div className="container mx-auto p-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="flex-1"><PageHeader title="PINs de Autorización" subtitle="Para anular pagos en caja" icon={KeyIcon} /></div>
            </div>
            <div className="flex justify-end -mt-4 mb-6">
                <button onClick={() => setGenerando(true)} className="bg-primary text-secondary px-6 py-3 rounded-lg font-black uppercase shadow-lg hover:bg-primary-hover">
                    + Generar PIN
                </button>
            </div>

            <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />

            <Table columns={columns} data={pines} loading={loading} pagination={{ ...pagination, onPageChange: fetchPines }} />

            {generando && <GenerarPinModal onClose={() => setGenerando(false)} onCreado={() => fetchPines(1)} />}
            {aRevocar && (
                <ConfirmModal message="¿Revocar este PIN? Ya no podrá usarse para anular pagos."
                    confirmText="Sí, revocar" cancelText="Cancelar"
                    onConfirm={confirmarRevocar} onCancel={() => setARevocar(null)} />
            )}
        </div>
    );
};

export default Index;
