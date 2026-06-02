import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const MisTrueques = () => {
    const [ofertas, setOfertas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [procesando, setProcesando] = useState(false);
    const usuarioNombre = localStorage.getItem('usuario');

    useEffect(() => {
        cargarOfertas();
    }, []);

    const cargarOfertas = async () => {
        setCargando(true);
        try {
            const response = await fetch('http://localhost:8080/api/trades');
            const data = await response.json();
            console.log("Datos recibidos:", data);
            console.log("Usuario logueado:", usuarioNombre);
            setOfertas(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error al cargar ofertas:', error);
            setOfertas([]);
        } finally {
            setCargando(false);
        }
    };

    const aceptarOferta = async (id) => {
        if (!window.confirm('¿Aceptar esta propuesta de trueque?')) return;
        setProcesando(true);
        try {
            const response = await fetch(`http://localhost:8080/api/trades/aceptar/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' }
            });
            if (response.ok) {
                alert('✅ Trueque aceptado');
                cargarOfertas();
            } else {
                alert('Error al aceptar');
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setProcesando(false);
        }
    };

    const rechazarOferta = async (id) => {
        if (!window.confirm('¿Rechazar esta propuesta de trueque?')) return;
        setProcesando(true);
        try {
            const response = await fetch(`http://localhost:8080/api/trades/rechazar/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' }
            });
            if (response.ok) {
                alert('❌ Trueque rechazado');
                cargarOfertas();
            } else {
                alert('Error al rechazar');
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setProcesando(false);
        }
    };

    // ========== FUNCIÓN DE PAGO CON LOGS ==========
    const iniciarPagoTrueque = async (offerId, monto) => {
        console.log("=== INICIANDO PAGO ===");
        console.log("offerId:", offerId);
        console.log("monto:", monto);
        
        const userId = localStorage.getItem('usuarioId');
        const token = localStorage.getItem('token');
        console.log("userId desde localStorage:", userId);
        console.log("token desde localStorage:", token);
        
        if (!userId) {
            alert("❌ No se encontró el ID de usuario. Inicia sesión nuevamente.");
            return;
        }
        
        if (!window.confirm(`💰 Pagar $${monto.toLocaleString()} COP? El dinero será retenido hasta que ambos confirmen la recepción.`)) return;
        
        setProcesando(true);
        try {
            const url = `http://localhost:8080/api/trades/${offerId}/initiate-payment?userId=${userId}`;
            console.log("URL completa:", url);
            
            const response = await fetch(url, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            
            console.log("Response status:", response.status);
            console.log("Response ok?", response.ok);
            
            const data = await response.json();
            console.log("Response data:", data);
            
            if (response.ok && data.paymentUrl) {
                console.log("Redirigiendo a:", data.paymentUrl);
                window.location.href = data.paymentUrl;
            } else {
                alert("Error: " + (data.message || JSON.stringify(data)));
            }
        } catch (error) {
            console.error("Error detallado:", error);
            alert("Error al conectar con el servidor: " + error.message);
        } finally {
            setProcesando(false);
        }
    };
    // ==========================================

    // Filtrar trueques donde el usuario logueado es emisor o receptor
    const misTrueques = ofertas.filter(oferta => 
        oferta.emisorNombre === usuarioNombre || oferta.receptorNombre === usuarioNombre
    );

    if (cargando) return <div className="loading">Cargando trueques...</div>;

    return (
        <div className="mis-trueques-container">
            <h1>🔄 Mis Trueques</h1>

            {misTrueques.length === 0 ? (
                <div className="empty">
                    <p>No hay propuestas de trueque aún.</p>
                    <Link to="/" className="btn-volver">Explorar productos</Link>
                </div>
            ) : (
                <div className="trueques-grid">
                    {misTrueques.map(oferta => {
                        // ========== CONSOLE.LOG PARA DEBUG ==========
                        console.log("=== DEBUG OFERTA ===");
                        console.log("ID:", oferta.id);
                        console.log("Estado:", oferta.estado);
                        console.log("Diferencia dinero:", oferta.diferenciaDinero);
                        console.log("Tipo de diferencia:", typeof oferta.diferenciaDinero);
                        console.log("PaymentId:", oferta.paymentId);
                        console.log("Usuario logueado:", usuarioNombre);
                        console.log("emisorNombre:", oferta.emisorNombre);
                        console.log("receptorNombre:", oferta.receptorNombre);
                        console.log("ID:", oferta.id, "Estado BD:", oferta.estado, "EscrowStatus:", oferta.escrowStatus);
                        // ==========================================
                        
                        const esEmisor = oferta.emisorNombre === usuarioNombre;
                        const esReceptor = oferta.receptorNombre === usuarioNombre;
                        if (!esEmisor && !esReceptor) return null;
                        
                        const otraParte = esEmisor ? oferta.receptorNombre : oferta.emisorNombre;
                        const diferencia = Number(oferta.diferenciaDinero) || 0;
                        const montoPagar = Math.abs(diferencia);
                        const deboPagar = (diferencia > 0 && esReceptor) || (diferencia < 0 && esEmisor);
                        const escrowStatus = oferta.escrowStatus || 'PENDIENTE';
                        
                        const yaConfirmeEnvio = (esEmisor && oferta.senderConfirmedShipment) || (esReceptor && oferta.receiverConfirmedShipment);
                        const yaConfirmeRecibido = (esEmisor && oferta.senderConfirmedReceipt) || (esReceptor && oferta.receiverConfirmedReceipt);
                        
                        // Variable para mostrar el botón de pago
                        const mostrarBotonPago = oferta.estado === 'ACEPTADO' && diferencia !== 0 && deboPagar && oferta.escrowStatus !== 'RETENIDO';
                        console.log("mostrarBotonPago:", mostrarBotonPago);

                        return (
                            <div key={oferta.id} className="trueque-card">
                                <div className="trueque-productos">
                                    <div className="producto-ofrecido">
                                        <span className="label">Yo ofrezco</span>
                                        <strong>{esEmisor ? oferta.productoOfrecidoNombre : oferta.productoDeseadoNombre}</strong>
                                        <small>Valor: ${(esEmisor ? oferta.productoOfrecidoPrecio : oferta.productoDeseadoPrecio)?.toLocaleString()}</small>
                                    </div>
                                    <div className="trueque-flecha">↔️</div>
                                    <div className="producto-deseado">
                                        <span className="label">Recibo</span>
                                        <strong>{esEmisor ? oferta.productoDeseadoNombre : oferta.productoOfrecidoNombre}</strong>
                                        <small>Valor: ${(esEmisor ? oferta.productoDeseadoPrecio : oferta.productoOfrecidoPrecio)?.toLocaleString()}</small>
                                    </div>
                                </div>

                                <div className="trueque-info">
                                    <p>Con <strong>{otraParte}</strong></p>
                                    {diferencia !== 0 && (
                                        <p className="diferencia">
                                            {deboPagar 
                                                ? `💰 Debes pagar $${montoPagar.toLocaleString()} COP` 
                                                : `💰 Recibirás $${montoPagar.toLocaleString()} COP (retenido hasta confirmación)`}
                                        </p>
                                    )}
                                    <p>Estado: {oferta.estado}</p>
                                    {diferencia !== 0 && oferta.estado === 'ACEPTADO' && (
                                        <p className="escrow-status" style={{ color: escrowStatus === 'RETENIDO' ? '#3498db' : '#f39c12' }}>
                                            {escrowStatus === 'PENDIENTE' ? '⏳ Pago pendiente' : 
                                             escrowStatus === 'RETENIDO' ? '🔒 Pago retenido en custodia' : 
                                             escrowStatus === 'ENVIADO' ? '📦 Productos enviados' : 
                                             escrowStatus === 'COMPLETADO' ? '✅ Trueque completado' : '⚪ Sin iniciar'}
                                        </p>
                                    )}
                                </div>

                                <div className="trueque-acciones">
                                    {oferta.estado === 'PENDIENTE' && !esEmisor && (
                                        <>
                                            <button className="btn-aceptar" onClick={() => aceptarOferta(oferta.id)} disabled={procesando}>
                                                Aceptar trueque
                                            </button>
                                            <button className="btn-rechazar" onClick={() => rechazarOferta(oferta.id)} disabled={procesando}>
                                                Rechazar
                                            </button>
                                        </>
                                    )}
                                    
                                    {/* 🔥 BOTÓN DE PAGO - Para el deudor cuando el trueque está ACEPTADO */}
                                    {mostrarBotonPago && (
                                        <button 
                                            className="btn-pagar" 
                                            onClick={() => iniciarPagoTrueque(oferta.id, montoPagar)} 
                                            disabled={procesando}
                                            style={{ background: '#00d4ff', color: '#0f172a', padding: '10px 20px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
                                        >
                                            💳 Pagar diferencia (${montoPagar.toLocaleString()})
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <Link to="/publicar" className="btn-nuevo-trueque">+ Ofrecer nuevo trueque</Link>
        </div>
    );
};

export default MisTrueques;