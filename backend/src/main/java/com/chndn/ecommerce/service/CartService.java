package com.chndn.ecommerce.service;

import com.chndn.ecommerce.dto.request.CartRequest;
import com.chndn.ecommerce.dto.response.CartResponse;
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
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductVariantRepository variantRepository;
    private final UserRepository userRepository;

    @Transactional
    public CartResponse addItem(UUID userId, CartRequest.AddItem request) {
        Cart cart = getOrCreateCart(userId);
        UUID variantId = UUID.fromString(request.variantId());

        ProductVariant variant = variantRepository.findById(variantId)
                .orElseThrow(() -> new ResourceNotFoundException("Variant not found: " + variantId));

        int availableStock = getAvailableStock(variant);
        var existingItem = cartItemRepository.findByCartIdAndVariantId(cart.getId(), variantId);
        int requestedTotalQty = request.quantity() + existingItem.map(CartItem::getQuantity).orElse(0);

        if (requestedTotalQty > availableStock) {
            throw new InsufficientStockException(
                    "Only " + availableStock + " units available for SKU " + variant.getSku());
        }

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            item.setQuantity(requestedTotalQty);
            cartItemRepository.save(item);
        } else {
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .variant(variant)
                    .quantity(request.quantity())
                    .build();
            cartItemRepository.save(newItem);
        }

        return getCart(userId);
    }

    @Transactional
    public CartResponse updateItem(UUID userId, UUID cartItemId, CartRequest.UpdateItem request) {
        Cart cart = getOrCreateCart(userId);
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found: " + cartItemId));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new InvalidCartOperationException("This item does not belong to your cart");
        }

        int availableStock = getAvailableStock(item.getVariant());
        if (request.quantity() > availableStock) {
            throw new InsufficientStockException(
                    "Only " + availableStock + " units available for SKU " + item.getVariant().getSku());
        }

        item.setQuantity(request.quantity());
        cartItemRepository.save(item);
        return getCart(userId);
    }

    @Transactional
    public CartResponse removeItem(UUID userId, UUID cartItemId) {
        Cart cart = getOrCreateCart(userId);
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found: " + cartItemId));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new InvalidCartOperationException("This item does not belong to your cart");
        }

        cartItemRepository.delete(item);
        return getCart(userId);
    }

    public CartResponse getCart(UUID userId) {
        return toResponse(getOrCreateCart(userId));
    }

    private Cart getOrCreateCart(UUID userId) {
        return cartRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
                    return cartRepository.save(Cart.builder().user(user).build());
                });
    }

    private int getAvailableStock(ProductVariant variant) {
        Inventory inv = variant.getInventory();
        return inv == null ? 0 : inv.getQuantityAvailable() - inv.getQuantityReserved();
    }

    private CartResponse toResponse(Cart cart) {
        List<CartResponse.Item> items = cart.getItems().stream().map(this::toItem).toList();
        BigDecimal total = items.stream()
                .map(CartResponse.Item::lineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return new CartResponse(cart.getId().toString(), items, total);
    }

    private CartResponse.Item toItem(CartItem item) {
        ProductVariant variant = item.getVariant();
        BigDecimal unitPrice = variant.getPrice() != null ? variant.getPrice() : variant.getProduct().getBasePrice();
        BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(item.getQuantity()));

        return new CartResponse.Item(
                item.getId().toString(),
                variant.getId().toString(),
                variant.getProduct().getName(),
                variant.getSku(),
                variant.getSize(),
                variant.getColor(),
                item.getQuantity(),
                unitPrice,
                lineTotal,
                getAvailableStock(variant)
        );
    }
}