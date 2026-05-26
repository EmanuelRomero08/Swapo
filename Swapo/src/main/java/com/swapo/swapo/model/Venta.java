package com.swapo.swapo.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ventas")
public class Venta {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private Long productoId;
    private Long compradorId;
    private Long vendedorId;
    private Double monto;
    private String estado;
    private String paymentId;
    private LocalDateTime fecha;
    

    @Column(length = 100)
    private String codigoRastreo;      
    
    @Column(length = 500)
    private String comprobanteEnvio;   
    
    public Venta() {}
    
    public Venta(Long productoId, Long compradorId, Long vendedorId, Double monto, String estado, String paymentId, LocalDateTime fecha) {
        this.productoId = productoId;
        this.compradorId = compradorId;
        this.vendedorId = vendedorId;
        this.monto = monto;
        this.estado = estado;
        this.paymentId = paymentId;
        this.fecha = fecha;
    }
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getProductoId() {
        return productoId;
    }
    
    public void setProductoId(Long productoId) {
        this.productoId = productoId;
    }
    
    public Long getCompradorId() {
        return compradorId;
    }
    
    public void setCompradorId(Long compradorId) {
        this.compradorId = compradorId;
    }
    
    public Long getVendedorId() {
        return vendedorId;
    }
    
    public void setVendedorId(Long vendedorId) {
        this.vendedorId = vendedorId;
    }
    
    public Double getMonto() {
        return monto;
    }
    
    public void setMonto(Double monto) {
        this.monto = monto;
    }
    
    public String getEstado() {
        return estado;
    }
    
    public void setEstado(String estado) {
        this.estado = estado;
    }
    
    public String getPaymentId() {
        return paymentId;
    }
    
    public void setPaymentId(String paymentId) {
        this.paymentId = paymentId;
    }
    
    public LocalDateTime getFecha() {
        return fecha;
    }
    
    public void setFecha(LocalDateTime fecha) {
        this.fecha = fecha;
    }
    
    // ========== GETTERS Y SETTERS PARA NUEVOS CAMPOS ==========
    public String getCodigoRastreo() {
        return codigoRastreo;
    }
    
    public void setCodigoRastreo(String codigoRastreo) {
        this.codigoRastreo = codigoRastreo;
    }
    
    public String getComprobanteEnvio() {
        return comprobanteEnvio;
    }
    
    public void setComprobanteEnvio(String comprobanteEnvio) {
        this.comprobanteEnvio = comprobanteEnvio;
    }
}