import { useState } from 'react';

const Login = ({ isOpen, onClose, onLoginSuccess }) =>
{

    const [isRegister, setIsRegister] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');

    const handleSubmit = async (e) =>
    {
        e.preventDefault();
        const endpoint = isRegister ? '/register' : '/login';
        const datosUsuario = {
            email: email,
            password: password,
            ...(isRegister && { username: username })
        };

        try
        {
            const response = await fetch(`http://localhost:8080/api/auth${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosUsuario)
            });

            const data = await response.text();

            if (response.ok && !data.includes("Error")) {
                alert(data);
                onLoginSuccess();
                onClose();
            } else {
                alert(data);
            }
        }
        catch (error)
        {
            console.error("Error de conexión:", error);
            alert("No se pudo conectar con el servidor (Spring Boot)");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            {/* Agregamos position relative aquí para que la X se ubique bien */}
            <div className="modal-content login-card" style={{ position: 'relative' }}>

                {/* BOTÓN DE CIERRE */}
                <button className="close-x" onClick={onClose}>&times;</button>

                <h2>SWAPO <span>{isRegister ? 'Registro' : 'Login'}</span></h2>

                <form onSubmit={handleSubmit} className="login-form">
                    {isRegister && (
                        <div className="form-group">
                            <label>Usuario</label>
                            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
                        </div>
                    )}
                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Contraseña</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <button type="submit" className="confirm-publish-btn">
                        {isRegister ? 'Crear Cuenta' : 'Entrar'}
                    </button>
                </form>

                <p className="switch-auth" onClick={() => setIsRegister(!isRegister)} style={{ cursor: 'pointer', marginTop: '20px' }}>
                    {isRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
                </p>
            </div>
        </div>
    );
};

export default Login;