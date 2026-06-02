import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Pago() {
    const location = useLocation();
    const navigate = useNavigate();
    const [producto, setProducto] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (location.state?.producto) {
            setProducto(location.state.producto);
        } else {
            navigate('/');
        }
    }, [location, navigate]);

    const handlePagar = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                'http://localhost:8080/api/payments/create-preference',
                {
                    productId: producto.id,
                    productTitle: producto.titulo,
                    productPrice: producto.precio,
                    buyerEmail: localStorage.getItem('email'),
                    userId: localStorage.getItem('usuarioId')
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            window.location.href = response.data.initPoint;
        } catch (error) {
            console.error('Error al crear preferencia:', error);
            alert('Error al iniciar el pago. Intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    if (!producto) {
        return <div className="loading">Cargando...</div>;
    }

    return (
        <div className="pago-container">
            <h1>Resumen de compra</h1>
            <div className="producto-resumen">
                <h2>{producto.titulo}</h2>
                <p className="precio">💰 ${producto.precio}</p>
                <p className="descripcion">{producto.descripcion}</p>
            </div>
            <button 
                className="btn-pagar" 
                onClick={handlePagar} 
                disabled={loading}
            >
                {loading ? 'Procesando...' : '💳 Pagar con Mercado Pago'}
            </button>
            <button className="btn-cancelar" onClick={() => navigate(-1)}>
                Cancelar
            </button>
        </div>
    );
}

export default Pago;