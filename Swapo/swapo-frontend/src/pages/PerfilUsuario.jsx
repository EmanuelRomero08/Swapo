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
    const [email, setEmail] = useState('');

    useEffect(() => {
        const usuario = localStorage.getItem("usuario");
        setUsuarioActual(usuario);
    }, []);

    useEffect(() => {
        const cargarPerfil = async () => {
            try {
                // 1. Obtener los datos del usuario (incluye email)
                const userResponse = await fetch(`http://localhost:8080/api/auth/usuario/${username}`);
                let userEmail = '';
                if (userResponse.ok) {
                    const userData = await userResponse.json();
                    userEmail = userData.email || 'No disponible';
                    setEmail(userEmail);
                } else {
                    setEmail('No disponible');
                }

                // 2. Cargar todos los productos
                const response = await fetch('http://localhost:8080/api/productos');
                const allProducts = await response.json();

                // 3. Filtrar productos del usuario
                const userProducts = allProducts.filter(p => p.vendedorNombre === username);
                setProductos(userProducts);

                // 4. Configurar perfil
                setPerfil({
                    nombre: username,
                    totalProductos: userProducts.length,
                    productosVendidos: userProducts.filter(p => p.tipo === 'Venta').length,
                    productosIntercambio: userProducts.filter(p => p.tipo === 'Intercambio').length
                });
            } catch (error) {
                console.error("Error:", error);
                setEmail('Error al cargar');
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
                    <p className="perfil-email"> {email}</p>
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