import { useNavigate } from 'react-router-dom';

function PaymentPending() {
    const navigate = useNavigate();
    
    return (
        <div className="payment-result pending">
            <h1>⏳ Pago pendiente</h1>
            <p>Tu pago está siendo procesado.</p>
            <p>Recibirás una confirmación en breve.</p>
            <button onClick={() => navigate('/')}>Volver al inicio</button>
        </div>
    );
}

export default PaymentPending;