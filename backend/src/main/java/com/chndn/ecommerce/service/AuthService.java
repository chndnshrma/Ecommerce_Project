package com.chndn.ecommerce.service;

import com.chndn.ecommerce.dto.request.AuthRequest;
import com.chndn.ecommerce.dto.response.AuthResponse;
import com.chndn.ecommerce.entity.User;
import com.chndn.ecommerce.exception.DuplicateEmailException;
import com.chndn.ecommerce.exception.ResourceNotFoundException;
import com.chndn.ecommerce.repository.UserRepository;
import com.chndn.ecommerce.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthResponse register(AuthRequest.Register request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new DuplicateEmailException("Email already registered: " + request.email());
        }

        User user = User.builder()
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .fullName(request.fullName())
                .phone(request.phone())
                .role(User.Role.CUSTOMER)
                .build();

        User saved = userRepository.save(user);
        String token = jwtUtil.generateToken(saved.getEmail(), saved.getId().toString(), saved.getRole().name());

        return new AuthResponse(token, saved.getId().toString(), saved.getEmail(), saved.getFullName(), saved.getRole().name());
    }

    public AuthResponse login(AuthRequest.Login request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getId().toString(), user.getRole().name());

        return new AuthResponse(token, user.getId().toString(), user.getEmail(), user.getFullName(), user.getRole().name());
    }
}