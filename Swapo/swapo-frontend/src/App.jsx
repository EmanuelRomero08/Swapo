import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Comparador from './pages/Comparador';
import Publicar from './pages/Publicar';
import ProductoDetalle from './pages/ProductoDetalle';
import './App.css';

function App()
{
    return (
        <Router>
            <div className="App">
                <Navbar />
                <main className="container">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/comparar" element={<Comparador />} />
                        <Route path="/publicar" element={<Publicar />} />
                        {/* Ruta dinámica: el :id permite cargar cualquier producto */}
                        <Route path="/producto/:id" element={<ProductoDetalle />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;