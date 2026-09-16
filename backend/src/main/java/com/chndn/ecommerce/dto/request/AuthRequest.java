package com.chndn.ecommerce.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AuthRequest {

    public record Register(
            @Email @NotBlank String email,
            @NotBlank @Size(min = 8) String password,
            @NotBlank String fullName,
            String phone
    ) {}

    public record Login(
            @Email @NotBlank String email,
            @NotBlank String password
    ) {}
}