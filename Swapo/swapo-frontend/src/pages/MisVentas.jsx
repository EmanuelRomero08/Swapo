import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function MisVentas() {
    const [ventas, setVentas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [procesando, setProcesando] = useState(false);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
    const [codigoRastreo, setCodigoRastreo] = useState('');
    const usuarioId = localStorage.getItem('usuarioId');

    useEffect(() => {
        if (usuarioId) {
            cargarVentas();
        } else {
            setCargando(false);
        }
    }, [usuarioId]);

    const cargarVentas = async () => {
        setCargando(true);
        try {
            const response = await fetch(`http://localhost:8080/api/payments/ventas/vendedor/${usuarioId}`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            const data = await response.json();
            setVentas(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error al cargar ventas:', error);
            setVentas([]);
        } finally {
            setCargando(false);
        }
    };

    const abrirModalEnvio = (venta) => {
        setVentaSeleccionada(venta);
        setCodigoRastreo(venta.codigoRastreo || '');
        setMostrarModal(true);
    };

    const cerrarModal = () => {
        setMostrarModal(false);
        setVentaSeleccionada(null);
        setCodigoRastreo('');
    };

    const marcarComoEnviado = async () => {
        if (!codigoRastreo.trim()) {
            alert("Por favor, ingresa el código de rastreo del envío");
            return;
        }
        setProcesando(true);
        try {
            const response = await fetch(`http://localhost:8080/api/payments/marcar-enviado/${ventaSeleccionada.id}`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ codigoRastreo: codigoRastreo })
            });
            const result = await response.text();
            alert(result);
            if (response.ok) {
                cerrarModal();
                cargarVentas();
            }
        } catch (error) {
            console.error('Error:', error);
            alert("Error al marcar como enviado.");
        } finally {
            setProcesando(false);
        }
    };

    const cancelarVenta = async (ventaId) => {
        if (!window.confirm("¿Estás seguro de que quieres cancelar esta venta?")) {
            return;
        }
        setProcesando(true);
        try {
            const response = await fetch(`http://localhost:8080/api/payments/cancelar-venta/${ventaId}`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const result = await response.text();
            alert(result);
            if (response.ok) {
                cargarVentas();
            }
        } catch (error) {
            console.error('Error:', error);
            alert("Error al cancelar la venta.");
        } finally {
            setProcesando(false);
        }
    };

    const getEstadoTexto = (estado) => {
        switch (estado) {
            case 'PENDIENTE_ENVIO': return '⏳ Pendiente de envío';
            case 'ENVIADO': return '📦 Enviado - Esperando confirmación';
            case 'COMPLETADO': return '✅ Venta completada - Pago recibido';
            case 'CANCELADO': return '❌ Cancelado';
            default: return estado;
        }
    };

    if (cargando) return <div className="loading">Cargando...</div>;

    if (!usuarioId) {
        return <div className="mis-ventas-container"><p>Debes iniciar sesión para ver tus ventas.</p><Link to="/">Volver al inicio</Link></div>;
    }

    return (
        <div className="mis-ventas-container">
            <h1>🏷️ Mis ventas</h1>
            {ventas.length === 0 ? (
                <p>Aún no has vendido ningún producto.</p>
            ) : (
                <div className="ventas-grid">
                    {ventas.map(venta => (
                        <div key={venta.id} className="venta-card">
                            <div className="venta-info">
                                <p>ID Venta: {venta.id}</p>
                                <p>Producto ID: {venta.productoId}</p>
                                <p>Monto: ${venta.monto?.toLocaleString()}</p>
                                <p>Fecha: {new Date(venta.fecha).toLocaleDateString()}</p>
                                <p>Estado: {getEstadoTexto(venta.estado)}</p>
                                {venta.codigoRastreo && (
                                    <p>Código de rastreo: {venta.codigoRastreo}</p>
                                )}
                            </div>
                            <div className="venta-acciones">
                                {venta.estado === 'PENDIENTE_ENVIO' && (
                                    <>
                                        <button onClick={() => abrirModalEnvio(venta)} disabled={procesando}>
                                            📦 Marcar como enviado
                                        </button>
                                        <button onClick={() => cancelarVenta(venta.id)} disabled={procesando}>
                                            ❌ Cancelar venta
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {mostrarModal && (
                <div className="modal-overlay" onClick={cerrarModal}>
                    <div className="modal-contenido" onClick={(e) => e.stopPropagation()}>
                        <h2>📦 Marcar como enviado</h2>
                        <p>Producto ID: {ventaSeleccionada?.productoId}</p>
                        <p>Monto: ${ventaSeleccionada?.monto?.toLocaleString()}</p>
                        <div className="modal-campo">
                            <label>Código de rastreo (número de guía):</label>
                            <input 
                                type="text" 
                                value={codigoRastreo}
                                onChange={(e) => setCodigoRastreo(e.target.value)}
                                placeholder="Ej: 1234567890"
                            />
                            <small>Ingresa el número de guía proporcionado por la empresa de envíos</small>
                        </div>
                        <div className="modal-botones">
                            <button onClick={cerrarModal} disabled={procesando}>
                                Cancelar
                            </button>
                            <button onClick={marcarComoEnviado} disabled={procesando}>
                                {procesando ? 'Procesando...' : 'Confirmar envío'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MisVentas;