package com.swapo.swapo.controller;

import com.swapo.swapo.dto.TradeOfferDTO;
import com.swapo.swapo.model.TradeOffer;
import com.swapo.swapo.service.TradeOfferService;
import com.swapo.swapo.service.ValidadorTruequeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

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
    public ResponseEntity<?> crearOferta(@RequestBody Map<String, Object> payload)
    {
        try {
            Map<String, String> emisorMap = (Map<String, String>) payload.get("emisor");
            Map<String, String> receptorMap = (Map<String, String>) payload.get("receptor");
            Map<String, Object> productoOfrecidoMap = (Map<String, Object>) payload.get("productoOfrecido");
            Map<String, Object> productoDeseadoMap = (Map<String, Object>) payload.get("productoDeseado");
            Double diferenciaDinero = ((Number) payload.getOrDefault("diferenciaDinero", 0)).doubleValue();

            String emisorNombre = emisorMap.get("username");
            String receptorNombre = receptorMap.get("username");
            Long productoOfrecidoId = Long.valueOf(productoOfrecidoMap.get("id").toString());
            Long productoDeseadoId = Long.valueOf(productoDeseadoMap.get("id").toString());

            TradeOffer nuevaOferta = tradeOfferService.crearPropuesta(emisorNombre, receptorNombre, productoOfrecidoId, productoDeseadoId, diferenciaDinero);

            String mensajeIA = validadorTruequeService.validarTrueque(nuevaOferta);
            TradeOfferDTO respuestaLimpia = tradeOfferService.crearOfertaLimpia(nuevaOferta, mensajeIA);

            return ResponseEntity.ok(respuestaLimpia);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @PutMapping("/aceptar/{id}")
    public ResponseEntity<?> aceptarPropuesta(@PathVariable Long id) {
        TradeOffer oferta = tradeOfferService.aceptarPropuesta(id);
        return ResponseEntity.ok(oferta);
    }

    @PutMapping("/rechazar/{id}")
    public ResponseEntity<?> rechazarPropuesta(@PathVariable Long id) {
        TradeOffer oferta = tradeOfferService.rechazarPropuesta(id);
        return ResponseEntity.ok(oferta);
    }

    @GetMapping
    public List<TradeOfferDTO> obtenerTodas() {
        return tradeOfferService.obtenerTodasDTO();
    }

    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<?> eliminarPropuesta(@PathVariable Long id) {
        tradeOfferService.eliminarPropuesta(id);
        return ResponseEntity.ok("Oferta eliminada");
    }
}