import { useState } from 'react';

const Publicar = () =>
{
    const [step, setStep] = useState(1);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [scannedData, setScannedData] = useState(null);

    const handleFileUpload = (e) =>
    {
        setIsAnalyzing(true);
        setTimeout(() =>
        {
            setScannedData({
                model: "MacBook Air M2",
                detectedSpecs: "8GB RAM, 256GB SSD, Batería 98%",
                suggestedPrice: 4200000,
                confidence: 95
            });
            setIsAnalyzing(false);
            setStep(2);
        }, 3000);
    };

    return (
        <div className="page-fade-in content publish-flow">
            <div className="publish-card">
                {step === 1 ? (
                    <div className="upload-zone">
                        <h2>Validación de Producto <span>IA</span></h2>
                        <p>Sube una foto de las especificaciones de tu equipo (Pantallazo de "Acerca de este Mac/PC")</p>

                        <div className={`drop-box ${isAnalyzing ? 'analyzing' : ''}`}>
                            {isAnalyzing ? (
                                <div className="ai-scanner-line"></div>
                            ) : (
                                <input type="file" onChange={handleFileUpload} />
                            )}
                            <div className="icon">{isAnalyzing ? "🤖" : "📸"}</div>
                            <p>{isAnalyzing ? "Analizando autenticidad..." : "Arrastra o selecciona fotos"}</p>
                        </div>
                    </div>
                ) : (
                    <div className="edit-zone page-fade-in">
                        <div className="ai-success-badge">✓ Verificación de Specs Exitosa</div>
                        <h3>Confirmar Información Detectada</h3>

                        <div className="form-group">
                            <label>Modelo Detectado</label>
                            <input type="text" defaultValue={scannedData.model} />
                        </div>

                        <div className="form-group">
                            <label>Precio Sugerido por IA (Basado en mercado)</label>
                            <input type="text" defaultValue={`$${scannedData.suggestedPrice.toLocaleString()}`} />
                            <small>Nuestra IA sugiere este precio para vender en menos de 7 días.</small>
                        </div>

                        <button className="confirm-publish-btn">Publicar en SWAPO</button>
                        <button className="re-scan-btn" onClick={() => setStep(1)}>Volver a escanear</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Publicar;