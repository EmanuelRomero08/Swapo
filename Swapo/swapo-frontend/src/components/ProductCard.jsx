import { useNavigate } from 'react-router-dom';

const ProductCard = ({ producto }) => {
    const navigate = useNavigate();

    const esIntercambio = producto.tipo?.toLowerCase() === 'intercambio';

    const estiloBadge = {
        background: esIntercambio
            ? 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)'
            : 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)',
        color: '#ffffff',
        padding: '5px 12px',
        borderRadius: '8px',
        fontSize: '0.7rem',
        fontWeight: '800',
        textTransform: 'uppercase',
        display: 'inline-block',
        boxShadow: esIntercambio ? '0 4px 10px rgba(0, 242, 254, 0.3)' : 'none'
    };

    return (
        <div className="product-card" onClick={() => navigate(`/producto/${producto.id}`)} style={{ cursor: 'pointer' }}>
            <div className="card-image-container" style={{ position: 'relative' }}>
                <img
                    src={producto.imagenPath ? `http://localhost:8080${producto.imagenPath}` : 'https://via.placeholder.com/150'}
                    alt={producto.nombre}
                    style={{ width: '100%', borderRadius: '12px' }}
                />

                <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
                    <span style={estiloBadge}>
                        {producto.tipo || 'Venta'}
                    </span>
                </div>
            </div>

            <div className="card-content" style={{ padding: '15px' }}>
                <h4 style={{ color: '#fff', margin: '10px 0 5px 0' }}>{producto.nombre}</h4>
                <p className="price" style={{ color: '#00f2fe', fontWeight: 'bold' }}>
                    ${producto.precio?.toLocaleString()}
                </p>
                <p style={{ color: '#a0a0a0', fontSize: '0.85rem' }}>{producto.categoria}</p>
            </div>
        </div>
    );
};

export default ProductCard;