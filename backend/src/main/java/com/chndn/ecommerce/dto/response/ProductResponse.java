package com.chndn.ecommerce.dto.response;

import java.math.BigDecimal;
import java.util.List;

public record ProductResponse(
        String id,
        String name,
        String slug,
        String description,
        String brand,
        BigDecimal basePrice,
        String categoryName,
        List<Variant> variants
) {
    public record Variant(
            String id,
            String sku,
            String size,
            String color,
            BigDecimal effectivePrice,
            String imageUrl,
            Integer stockAvailable
    ) {}
}