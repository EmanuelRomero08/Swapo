package com.swapo.swapo.controller;

import com.swapo.swapo.model.Usuario;
import com.swapo.swapo.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController
{
    @Autowired
    private UsuarioRepository usuarioRepo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Usuario usuario)
    {
        Map<String, String> response = new HashMap<>();
        
        if (usuarioRepo.findByEmail(usuario.getEmail()).isPresent())
        {
            response.put("error", "El email ya está registrado.");
            return ResponseEntity.badRequest().body(response);
        }
        if (usuarioRepo.findByUsername(usuario.getUsername()).isPresent())
        {
            response.put("error", "El nombre de usuario ya está registrado.");
            return ResponseEntity.badRequest().body(response);
        }
        
        usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
        Usuario savedUser = usuarioRepo.save(usuario);
        
        response.put("message", "¡Usuario registrado con éxito! Bienvenido a SWAPO, " + usuario.getUsername() + "!");
        response.put("userId", savedUser.getId().toString());
        response.put("username", savedUser.getUsername());
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Usuario usuario)
    {
        Optional<Usuario> userOpt = usuarioRepo.findByEmailOrUsername(usuario.getEmail(), usuario.getEmail());
        
        Map<String, Object> response = new HashMap<>();

        if (userOpt.isPresent() && passwordEncoder.matches(usuario.getPassword(), userOpt.get().getPassword()))
        {
            response.put("message", "¡Bienvenido a SWAPO, " + userOpt.get().getUsername() + "!");
            response.put("userId", userOpt.get().getId());
            response.put("username", userOpt.get().getUsername());
            return ResponseEntity.ok(response);
        }
        
        response.put("error", "Email o contraseña incorrectos.");
        return ResponseEntity.badRequest().body(response);
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