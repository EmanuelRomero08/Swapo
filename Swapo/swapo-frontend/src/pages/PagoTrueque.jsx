import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const PagoTrueque = () => {
    const { offerId } = useParams();
    const navigate = useNavigate();
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const iniciarPago = async () => {
            try {
                const userId = localStorage.getItem('usuarioId');
                if (!userId) {
                    setError("Debes iniciar sesión para pagar");
                    setCargando(false);
                    return;
                }

                const response = await fetch(`http://localhost:8080/api/trades/${offerId}/initiate-payment?userId=${userId}`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                const data = await response.json();
                
                if (response.ok && data.paymentUrl) {
                    window.location.href = data.paymentUrl;
                } else {
                    setError(data.message || "Error al iniciar el pago");
                    setCargando(false);
                }
            } catch (error) {
                console.error('Error:', error);
                setError("Error de conexión con el servidor");
                setCargando(false);
            }
        };
        
        if (offerId) {
            iniciarPago();
        } else {
            setError("ID de trueque no válido");
            setCargando(false);
        }
    }, [offerId]);

    if (cargando) {
        return (
            <div className="pago-container">
                <h2>Redirigiendo a Mercado Pago...</h2>
                <div className="loading-spinner"></div>
                <p>Por favor espera, serás redirigido automáticamente.</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="pago-container error">
                <h2>❌ Error</h2>
                <p>{error}</p>
                <button onClick={() => navigate('/mis-trueques')} className="btn-volver">
                    Volver a mis trueques
                </button>
            </div>
        );
    }

    return null;
};

export default PagoTrueque;