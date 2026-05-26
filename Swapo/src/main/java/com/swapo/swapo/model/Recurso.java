package com.swapo.swapo.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Inheritance(strategy = InheritanceType.JOINED)
@Table(name = "recursos")
public abstract class Recurso
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;
    private String descripcion;
    private Double precio;
    private Integer stock;
    private String vendedorNombre;
    private String vendedorEmail;
    private Integer vendedorVentas;
    private String imagenPath;

    public abstract void calcularValorIntercambio();
}