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
            Map<String, Object> data = (Map<String, Object>) payload.get("data");                if (data.containsKey("id")) {
                    paymentId = data.get("id").toString();
                }
            }
            
            if (paymentId != null) {
                MercadoPagoConfig.setAccessToken(accessToken);
                PaymentClient paymentClient = new PaymentClient();
                Payment payment = paymentClient.get(Long.parseLong(paymentId));
                
                if ("approved".equals(payment.getStatus())) {
                    registrarVenta(payment);
                }
            }
            
            return ResponseEntity.ok().build();
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    private void registrarVenta(Payment payment) {
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
        venta.setEstado(payment.getStatus());
        venta.setPaymentId(payment.getId().toString());
        venta.setFecha(LocalDateTime.now());
        
        ventaRepository.save(venta);
        
        producto.setEstado("VENDIDO");
        productoRepository.save(producto);
        System.out.println("Producto actualizado a VENDIDO: " + producto.getNombre());
        
        System.out.println("Venta registrada exitosamente para el producto: " + producto.getNombre());
        
    } catch (Exception e) {
        System.err.println("Error al registrar venta: " + e.getMessage());
        e.printStackTrace();
    }
}

    @GetMapping("/ventas/comprador/{compradorId}")
    public ResponseEntity<List<Venta>> getVentasByComprador(@PathVariable Long compradorId) {
        List<Venta> ventas = ventaRepository.findByCompradorId(compradorId);
        return ResponseEntity.ok(ventas);
    }
}