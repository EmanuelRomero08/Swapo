package com.swapo.swapo.controller;

import com.swapo.swapo.model.Usuario;
import com.swapo.swapo.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController
{
    @Autowired
    private UsuarioRepository usuarioRepo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public Object register(@RequestBody Usuario usuario)
    {
        if (usuarioRepo.findByEmail(usuario.getEmail()).isPresent())
        {
            return "Error: El email ya está registrado.";
        }
        if (usuarioRepo.findByUsername(usuario.getUsername()).isPresent())
        {
            return "Error: El nombre de usuario ya está registrado.";
        }
        usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
        usuarioRepo.save(usuario);
        return "¡Usuario registrado con éxito! Bienvenido a SWAPO, " + usuario.getUsername() + "!";
    }

    @PostMapping("/login")
    public Object login(@RequestBody Usuario usuario)
    {
        Optional<Usuario> userOpt = usuarioRepo.findByEmailOrUsername(usuario.getEmail(), usuario.getEmail());

        if (userOpt.isPresent() && passwordEncoder.matches(usuario.getPassword(), userOpt.get().getPassword()))
        {
            return "¡Bienvenido a SWAPO, " + userOpt.get().getUsername() + "!";
        }
        return "Error: Email o contraseña incorrectos.";
    }
}