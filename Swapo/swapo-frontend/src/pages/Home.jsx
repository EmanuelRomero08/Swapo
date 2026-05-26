import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ProductCard from '../components/ProductCard';

const Home = () => {
    const [productos, setProductos] = useState([]);
    const [filtro, setFiltro] = useState('Todos');
    const [categoria, setCategoria] = useState('Todas');
    const [cargando, setCargando] = useState(true);
    const [busqueda, setBusqueda] = useState('');

    const location = useLocation();

    const categoriasDisponibles = ['Todas', 'Laptops', 'PC Escritorio', 'Componentes', 'Periféricos', 'Audio', 'Monitores', 'Almacenamiento'];

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const searchQuery = params.get('search');
        if (searchQuery) {
            setBusqueda(searchQuery);
        } else {
            setBusqueda('');
        }
    }, [location.search]);

    useEffect(() => {
        const cargarProductos = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/productos');
                const data = await response.json();
                // 🔥 CAMBIO 1: Filtrar productos VENDIDOS al cargar
                const disponibles = data.filter(p => p.estado !== 'VENDIDO');
                setProductos(disponibles);
            } catch (error) {
                console.error("Error al cargar productos:", error);
            } finally {
                setCargando(false);
            }
        };
        cargarProductos();
    }, []);

    const productosDisponibles = productos.filter(p => p.estado !== 'VENDIDO');

    const productosFiltrados = productosDisponibles.filter(p => {
        if (filtro !== 'Todos' && p.tipo?.toLowerCase() !== filtro.toLowerCase()) {
            return false;
        }
        if (categoria !== 'Todas' && p.categoria !== categoria) {
            return false;
        }
        // Filtro por búsqueda (nombre)
        if (busqueda && !p.nombre.toLowerCase().includes(busqueda.toLowerCase())) {
            return false;
        }
        return true;
    });

    if (cargando) {
        return (
            <div className="home-container" style={{ textAlign: 'center', padding: '50px' }}>
                <h2>Cargando productos...</h2>
            </div>
        );
    }

    return (
        <div className="home-container">
            <header className="home-header">
                <h1>Mercado <span>SWAPO</span></h1>

                {busqueda && (
                    <div style={{ marginBottom: '20px', color: '#00d4ff' }}>
                        Resultados para: <strong>"{busqueda}"</strong> ({productosFiltrados.length} productos)
                    </div>
                )}

                <div className="sw-filter-bar">
                    <button className={filtro === 'Todos' ? 'sw-btn-filter active' : 'sw-btn-filter'} onClick={() => setFiltro('Todos')}>Todos</button>
                    <button className={filtro === 'Venta' ? 'sw-btn-filter active' : 'sw-btn-filter'} onClick={() => setFiltro('Venta')}>En Venta</button>
                    <button className={filtro === 'Intercambio' ? 'sw-btn-filter active' : 'sw-btn-filter'} onClick={() => setFiltro('Intercambio')}>Intercambios</button>
                </div>

                <div className="category-selector">
                    {categoriasDisponibles.map(cat => (
                        <button
                            key={cat}
                            className={`cat-tab ${categoria === cat ? 'active' : ''}`}
                            onClick={() => setCategoria(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </header>

            <div className="product-grid">
                {productosFiltrados.length > 0 ? (
                    productosFiltrados.map(p => <ProductCard key={p.id} producto={p} />)
                ) : (
                    <div className="sw-no-results">
                        <h3>No hay productos disponibles</h3>
                        <p>No se encontraron artículos con los filtros seleccionados.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;