import { useState, useEffect } from 'react';

const Comparador = () => {
    const [modo, setModo] = useState('catalogo');
    const [categoria, setCategoria] = useState('Todos');
    const [precioFiltro, setPrecioFiltro] = useState(0);
    const [productos, setProductos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [precioMax, setPrecioMax] = useState(0);

    const [slotA, setSlotA] = useState(null);
    const [slotB, setSlotB] = useState(null);
    const [buscandoPara, setBuscandoPara] = useState(null);
    const [filtroModal, setFiltroModal] = useState('');
    const [analisisIA, setAnalisisIA] = useState('');

    const categorias = ['Todos', 'Laptops', 'PC Escritorio', 'Componentes', 'Periféricos', 'Audio', 'Monitores', 'Almacenamiento'];

    useEffect(() => {
        fetch('http://localhost:8080/api/productos')
            .then(res => res.json())
            .then(data => {
                setProductos(data);
                if (data.length > 0) {
                    const max = Math.max(...data.map(p => p.precio));
                    setPrecioMax(max);
                    setPrecioFiltro(max);
                }
                setCargando(false);
            });
    }, []);

    const calcularScore = (p) => {
        let score = 50;
        if (p.cpu && (p.cpu.includes('Ryzen 7') || p.cpu.includes('i7'))) score += 15;
        if (p.cpu && (p.cpu.includes('Ryzen 9') || p.cpu.includes('i9'))) score += 20;
        if (p.gpu && p.gpu.includes('RTX 4060')) score += 15;
        if (p.gpu && p.gpu.includes('RTX 4070')) score += 20;
        if (p.gpu && p.gpu.includes('RTX 4080')) score += 25;
        if (p.ram && parseInt(p.ram) >= 16) score += 10;
        if (p.ram && parseInt(p.ram) >= 32) score += 15;
        if (p.ssd && parseInt(p.ssd) >= 512) score += 10;
        if (p.precio > 5000000) score -= 5;
        return Math.min(100, Math.max(0, score));
    };

    const productosFiltrados = productos
        .filter(p => p.precio <= precioFiltro && (categoria === 'Todos' || p.categoria === categoria))
        .map(p => ({ ...p, score: calcularScore(p), specs: `${p.cpu || 'N/A'} / ${p.gpu || 'N/A'} / ${p.ram || 'N/A'} RAM` }))
        .sort((a, b) => b.score - a.score);

    const seleccionarProducto = (p) => {
        console.log("Producto seleccionado:", p);
        console.log("Precio del producto:", p.precio);

        if (buscandoPara === 'A') {
            setSlotA(null);
            setTimeout(() => {
                setSlotA(p);
            }, 10);
        } else if (buscandoPara === 'B') {
            setSlotB(null);
            setTimeout(() => {
                setSlotB(p);
            }, 10);
        }
        setBuscandoPara(null);
        setFiltroModal('');
    };

    useEffect(() => {
        if (slotA && slotB) {
            setAnalisisIA("Analizando...");
            fetch('http://localhost:8080/api/ia/comparar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productoA: slotA.nombre,
                    precioA: slotA.precio,
                    specsA: `${slotA.cpu || 'No especificado'} / ${slotA.gpu || 'No especificado'} / ${slotA.ram || 'No especificado'} RAM`,
                    productoB: slotB.nombre,
                    precioB: slotB.precio,
                    specsB: `${slotB.cpu || 'No especificado'} / ${slotB.gpu || 'No especificado'} / ${slotB.ram || 'No especificado'} RAM`
                })
            })
                .then(res => res.text())
                .then(data => setAnalisisIA(data))
                .catch(() => setAnalisisIA("Error al conectar con IA"));
        }
    }, [slotA, slotB]);

    if (cargando) return <div className="content" style={{ textAlign: 'center', padding: '50px' }}>Cargando productos...</div>;

    return (
        <div className="content">
            <header className="home-header">
                <h1>SWAPO <span>Rankings</span></h1>
                <div className="filter-container">
                    <button className={`filter-pill ${modo === '1vs1' ? 'active' : ''}`} onClick={() => setModo('1vs1')}>Comparador 1:1</button>
                    <button className={`filter-pill ${modo === 'catalogo' ? 'active' : ''}`} onClick={() => setModo('catalogo')}>Explorar Top</button>
                </div>
            </header>

            {modo === 'catalogo' ? (
                <div>
                    <div className="category-selector">
                        {categorias.map(c => (
                            <button key={c} className={`cat-tab ${categoria === c ? 'active' : ''}`} onClick={() => setCategoria(c)}>{c}</button>
                        ))}
                    </div>

                    <div className="price-filter-bar">
                        <span>Mostrar productos hasta: </span>
                        <input
                            type="range"
                            min={0}
                            max={precioMax}
                            step={100000}
                            value={precioFiltro}
                            onChange={(e) => {
                                const nuevoValor = Number(e.target.value);
                                console.log("Slider a:", nuevoValor);
                                setPrecioFiltro(nuevoValor);
                                const label = document.getElementById('precio-mostrado');
                                if (label) label.innerText = `$${nuevoValor.toLocaleString()} COP`;
                            }}
                            style={{ width: '60%', margin: '0 15px' }}
                        />
                        <strong id="precio-mostrado" style={{ fontSize: '1.2rem', color: '#00d4ff' }}>
                            ${precioFiltro.toLocaleString()} COP
                        </strong>
                    </div>

                    <div className="top-table">
                        <div className="table-head">
                            <span>#</span>
                            <span>Producto</span>
                            <span>Especificaciones</span>
                            <span>Puntaje</span>
                            <span>Precio</span>
                        </div>
                        {productosFiltrados.map((p, idx) => (
                            <div key={p.id} className="table-row" onClick={() => window.location.href = `/producto/${p.id}`} style={{cursor: 'pointer'}}>
                                <div className="rank-col">#{idx + 1}</div>
                                <div className="name-col"><strong>{p.nombre}</strong><small>{p.categoria}</small></div>
                                <div className="spec-col">{p.specs}</div>
                                <div className="score-col">
                                    <span className="score-number">{p.score}</span>
                                    <div className="mini-bar"><div className="fill" style={{ width: `${p.score}%` }}></div></div>
                                </div>
                                <div className="price-col">${p.precio.toLocaleString()} COP</div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="mode-1vs1">
                    <div className="selection-area">
                        <div className={`product-slot ${slotA ? 'selected' : ''}`} onClick={() => !slotA && setBuscandoPara('A')}>
                            {slotA ? (
                                <div className="slot-content">
                                    <div className="slot-badge">PRODUCTO A</div>
                                    <h3>{slotA.nombre}</h3>
                                    <p className="slot-price">${slotA.precio?.toLocaleString()} COP</p>
                                    <button className="change-btn" onClick={(e) => { e.stopPropagation(); setBuscandoPara('A'); }}>Cambiar</button>
                                </div>
                            ) : (
                                <div className="empty-slot"><div className="add-btn">+</div><span>Seleccionar</span></div>
                            )}
                        </div>
                        <div className="vs-circle">VS</div>
                        <div className={`product-slot ${slotB ? 'selected' : ''}`} onClick={() => !slotB && setBuscandoPara('B')}>
                            {slotB ? (
                                <div className="slot-content">
                                    <div className="slot-badge">PRODUCTO B</div>
                                    <h3>{slotB.nombre}</h3>
                                    <p className="slot-price">${slotB.precio?.toLocaleString()} COP</p>
                                    <button className="change-btn" onClick={(e) => { e.stopPropagation(); setBuscandoPara('B'); }}>Cambiar</button>
                                </div>
                            ) : (
                                <div className="empty-slot"><div className="add-btn">+</div><span>Seleccionar</span></div>
                            )}
                        </div>
                    </div>
                    {slotA && slotB && (
                        <div className="ai-insight-section">
                            <div className="ai-insight-box">
                                <div className="ai-badge">SWAPO ANALYZER PRO</div>
                                <h4>Comparación</h4>
                                <div className="verdict-card">
                                    <strong>SWAPO IA</strong>
                                    <p style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: '1.5' }}>
                                        {analisisIA || "Selecciona dos productos para comparar"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {buscandoPara && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Seleccionar Producto</h3>
                        <input type="text" placeholder="Buscar..." value={filtroModal} onChange={(e) => setFiltroModal(e.target.value)} autoFocus />
                        <div className="modal-results">
                            {productos.filter(p => p.nombre.toLowerCase().includes(filtroModal.toLowerCase())).map(p => (
                                <div key={p.id} className="modal-product" onClick={() => seleccionarProducto(p)}>
                                    <strong>{p.nombre}</strong> - ${p.precio?.toLocaleString()} COP
                                </div>
                            ))}
                        </div>
                        <button className="close-modal-btn" onClick={() => setBuscandoPara(null)}>Cerrar</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Comparador;