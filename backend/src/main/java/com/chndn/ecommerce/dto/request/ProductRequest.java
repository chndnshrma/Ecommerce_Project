package com.chndn.ecommerce.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;

public record ProductRequest(
    String keyword,
    String categorySlug,
    BigDecimal minPrice,
    BigDecimal maxPrice,
    int page,
    int size
) {
    public ProductRequest {
        if (page < 0) page = 0;
        if (size <= 0 || size > 100) size = 20;
    }

    public record AdminCreate(
        @NotBlank String name,
        @NotBlank String slug,
        String description,
        String brand,
        @NotNull @PositiveOrZero BigDecimal basePrice,
        @NotBlank String categorySlug,
        @NotBlank String variantSku,
        String variantSize,
        String variantColor,
        BigDecimal variantPrice,
        @NotNull @PositiveOrZero Integer initialStock
    ) {}
    public record AdminUpdate(
        String name,
        String description,
        String brand,
        BigDecimal basePrice,
        Boolean isActive
    ) {}
}