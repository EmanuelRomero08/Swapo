import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Comparador from './pages/Comparador';
import Publicar from './pages/Publicar';
import ProductoDetalle from './pages/ProductoDetalle';
import EditarProducto from './pages/EditarProducto';
import PerfilUsuario from './pages/PerfilUsuario';
import OfertarTrueque from './pages/OfertarTrueque';
import MisTrueques from './pages/MisTrueques';
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
                        <Route path="/producto/:id" element={<ProductoDetalle />} />
                        <Route path="/ofrecer-trueque/:id" element={<OfertarTrueque />} />
                        <Route path="/mis-trueques" element={<MisTrueques />} />
                        <Route path="/editar/:id" element={<EditarProducto />} />
                        <Route path="/perfil/:username" element={<PerfilUsuario />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;