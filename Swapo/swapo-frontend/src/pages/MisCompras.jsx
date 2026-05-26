import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function MisCompras() {
    const [compras, setCompras] = useState([]);
    const [cargando, setCargando] = useState(true);
    const usuarioId = localStorage.getItem('usuarioId');

    useEffect(() => {
        const cargarCompras = async () => {
            try {
                const response = await fetch(`http://localhost:8080/api/productos/comprados/${usuarioId}`);
                const data = await response.json();
                setCompras(data);
            } catch (error) {
                console.error('Error al cargar compras:', error);
            } finally {
                setCargando(false);
            }
        };
        cargarCompras();
    }, [usuarioId]);

    if (cargando) return <div className="loading">Cargando...</div>;

    return (
        <div className="mis-compras-container">
            <h1>📦 Productos comprados</h1>
            {compras.length === 0 ? (
                <p>No has comprado ningún producto aún.</p>
            ) : (
                <div className="productos-grid">
                    {compras.map(producto => (
                        <div key={producto.id} className="producto-card comprado">
                            <img src={producto.imagenPath || '/placeholder.png'} alt={producto.nombre} />
                            <h3>{producto.nombre}</h3>
                            <p className="precio">${producto.precio?.toLocaleString()}</p>
                            <span className="badge comprado">✅ Comprado</span>
                            <Link to={`/producto/${producto.id}`}>Ver detalles</Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default MisCompras;