import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function PaymentSuccess() {
    const navigate = useNavigate();
    
    useEffect(() => {
        setTimeout(() => {
            navigate('/mis-compras'); // Redirige a la página de compras del usuario
        }, 5000);
    }, [navigate]);
    
    return (
        <div className="payment-result success">
            <h1>✅ ¡Pago exitoso!</h1>
            <p>Tu compra ha sido confirmada.</p>
            <p>Recibirás un correo con los detalles.</p>
            <button onClick={() => navigate('/')}>Volver al inicio</button>
        </div>
    );
}

export default PaymentSuccess;