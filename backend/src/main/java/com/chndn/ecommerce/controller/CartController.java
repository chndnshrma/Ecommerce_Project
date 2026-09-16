package com.chndn.ecommerce.controller;

import com.chndn.ecommerce.dto.request.CartRequest;
import com.chndn.ecommerce.dto.response.CartResponse;
import com.chndn.ecommerce.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping("/{userId}")
    public CartResponse getCart(@PathVariable UUID userId) {
        return cartService.getCart(userId);
    }

    @PostMapping("/{userId}/items")
    public CartResponse addItem(@PathVariable UUID userId, @Valid @RequestBody CartRequest.AddItem request) {
        return cartService.addItem(userId, request);
    }

    @PutMapping("/{userId}/items/{itemId}")
    public CartResponse updateItem(
            @PathVariable UUID userId,
            @PathVariable UUID itemId,
            @Valid @RequestBody CartRequest.UpdateItem request
    ) {
        return cartService.updateItem(userId, itemId, request);
    }

    @DeleteMapping("/{userId}/items/{itemId}")
    public CartResponse removeItem(@PathVariable UUID userId, @PathVariable UUID itemId) {
        return cartService.removeItem(userId, itemId);
    }
}