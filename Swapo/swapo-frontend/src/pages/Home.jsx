import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ProductCard from '../components/ProductCard';

const Home = () =>
{
    const [filtro, setFiltro] = useState('Todos');
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const terminoBusqueda = queryParams.get('search')?.toLowerCase() || '';

    const productosPrueba = [
        { id: 1, nombre: "iPhone 13", precio: 2500000, tipo: "Venta", descripcion: "Perfecto estado, 128GB" },
        { id: 2, nombre: "Monitor Gamer 144hz", precio: 800000, tipo: "Cambio", descripcion: "Busco componentes de PC" },
        { id: 3, nombre: "Laptop Lenovo LOQ", precio: 3500000, tipo: "Venta", descripcion: "RTX 4050, 16GB RAM" },
        { id: 4, nombre: "Teclado Mecánico", precio: 200000, tipo: "Cambio", descripcion: "Cambio por mouse inalámbrico" },
    ];

    const productosFiltrados = productosPrueba.filter(prod =>
    {
        const coincideFiltro = filtro === 'Todos' ? true : prod.tipo === filtro;
        const coincideBusqueda = prod.nombre.toLowerCase().includes(terminoBusqueda) ||
            prod.descripcion.toLowerCase().includes(terminoBusqueda);
        return coincideFiltro && coincideBusqueda;
    });

    return (
        <div className="page-fade-in">
            <header className="home-header">
                {terminoBusqueda ? (
                    <h1>Resultados para: <span>"{terminoBusqueda}"</span></h1>
                ) : (
                    <h1>Mercado <span>SWAPO</span></h1>
                )}

                <div className="filter-container">
                    {['Todos', 'Venta', 'Cambio'].map((opcion) => (
                        <button
                            key={opcion}
                            className={`filter-pill ${filtro === opcion ? 'active' : ''}`}
                            onClick={() => setFiltro(opcion)}
                        >
                            {opcion}
                        </button>
                    ))}
                </div>
            </header>

            <div className="product-grid">
                {productosFiltrados.map(prod => (
                    <ProductCard key={prod.id} producto={prod} />
                ))}
            </div>
        </div>
    );
};

export default Home;