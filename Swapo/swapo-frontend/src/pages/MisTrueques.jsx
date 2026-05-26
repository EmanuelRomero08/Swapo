import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const MisTrueques = () => {
    const [ofertasEnviadas, setOfertasEnviadas] = useState([]);
    const [ofertasRecibidas, setOfertasRecibidas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const navigate = useNavigate();
    const usuario = localStorage.getItem("usuario");

    useEffect(() => {
        const cargarTrueques = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/trades');
                const allOffers = await response.json();

                setOfertasEnviadas(allOffers.filter(o => o.emisorNombre === usuario));
                setOfertasRecibidas(allOffers.filter(o => o.receptorNombre === usuario));
            } catch (error) {
                console.error("Error:", error);
            } finally {
                setCargando(false);
            }
        };
        cargarTrueques();
    }, [usuario]);

    const eliminarOferta = async (id) => {
        try {
            await fetch(`http://localhost:8080/api/trades/eliminar/${id}`, {
                method: 'DELETE'
            });
        } catch (error) {
            console.error("Error al eliminar:", error);
        }
    };

    const aceptarOferta = async (id) => {
        if (window.confirm("¿Aceptar este trueque?")) {
            try {
                const response = await fetch(`http://localhost:8080/api/trades/aceptar/${id}`, {
                    method: 'PUT'
                });
                if (response.ok) {
                    alert("✅ Trueque aceptado");
                    await eliminarOferta(id);
                    window.location.reload();
                }
            } catch (error) {
                console.error("Error:", error);
            }
        }
    };

    const rechazarOferta = async (id) => {
        if (window.confirm("¿Rechazar este trueque?")) {
            try {
                const response = await fetch(`http://localhost:8080/api/trades/rechazar/${id}`, {
                    method: 'PUT'
                });
                if (response.ok) {
                    alert("❌ Trueque rechazado");
                    await eliminarOferta(id);
                    window.location.reload();
                }
            } catch (error) {
                console.error("Error:", error);
            }
        }
    };

    if (cargando) {
        return <div className="loading">Cargando...</div>;
    }

    return (
        <div className="trueques-container">
            <h1>Mis Trueques</h1>

            {/* OFERTAS ENVIADAS */}
            <div className="trueques-section">
                <h2>📤 Ofertas enviadas</h2>
                {ofertasEnviadas.length === 0 ? (
                    <p className="empty">No has enviado ofertas</p>
                ) : (
                    <div className="trueques-grid">
                        {ofertasEnviadas.map(o => (
                            <div key={o.id} className="trueque-card">
                                <div className="trueque-productos">
                                    <div className="producto-ofrecido">
                                        <span className="label">Ofreces:</span>
                                        <strong>{o.productoOfrecidoNombre}</strong>
                                        <span>${o.productoOfrecidoPrecio?.toLocaleString()}</span>
                                    </div>
                                    <div className="trueque-flecha">→</div>
                                    <div className="producto-deseado">
                                        <span className="label">Recibes:</span>
                                        <strong>{o.productoDeseadoNombre}</strong>
                                        <span>${o.productoDeseadoPrecio?.toLocaleString()}</span>
                                    </div>
                                </div>
                                <div className="trueque-estado">
                                    <span className={`estado-badge ${o.estado.toLowerCase()}`}>
                                        {o.estado === 'ACEPTADO' ? '✅ ACEPTADO' : o.estado === 'RECHAZADO' ? '❌ RECHAZADO' : '⏳ PENDIENTE'}
                                    </span>
                                </div>
                                <div className="trueque-ia">
                                    🤖 {o.analisisIA}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* OFERTAS RECIBIDAS */}
            <div className="trueques-section">
                <h2>📥 Ofertas recibidas</h2>
                {ofertasRecibidas.length === 0 ? (
                    <p className="empty">No has recibido ofertas</p>
                ) : (
                    <div className="trueques-grid">
                        {ofertasRecibidas.map(o => (
                            <div key={o.id} className="trueque-card recibido">
                                <div className="trueque-productos">
                                    <div className="producto-ofrecido">
                                        <span className="label">{o.emisorNombre} ofrece:</span>
                                        <strong>{o.productoOfrecidoNombre}</strong>
                                        <span>${o.productoOfrecidoPrecio?.toLocaleString()}</span>
                                    </div>
                                    <div className="trueque-flecha">→</div>
                                    <div className="producto-deseado">
                                        <span className="label">Tú das:</span>
                                        <strong>{o.productoDeseadoNombre}</strong>
                                        <span>${o.productoDeseadoPrecio?.toLocaleString()}</span>
                                    </div>
                                </div>
                                <div className="trueque-ia">
                                    🤖 {o.analisisIA}
                                </div>
                                {o.estado === 'PENDIENTE' ? (
                                    <div className="trueque-acciones">
                                        <button className="btn-aceptar" onClick={() => aceptarOferta(o.id)}>
                                            ✅ Aceptar
                                        </button>
                                        <button className="btn-rechazar" onClick={() => rechazarOferta(o.id)}>
                                            ❌ Rechazar
                                        </button>
                                    </div>
                                ) : (
                                    <div className="trueque-estado-final">
                                        <span className={`estado-badge ${o.estado.toLowerCase()}`}>
                                            {o.estado === 'ACEPTADO' ? '✅ ACEPTADO' : '❌ RECHAZADO'}
                                        </span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <button className="btn-volver" onClick={() => navigate(-1)}>
                ← Volver
            </button>
        </div>
    );
};

export default MisTrueques;