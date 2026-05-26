import { useState } from 'react';

const Login = ({ isOpen, onClose, onLoginSuccess }) => {
    const [isRegister, setIsRegister] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [identificador, setIdentificador] = useState('');
    const [cargando, setCargando] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setCargando(true);

        const endpoint = isRegister ? '/register' : '/login';

        let datosUsuario;

        if (isRegister) {
            datosUsuario = {
                email: email,
                password: password,
                username: username
            };
        } else {
            datosUsuario = {
                email: identificador,
                password: password
            };
        }

        try {
            const response = await fetch(`http://localhost:8080/api/auth${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosUsuario)
            });

            const data = await response.text();

            if (response.ok && !data.includes("Error")) {
                alert(data);

                if (isRegister) {
                    // Registro: guardar el nombre que el usuario escribió
                    localStorage.setItem("usuario", username);
                    localStorage.setItem("usuarioEmail", email);
                    localStorage.setItem("usuarioNombre", username);
                } else {
                    // Login: extraer el nombre real del mensaje del backend
                    // El mensaje viene como "¡Bienvenido a SWAPO, Emanuel!"
                    const match = data.match(/SWAPO, (.+?)!/);
                    const nombreReal = match ? match[1] : identificador;

                    localStorage.setItem("usuario", nombreReal);
                    localStorage.setItem("usuarioEmail", identificador.includes('@') ? identificador : '');
                    localStorage.setItem("usuarioNombre", nombreReal);
                }

                // Forzar actualización del Navbar
                if (onLoginSuccess) {
                    onLoginSuccess();
                }

                onClose();
            } else {
                alert(data);
            }
        } catch (error) {
            console.error("Error de conexión:", error);
            alert("No se pudo conectar con el servidor (Spring Boot)");
        } finally {
            setCargando(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="sw-modal-overlay">
            <div className="sw-modal-card">
                <button className="sw-modal-close" onClick={onClose}>✕</button>

                <div className="sw-modal-header">
                    <h2>SWAPO <span>{isRegister ? 'REGISTRO' : 'LOGIN'}</span></h2>
                    <p>{isRegister ? 'Crea tu cuenta para empezar a tradear.' : 'Bienvenido de nuevo, te extrañamos.'}</p>
                </div>

                <form onSubmit={handleSubmit} className="sw-modal-form">
                    {isRegister && (
                        <>
                            <div className="sw-form-group">
                                <label>Nombre de Usuario</label>
                                <input
                                    type="text"
                                    placeholder="Ej: JuanPerez"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="sw-form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    placeholder="correo@ejemplo.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </>
                    )}

                    {!isRegister && (
                        <div className="sw-form-group">
                            <label>Email o Nombre de Usuario</label>
                            <input
                                type="text"
                                placeholder="correo@ejemplo.com o JuanPerez"
                                value={identificador}
                                onChange={(e) => setIdentificador(e.target.value)}
                                required
                            />
                        </div>
                    )}

                    <div className="sw-form-group">
                        <label>Contraseña</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="sw-btn-submit" disabled={cargando}>
                        {cargando ? 'CARGANDO...' : (isRegister ? 'CREAR CUENTA' : 'ENTRAR')}
                    </button>
                </form>

                <div className="sw-modal-footer">
                    <p onClick={() => setIsRegister(!isRegister)}>
                        {isRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;