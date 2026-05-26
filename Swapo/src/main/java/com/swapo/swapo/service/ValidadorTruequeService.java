package com.swapo.swapo.service;

import com.swapo.swapo.model.TradeOffer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ValidadorTruequeService
{
    @Autowired
    private GroqService groqService;

    public String validarTrueque(TradeOffer oferta)
    {
        double precioOfrecido = oferta.getProductoOfrecido().getPrecio();
        double precioDeseado = oferta.getProductoDeseado().getPrecio();
        double diferenciaDinero = oferta.getDiferenciaDinero() != null ? oferta.getDiferenciaDinero() : 0;

        return groqService.analizarTrueque(
                oferta.getProductoOfrecido().getNombre(),
                precioOfrecido,
                oferta.getProductoDeseado().getNombre(),
                precioDeseado,
                diferenciaDinero
        );
    }
}