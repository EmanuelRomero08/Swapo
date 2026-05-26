import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const OfertarTrueque = () => {
    const { id } = useParams(); // id del producto deseado
    const navigate = useNavigate();
    const [cargando, setCargando] = useState(true);
    const [productoDeseado, setProductoDeseado] = useState(null);
    const [misProductos, setMisProductos] = useState([]);
    const [productoOfrecidoId, setProductoOfrecidoId] = useState('');
    const [diferenciaDinero, setDiferenciaDinero] = useState(0);
    const [enviando, setEnviando] = useState(false);

    // Cargar producto deseado
    useEffect(() => {
        const cargarProductoDeseado = async () => {
            try {
                const response = await fetch(`http://localhost:8080/api/productos/${id}`);
                if (response.ok) {
                    const data = await response.json();
                    setProductoDeseado(data);
                }
            } catch (error) {
                console.error("Error:", error);
            }
        };
        cargarProductoDeseado();
    }, [id]);

    // Cargar mis productos
    useEffect(() => {
        const cargarMisProductos = async () => {
            try {
                const usuario = localStorage.getItem("usuario");
                const response = await fetch('http://localhost:8080/api/productos');
                const allProducts = await response.json();
                const misProductosFiltrados = allProducts.filter(p => p.vendedorNombre === usuario);
                setMisProductos(misProductosFiltrados);
            } catch (error) {
                console.error("Error:", error);
            } finally {
                setCargando(false);
            }
        };
        cargarMisProductos();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setEnviando(true);

        const productoOfrecido = misProductos.find(p => p.id === parseInt(productoOfrecidoId));
        const emisorNombre = localStorage.getItem("usuario");
        const receptorNombre = productoDeseado?.vendedorNombre;

        const ofertaData = {
            emisor: { username: emisorNombre },
            receptor: { username: receptorNombre },
            productoOfrecido: { id: parseInt(productoOfrecidoId), nombre: productoOfrecido?.nombre, precio: productoOfrecido?.precio },
            productoDeseado: { id: parseInt(id), nombre: productoDeseado?.nombre, precio: productoDeseado?.precio },
            diferenciaDinero: diferenciaDinero
        };

        try {
            const response = await fetch('http://localhost:8080/api/trades/proponer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(ofertaData)
            });

            if (response.ok) {
                const result = await response.json();
                alert(`Oferta enviada! ${result.analisisIA}`);
                navigate('/mis-trueques');
            } else {
                alert("Error al enviar la oferta");
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setEnviando(false);
        }
    };

    if (cargando) {
        return <div className="loading">Cargando...</div>;
    }

    return (
        <div className="ofertar-container">
            <h1>Ofrecer trueque</h1>

            <div className="producto-deseado">
                <h3>Quieres recibir:</h3>
                <div className="producto-card-resumen">
                    <strong>{productoDeseado?.nombre}</strong>
                    <span>${productoDeseado?.precio?.toLocaleString()}</span>
                    <small>Vendido por: {productoDeseado?.vendedorNombre}</small>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="ofertar-form">
                <div className="form-group">
                    <label>Tu producto a cambiar:</label>
                    <select
                        value={productoOfrecidoId}
                        onChange={(e) => setProductoOfrecidoId(e.target.value)}
                        required
                    >
                        <option value="">Selecciona un producto</option>
                        {misProductos.map(p => (
                            <option key={p.id} value={p.id}>
                                {p.nombre} - ${p.precio?.toLocaleString()}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Diferencia en dinero (si aplica):</label>
                    <input
                        type="number"
                        value={diferenciaDinero}
                        onChange={(e) => setDiferenciaDinero(Number(e.target.value))}
                        placeholder="0"
                    />
                    <small>Si tu producto vale menos, puedes agregar dinero</small>
                </div>

                <div className="form-actions">
                    <button type="button" className="btn-cancelar" onClick={() => navigate(-1)}>
                        Cancelar
                    </button>
                    <button type="submit" className="btn-enviar" disabled={enviando || !productoOfrecidoId}>
                        {enviando ? 'Enviando...' : 'Enviar oferta'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default OfertarTrueque;