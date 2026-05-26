import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Login from '../pages/Login';

const Navbar = () => {
    const [busqueda, setBusqueda] = useState('');
    const [sugerencias, setSugerencias] = useState([]);
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [usuarioLogueado, setUsuarioLogueado] = useState(null);
    const [productosReales, setProductosReales] = useState([]);
    const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
    const navigate = useNavigate();
    const searchRef = useRef(null);

    // Cargar productos reales
    useEffect(() => {
        const cargarProductos = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/productos');
                const data = await response.json();
                setProductosReales(data);
            } catch (error) {
                console.error("Error:", error);
            }
        };
        cargarProductos();
    }, []);

    // Cerrar sugerencias al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setMostrarSugerencias(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const usuario = localStorage.getItem("usuario");
        if (usuario) {
            setUsuarioLogueado(usuario);
        }
    }, []);

    const handleLogout = () => {
        if (window.confirm("¿Estás seguro de que quieres cerrar sesión?")) {
            localStorage.removeItem("usuario");
            localStorage.removeItem("usuarioEmail");
            setUsuarioLogueado(null);
            navigate('/');
        }
    };

    // Filtrar sugerencias
    useEffect(() => {
        const valor = busqueda.trim().toLowerCase();
        if (valor.length > 1 && productosReales.length > 0) {
            const filtradas = productosReales
                .filter(p => p.nombre && p.nombre.toLowerCase().includes(valor))
                .slice(0, 5)
                .map(p => p.nombre);
            setSugerencias(filtradas);
            setMostrarSugerencias(filtradas.length > 0);
        } else {
            setSugerencias([]);
            setMostrarSugerencias(false);
        }
    }, [busqueda, productosReales]);

    const alBuscar = (e) => {
        e.preventDefault();
        if (busqueda.trim()) {
            setMostrarSugerencias(false);
            navigate(`/?search=${encodeURIComponent(busqueda)}`);
        }
    };

    const seleccionarSugerencia = (s) => {
        setBusqueda(s);
        setMostrarSugerencias(false);
        navigate(`/?search=${encodeURIComponent(s)}`);
    };

    return (
        <nav className="navbar">
            <div className="nav-top-row">
                <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                    SWAPO<span>.ia</span>
                </div>

                <div className="search-container" ref={searchRef}>
                    <form className="search-bar" onSubmit={alBuscar}>
                        <input
                            type="text"
                            placeholder="¿Qué buscas hoy?"
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            onFocus={() => sugerencias.length > 0 && setMostrarSugerencias(true)}
                            autoComplete="off"
                        />
                        <button type="submit" className="search-btn">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00d4ff" strokeWidth="3">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                        </button>
                    </form>

                    {mostrarSugerencias && sugerencias.length > 0 && (
                        <ul className="suggestions-list">
                            {sugerencias.map((s, i) => (
                                <li key={i} onClick={() => seleccionarSugerencia(s)}>
                                    {s}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="nav-links">
                    <Link to="/comparar">Comparar</Link>
                    <Link to="/publicar">Publicar</Link>
                    {usuarioLogueado ? (
                        <>
                            <Link to="/mis-trueques" className="trueques-link">Mis trueques</Link>
                            <Link to={`/perfil/${usuarioLogueado}`} style={{ color: '#00d4ff', fontWeight: 'bold', textDecoration: 'none' }}>
                                Hola, {usuarioLogueado}
                            </Link>
                            <button onClick={handleLogout} className="logout-btn-movil">
                                Salir
                            </button>
                        </>
                    ) : (
                        <span className="login-btn" onClick={() => setIsLoginOpen(true)}>
                            Entrar
                        </span>
                    )}
                </div>
            </div>

            <Login
                isOpen={isLoginOpen}
                onClose={() => setIsLoginOpen(false)}
                onLoginSuccess={() => {
                    const usuario = localStorage.getItem("usuario");
                    setUsuarioLogueado(usuario);
                    setIsLoginOpen(false);
                }}
            />
        </nav>
    );
};

export default Navbar;