package com.swapo.swapo.controller;

import com.swapo.swapo.service.GroqService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ia")
@CrossOrigin(origins = "http://localhost:5173")
public class IAController
{
    @Autowired
    private GroqService groqService;

    @PostMapping("/comparar")
    public String compararProductos(@RequestBody Map<String, String> datos) {
        return groqService.analizarComparacion(
                datos.get("productoA"),
                Double.parseDouble(datos.get("precioA")),
                datos.get("specsA"),
                datos.get("productoB"),
                Double.parseDouble(datos.get("precioB")),
                datos.get("specsB")
        );
    }
}