package com.swapo.swapo.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "productos")
public class Producto extends Recurso {
    
    private String marca;
    private String categoria;
    private String cpu;
    private String gpu;
    private String ram;
    private String ssd;
    private Double scoreIA;
    private String tipo;
    
    
    @Column(name = "usuario_id")
    private Long usuarioId;
    
    private String estado; // "DISPONIBLE", "VENDIDO", "INTERCAMBIADO"
    
    // Getters y setters específicos (Lombok @Data genera el resto)
    public Long getUsuarioId() {
        return usuarioId;
    }
    
    public void setUsuarioId(Long usuarioId) {
        this.usuarioId = usuarioId;
    }
    
    public String getEstado() {
        return estado;
    }
    
    public void setEstado(String estado) {
        this.estado = estado;
    }
    
    @Override
    public void calcularValorIntercambio() {
        double valorSugerido = this.getPrecio() * 0.9;
        System.out.println(">>> Lógica de SWAPO para " + this.getNombre() + ":");
        System.out.println("Valor de venta: $" + this.getPrecio());
        System.out.println("Valor sugerido para intercambio: $" + valorSugerido);
    }
}