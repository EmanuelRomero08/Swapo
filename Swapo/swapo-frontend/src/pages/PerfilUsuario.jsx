import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';

const PerfilUsuario = () => {
    const { username } = useParams();
    const navigate = useNavigate();
    const [perfil, setPerfil] = useState(null);
    const [productos, setProductos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [usuarioActual, setUsuarioActual] = useState(null);
    const [emailVendedor, setEmailVendedor] = useState('');

    useEffect(() => {
        const usuario = localStorage.getItem("usuario");
        setUsuarioActual(usuario);
    }, []);

    useEffect(() => {
        const cargarPerfil = async () => {
            try {
                // Cargar todos los productos
                const response = await fetch('http://localhost:8080/api/productos');
                const allProducts = await response.json();

                // Filtrar productos del usuario
                const userProducts = allProducts.filter(p => p.vendedorNombre === username);
                setProductos(userProducts);

                // Obtener el email del vendedor desde el primer producto
                if (userProducts.length > 0 && userProducts[0].vendedorEmail) {
                    setEmailVendedor(userProducts[0].vendedorEmail);
                } else {
                    // Si no hay productos, el email no está disponible
                    setEmailVendedor('No disponible');
                }

                setPerfil({
                    nombre: username,
                    totalProductos: userProducts.length,
                    productosVendidos: userProducts.filter(p => p.tipo === 'Venta').length,
                    productosIntercambio: userProducts.filter(p => p.tipo === 'Intercambio').length
                });
            } catch (error) {
                console.error("Error:", error);
            } finally {
                setCargando(false);
            }
        };

        if (username) {
            cargarPerfil();
        }
    }, [username]);

    const esMiPerfil = usuarioActual === username;

    if (cargando) {
        return (
            <div className="perfil-container" style={{ textAlign: 'center', padding: '50px' }}>
                <h2>Cargando perfil...</h2>
            </div>
        );
    }

    if (!perfil) {
        return (
            <div className="perfil-container" style={{ textAlign: 'center', padding: '50px' }}>
                <h2>Usuario no encontrado</h2>
                <button className="perfil-btn-back" onClick={() => navigate('/')}>Volver al inicio</button>
            </div>
        );
    }

    return (
        <div className="perfil-page">
            <button className="perfil-btn-back" onClick={() => navigate(-1)}>
                ← Volver
            </button>

            <div className="perfil-header">
                <div className="perfil-avatar">
                    <div className="avatar-icon">
                        {perfil.nombre.charAt(0).toUpperCase()}
                    </div>
                </div>
                <div className="perfil-info">
                    <h1>{perfil.nombre}</h1>
                    <p className="perfil-email">{emailVendedor}</p>
                    {esMiPerfil && (
                        <span className="perfil-badge">Este eres tú</span>
                    )}
                </div>
            </div>

            <div className="perfil-stats">
                <div className="stat-card">
                    <div className="stat-number">{perfil.totalProductos}</div>
                    <div className="stat-label">Publicaciones</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{perfil.productosVendidos}</div>
                    <div className="stat-label">En Venta</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{perfil.productosIntercambio}</div>
                    <div className="stat-label">Intercambios</div>
                </div>
            </div>

            <div className="perfil-productos">
                <h2>Publicaciones de {perfil.nombre}</h2>
                {productos.length > 0 ? (
                    <div className="product-grid">
                        {productos.map(p => (
                            <ProductCard key={p.id} producto={p} />
                        ))}
                    </div>
                ) : (
                    <div className="sw-no-results">
                        <h3>No hay publicaciones</h3>
                        <p>{perfil.nombre} aún no ha publicado productos.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PerfilUsuario;