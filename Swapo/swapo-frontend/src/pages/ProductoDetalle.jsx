import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

const ProductoDetalle = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [producto, setProducto] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [usuarioLogueado, setUsuarioLogueado] = useState(null);
    const [esPropietario, setEsPropietario] = useState(false);
    const [imagenCargando, setImagenCargando] = useState(true);

    useEffect(() => {
        const usuario = localStorage.getItem("usuario");
        setUsuarioLogueado(usuario);
    }, []);

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const response = await fetch(`http://localhost:8080/api/productos/${id}`);
                if (response.ok) {
                    const data = await response.json();
                    setProducto(data);

                    const usuario = localStorage.getItem("usuario");
                    if (usuario && data.vendedorNombre === usuario) {
                        setEsPropietario(true);
                    }
                } else {
                    alert("Producto no encontrado");
                    navigate('/');
                }
            } catch (error) {
                console.error("Error:", error);
            } finally {
                setCargando(false);
            }
        };
        cargarDatos();
    }, [id, navigate]);

    const handleEliminar = async () => {
        if (window.confirm("¿Eliminar este producto?")) {
            try {
                const response = await fetch(`http://localhost:8080/api/productos/${id}`, {
                    method: 'DELETE',
                });
                if (response.ok) {
                    alert("Producto eliminado");
                    navigate('/');
                }
            } catch (error) {
                console.error("Error:", error);
            }
        }
    };

    const handleContactar = () => {
        alert(`Contactando a ${producto.vendedorNombre} sobre: ${producto.nombre}`);
    };

    if (cargando) {
        return (
            <div className="detalle-loading">
                <div className="loading-spinner"></div>
                <p>Cargando detalles...</p>
            </div>
        );
    }

    if (!producto) return null;

    return (
        <div className="detalle-container">
            {/* Botón volver */}
            <button className="detalle-back-btn" onClick={() => navigate(-1)}>
                ← Volver al mercado
            </button>

            <div className="detalle-grid">
                {/* Columna izquierda - Imagen */}
                <div className="detalle-imagen">
                    <div className="imagen-wrapper">
                        {imagenCargando && <div className="imagen-skeleton"></div>}
                        <img
                            src={producto.imagenPath ? `http://localhost:8080${producto.imagenPath}` : '/placeholder.png'}
                            alt={producto.nombre}
                            onLoad={() => setImagenCargando(false)}
                            style={{ display: imagenCargando ? 'none' : 'block' }}
                        />
                    </div>
                    <div className="detalle-badge">
                        {producto.tipo === 'Intercambio' ? '🔄 Intercambio' : '💰 En Venta'}
                    </div>
                </div>

                {/* Columna derecha - Información */}
                <div className="detalle-info">
                    <h1 className="detalle-titulo">{producto.nombre}</h1>

                    <div className="detalle-precio">
                        <span className="precio-label">Precio</span>
                        <span className="precio-valor">${producto.precio?.toLocaleString()}</span>
                    </div>

                    <div className="detalle-vendedor">
                        <div className="vendedor-avatar">
                            {producto.vendedorNombre?.charAt(0).toUpperCase()}
                        </div>
                        <div className="vendedor-info">
                            <span className="vendedor-label">Publicado por</span>
                            <Link to={`/perfil/${producto.vendedorNombre}`} className="vendedor-nombre">
                                {producto.vendedorNombre}
                            </Link>
                        </div>
                    </div>

                    <div className="detalle-seccion">
                        <h3>Especificaciones técnicas</h3>
                        <div className="specs-grid">
                            <div className="spec-item">
                                <span className="spec-icon"></span>
                                <div>
                                    <span className="spec-label">CPU</span>
                                    <span className="spec-value">{producto.cpu || 'No especificado'}</span>
                                </div>
                            </div>
                            <div className="spec-item">
                                <span className="spec-icon"></span>
                                <div>
                                    <span className="spec-label">GPU</span>
                                    <span className="spec-value">{producto.gpu || 'No especificado'}</span>
                                </div>
                            </div>
                            <div className="spec-item">
                                <span className="spec-icon"></span>
                                <div>
                                    <span className="spec-label">RAM</span>
                                    <span className="spec-value">{producto.ram || 'No especificado'}</span>
                                </div>
                            </div>
                            <div className="spec-item">
                                <span className="spec-icon"></span>
                                <div>
                                    <span className="spec-label">SSD</span>
                                    <span className="spec-value">{producto.ssd || 'No especificado'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="detalle-seccion">
                        <h3>Descripción</h3>
                        <p className="detalle-descripcion">{producto.descripcion || 'Sin descripción'}</p>
                    </div>

                    <div className="detalle-acciones">
                        {esPropietario ? (
                            <>
                                <button className="btn-editar" onClick={() => navigate(`/editar/${id}`)}>
                                    Editar producto
                                </button>
                                <button className="btn-eliminar" onClick={handleEliminar}>
                                    Eliminar
                                </button>
                            </>
                        ) : (
                            <>
                                <button className="btn-contactar" onClick={handleContactar}>
                                    Contactar vendedor
                                </button>
                                {usuarioLogueado && (
                                    <button className="btn-trueque" onClick={() => navigate(`/ofrecer-trueque/${id}`)}>
                                        Ofrecer trueque
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductoDetalle;