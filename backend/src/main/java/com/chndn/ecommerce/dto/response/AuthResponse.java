package com.chndn.ecommerce.dto.response;

public record AuthResponse(
        String token,
        String userId,
        String email,
        String fullName,
        String role
) {}