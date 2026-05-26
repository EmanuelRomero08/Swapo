package com.swapo.swapo.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "productos")
public class Producto extends Recurso
{
    private String marca;
    private String categoria;
    private String cpu;
    private String gpu;
    private String ram;
    private String ssd;
    private Double scoreIA;
    private String tipo;

    @Override
    public void calcularValorIntercambio()
    {
        double valorSugerido = this.getPrecio() * 0.9;
        System.out.println(">>> Lógica de SWAPO para " + this.getNombre() + ":");
        System.out.println("Valor de venta: $" + this.getPrecio());
        System.out.println("Valor sugerido para intercambio: $" + valorSugerido);
    }
}