package com.swapo.swapo.controller;

import com.mercadopago.MercadoPagoConfig;
import com.mercadopago.client.payment.PaymentClient;
import com.mercadopago.client.preference.PreferenceBackUrlsRequest;
import com.mercadopago.client.preference.PreferenceClient;
import com.mercadopago.client.preference.PreferenceItemRequest;
import com.mercadopago.client.preference.PreferenceRequest;
import com.mercadopago.resources.preference.Preference;
import com.mercadopago.resources.payment.Payment;
import com.swapo.swapo.dto.PaymentRequest;
import com.swapo.swapo.dto.PaymentResponse;
import com.swapo.swapo.model.Producto;
import com.swapo.swapo.model.Venta;
import com.swapo.swapo.repository.ProductoRepository;
import com.swapo.swapo.repository.VentaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "http://localhost:5173")
public class MercadoPagoController {

    @Value("${mercadopago.access.token}")
    private String accessToken;
    
    @Autowired
    private VentaRepository ventaRepository;
    
    @Autowired
    private ProductoRepository productoRepository;

    @PostMapping("/create-preference")
    public ResponseEntity<PaymentResponse> createPreference(@RequestBody PaymentRequest request) {
        try {
            MercadoPagoConfig.setAccessToken(accessToken);
            
            PreferenceItemRequest itemRequest = PreferenceItemRequest.builder()
                .id(request.getProductId().toString())
                .title(request.getProductTitle())
                .quantity(1)
                .unitPrice(BigDecimal.valueOf(request.getProductPrice()))
                .currencyId("COP")
                .build();
            
            PreferenceBackUrlsRequest backUrls = PreferenceBackUrlsRequest.builder()
                .success("http://localhost:5173/payment-success")
                .failure("http://localhost:5173/payment-failure")
                .pending("http://localhost:5173/payment-pending")
                .build();
            
            PreferenceRequest preferenceRequest = PreferenceRequest.builder()
                .items(java.util.List.of(itemRequest))
                .backUrls(backUrls)
                .notificationUrl("https://stalemate-finalist-entrust.ngrok-free.dev/api/payments/webhook")
                .build();
            
            PreferenceClient client = new PreferenceClient();
            Preference preference = client.create(preferenceRequest);
            
            PaymentResponse response = new PaymentResponse();
            response.setInitPoint(preference.getInitPoint());
            response.setPreferenceId(preference.getId());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/webhook")
    public ResponseEntity<Void> webhook(@RequestBody Map<String, Object> payload) {
        try {
            System.out.println("Webhook recibido: " + payload);
            
            String paymentId = null;
            if (payload.containsKey("data") && payload.get("data") instanceof Map) {
                @SuppressWarnings("unchecked")
                Map<String, Object> data = (Map<String, Object>) payload.get("data");
                if (data.containsKey("id")) {
                    paymentId = data.get("id").toString();
                }
            }
            
            if (paymentId != null) {
                MercadoPagoConfig.setAccessToken(accessToken);
                PaymentClient paymentClient = new PaymentClient();
                Payment payment = paymentClient.get(Long.parseLong(paymentId));
                
                String status = payment.getStatus();
                System.out.println("Estado del pago: " + status);
                
                if ("authorized".equals(status) || "waiting_capture".equals(status)) {
                    registrarVentaPendiente(payment);
                } 
                else if ("approved".equals(status)) {
                    registrarVentaCompleta(payment);
                }
                else if ("rejected".equals(status) || "cancelled".equals(status)) {
                    System.out.println("Pago rechazado o cancelado: " + paymentId);
                }
            }
            
            return ResponseEntity.ok().build();
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    private void registrarVentaPendiente(Payment payment) {
        try {
            if (payment.getAdditionalInfo() == null || 
                payment.getAdditionalInfo().getItems() == null || 
                payment.getAdditionalInfo().getItems().isEmpty()) {
                System.err.println("No se encontró información del producto en el pago");
                return;
            }
            
            String productId = payment.getAdditionalInfo().getItems().get(0).getId();
            
            Producto producto = productoRepository.findById(Long.parseLong(productId))
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
            
            Venta venta = new Venta();
            venta.setProductoId(producto.getId());
            venta.setVendedorId(producto.getUsuarioId()); 
            venta.setCompradorId(Long.parseLong(payment.getPayer().getId()));
            venta.setMonto(payment.getTransactionAmount().doubleValue());
            venta.setEstado("PENDIENTE_ENVIO");  // 🔥 Estado: pago autorizado, esperando envío
            venta.setPaymentId(payment.getId().toString());
            venta.setFecha(LocalDateTime.now());
            
            ventaRepository.save(venta);
            
            System.out.println("✅ Pago AUTORIZADO (no cobrado) para: " + producto.getNombre());
            System.out.println("💰 Dinero retenido. El vendedor debe marcar como enviado para cobrar.");
            
        } catch (Exception e) {
            System.err.println("Error al registrar venta pendiente: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private void registrarVentaCompleta(Payment payment) {
        try {
            if (payment.getAdditionalInfo() == null || 
                payment.getAdditionalInfo().getItems() == null || 
                payment.getAdditionalInfo().getItems().isEmpty()) {
                System.err.println("No se encontró información del producto en el pago");
                return;
            }
            
            String productId = payment.getAdditionalInfo().getItems().get(0).getId();
            
            Producto producto = productoRepository.findById(Long.parseLong(productId))
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
            
            Venta venta = new Venta();
            venta.setProductoId(producto.getId());
            venta.setVendedorId(producto.getUsuarioId()); 
            venta.setCompradorId(Long.parseLong(payment.getPayer().getId()));
            venta.setMonto(payment.getTransactionAmount().doubleValue());
            venta.setEstado("COMPLETADO");
            venta.setPaymentId(payment.getId().toString());
            venta.setFecha(LocalDateTime.now());
            
            ventaRepository.save(venta);
            
            producto.setEstado("VENDIDO");
            productoRepository.save(producto);
            
            System.out.println("✅ Venta COMPLETADA y producto marcado como VENDIDO: " + producto.getNombre());
            
        } catch (Exception e) {
            System.err.println("Error al registrar venta completa: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @PostMapping("/marcar-enviado/{ventaId}")
    public ResponseEntity<?> marcarComoEnviado(@PathVariable Long ventaId, @RequestBody(required = false) Map<String, String> datos) {
        try {
            Venta venta = ventaRepository.findById(ventaId)
                .orElseThrow(() -> new RuntimeException("Venta no encontrada"));
            
            if (!"PENDIENTE_ENVIO".equals(venta.getEstado())) {
                return ResponseEntity.badRequest().body("❌ La venta no está en estado pendiente de envío. Estado actual: " + venta.getEstado());
            }
            
            if (datos != null && datos.containsKey("codigoRastreo")) {
                venta.setCodigoRastreo(datos.get("codigoRastreo"));
            }
            
            venta.setEstado("ENVIADO");
            ventaRepository.save(venta);
            
            return ResponseEntity.ok("✅ Producto marcado como enviado. El comprador podrá confirmar la recepción para que se cobre el pago.");
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/confirmar-recepcion/{ventaId}")
    public ResponseEntity<?> confirmarRecepcion(@PathVariable Long ventaId) {
        try {
            Venta venta = ventaRepository.findById(ventaId)
                .orElseThrow(() -> new RuntimeException("Venta no encontrada"));
            
            if (!"ENVIADO".equals(venta.getEstado())) {
                return ResponseEntity.badRequest().body("❌ El producto no ha sido marcado como enviado aún. Estado actual: " + venta.getEstado());
            }
            
            MercadoPagoConfig.setAccessToken(accessToken);
            PaymentClient paymentClient = new PaymentClient();
            Payment payment = paymentClient.capture(Long.parseLong(venta.getPaymentId()));
            
            if ("approved".equals(payment.getStatus())) {
                venta.setEstado("COMPLETADO");
                
                Producto producto = productoRepository.findById(venta.getProductoId()).orElse(null);
                if (producto != null) {
                    producto.setEstado("VENDIDO");
                    productoRepository.save(producto);
                }
                
                ventaRepository.save(venta);
                return ResponseEntity.ok("✅ Pago cobrado exitosamente. Venta completada.");
            } else {
                return ResponseEntity.status(500).body("❌ Error al capturar el pago. Estado actual: " + payment.getStatus());
            }
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/cancelar-venta/{ventaId}")
    public ResponseEntity<?> cancelarVenta(@PathVariable Long ventaId) {
        try {
            Venta venta = ventaRepository.findById(ventaId)
                .orElseThrow(() -> new RuntimeException("Venta no encontrada"));
            
            if (!"PENDIENTE_ENVIO".equals(venta.getEstado()) && !"ENVIADO".equals(venta.getEstado())) {
                return ResponseEntity.badRequest().body("❌ No se puede cancelar esta venta. Estado actual: " + venta.getEstado());
            }
            
            MercadoPagoConfig.setAccessToken(accessToken);
            PaymentClient paymentClient = new PaymentClient();
            Payment payment = paymentClient.cancel(Long.parseLong(venta.getPaymentId()));
            
            venta.setEstado("CANCELADO");
            ventaRepository.save(venta);
            
            return ResponseEntity.ok("✅ Venta cancelada. El dinero ha sido liberado para el comprador.");
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/ventas/comprador/{compradorId}")
    public ResponseEntity<List<Venta>> getVentasByComprador(@PathVariable Long compradorId) {
        List<Venta> ventas = ventaRepository.findByCompradorId(compradorId);
        return ResponseEntity.ok(ventas);
    }

    @GetMapping("/ventas/vendedor/{vendedorId}")
    public ResponseEntity<List<Venta>> getVentasByVendedor(@PathVariable Long vendedorId) {
        List<Venta> ventas = ventaRepository.findByVendedorId(vendedorId);
        return ResponseEntity.ok(ventas);
    }
}
