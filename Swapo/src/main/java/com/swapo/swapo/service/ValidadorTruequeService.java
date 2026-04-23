package com.swapo.swapo.service;

import com.swapo.swapo.model.TradeOffer;
import org.springframework.stereotype.Service;

@Service
public class ValidadorTruequeService
{
    public String validarTrueque(TradeOffer oferta)
    {
        double precioOfrecido = oferta.getProductoOfrecido().getPrecio();
        double precioDeseado = oferta.getProductoDeseado().getPrecio();
        double diferencia = precioOfrecido - precioDeseado;

        if (Math.abs(diferencia) < 50000)
        {
            return "IA SWAPO: El trato es justo y equilibrado.";
        }
        else if (precioOfrecido > precioDeseado)
        {
            return "IA SWAPO: ¡Atención! Estás ofreciendo un producto más caro ($" + precioOfrecido + ") de lo que pides ($" + precioDeseado + ").";
        }
        else
        {
            return "IA SWAPO: ¡Gran trato! Lo que pides vale más que lo que das.";
        }
    }
}