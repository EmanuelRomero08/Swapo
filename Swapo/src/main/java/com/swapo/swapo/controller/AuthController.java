package com.swapo.swapo.controller;

import com.swapo.swapo.model.Usuario;
import com.swapo.swapo.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController
{
    @Autowired
    private UsuarioRepository usuarioRepo;

    @PostMapping("/register")
    public Object register(@RequestBody Usuario usuario)
    {
        if (usuarioRepo.findByEmail(usuario.getEmail()).isPresent())
        {
            return "Error: El email ya está registrado.";
        }
        return usuarioRepo.save(usuario);
    }

    @PostMapping("/login")
    public Object login(@RequestBody Usuario usuario)
    {
        return usuarioRepo.findByEmailAndPassword(usuario.getEmail(), usuario.getPassword()).map(u -> "¡Bienvenido a SWAPO, " + u.getUsername() + "!").orElse("Error: Email o contraseña incorrectos.");
    }
}