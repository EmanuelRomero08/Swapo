package com.swapo.swapo.repository;

import com.swapo.swapo.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface ProductoRepository extends JpaRepository<Producto, Long> {
    
    List<Producto> findByEstadoIsNullOrEstadoNot(String estado);
    
    @Query("SELECT p FROM Producto p WHERE p.vendedorNombre = ?1 AND p.estado = 'VENDIDO'")
    List<Producto> findVendidosByVendedorNombre(String vendedorNombre);
    
    @Query("SELECT p FROM Producto p JOIN Venta v ON v.productoId = p.id WHERE v.compradorId = ?1")
    List<Producto> findCompradosByCompradorId(Long compradorId);
}

