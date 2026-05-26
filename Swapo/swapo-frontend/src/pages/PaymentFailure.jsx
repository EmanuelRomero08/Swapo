import { useNavigate } from 'react-router-dom';

function PaymentFailure() {
    const navigate = useNavigate();
    
    return (
        <div className="payment-result failure">
            <h1>❌ Error en el pago</h1>
            <p>Hubo un problema al procesar tu pago.</p>
            <button onClick={() => navigate(-1)}>Intentar nuevamente</button>
        </div>
    );
}

export default PaymentFailure;