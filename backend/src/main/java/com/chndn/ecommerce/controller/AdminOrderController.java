package com.chndn.ecommerce.controller;

import com.chndn.ecommerce.dto.response.OrderResponse;
import com.chndn.ecommerce.entity.Order;
import com.chndn.ecommerce.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
public class AdminOrderController {

    private final OrderRepository orderRepository;

    @GetMapping
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc().stream()
            .map(this::toResponse)
            .toList();
    }

    private OrderResponse toResponse(Order order) {
        List<OrderResponse.Item> items = order.getItems().stream()
            .map(item -> new OrderResponse.Item(
                item.getVariant().getProduct().getName(),
                item.getVariant().getSku(),
                item.getVariant().getSize(),
                item.getVariant().getColor(),
                item.getQuantity(),
                item.getUnitPriceAtPurchase(),
                item.getUnitPriceAtPurchase().multiply(BigDecimal.valueOf(item.getQuantity()))
            ))
            .toList();

        return new OrderResponse(
            order.getId().toString(),
            order.getStatus().name(),
            items,
            order.getTotalAmount(),
            order.getShippingAddress(),
            order.getCreatedAt()
        );
    }
}