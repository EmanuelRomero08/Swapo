package com.swapo.swapo.controller;

import com.swapo.swapo.dto.TradeOfferDTO;
import com.swapo.swapo.model.TradeOffer;
import com.swapo.swapo.service.TradeOfferService;
import com.swapo.swapo.service.ValidadorTruequeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/trades")
public class TradeOfferController
{
    private final TradeOfferService tradeOfferService;
    private final ValidadorTruequeService validadorTruequeService;

    public TradeOfferController(TradeOfferService tradeOfferService, ValidadorTruequeService validadorTruequeService)
    {
        this.tradeOfferService = tradeOfferService;
        this.validadorTruequeService = validadorTruequeService;
    }

    @PostMapping("/proponer")
    public ResponseEntity<TradeOfferDTO> crearOferta(@RequestBody TradeOffer oferta)
    {
        TradeOffer nuevaOferta = tradeOfferService.crearPropuesta(oferta);
        String mensajeIA = validadorTruequeService.validarTrueque(nuevaOferta);
        TradeOfferDTO respuestaLimpia = tradeOfferService.crearOfertaLimpia(nuevaOferta, mensajeIA);

        return ResponseEntity.ok(respuestaLimpia);
    }
}