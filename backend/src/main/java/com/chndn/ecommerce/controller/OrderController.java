package com.chndn.ecommerce.controller;

import com.chndn.ecommerce.dto.request.OrderRequest;
import com.chndn.ecommerce.dto.response.OrderResponse;
import com.chndn.ecommerce.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/{userId}")
    public OrderResponse placeOrder(@PathVariable UUID userId, @Valid @RequestBody OrderRequest request) {
        return orderService.placeOrder(userId, request);
    }

    @GetMapping("/{userId}")
    public List<OrderResponse> getOrderHistory(@PathVariable UUID userId) {
        return orderService.getOrderHistory(userId);
    }

    @GetMapping("/{userId}/{orderId}")
    public OrderResponse getOrder(@PathVariable UUID userId, @PathVariable UUID orderId) {
        return orderService.getOrder(userId, orderId);
    }
}