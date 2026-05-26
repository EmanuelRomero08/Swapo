package com.swapo.swapo.repository;

import com.swapo.swapo.model.Venta;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface VentaRepository extends JpaRepository<Venta, Long> {
    List<Venta> findByCompradorId(Long compradorId);
    List<Venta> findByVendedorId(Long vendedorId);
    Venta findByPaymentId(String paymentId);
    
    List<Venta> findByVendedorIdAndEstado(Long vendedorId, String estado);
    
    List<Venta> findByCompradorIdAndEstado(Long compradorId, String estado);
}