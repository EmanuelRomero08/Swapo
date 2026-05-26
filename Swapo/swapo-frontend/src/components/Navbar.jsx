import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Login from '../pages/Login';

const Navbar = () => {
    const [busqueda, setBusqueda] = useState('');
    const [sugerencias, setSugerencias] = useState([]);
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [usuarioLogueado, setUsuarioLogueado] = useState(null);
    const [usuarioId, setUsuarioId] = useState(null);
    const [productosReales, setProductosReales] = useState([]);
    const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
    const [menuAbierto, setMenuAbierto] = useState(false);
    const navigate = useNavigate();
    const searchRef = useRef(null);
    const menuRef = useRef(null);

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

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setMostrarSugerencias(false);
            }
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuAbierto(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const usuario = localStorage.getItem("usuario");
        const userId = localStorage.getItem("usuarioId");
        if (usuario) {
            setUsuarioLogueado(usuario);
            setUsuarioId(userId);
        }
    }, []);

    const handleLogout = () => {
        if (window.confirm("¿Estás seguro de que quieres cerrar sesión?")) {
            localStorage.removeItem("usuario");
            localStorage.removeItem("usuarioEmail");
            localStorage.removeItem("usuarioId");
            localStorage.removeItem("token");
            setUsuarioLogueado(null);
            setUsuarioId(null);
            setMenuAbierto(false);
            navigate('/');
        }
    };

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
        <nav className="navbar-ml">
            <div className="navbar-ml-container">
                {/* Logo */}
                <div className="logo-ml" onClick={() => navigate('/')}>
                    SWAPO<span>.ia</span>
                </div>

                {/* Buscador */}
                <div className="search-ml-container" ref={searchRef}>
                    <form className="search-ml-form" onSubmit={alBuscar}>
                        <input
                            type="text"
                            placeholder="Buscar productos, marcas..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            onFocus={() => sugerencias.length > 0 && setMostrarSugerencias(true)}
                            autoComplete="off"
                        />
                        <button type="submit">🔍</button>
                    </form>
                    {mostrarSugerencias && sugerencias.length > 0 && (
                        <ul className="suggestions-ml">
                            {sugerencias.map((s, i) => (
                                <li key={i} onClick={() => seleccionarSugerencia(s)}>
                                    {s}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Links principales */}
                <div className="links-ml">
                    <Link to="/comparar" className="link-ml">Comparar</Link>
                    <Link to="/publicar" className="link-ml">Publicar</Link>
                </div>

                {/* Usuario / Menú */}
                {usuarioLogueado ? (
                    <div className="user-menu-ml" ref={menuRef}>
                        <button className="user-btn-ml" onClick={() => setMenuAbierto(!menuAbierto)}>
                            👤 {usuarioLogueado} <span className="arrow-ml">{menuAbierto ? '▲' : '▼'}</span>
                        </button>
                        {menuAbierto && (
                            <div className="dropdown-ml">
                                <Link to="/mis-compras" onClick={() => setMenuAbierto(false)}>📦 Mis compras</Link>
                                <Link to="/mis-ventas" onClick={() => setMenuAbierto(false)}>🏷️ Mis ventas</Link>
                                <Link to="/mis-trueques" onClick={() => setMenuAbierto(false)}>🔄 Mis trueques</Link>
                                <Link to={`/perfil/${usuarioLogueado}`} onClick={() => setMenuAbierto(false)}>👤 Mi perfil</Link>
                                <button onClick={handleLogout}>🚪 Cerrar sesión</button>
                            </div>
                        )}
                    </div>
                ) : (
                    <button className="login-ml-btn" onClick={() => setIsLoginOpen(true)}>
                        Entrar
                    </button>
                )}
            </div>

            <Login
                isOpen={isLoginOpen}
                onClose={() => setIsLoginOpen(false)}
                onLoginSuccess={() => {
                    const usuario = localStorage.getItem("usuario");
                    const userId = localStorage.getItem("usuarioId");
                    setUsuarioLogueado(usuario);
                    setUsuarioId(userId);
                    setIsLoginOpen(false);
                }}
            />
        </nav>
    );
};

export default Navbar;