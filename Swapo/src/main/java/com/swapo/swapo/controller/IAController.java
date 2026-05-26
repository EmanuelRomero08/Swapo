package com.swapo.swapo.controller;

import com.swapo.swapo.service.GroqService;
import com.swapo.swapo.service.ImageValidatorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/ia")
@CrossOrigin(origins = "http://localhost:5173")
public class IAController
{
    @Autowired
    private GroqService groqService;

    @Autowired
    private ImageValidatorService imageValidatorService;

    @PostMapping("/comparar")
    public String compararProductos(@RequestBody Map<String, String> datos)
    {
        return groqService.analizarComparacion(
                datos.get("productoA"),
                Double.parseDouble(datos.get("precioA")),
                datos.get("specsA"),
                datos.get("productoB"),
                Double.parseDouble(datos.get("precioB")),
                datos.get("specsB")
        );
    }

    @PostMapping("/validar-imagen")
    public String validarImagen(@RequestParam("imagen") MultipartFile imagen)
    {
        return imageValidatorService.validarImagen(imagen);
    }

    @PostMapping("/validar-producto-seguridad")
    public String validarProductoSeguridad(@RequestBody Map<String, String> datos)
    {
        return groqService.validarProducto(
                datos.get("nombre"),
                datos.get("descripcion"),
                datos.get("categoria"),
                datos.get("cpu"),
                datos.get("gpu"),
                datos.get("ram"),
                datos.get("ssd"),
                Double.parseDouble(datos.get("precio")),
                datos.get("vendedorNombre"),
                datos.get("imagenPath")
        );
    }
}