import React, { useEffect, useState } from 'react';
import { CalendarDaysIcon, ClockIcon, MapPinIcon, UserIcon, PencilSquareIcon, NoSymbolIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { show, inscribir, desinscribir, asistencia, cancelar } from 'services/claseService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';
import { Modal, errorDeAlerta } from 'components/Pagos/PagoUI';
import { Cupos, EstadoClase, colorClase } from 'components/Clases/ClaseUI';
import { fechaLarga } from 'utilities/Fechas/fechas';

const btn = 'px-4 py-2 rounded-lg font-bold uppercase text-sm transition-colors disabled:opacity-50';

/**
 * Detalle de una clase.
 * - Cliente: inscribirse / cancelar su inscripción.
 * - Instructor / admin: lista de inscritos, tomar asistencia, editar o cancelar.
 */
const ClaseDetalleModal = ({ clase: inicial, esCliente, onClose, onCambio, onEditar }) => {
    const [clase, setClase] = useState(inicial);
    const [detalle, setDetalle] = useState(null);  // solo personal
    const [marcas, setMarcas] = useState({});      // inscripcion_id → asistio | falto
    const [trabajando, setTrabajando] = useState(false);
    const [alert, setAlert] = useState(null);
    const [cancelando, setCancelando] = useState(false);
    const [motivo, setMotivo] = useState('');

    useEffect(() => {
        if (esCliente) return;
        show(inicial.id)
            .then(r => {
                setDetalle(r.data);
                setClase(prev => ({ ...prev, ...r.data }));
                setMarcas(Object.fromEntries((r.data.lista || []).map(i => [i.inscripcion_id, i.asistencia])));
            })
            .catch(err => setAlert(handleApiError(err, 'No se pudo cargar la clase')));
    }, [inicial.id, esCliente]);

    const ejecutar = async (fn, errorMsg, cerrar = true) => {
        setTrabajando(true);
        setAlert(null);
        try {
            const res = await fn();
            onCambio?.(res?.message);
            if (cerrar) onClose();
            else setAlert({ type: 'success', message: res?.message || 'Guardado.' });
            return res;
        } catch (err) {
            setAlert(handleApiError(err, errorMsg));
        } finally {
            setTrabajando(false);
        }
    };

    const cancelada = clase.estado === 'cancelada';
    const lista = detalle?.lista || [];
    const presentes = Object.values(marcas).filter(v => v === 'asistio').length;

    // ---------------- Pie de acciones ----------------
    let pie = null;
    if (esCliente && !cancelada && !clase.ya_empezo) {
        pie = clase.inscrito ? (
            <button className={`${btn} bg-red-50 text-red-700 border border-red-200 hover:bg-red-100`} disabled={trabajando}
                onClick={() => ejecutar(() => desinscribir(clase.id), 'No se pudo cancelar tu inscripción')}>
                {trabajando ? 'Cancelando...' : 'Cancelar mi inscripción'}
            </button>
        ) : (
            <button className={`${btn} bg-primary text-secondary hover:bg-primary-hover`} disabled={trabajando || clase.disponibles === 0}
                onClick={() => ejecutar(() => inscribir(clase.id), 'No se pudo completar la inscripción')}>
                {clase.disponibles === 0 ? 'Clase llena' : trabajando ? 'Inscribiendo...' : 'Inscribirme'}
            </button>
        );
    } else if (!esCliente && detalle) {
        pie = (
            <>
                {detalle.puede_gestionar && !cancelada && !clase.ya_empezo && (
                    <>
                        <button className={`${btn} bg-red-50 text-red-700 border border-red-200 hover:bg-red-100`} onClick={() => setCancelando(true)} disabled={trabajando}>
                            <NoSymbolIcon className="w-4 h-4 inline -mt-0.5" /> Cancelar clase
                        </button>
                        <button className={`${btn} bg-slate-100 text-slate-700 hover:bg-slate-200`} onClick={() => onEditar(clase)} disabled={trabajando}>
                            <PencilSquareIcon className="w-4 h-4 inline -mt-0.5" /> Editar
                        </button>
                    </>
                )}
                {detalle.puede_asistencia && lista.length > 0 && (
                    <button className={`${btn} bg-secondary text-primary hover:bg-secondary/90`} disabled={trabajando}
                        onClick={() => ejecutar(() => asistencia(clase.id, lista.map(i => ({ inscripcion_id: i.inscripcion_id, asistencia: marcas[i.inscripcion_id] || null }))), 'No se pudo guardar la asistencia', false)}>
                        {trabajando ? 'Guardando...' : `Guardar asistencia (${presentes}/${lista.length})`}
                    </button>
                )}
            </>
        );
    }

    if (cancelando) {
        pie = (
            <>
                <button className={`${btn} bg-slate-100 text-slate-600 hover:bg-slate-200`} onClick={() => setCancelando(false)} disabled={trabajando}>Volver</button>
                <button className={`${btn} bg-red-600 text-white hover:bg-red-700`} disabled={trabajando}
                    onClick={() => ejecutar(() => cancelar(clase.id, motivo.trim()), 'No se pudo cancelar la clase')}>
                    {trabajando ? 'Cancelando...' : 'Confirmar cancelación'}
                </button>
            </>
        );
    }

    return (
        <Modal titulo={clase.nombre} icon={CalendarDaysIcon} onClose={onClose} ancho="max-w-2xl" error={errorDeAlerta(alert)} pie={pie}>
            {alert?.type === 'success' && <p className="mb-3 text-sm font-bold text-green-700">{alert.message}</p>}

            <div className="rounded-xl p-4 border border-slate-200" style={{ borderLeftWidth: 6, borderLeftColor: colorClase(clase.nombre) }}>
                <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 text-sm text-slate-700">
                        <p className="flex items-center gap-1.5 font-bold"><CalendarDaysIcon className="w-4 h-4 text-slate-400" /> {fechaLarga(clase.fecha)}</p>
                        <p className="flex items-center gap-1.5 tabular-nums"><ClockIcon className="w-4 h-4 text-slate-400" /> {clase.hora_inicio} – {clase.hora_fin}</p>
                        <p className="flex items-center gap-1.5"><UserIcon className="w-4 h-4 text-slate-400" /> {clase.instructor?.nombre}</p>
                        <p className="flex items-center gap-1.5"><MapPinIcon className="w-4 h-4 text-slate-400" /> {clase.sucursal?.nombre}{clase.lugar ? ` · ${clase.lugar}` : ''}</p>
                    </div>
                    <EstadoClase clase={clase} />
                </div>
                {clase.descripcion && <p className="mt-3 text-sm text-slate-500">{clase.descripcion}</p>}
                {cancelada && clase.motivo_cancelacion && <p className="mt-3 text-sm font-bold text-red-700">Motivo: {clase.motivo_cancelacion}</p>}
                {!cancelada && <div className="mt-3"><Cupos clase={clase} /></div>}
            </div>

            {esCliente && clase.mi_asistencia && (
                <p className={`mt-4 text-sm font-bold ${clase.mi_asistencia === 'asistio' ? 'text-green-700' : 'text-red-700'}`}>
                    {clase.mi_asistencia === 'asistio' ? '✔ Registraron tu asistencia a esta clase.' : '✖ Figuras como ausente en esta clase.'}
                </p>
            )}
            {esCliente && clase.reserva_liberada && !clase.inscrito && (
                <p className="mt-4 text-sm font-bold text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3">
                    Tenías esta clase reservada, pero se liberó tu cupo: {clase.reserva_liberada}
                </p>
            )}
            {esCliente && !cancelada && !clase.ya_empezo && !clase.inscrito && (
                <p className="mt-4 text-xs text-slate-500">Necesitas una membresía activa ese día. No puedes estar en dos clases a la misma hora.</p>
            )}

            {cancelando && (
                <div className="mt-4">
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Motivo (lo verán los inscritos)</label>
                    <input value={motivo} onChange={e => setMotivo(e.target.value)} maxLength={255} autoFocus
                        className="w-full p-2.5 text-sm border border-slate-300 rounded-lg focus:ring-1 focus:ring-primary outline-none"
                        placeholder="Ej: Instructor con descanso médico" />
                </div>
            )}

            {/* Lista de inscritos y asistencia (personal) */}
            {!esCliente && detalle && !cancelando && (
                <div className="mt-5">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                        Inscritos ({lista.length}) {detalle.puede_asistencia ? '· Toma de asistencia' : ''}
                    </h4>
                    {lista.length === 0 ? (
                        <p className="text-sm text-slate-400 py-4 text-center">Aún no hay inscritos.</p>
                    ) : (
                        <ul className="divide-y divide-slate-100 border border-slate-100 rounded-lg">
                            {lista.map(i => {
                                const m = marcas[i.inscripcion_id];
                                return (
                                    <li key={i.inscripcion_id} className="flex items-center justify-between gap-3 px-3 py-2">
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-slate-800 truncate">{i.cliente}</p>
                                            <p className="text-[11px] text-slate-400">DNI {i.dni}</p>
                                        </div>
                                        {detalle.puede_asistencia ? (
                                            <div className="flex gap-1.5" role="radiogroup" aria-label={`Asistencia de ${i.cliente}`}>
                                                <button type="button" role="radio" aria-checked={m === 'asistio'}
                                                    onClick={() => setMarcas(p => ({ ...p, [i.inscripcion_id]: m === 'asistio' ? null : 'asistio' }))}
                                                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-bold border ${m === 'asistio' ? 'bg-green-600 text-white border-green-600' : 'bg-white text-slate-600 border-slate-300'}`}>
                                                    <CheckIcon className="w-3.5 h-3.5" /> Asistió
                                                </button>
                                                <button type="button" role="radio" aria-checked={m === 'falto'}
                                                    onClick={() => setMarcas(p => ({ ...p, [i.inscripcion_id]: m === 'falto' ? null : 'falto' }))}
                                                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-bold border ${m === 'falto' ? 'bg-red-600 text-white border-red-600' : 'bg-white text-slate-600 border-slate-300'}`}>
                                                    <XMarkIcon className="w-3.5 h-3.5" /> Faltó
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="text-xs font-bold text-slate-500">
                                                {i.asistencia === 'asistio' ? '✔ Asistió' : i.asistencia === 'falto' ? '✖ Faltó' : '—'}
                                            </span>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                    {!detalle.puede_asistencia && detalle.puede_gestionar && !cancelada && !clase.ya_empezo && (
                        <p className="mt-2 text-[11px] text-slate-400">La asistencia se toma desde 15 minutos antes de que empiece la clase.</p>
                    )}
                </div>
            )}
        </Modal>
    );
};

export default ClaseDetalleModal;
