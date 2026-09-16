package com.chndn.ecommerce.service;

import com.chndn.ecommerce.dto.request.ProductRequest;
import com.chndn.ecommerce.dto.response.ProductResponse;
import com.chndn.ecommerce.entity.Product;
import com.chndn.ecommerce.entity.ProductVariant;
import com.chndn.ecommerce.exception.ResourceNotFoundException;
import com.chndn.ecommerce.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    public Page<ProductResponse> search(ProductRequest request) {
        Page<Product> products = productRepository.search(
                request.keyword(),
                request.categorySlug(),
                request.minPrice(),
                request.maxPrice(),
                PageRequest.of(request.page(), request.size())
        );
        return products.map(this::toResponse);
    }

    public ProductResponse getBySlug(String slug) {
        Product product = productRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + slug));
        return toResponse(product);
    }

    private ProductResponse toResponse(Product product) {
        List<ProductResponse.Variant> variants = product.getVariants().stream()
                .map(v -> toVariant(v, product.getBasePrice()))
                .toList();

        return new ProductResponse(
                product.getId().toString(),
                product.getName(),
                product.getSlug(),
                product.getDescription(),
                product.getBrand(),
                product.getBasePrice(),
                product.getCategory().getName(),
                variants
        );
    }

    private ProductResponse.Variant toVariant(ProductVariant variant, BigDecimal basePrice) {
        BigDecimal effectivePrice = variant.getPrice() != null ? variant.getPrice() : basePrice;
        Integer stock = variant.getInventory() != null
                ? variant.getInventory().getQuantityAvailable() - variant.getInventory().getQuantityReserved()
                : 0;

        return new ProductResponse.Variant(
                variant.getId().toString(),
                variant.getSku(),
                variant.getSize(),
                variant.getColor(),
                effectivePrice,
                variant.getImageUrl(),
                stock
        );
    }
}