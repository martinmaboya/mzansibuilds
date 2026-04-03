package com.mzansibuilds.backend.controller;

import com.mzansibuilds.backend.dto.LoginRequest;
import com.mzansibuilds.backend.dto.RegisterRequest;
import com.mzansibuilds.backend.entity.DeveloperUser;
import com.mzansibuilds.backend.security.JwtService;
import com.mzansibuilds.backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final JwtService jwtService;

    public AuthController(AuthService authService, JwtService jwtService) {
        this.authService = authService;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public Map<String, Object> register(@Valid @RequestBody RegisterRequest request) {
        DeveloperUser user = authService.register(request);
        return Map.of("status", HttpStatus.CREATED.value(), "user", user);
    }

    @PostMapping("/login")
    public Map<String, Object> login(@Valid @RequestBody LoginRequest request) {
        DeveloperUser user = authService.login(request);
        String token = jwtService.generateToken(user.getEmail());
        return Map.of("token", token, "tokenType", "Bearer", "user", user);
    }
}
