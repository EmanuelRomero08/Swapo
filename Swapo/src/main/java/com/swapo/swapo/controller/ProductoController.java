package com.swapo.swapo.controller;

import com.swapo.swapo.model.Producto;
import com.swapo.swapo.repository.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/productos")
public class ProductoController
{
    @Autowired
    private ProductoRepository productoRepo;

    @GetMapping
    public List<Producto> listarTodos()
    {
        return productoRepo.findAll();
    }

    @PostMapping
    public Object guardar(@RequestBody Producto producto)
    {
        if (producto.getNombre() == null || producto.getNombre().isBlank())
        {
            return "Error: El nombre del producto es obligatorio.";
        }
        if (producto.getPrecio() == null || producto.getPrecio() <= 0)
        {
            return "Error: El precio debe ser mayor a 0.";
        }
        if (producto.getCategoria() == null || producto.getCategoria().isBlank())
        {
            return "Error: La categoría es obligatoria para las búsquedas de SWAPO.";
        }

        return productoRepo.save(producto);
    }

    @GetMapping("/buscar")
    public List<Producto> buscarPorMarca(@RequestParam String marca)
    {
        return productoRepo.findByMarcaIgnoreCase(marca);
    }

    @GetMapping("/{id}/valor-intercambio")
    public String probarIntercambio(@PathVariable long id)
    {
        return productoRepo.findById(id).map(p ->
        {
            p.calcularValorIntercambio();
            return "Cálculo realizado para: " + p.getNombre() + ". Revisa la consola de IntelliJ.";
        }).orElse("Producto no encontrado");
    }

    @GetMapping("/categoria/{nombre}")
    public List<Producto> buscarPorCategoria(@PathVariable String nombre)
    {
        return productoRepo.findByCategoriaIgnoreCase(nombre);
    }
}