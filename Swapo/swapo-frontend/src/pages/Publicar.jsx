import { useState, useEffect } from 'react';

const Publicar = () => {
    const [producto, setProducto] = useState({
        nombre: '',
        precio: '',
        categoria: 'Laptops',
        descripcion: '',
        cpu: '',
        gpu: '',
        ram: '',
        ssd: '',
        tipo: 'Venta'
    });

    const [preview, setPreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [vendedorNombre, setVendedorNombre] = useState('');
    const [vendedorId, setVendedorId] = useState('');
    const [validacionImagen, setValidacionImagen] = useState('');
    const [validandoSeguridad, setValidandoSeguridad] = useState(false);

    useEffect(() => {
        const usuario = localStorage.getItem("usuario");
        const userId = localStorage.getItem("usuarioId");
        if (usuario) {
            setVendedorNombre(usuario);
            setVendedorId(userId);
        }
    }, []);

    const handleChange = (e) => {
        setProducto({ ...producto, [e.target.name]: e.target.value });
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setPreview(URL.createObjectURL(file));
            setValidacionImagen("Validando imagen...");

            const formData = new FormData();
            formData.append('imagen', file);

            try {
                const response = await fetch('http://localhost:8080/api/ia/validar-imagen', {
                    method: 'POST',
                    body: formData
                });
                const resultado = await response.text();
                setValidacionImagen(resultado);
            } catch (error) {
                console.error("Error:", error);
                setValidacionImagen("⚠️ No se pudo validar la imagen");
            }
        }
    };

    const validarSeguridadProducto = async () => {
        setValidandoSeguridad(true);
        try {
            const response = await fetch('http://localhost:8080/api/ia/validar-producto-seguridad', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre: producto.nombre,
                    descripcion: producto.descripcion,
                    categoria: producto.categoria,
                    cpu: producto.cpu,
                    gpu: producto.gpu,
                    ram: producto.ram,
                    ssd: producto.ssd,
                    precio: producto.precio,
                    vendedorNombre: vendedorNombre,
                    imagenPath: preview || ''
                })
            });
            const resultado = await response.text();

            if (resultado.includes("🔴 PELIGRO")) {
                alert(`🚨 SWAPO IA detectó un posible problema:\n${resultado}\n\n¿Aún quieres publicar?`);
                return confirm("Publicar de todas formas?");
            } else if (resultado.includes("🟡 SOSPECHOSO")) {
                alert(`⚠️ SWAPO IA tiene dudas:\n${resultado}\n\n¿Aún quieres publicar?`);
                return confirm("Publicar de todas formas?");
            } else {
                alert(`✅ SWAPO IA validó tu producto:\n${resultado}`);
                return true;
            }
        } catch (error) {
            console.error("Error:", error);
            return true;
        } finally {
            setValidandoSeguridad(false);
        }
    };

    const handlePublish = async (e) => {
        e.preventDefault();

        if (!vendedorNombre) {
            alert("Debes iniciar sesión para publicar un producto");
            return;
        }

        if (!imageFile) {
            alert("Por favor, selecciona una imagen del producto.");
            return;
        }

        if (validacionImagen && validacionImagen.includes("❌")) {
            alert("La imagen no es válida: " + validacionImagen);
            return;
        }

        const seguridadExitosa = await validarSeguridadProducto();
        if (!seguridadExitosa) return;

        const formData = new FormData();
        formData.append('imagen', imageFile);
        formData.append('nombre', producto.nombre);
        formData.append('precio', producto.precio);
        formData.append('descripcion', producto.descripcion);
        formData.append('categoria', producto.categoria);
        formData.append('cpu', producto.cpu);
        formData.append('gpu', producto.gpu);
        formData.append('ram', producto.ram);
        formData.append('ssd', producto.ssd);
        formData.append('tipo', producto.tipo);
        formData.append('vendedorNombre', vendedorNombre);
        formData.append('vendedorEmail', localStorage.getItem("usuarioEmail") || '');
        formData.append('usuarioId', vendedorId);  // ← AGREGAR ESTO

        try {
            const response = await fetch('http://localhost:8080/api/productos/publicar', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const productoId = await response.text();
                alert("¡Producto publicado con éxito!");
                window.location.href = `/producto/${productoId}`;
            } else {
                const error = await response.text();
                alert("Error: " + error);
            }
        } catch (error) {
            console.error("Error:", error);
            alert("No se pudo conectar con el backend.");
        }
    };

    return (
        <div className="sw-publicar-page">
            <div className="sw-publicar-header">
                <h1>Publicar <span>Producto</span></h1>
                {vendedorNombre && (
                    <p style={{ color: '#00d4ff', marginTop: '10px' }}>
                        Publicando como: {vendedorNombre}
                    </p>
                )}
            </div>

            <form className="sw-publicar-form" onSubmit={handlePublish}>
                <div className="sw-form-grid">
                    <div className="sw-form-section">
                        <h3>Información General</h3>

                        <div className="sw-input-group">
                            <label>Modo de Publicación</label>
                            <select name="tipo" className="sw-mode-selector" onChange={handleChange} value={producto.tipo}>
                                <option value="Venta">Poner en Venta</option>
                                <option value="Intercambio">Ofrecer para Intercambio (Swap)</option>
                            </select>
                        </div>

                        <div className="sw-input-group">
                            <label>Nombre del Producto</label>
                            <input name="nombre" placeholder="Ej: Laptop Lenovo LOQ" onChange={handleChange} required />
                        </div>

                        <div className="sw-input-row">
                            <div className="sw-input-group">
                                <label>Precio (COP)</label>
                                <input name="precio" type="number" onChange={handleChange} required />
                            </div>
                            <div className="sw-input-group">
                                <label>Categoría</label>
                                <select name="categoria" onChange={handleChange}>
                                    <option value="Laptops">Laptops</option>
                                    <option value="PC Escritorio">PC Escritorio</option>
                                    <option value="Componentes">Componentes</option>
                                    <option value="Periféricos">Periféricos</option>
                                    <option value="Audio">Audio</option>
                                    <option value="Monitores">Monitores</option>
                                    <option value="Almacenamiento">Almacenamiento</option>
                                </select>
                            </div>
                        </div>

                        <div className="sw-input-group">
                            <label>Descripción</label>
                            <textarea name="descripcion" rows="3" onChange={handleChange} required></textarea>
                        </div>
                    </div>

                    <div className="sw-form-section">
                        <h3>Especificaciones Técnicas</h3>
                        <div className="sw-input-row">
                            <div className="sw-input-group">
                                <label>CPU</label>
                                <input name="cpu" placeholder="Ej: Ryzen 5" onChange={handleChange} />
                            </div>
                            <div className="sw-input-group">
                                <label>GPU</label>
                                <input name="gpu" placeholder="Ej: RTX 4050" onChange={handleChange} />
                            </div>
                        </div>
                        <div className="sw-input-row">
                            <div className="sw-input-group">
                                <label>RAM</label>
                                <input name="ram" placeholder="Ej: 16GB" onChange={handleChange} />
                            </div>
                            <div className="sw-input-group">
                                <label>SSD</label>
                                <input name="ssd" placeholder="Ej: 512GB" onChange={handleChange} />
                            </div>
                        </div>

                        <div className="sw-upload-container">
                            <label className="sw-upload-label">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                />
                                <div className="sw-upload-box">
                                    {preview ? (
                                        <img src={preview} alt="Vista previa" className="sw-img-preview" />
                                    ) : (
                                        <>
                                            <div className="sw-upload-icon">📸</div>
                                            <p>Click para subir imagen</p>
                                        </>
                                    )}
                                </div>
                            </label>
                            {validacionImagen && (
                                <div className={`validacion-imagen ${validacionImagen.includes("❌") ? "error" : validacionImagen.includes("✅") ? "exito" : "info"}`}>
                                    {validacionImagen}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="sw-form-actions">
                    <button type="submit" className="sw-btn-publish" disabled={validandoSeguridad}>
                        {validandoSeguridad ? "VALIDANDO CON IA..." : "PUBLICAR EN SWAPO"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Publicar;