package com.chndn.ecommerce.controller;

import com.chndn.ecommerce.dto.request.AuthRequest;
import com.chndn.ecommerce.dto.response.AuthResponse;
import com.chndn.ecommerce.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody AuthRequest.Register request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody AuthRequest.Login request) {
        return authService.login(request);
    }
}