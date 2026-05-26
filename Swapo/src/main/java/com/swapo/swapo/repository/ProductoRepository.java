package com.swapo.swapo.repository;

import com.swapo.swapo.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProductoRepository extends JpaRepository<Producto, Long>
{
    List<Producto> findByMarcaIgnoreCase(String marca);
    List<Producto> findByCategoriaIgnoreCase(String categoria);
}