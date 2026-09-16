package com.chndn.ecommerce.dto.request;

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
}