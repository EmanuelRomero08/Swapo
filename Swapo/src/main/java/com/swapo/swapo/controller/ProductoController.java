package com.swapo.swapo.controller;

import com.swapo.swapo.model.Producto;
import com.swapo.swapo.repository.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/productos")
@CrossOrigin(origins = "http://localhost:5173")
public class ProductoController
{
    @Autowired
    private ProductoRepository productoRepo;

    private final String UPLOAD_DIR = "uploads/";

    @GetMapping
    public List<Producto> listarTodos()
    {
        return productoRepo.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Producto> obtenerPorId(@PathVariable Long id)
    {
        return productoRepo.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Long id)
    {
        return productoRepo.findById(id).map(producto -> {
            productoRepo.delete(producto);
            return ResponseEntity.ok().body("Producto eliminado de SWAPO");
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/publicar")
    public ResponseEntity<?> guardarConFoto(
            @RequestParam("imagen") MultipartFile imagen,
            @RequestParam("nombre") String nombre,
            @RequestParam("precio") Double precio,
            @RequestParam("vendedorNombre") String vendedorNombre,
            @RequestParam(value = "vendedorEmail", required = false) String vendedorEmail,
            @RequestParam("cpu") String cpu,
            @RequestParam("gpu") String gpu,
            @RequestParam("ram") String ram,
            @RequestParam("ssd") String ssd,
            @RequestParam("descripcion") String descripcion,
            @RequestParam("categoria") String categoria,
            @RequestParam("tipo") String tipo
    ) {
        try
        {
            Path pathDirectorio = Paths.get(UPLOAD_DIR);
            if (!Files.exists(pathDirectorio))
            {
                Files.createDirectories(pathDirectorio);
            }

            String nombreArchivo = UUID.randomUUID().toString() + "_" + imagen.getOriginalFilename();
            Path rutaArchivo = pathDirectorio.resolve(nombreArchivo);
            Files.copy(imagen.getInputStream(), rutaArchivo);

            Producto producto = new Producto();
            producto.setNombre(nombre);
            producto.setPrecio(precio);
            producto.setDescripcion(descripcion);
            producto.setCategoria(categoria);
            producto.setVendedorNombre(vendedorNombre);
            producto.setVendedorEmail(vendedorEmail != null ? vendedorEmail : "");
            producto.setVendedorVentas(0);
            producto.setCpu(cpu);
            producto.setGpu(gpu);
            producto.setRam(ram);
            producto.setSsd(ssd);
            producto.setImagenPath("/uploads/" + nombreArchivo);
            producto.setTipo(tipo);

            productoRepo.save(producto);
            return ResponseEntity.ok(producto.getId().toString());
        }
        catch (IOException e)
        {
            return ResponseEntity.internalServerError().body("Error al guardar la imagen: " + e.getMessage());
        }
    }

    @PutMapping("/editar/{id}")
    public ResponseEntity<?> editarProducto(
            @PathVariable Long id,
            @RequestParam("nombre") String nombre,
            @RequestParam("precio") Double precio,
            @RequestParam("descripcion") String descripcion,
            @RequestParam("categoria") String categoria,
            @RequestParam("cpu") String cpu,
            @RequestParam("gpu") String gpu,
            @RequestParam("ram") String ram,
            @RequestParam("ssd") String ssd,
            @RequestParam("tipo") String tipo,
            @RequestParam(value = "imagen", required = false) MultipartFile imagen
    ) {
        try {
            Optional<Producto> productoOpt = productoRepo.findById(id);
            if (!productoOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            Producto producto = productoOpt.get();
            producto.setNombre(nombre);
            producto.setPrecio(precio);
            producto.setDescripcion(descripcion);
            producto.setCategoria(categoria);
            producto.setCpu(cpu);
            producto.setGpu(gpu);
            producto.setRam(ram);
            producto.setSsd(ssd);
            producto.setTipo(tipo);

            if (imagen != null && !imagen.isEmpty()) {
                Path pathDirectorio = Paths.get(UPLOAD_DIR);
                if (!Files.exists(pathDirectorio)) {
                    Files.createDirectories(pathDirectorio);
                }
                String nombreArchivo = UUID.randomUUID().toString() + "_" + imagen.getOriginalFilename();
                Path rutaArchivo = pathDirectorio.resolve(nombreArchivo);
                Files.copy(imagen.getInputStream(), rutaArchivo);
                producto.setImagenPath("/uploads/" + nombreArchivo);
            }

            productoRepo.save(producto);
            return ResponseEntity.ok("Producto actualizado");
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Error al actualizar: " + e.getMessage());
        }
    }
}