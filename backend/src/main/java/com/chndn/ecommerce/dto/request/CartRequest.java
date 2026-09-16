package com.chndn.ecommerce.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class CartRequest {

    public record AddItem(
            @NotNull String variantId,
            @Min(1) Integer quantity
    ) {}

    public record UpdateItem(
            @NotNull @Min(1) Integer quantity
    ) {}
}