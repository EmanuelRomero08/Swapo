package com.swapo.swapo.controller;

import com.swapo.swapo.model.Usuario;
import com.swapo.swapo.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.http.ResponseEntity;
import java.util.HashMap;
import java.util.Map;
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
    public ResponseEntity<?> register(@RequestBody Usuario usuario)
    {
        if (usuarioRepo.findByEmail(usuario.getEmail()).isPresent())
        {
            return ResponseEntity.badRequest().body("Error: El email ya está registrado.");
        }
        if (usuarioRepo.findByUsername(usuario.getUsername()).isPresent())
        {
            return ResponseEntity.badRequest().body("Error: El nombre de usuario ya está registrado.");
        }
        usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
        Usuario savedUser = usuarioRepo.save(usuario);
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "¡Usuario registrado con éxito! Bienvenido a SWAPO, " + usuario.getUsername() + "!");
        response.put("userId", savedUser.getId());
        response.put("username", savedUser.getUsername());
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Usuario usuario)
    {
        Optional<Usuario> userOpt = usuarioRepo.findByEmailOrUsername(usuario.getEmail(), usuario.getEmail());

        if (userOpt.isPresent() && passwordEncoder.matches(usuario.getPassword(), userOpt.get().getPassword()))
        {
            Map<String, Object> response = new HashMap<>();
            response.put("message", "¡Bienvenido a SWAPO, " + userOpt.get().getUsername() + "!");
            response.put("userId", userOpt.get().getId());
            response.put("username", userOpt.get().getUsername());
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.badRequest().body("Error: Email o contraseña incorrectos.");
    }

    @GetMapping("/usuario/{username}")
    public ResponseEntity<?> getUsuarioByUsername(@PathVariable String username)
    {
        Optional<Usuario> userOpt = usuarioRepo.findByUsername(username);
        if (!userOpt.isPresent())
        {
            return ResponseEntity.notFound().build();
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("id", userOpt.get().getId());
        response.put("username", userOpt.get().getUsername());
        response.put("email", userOpt.get().getEmail());
        
        return ResponseEntity.ok(response);
    }
}