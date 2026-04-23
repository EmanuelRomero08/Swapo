import { useParams, useNavigate } from 'react-router-dom';

const ProductoDetalle = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // Simulamos la data que vendría de tu backend en Java
    const producto = {
        id: id,
        nombre: "Lenovo LOQ 15IRH8",
        precio: 3200000,
        vendedor: "Emanuel R.",
        ubicacion: "Medellín, Antioquia",
        scoreIA: 88,
        estado: "Como nuevo",
        specs: {
            cpu: "Intel Core i5-13420H",
            gpu: "NVIDIA RTX 4050 6GB",
            ram: "16GB DDR5",
            ssd: "512GB NVMe",
            pantalla: "15.6\" FHD 144Hz"
        },
        analisisIA: "Este equipo destaca por su equilibrio térmico. La RTX 4050 de 95W permite gaming competitivo y desarrollo de software fluido. Precio sugerido basado en 3 meses de uso detectado.",
        verificado: true
    };

    return (
        <div className="page-fade-in content producto-detalle">
            <button className="back-btn" onClick={() => navigate(-1)}>← Volver</button>

            <div className="detalle-grid">
                {/* Galería de Fotos */}
                <div className="foto-panel">
                    <div className="foto-principal">
                        <div className="ia-overlay">AI VERIFIED SCAN</div>
                        <img src="https://via.placeholder.com/600x400" alt={producto.nombre} />
                    </div>
                    <div className="fotos-mini">
                        {[1, 2, 3].map(i => <img key={i} src="https://via.placeholder.com/100" alt="mini" />)}
                    </div>
                </div>

                {/* Info y Compra */}
                <div className="info-panel">
                    {producto.verificado && <span className="badge-verificado">✓ Verificado por SWAPO IA</span>}
                    <h1>{producto.nombre}</h1>
                    <p className="vendedor-info">Vendido por <strong>{producto.vendedor}</strong> • {producto.ubicacion}</p>

                    <div className="precio-box">
                        <span className="precio-actual">${producto.precio.toLocaleString()}</span>
                        <span className="estado-tag">{producto.estado}</span>
                    </div>

                    <div className="ia-score-card">
                        <div className="score-circle">
                            <svg viewBox="0 0 36 36" className="circular-chart">
                                <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                <path className="circle" strokeDasharray={`${producto.scoreIA}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            </svg>
                            <div className="percentage">{producto.scoreIA}</div>
                        </div>
                        <div className="score-text">
                            <strong>Puntaje de Rendimiento IA</strong>
                            <p>{producto.analisisIA}</p>
                        </div>
                    </div>

                    <div className="specs-tecnicas">
                        <h3>Especificaciones Técnicas</h3>
                        <ul>
                            {Object.entries(producto.specs).map(([key, val]) => (
                                <li key={key}><strong>{key.toUpperCase()}:</strong> {val}</li>
                            ))}
                        </ul>
                    </div>

                    <button className="buy-btn">Contactar Vendedor</button>
                </div>
            </div>
        </div>
    );
};

export default ProductoDetalle;