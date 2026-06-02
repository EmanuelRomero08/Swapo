import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function MisCompras() {
    const [compras, setCompras] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [procesando, setProcesando] = useState(false);
    const usuarioId = localStorage.getItem('usuarioId');

    useEffect(() => {
        if (usuarioId) {
            cargarCompras();
        } else {
            setCargando(false);
        }
    }, [usuarioId]);

    const cargarCompras = async () => {
        setCargando(true);
        try {
            const response = await fetch(`http://localhost:8080/api/payments/ventas/comprador/${usuarioId}`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            const data = await response.json();
            setCompras(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error al cargar compras:', error);
            setCompras([]);
        } finally {
            setCargando(false);
        }
    };

    const confirmarRecepcion = async (ventaId) => {
        if (!window.confirm("¿Confirmas que has recibido el producto en buenas condiciones?")) return;
        setProcesando(true);
        try {
            const response = await fetch(`http://localhost:8080/api/payments/confirmar-recepcion/${ventaId}`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const result = await response.text();
            alert(result);
            if (response.ok) cargarCompras();
        } catch (error) {
            console.error('Error:', error);
            alert("Error al confirmar la recepción.");
        } finally {
            setProcesando(false);
        }
    };

    const cancelarCompra = async (ventaId) => {
        if (!window.confirm("¿Estás seguro de que quieres cancelar esta compra?")) return;
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
            if (response.ok) cargarCompras();
        } catch (error) {
            console.error('Error:', error);
            alert("Error al cancelar la compra.");
        } finally {
            setProcesando(false);
        }
    };

    const getEstadoTexto = (estado) => {
        switch (estado) {
            case 'PENDIENTE_ENVIO': return '⏳ Esperando envío';
            case 'ENVIADO': return '📦 Producto enviado';
            case 'COMPLETADO': return '✅ Compra completada';
            case 'CANCELADO': return '❌ Cancelado';
            default: return estado;
        }
    };

    if (cargando) return <div className="loading">Cargando...</div>;

    if (!usuarioId) {
        return <div className="mis-trueques-container"><p>Debes iniciar sesión para ver tus compras.</p><Link to="/">Volver al inicio</Link></div>;
    }

    return (
        <div className="mis-trueques-container">
            <h1>📦 Mis compras</h1>
            {compras.length === 0 ? (
                <p>No has comprado ningún producto aún.</p>
            ) : (
                <div className="trueques-grid">
                    {compras.map(venta => (
                        <div key={venta.id} className="trueque-card">
                            <div className="trueque-info">
                                <p>ID Venta: {venta.id}</p>
                                <p>Producto ID: {venta.productoId}</p>
                                <p>Monto: ${venta.monto?.toLocaleString()}</p>
                                <p>Fecha: {new Date(venta.fecha).toLocaleDateString()}</p>
                                <p>Estado: {getEstadoTexto(venta.estado)}</p>
                                {venta.codigoRastreo && (
                                    <p>Código de rastreo: {venta.codigoRastreo}</p>
                                )}
                            </div>
                            <div className="trueque-acciones">
                                {venta.estado === 'ENVIADO' && (
                                    <button onClick={() => confirmarRecepcion(venta.id)} disabled={procesando}>
                                        ✅ Confirmar que recibí el producto
                                    </button>
                                )}
                                {venta.estado === 'PENDIENTE_ENVIO' && (
                                    <button onClick={() => cancelarCompra(venta.id)} disabled={procesando}>
                                        ❌ Cancelar compra
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default MisCompras;