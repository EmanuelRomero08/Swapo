import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Login from '../pages/Login'; // Asegúrate de que la ruta sea correcta

const Navbar = () =>
{
    const [busqueda, setBusqueda] = useState('');
    const [sugerencias, setSugerencias] = useState([]);
    const [isLoginOpen, setIsLoginOpen] = useState(false); // ESTADO PARA EL MODAL
    const navigate = useNavigate();

    const productosBase = [
        "iPhone 13", "iPhone 15 Pro", "Monitor Gamer 144hz",
        "Laptop Lenovo LOQ", "Teclado Mecánico RGB", "Mouse Razer Deathadder",
        "Samsung Galaxy S23", "PlayStation 5 Slim", "MacBook Air M2"
    ];

    useEffect(() =>
    {
        const valor = busqueda.trim().toLowerCase();
        if (valor.length > 0)
        {
            const filtradas = productosBase.filter(p =>
                p.toLowerCase().includes(valor)
            ).slice(0, 5);
            setSugerencias(filtradas);
        }
        else
        {
            setSugerencias([]);
        }
    }, [busqueda]);

    const alBuscar = (e) =>
    {
        e.preventDefault();
        if (busqueda.trim())
        {
            navigate(`/?search=${busqueda}`);
            setSugerencias([]);
        }
    };

    const seleccionarSugerencia = (s) =>
    {
        setBusqueda(s);
        navigate(`/?search=${s}`);
        setSugerencias([]);
    };

    return (
        <nav className="navbar">
            <div className="nav-top-row">
                <div className="logo" onClick={() => navigate('/')} style={{cursor: 'pointer'}}>
                    SWAPO<span>.ia</span>
                </div>

                <div className="search-container">
                    <form className="search-bar" onSubmit={alBuscar}>
                        <input
                            type="text"
                            placeholder="¿Qué buscas hoy?"
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            className="input-fix"
                            autoComplete="off"
                        />
                        <button type="submit" className="search-btn">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00d4ff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        </button>
                    </form>

                    {sugerencias.length > 0 && (
                        <ul className="suggestions-list">
                            {sugerencias.map((s, i) => (
                                <li key={i} onClick={() => seleccionarSugerencia(s)}>
                                    <div className="suggestion-icon">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                                    </div>
                                    <span className="suggestion-text">{s}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="nav-links">
                    <Link to="/comparar">Comparar</Link>
                    <Link to="/publicar">Publicar</Link>
                    {/* CAMBIO AQUÍ: Ahora es un span/div que abre el modal al hacer clic */}
                    <span
                        className="login-btn"
                        onClick={() => setIsLoginOpen(true)}
                        style={{cursor: 'pointer'}}
                    >
                        Entrar
                    </span>
                </div>
            </div>

            {/* EL MODAL DE LOGIN (Se mantiene oculto hasta que isLoginOpen sea true) */}
            <Login
                isOpen={isLoginOpen}
                onClose={() => setIsLoginOpen(false)}
                onLoginSuccess={() => setIsLoginOpen(false)}
            />
        </nav>
    );
};

export default Navbar;