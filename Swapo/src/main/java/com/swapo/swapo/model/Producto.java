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

    @Override
    public void calcularValorIntercambio()
    {
        System.out.println("Calculando valor para el producto: "+ getNombre());
    }
}
