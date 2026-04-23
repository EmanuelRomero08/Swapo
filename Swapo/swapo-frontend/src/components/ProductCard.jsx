const ProductCard = ({ producto }) =>
{
    return (
        <div className="product-card">
            <div className="product-image">
                <div className="img-placeholder">Imagen</div>
                <div className={`status-dot ${producto.tipo === 'Cambio' ? 'dot-swap' : 'dot-sale'}`}>
                    {producto.tipo}
                </div>
            </div>
            <div className="product-info">
                <span className="category-label">Tecnología</span>
                <h3>{producto.nombre}</h3>
                <p className="price">${producto.precio.toLocaleString()}</p>
                <p className="description">{producto.descripcion}</p>
                <button className="view-btn">Ver Detalles</button>
            </div>
        </div>
    );
};

export default ProductCard;