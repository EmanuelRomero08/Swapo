import { useState } from 'react';

const Comparador = () => {
    const [modo, setModo] = useState('catalogo');
    const [categoria, setCategoria] = useState('Todos');
    const [rangoPrecio, setRangoPrecio] = useState(6000000);

    const [slotA, setSlotA] = useState(null);
    const [slotB, setSlotB] = useState(null);
    const [buscandoPara, setBuscandoPara] = useState(null);
    const [filtroModal, setFiltroModal] = useState('');

    const categorias = ['Todos', 'Smartphone', 'Laptop', 'Tablet', 'Audifonos', 'Componentes'];

    const productosDisponibles = [
        { id: 1, nombre: "iPhone 15 Pro", precio: 5100000, score: 96, specs: "A17 Pro / 8GB", cat: "Smartphone", cpu: 10, gpu: 9, ram: 8 },
        { id: 2, nombre: "Lenovo LOQ 15", precio: 3200000, score: 88, specs: "RTX 4050 / i5", cat: "Laptop", cpu: 8, gpu: 8, ram: 10 },
        { id: 3, nombre: "iPad Air M2", precio: 2800000, score: 92, specs: "M2 Chip / 11\"", cat: "Tablet", cpu: 9, gpu: 8, ram: 8 },
        { id: 4, nombre: "Sony WH-1000XM5", precio: 1400000, score: 94, specs: "ANC / 30h Bat", cat: "Audifonos", cpu: 5, gpu: 4, ram: 2 },
        { id: 5, nombre: "Samsung S23 Ultra", precio: 3800000, score: 94, specs: "Snapdragon G2", cat: "Smartphone", cpu: 9, gpu: 9, ram: 9 },
        { id: 6, nombre: "MacBook Air M2", precio: 4500000, score: 91, specs: "M2 / 8GB RAM", cat: "Laptop", cpu: 9, gpu: 7, ram: 8 },
        { id: 10, nombre: "RTX 4060 Ti", precio: 2100000, score: 87, specs: "8GB GDDR6", cat: "Componentes", cpu: 2, gpu: 10, ram: 8 },
        { id: 11, nombre: "Asus ROG Zephyrus", precio: 5800000, score: 97, specs: "RTX 4070 / R9", cat: "Laptop", cpu: 10, gpu: 10, ram: 10 },
    ];

    const seleccionarProducto = (p) => {
        if (buscandoPara === 'A') setSlotA(p);
        else setSlotB(p);
        setBuscandoPara(null);
        setFiltroModal('');
    };

    const listaFiltrada = productosDisponibles
        .filter(p => p.precio <= rangoPrecio && (categoria === 'Todos' || p.cat === categoria))
        .sort((a, b) => b.score - a.score);

    // ESTILO PARA FORZAR EL CENTRADO TOTAL
    const estiloSlotVacio = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        gap: '12px',
        cursor: 'pointer'
    };

    return (
        <div className="page-fade-in content">
            <header className="home-header">
                <h1>SWAPO <span>Rankings</span></h1>
                <div className="filter-container">
                    <button className={`filter-pill ${modo === '1vs1' ? 'active' : ''}`} onClick={() => setModo('1vs1')}>Comparador 1:1</button>
                    <button className={`filter-pill ${modo === 'catalogo' ? 'active' : ''}`} onClick={() => setModo('catalogo')}>Explorar Top</button>
                </div>
            </header>

            {modo === 'catalogo' ? (
                <div className="ranking-container">
                    <div className="category-selector">
                        {categorias.map(c => (
                            <button key={c} className={`cat-tab ${categoria === c ? 'active' : ''}`} onClick={() => setCategoria(c)}>{c}</button>
                        ))}
                    </div>
                    <div className="price-filter-bar">
                        <span>Presupuesto hasta: <strong>${Number(rangoPrecio).toLocaleString()}</strong></span>
                        <input type="range" min="500000" max="8000000" step="100000" value={rangoPrecio} onChange={(e) => setRangoPrecio(e.target.value)} />
                    </div>
                    <div className="top-table">
                        <div className="table-head">
                            <span>Pos.</span><span>Producto</span><span className="hide-mobile">Specs</span><span>Puntaje</span><span>Precio</span>
                        </div>
                        {listaFiltrada.map((p, index) => (
                            <div key={p.id} className="table-row">
                                <div className="rank-col">#{index + 1}</div>
                                <div className="name-col"><strong>{p.nombre}</strong><small>{p.cat}</small></div>
                                <div className="spec-col hide-mobile">{p.specs}</div>
                                <div className="score-col">
                                    <div className="score-number">{p.score}</div>
                                    <div className="mini-bar"><div className="fill" style={{width: `${p.score}%`}}></div></div>
                                </div>
                                <div className="price-col">${(p.precio / 1000000).toFixed(1)}M</div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="mode-1vs1 page-fade-in">
                    <div className="selection-area-wrapper">
                        <div className="selection-area">
                            {/* SLOT A */}
                            <div className={`product-slot ${slotA ? 'selected' : ''}`} onClick={() => !slotA && setBuscandoPara('A')}>
                                {slotA ? (
                                    <div className="slot-content">
                                        <div className="slot-badge">PRODUCTO A</div>
                                        <h3 style={{color: 'white', margin: '10px 0'}}>{slotA.nombre}</h3>
                                        <button className="change-btn" onClick={(e) => { e.stopPropagation(); setBuscandoPara('A'); }}>Cambiar</button>
                                    </div>
                                ) : (
                                    <div style={estiloSlotVacio}>
                                        <div className="add-btn" style={{ margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</div>
                                        <span style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '1.1rem' }}>Seleccionar</span>
                                    </div>
                                )}
                            </div>

                            <div className="vs-circle">VS</div>

                            {/* SLOT B */}
                            <div className={`product-slot ${slotB ? 'selected' : ''}`} onClick={() => !slotB && setBuscandoPara('B')}>
                                {slotB ? (
                                    <div className="slot-content">
                                        <div className="slot-badge">PRODUCTO B</div>
                                        <h3 style={{color: 'white', margin: '10px 0'}}>{slotB.nombre}</h3>
                                        <button className="change-btn" onClick={(e) => { e.stopPropagation(); setBuscandoPara('B'); }}>Cambiar</button>
                                    </div>
                                ) : (
                                    <div style={estiloSlotVacio}>
                                        <div className="add-btn" style={{ margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</div>
                                        <span style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '1.1rem' }}>Seleccionar</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {slotA && slotB && (
                        <div className="ai-insight-section page-fade-in" style={{marginTop: '40px'}}>
                            <div className="ai-insight-box">
                                <div className="ai-header-wrapper" style={{textAlign: 'center', marginBottom: '20px'}}>
                                    <div className="ai-badge">SWAPO ANALYZER PRO</div>
                                    <h4>Análisis de Rendimiento Real</h4>
                                </div>
                                <div className="comparison-grid-ia">
                                    <div className="comp-item" style={{marginBottom: '20px'}}>
                                        <div className="comp-labels" style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
                                            <span>{slotA.cpu} pts</span><label>CPU</label><span>{slotB.cpu} pts</span>
                                        </div>
                                        <div className="dual-bar" style={{display: 'flex', height: '10px', background: '#0f172a', borderRadius: '5px', overflow: 'hidden'}}>
                                            <div style={{width: `${slotA.cpu * 10}%`, background: 'var(--primary)'}}></div>
                                            <div style={{width: `${slotB.cpu * 10}%`, background: '#64748b', marginLeft: 'auto'}}></div>
                                        </div>
                                    </div>
                                    <div className="comp-item">
                                        <div className="comp-labels" style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
                                            <span>{slotA.gpu} pts</span><label>GPU</label><span>{slotB.gpu} pts</span>
                                        </div>
                                        <div className="dual-bar" style={{display: 'flex', height: '10px', background: '#0f172a', borderRadius: '5px', overflow: 'hidden'}}>
                                            <div style={{width: `${slotA.gpu * 10}%`, background: 'var(--primary)'}}></div>
                                            <div style={{width: `${slotB.gpu * 10}%`, background: '#64748b', marginLeft: 'auto'}}></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="verdict-card" style={{marginTop: '30px', padding: '20px', background: 'rgba(0, 212, 255, 0.1)', borderRadius: '15px', borderLeft: '4px solid var(--primary)'}}>
                                    <strong>💡 Veredicto de la IA:</strong>
                                    <p style={{margin: '10px 0 0', color: '#94a3b8', fontSize: '0.9rem'}}>
                                        {slotA.score > slotB.score
                                            ? `El ${slotA.nombre} lidera en rendimiento general. Es la mejor opción para gaming y multitarea.`
                                            : `El ${slotB.nombre} ofrece un equilibrio superior. Ideal para longevidad y productividad.`}
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
                        <h3>Seleccionar Tecnología</h3>
                        <input
                            type="text" className="modal-search-input" placeholder="Buscar..."
                            value={filtroModal} onChange={(e) => setFiltroModal(e.target.value)} autoFocus
                        />
                        <div className="modal-results" style={{maxHeight: '300px', overflowY: 'auto'}}>
                            {productosDisponibles.filter(p => p.nombre.toLowerCase().includes(filtroModal.toLowerCase())).map(p => (
                                <div key={p.id} className="mini-card-search" onClick={() => seleccionarProducto(p)} style={{padding: '12px', borderBottom: '1px solid #334155', cursor: 'pointer'}}>
                                    <strong>{p.nombre}</strong> <small>({p.cat})</small>
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