package com.chndn.ecommerce.service;

import com.chndn.ecommerce.dto.request.OrderRequest;
import com.chndn.ecommerce.dto.response.OrderResponse;
import com.chndn.ecommerce.entity.*;
import com.chndn.ecommerce.exception.InsufficientStockException;
import com.chndn.ecommerce.exception.InvalidCartOperationException;
import com.chndn.ecommerce.exception.ResourceNotFoundException;
import com.chndn.ecommerce.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final InventoryRepository inventoryRepository;
    private final UserRepository userRepository;

    @Transactional
    public OrderResponse placeOrder(UUID userId, OrderRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new InvalidCartOperationException("Cart is empty"));

        List<CartItem> cartItems = cart.getItems();
        if (cartItems.isEmpty()) {
            throw new InvalidCartOperationException("Cannot place an order with an empty cart");
        }

        for (CartItem cartItem : cartItems) {
            Inventory inventory = cartItem.getVariant().getInventory();
            int available = inventory.getQuantityAvailable() - inventory.getQuantityReserved();
            if (cartItem.getQuantity() > available) {
                throw new InsufficientStockException(
                        "Only " + available + " units available for SKU " + cartItem.getVariant().getSku());
            }
        }

        Order order = Order.builder()
                .user(user)
                .status(Order.Status.PENDING)
                .shippingAddress(request.shippingAddress())
                .totalAmount(BigDecimal.ZERO)
                .build();

        BigDecimal total = BigDecimal.ZERO;

        for (CartItem cartItem : cartItems) {
            ProductVariant variant = cartItem.getVariant();
            BigDecimal unitPrice = variant.getPrice() != null ? variant.getPrice() : variant.getProduct().getBasePrice();

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .variant(variant)
                    .quantity(cartItem.getQuantity())
                    .unitPriceAtPurchase(unitPrice)
                    .build();

            order.getItems().add(orderItem);
            total = total.add(unitPrice.multiply(BigDecimal.valueOf(cartItem.getQuantity())));

            Inventory inventory = variant.getInventory();
            inventory.setQuantityReserved(inventory.getQuantityReserved() + cartItem.getQuantity());
            inventoryRepository.save(inventory);
        }

        order.setTotalAmount(total);
        order.getStatusHistory().add(
                OrderStatusHistory.builder().order(order).status(Order.Status.PENDING).note("Order placed").build()
        );

        Order savedOrder = orderRepository.save(order);
        cartItemRepository.deleteAll(cartItems);
        cart.getItems().clear();

        return toResponse(savedOrder);
    }

    public List<OrderResponse> getOrderHistory(UUID userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId).stream().map(this::toResponse).toList();
    }

    public OrderResponse getOrder(UUID userId, UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));
        if (!order.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Order not found: " + orderId);
        }
        return toResponse(order);
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