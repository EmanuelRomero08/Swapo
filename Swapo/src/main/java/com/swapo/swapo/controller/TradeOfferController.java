package com.swapo.swapo.controller;

import com.swapo.swapo.dto.TradeOfferDTO;
import com.swapo.swapo.dto.PaymentRequest;
import com.swapo.swapo.dto.PaymentResponse;
import com.swapo.swapo.model.TradeOffer;
import com.swapo.swapo.model.TradeStatus;
import com.swapo.swapo.model.Producto;
import com.swapo.swapo.service.TradeOfferService;
import com.swapo.swapo.service.ValidadorTruequeService;
import com.swapo.swapo.repository.TradeOfferRepository;
import com.swapo.swapo.repository.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/trades")
public class TradeOfferController
{
    private final TradeOfferService tradeOfferService;
    private final ValidadorTruequeService validadorTruequeService;
    private final TradeOfferRepository tradeOfferRepository;

    @Autowired
    private ProductoRepository productoRepository;

    @Value("${swapo.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    public TradeOfferController(TradeOfferService tradeOfferService, 
                                ValidadorTruequeService validadorTruequeService,
                                TradeOfferRepository tradeOfferRepository)
    {
        this.tradeOfferService = tradeOfferService;
        this.validadorTruequeService = validadorTruequeService;
        this.tradeOfferRepository = tradeOfferRepository;
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
            return ResponseEntity.badRequest().body(Map.of("error", "Error: " + e.getMessage()));
        }
    }

    @PutMapping("/aceptar/{id}")
    public ResponseEntity<?> aceptarPropuesta(@PathVariable Long id) {
        try {
            TradeOffer oferta = tradeOfferService.aceptarPropuesta(id);
            
            Producto productoOfrecido = oferta.getProductoOfrecido();
            Producto productoDeseado = oferta.getProductoDeseado();
            
            if (productoOfrecido != null) {
                productoOfrecido.setEstado("EN_TRUEQUE");
                productoRepository.save(productoOfrecido);
            }
            if (productoDeseado != null) {
                productoDeseado.setEstado("EN_TRUEQUE");
                productoRepository.save(productoDeseado);
            }
            
            return ResponseEntity.ok(oferta);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error: " + e.getMessage()));
        }
    }

    @PutMapping("/rechazar/{id}")
    public ResponseEntity<?> rechazarPropuesta(@PathVariable Long id) {
        try {
            TradeOffer oferta = tradeOfferService.rechazarPropuesta(id);
            
            Producto productoOfrecido = oferta.getProductoOfrecido();
            Producto productoDeseado = oferta.getProductoDeseado();
            
            if (productoOfrecido != null) {
                productoOfrecido.setEstado("DISPONIBLE");
                productoRepository.save(productoOfrecido);
            }
            if (productoDeseado != null) {
                productoDeseado.setEstado("DISPONIBLE");
                productoRepository.save(productoDeseado);
            }
            
            return ResponseEntity.ok(oferta);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error: " + e.getMessage()));
        }
    }

    @GetMapping
    public List<TradeOfferDTO> obtenerTodas() {
        return tradeOfferService.obtenerTodasDTO();
    }

    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<?> eliminarPropuesta(@PathVariable Long id) {
        tradeOfferService.eliminarPropuesta(id);
        return ResponseEntity.ok(Map.of("message", "Oferta eliminada"));
    }

    @PostMapping("/{offerId}/initiate-payment")
    public ResponseEntity<?> initiatePayment(@PathVariable Long offerId, @RequestParam Long userId) {
        try {
            System.out.println("=== INITIATE PAYMENT ===");
            System.out.println("Offer ID: " + offerId);
            System.out.println("User ID: " + userId);
            
            TradeOffer offer = tradeOfferRepository.findById(offerId)
                .orElseThrow(() -> new RuntimeException("Oferta no encontrada"));

            double diferencia = offer.getDiferenciaDinero();
            System.out.println("Diferencia: " + diferencia);

            Long deudorId;
            Long acreedorId;
            double montoPagar;

            if (diferencia > 0) {
                deudorId = offer.getReceptor().getId();
                acreedorId = offer.getEmisor().getId();
                montoPagar = diferencia;
                System.out.println("Deudor es el receptor: " + deudorId);
            } else if (diferencia < 0) {
                deudorId = offer.getEmisor().getId();
                acreedorId = offer.getReceptor().getId();
                montoPagar = Math.abs(diferencia);
                System.out.println("Deudor es el emisor: " + deudorId);
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "No hay diferencia de dinero que pagar en este trueque"));
            }

            if (!deudorId.equals(userId)) {
                return ResponseEntity.badRequest().body(Map.of("error", "No eres el usuario que debe pagar la diferencia"));
            }

            if (!TradeStatus.ACEPTADO.equals(offer.getEstado()) || offer.getPaymentId() != null) {
                System.out.println("Error: Estado = " + offer.getEstado() + ", PaymentId = " + offer.getPaymentId());
                return ResponseEntity.badRequest().body(Map.of("error", "El pago para este trueque ya fue iniciado o la oferta no está activa"));
            }

            PaymentRequest paymentRequest = new PaymentRequest();
            paymentRequest.setProductId(offer.getId());
            paymentRequest.setProductTitle("Diferencia de trueque SWAPO - Oferta #" + offer.getId());
            paymentRequest.setProductPrice(montoPagar);
            paymentRequest.setBuyerEmail(offer.getReceptor() != null ? offer.getReceptor().getEmail() : "test@test.com");

            RestTemplate restTemplate = new RestTemplate();
            ResponseEntity<PaymentResponse> mpResponse = restTemplate.postForEntity(
                "http://localhost:8080/api/payments/create-preference-for-trade",
                paymentRequest,
                PaymentResponse.class
            );

            if (mpResponse.getBody() != null && mpResponse.getBody().getInitPoint() != null) {
                String preferenceId = mpResponse.getBody().getPreferenceId();
                System.out.println("=== PREFERENCE ID CREADA ===");
                System.out.println("Preference ID: " + preferenceId);
                System.out.println("============================");
                
                offer.setPaymentId(preferenceId);
                offer.setEscrowStatus("PENDIENTE");
                tradeOfferRepository.save(offer);
                
                // Verificar que se guardó
                TradeOffer savedOffer = tradeOfferRepository.findById(offerId).get();
                System.out.println("PaymentId guardado en BD: " + savedOffer.getPaymentId());
                System.out.println("EscrowStatus guardado: " + savedOffer.getEscrowStatus());

                return ResponseEntity.ok(Map.of(
                    "paymentUrl", mpResponse.getBody().getInitPoint(),
                    "offerId", offer.getId(),
                    "preferenceId", preferenceId
                ));
            } else {
                return ResponseEntity.internalServerError().body(Map.of("error", "Error al crear la preferencia de pago"));
            }

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("error", "Error: " + e.getMessage()));
        }
    }

    @PostMapping("/{offerId}/confirm-shipment")
    public ResponseEntity<?> confirmShipment(@PathVariable Long offerId, @RequestParam Long userId) {
        try {
            TradeOffer offer = tradeOfferRepository.findById(offerId)
                .orElseThrow(() -> new RuntimeException("Oferta no encontrada"));

            if (!"RETENIDO".equals(offer.getEscrowStatus())) {
                return ResponseEntity.badRequest().body(Map.of("error", "El pago de la diferencia no se ha retenido aún. Estado actual: " + offer.getEscrowStatus()));
            }

            Long emisorId = offer.getEmisor().getId();
            Long receptorId = offer.getReceptor().getId();

            if (emisorId.equals(userId)) {
                if (offer.isSenderConfirmedShipment()) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Ya confirmaste el envío de tu producto"));
                }
                offer.setSenderConfirmedShipment(true);
                tradeOfferRepository.save(offer);
            } else if (receptorId.equals(userId)) {
                if (offer.isReceiverConfirmedShipment()) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Ya confirmaste el envío de tu producto"));
                }
                offer.setReceiverConfirmedShipment(true);
                tradeOfferRepository.save(offer);
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "Usuario no pertenece a este trueque"));
            }

            if (offer.isSenderConfirmedShipment() && offer.isReceiverConfirmedShipment()) {
                offer.setEscrowStatus("ENVIADO");
                tradeOfferRepository.save(offer);
                return ResponseEntity.ok(Map.of(
                    "message", "✅ Ambos confirmaron el envío. Estado actualizado a 'ENVIADO'.",
                    "escrowStatus", offer.getEscrowStatus()
                ));
            }

            return ResponseEntity.ok(Map.of(
                "message", "✅ Envío confirmado. Esperando confirmación de la otra parte.",
                "senderConfirmed", offer.isSenderConfirmedShipment(),
                "receiverConfirmed", offer.isReceiverConfirmedShipment(),
                "escrowStatus", offer.getEscrowStatus()
            ));

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Error: " + e.getMessage()));
        }
    }

    @PostMapping("/{offerId}/confirm-receipt")
    public ResponseEntity<?> confirmReceipt(@PathVariable Long offerId, @RequestParam Long userId) {
        try {
            TradeOffer offer = tradeOfferRepository.findById(offerId)
                .orElseThrow(() -> new RuntimeException("Oferta no encontrada"));

            if (!"ENVIADO".equals(offer.getEscrowStatus())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Los productos no han sido marcados como enviados por ambos aún. Estado actual: " + offer.getEscrowStatus()));
            }

            Long emisorId = offer.getEmisor().getId();
            Long receptorId = offer.getReceptor().getId();

            if (emisorId.equals(userId)) {
                if (offer.isSenderConfirmedReceipt()) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Ya confirmaste la recepción del producto"));
                }
                offer.setSenderConfirmedReceipt(true);
                tradeOfferRepository.save(offer);
            } else if (receptorId.equals(userId)) {
                if (offer.isReceiverConfirmedReceipt()) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Ya confirmaste la recepción del producto"));
                }
                offer.setReceiverConfirmedReceipt(true);
                tradeOfferRepository.save(offer);
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "Usuario no pertenece a este trueque"));
            }

            if (offer.isSenderConfirmedReceipt() && offer.isReceiverConfirmedReceipt()) {
                RestTemplate restTemplate = new RestTemplate();
                String captureUrl = "http://localhost:8080/api/payments/capture-payment/" + offer.getPaymentId();
                ResponseEntity<String> captureResponse = restTemplate.postForEntity(captureUrl, null, String.class);

                if (captureResponse.getStatusCode().is2xxSuccessful()) {
                    offer.setEscrowStatus("COMPLETADO");
                    offer.setEstado(TradeStatus.COMPLETADO);
                    tradeOfferRepository.save(offer);
                    
                    Producto productoOfrecido = offer.getProductoOfrecido();
                    Producto productoDeseado = offer.getProductoDeseado();
                    
                    if (productoOfrecido != null) {
                        productoOfrecido.setEstado("VENDIDO");
                        productoRepository.save(productoOfrecido);
                    }
                    if (productoDeseado != null) {
                        productoDeseado.setEstado("VENDIDO");
                        productoRepository.save(productoDeseado);
                    }
                    
                    return ResponseEntity.ok(Map.of(
                        "message", "🎉 ¡Trueque completado! El pago de la diferencia ha sido liberado al vendedor.",
                        "escrowStatus", offer.getEscrowStatus()
                    ));
                } else {
                    return ResponseEntity.status(500).body(Map.of("error", "Error al liberar el pago en Mercado Pago: " + captureResponse.getBody()));
                }
            }

            return ResponseEntity.ok(Map.of(
                "message", "✅ Recepción confirmada. Esperando confirmación de la otra parte para liberar el pago.",
                "senderConfirmed", offer.isSenderConfirmedReceipt(),
                "receiverConfirmed", offer.isReceiverConfirmedReceipt(),
                "escrowStatus", offer.getEscrowStatus()
            ));

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Error: " + e.getMessage()));
        }
    }

    @GetMapping("/{offerId}/escrow-status")
    public ResponseEntity<?> getEscrowStatus(@PathVariable Long offerId) {
        try {
            TradeOffer offer = tradeOfferRepository.findById(offerId)
                .orElseThrow(() -> new RuntimeException("Oferta no encontrada"));

            return ResponseEntity.ok(Map.of(
                "offerId", offer.getId(),
                "paymentId", offer.getPaymentId(),
                "escrowStatus", offer.getEscrowStatus(),
                "diferenciaDinero", offer.getDiferenciaDinero(),
                "senderConfirmedShipment", offer.isSenderConfirmedShipment(),
                "receiverConfirmedShipment", offer.isReceiverConfirmedShipment(),
                "senderConfirmedReceipt", offer.isSenderConfirmedReceipt(),
                "receiverConfirmedReceipt", offer.isReceiverConfirmedReceipt()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error al obtener estado: " + e.getMessage()));
        }
    }
}