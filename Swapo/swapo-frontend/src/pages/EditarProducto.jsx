import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const EditarProducto = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [producto, setProducto] = useState({
        nombre: '',
        precio: '',
        categoria: '',
        descripcion: '',
        cpu: '',
        gpu: '',
        ram: '',
        ssd: '',
        tipo: ''
    });
    const [imagenActual, setImagenActual] = useState('');
    const [nuevaImagen, setNuevaImagen] = useState(null);
    const [preview, setPreview] = useState('');

    useEffect(() => {
        const cargarProducto = async () => {
            try {
                const response = await fetch(`http://localhost:8080/api/productos/${id}`);
                if (response.ok) {
                    const data = await response.json();
                    setProducto({
                        nombre: data.nombre || '',
                        precio: data.precio || '',
                        categoria: data.categoria || 'Laptops',
                        descripcion: data.descripcion || '',
                        cpu: data.cpu || '',
                        gpu: data.gpu || '',
                        ram: data.ram || '',
                        ssd: data.ssd || '',
                        tipo: data.tipo || 'Venta'
                    });
                    setImagenActual(data.imagenPath || '');
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
        cargarProducto();
    }, [id, navigate]);

    const handleChange = (e) => {
        setProducto({ ...producto, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNuevaImagen(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setGuardando(true);

        const formData = new FormData();
        formData.append('nombre', producto.nombre);
        formData.append('precio', producto.precio);
        formData.append('descripcion', producto.descripcion);
        formData.append('categoria', producto.categoria);
        formData.append('cpu', producto.cpu);
        formData.append('gpu', producto.gpu);
        formData.append('ram', producto.ram);
        formData.append('ssd', producto.ssd);
        formData.append('tipo', producto.tipo);

        if (nuevaImagen) {
            formData.append('imagen', nuevaImagen);
        }

        try {
            const response = await fetch(`http://localhost:8080/api/productos/editar/${id}`, {
                method: 'PUT',
                body: formData
            });

            if (response.ok) {
                alert("Producto actualizado con éxito");
                navigate(`/producto/${id}`);
            } else {
                alert("Error al actualizar");
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setGuardando(false);
        }
    };

    if (cargando) {
        return (
            <div className="editar-loading">
                <h2>Cargando producto...</h2>
            </div>
        );
    }

    return (
        <div className="editar-container">
            <h1>Editar Producto</h1>
            <form onSubmit={handleSubmit} className="editar-form">
                <div className="form-grid">
                    <div className="form-group">
                        <label>Nombre del Producto</label>
                        <input
                            type="text"
                            name="nombre"
                            value={producto.nombre}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Precio (COP)</label>
                        <input
                            type="number"
                            name="precio"
                            value={producto.precio}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Categoría</label>
                        <select name="categoria" value={producto.categoria} onChange={handleChange}>
                            <option value="Laptops">Laptops</option>
                            <option value="PC Escritorio">PC Escritorio</option>
                            <option value="Componentes">Componentes</option>
                            <option value="Periféricos">Periféricos</option>
                            <option value="Audio">Audio</option>
                            <option value="Monitores">Monitores</option>
                            <option value="Almacenamiento">Almacenamiento</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Tipo</label>
                        <select name="tipo" value={producto.tipo} onChange={handleChange}>
                            <option value="Venta">Venta</option>
                            <option value="Intercambio">Intercambio</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>CPU</label>
                        <input type="text" name="cpu" value={producto.cpu} onChange={handleChange} />
                    </div>

                    <div className="form-group">
                        <label>GPU</label>
                        <input type="text" name="gpu" value={producto.gpu} onChange={handleChange} />
                    </div>

                    <div className="form-group">
                        <label>RAM</label>
                        <input type="text" name="ram" value={producto.ram} onChange={handleChange} />
                    </div>

                    <div className="form-group">
                        <label>SSD</label>
                        <input type="text" name="ssd" value={producto.ssd} onChange={handleChange} />
                    </div>

                    <div className="form-group full-width">
                        <label>Descripción</label>
                        <textarea name="descripcion" rows="4" value={producto.descripcion} onChange={handleChange} />
                    </div>

                    <div className="form-group full-width">
                        <label>Imagen actual</label>
                        {imagenActual && (
                            <img src={`http://localhost:8080${imagenActual}`} alt="Actual" className="imagen-actual" />
                        )}
                    </div>

                    <div className="form-group full-width">
                        <label>Cambiar imagen (opcional)</label>
                        <input type="file" accept="image/*" onChange={handleFileChange} />
                        {preview && (
                            <img src={preview} alt="Preview" className="imagen-preview" />
                        )}
                    </div>
                </div>

                <div className="form-actions">
                    <button type="button" className="btn-cancelar" onClick={() => navigate(-1)}>
                        Cancelar
                    </button>
                    <button type="submit" className="btn-guardar" disabled={guardando}>
                        {guardando ? 'Guardando...' : 'Guardar cambios'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditarProducto;