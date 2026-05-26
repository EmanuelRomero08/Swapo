package com.swapo.swapo.repository;

import com.swapo.swapo.model.Venta;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface VentaRepository extends JpaRepository<Venta, Long> {
    List<Venta> findByVendedorId(Long vendedorId);
    List<Venta> findByCompradorId(Long compradorId);
    Venta findByPaymentId(String paymentId);
}