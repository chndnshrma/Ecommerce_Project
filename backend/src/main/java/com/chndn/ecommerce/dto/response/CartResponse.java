package com.chndn.ecommerce.dto.response;

import java.math.BigDecimal;
import java.util.List;

public record CartResponse(
        String cartId,
        List<Item> items,
        BigDecimal totalAmount
) {
    public record Item(
            String cartItemId,
            String variantId,
            String productName,
            String sku,
            String size,
            String color,
            Integer quantity,
            BigDecimal unitPrice,
            BigDecimal lineTotal,
            Integer stockAvailable
    ) {}
}