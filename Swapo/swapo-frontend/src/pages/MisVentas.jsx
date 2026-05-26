import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function MisVentas() {
    const [ventas, setVentas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const usuarioId = localStorage.getItem('usuarioId');

    useEffect(() => {
        const cargarVentas = async () => {
            try {
                const response = await fetch(`http://localhost:8080/api/productos/vendidos/${usuarioId}`);
                const data = await response.json();
                setVentas(data);
            } catch (error) {
                console.error('Error al cargar ventas:', error);
            } finally {
                setCargando(false);
            }
        };
        cargarVentas();
    }, [usuarioId]);

    if (cargando) return <div className="loading">Cargando...</div>;

    return (
        <div className="mis-ventas-container">
            <h1>🏷️ Productos vendidos</h1>
            {ventas.length === 0 ? (
                <p>Aún no has vendido ningún producto.</p>
            ) : (
                <div className="productos-grid">
                    {ventas.map(producto => (
                        <div key={producto.id} className="producto-card vendido">
                            <img src={producto.imagenPath || '/placeholder.png'} alt={producto.nombre} />
                            <h3>{producto.nombre}</h3>
                            <p className="precio">${producto.precio?.toLocaleString()}</p>
                            <span className="badge vendido">💰 Vendido</span>
                            <Link to={`/producto/${producto.id}`}>Ver detalles</Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default MisVentas;