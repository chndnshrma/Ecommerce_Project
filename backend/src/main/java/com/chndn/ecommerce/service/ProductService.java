package com.chndn.ecommerce.service;

import com.chndn.ecommerce.dto.request.ProductRequest;
import com.chndn.ecommerce.dto.response.ProductResponse;
import com.chndn.ecommerce.entity.Category;
import com.chndn.ecommerce.entity.Inventory;
import com.chndn.ecommerce.entity.Product;
import com.chndn.ecommerce.entity.ProductVariant;
import com.chndn.ecommerce.exception.ResourceNotFoundException;
import com.chndn.ecommerce.repository.CategoryRepository;
import com.chndn.ecommerce.repository.ProductRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

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

    @Transactional
    public ProductResponse createProduct(ProductRequest.AdminCreate request) {
        Category category = categoryRepository.findBySlug(request.categorySlug())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + request.categorySlug()));

        Product product = Product.builder()
                .name(request.name())
                .slug(request.slug())
                .description(request.description())
                .brand(request.brand())
                .basePrice(request.basePrice())
                .isActive(true)
                .category(category)
                .build();

        ProductVariant variant = ProductVariant.builder()
                .product(product)
                .sku(request.variantSku())
                .size(request.variantSize())
                .color(request.variantColor())
                .price(request.variantPrice())
                .build();

        Inventory inventory = Inventory.builder()
                .variant(variant)
                .quantityAvailable(request.initialStock())
                .quantityReserved(0)
                .build();

        variant.setInventory(inventory);
        product.getVariants().add(variant);

        Product saved = productRepository.save(product);
        return toResponse(saved);
    }

    @Transactional
    public ProductResponse updateProduct(UUID productId, ProductRequest.AdminUpdate request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + productId));

        if (request.name() != null) product.setName(request.name());
        if (request.description() != null) product.setDescription(request.description());
        if (request.brand() != null) product.setBrand(request.brand());
        if (request.basePrice() != null) product.setBasePrice(request.basePrice());
        if (request.isActive() != null) product.setActive(request.isActive());

        Product saved = productRepository.save(product);
        return toResponse(saved);
    }

    @Transactional
    public void deactivateProduct(UUID productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + productId));
        product.setActive(false);
        productRepository.save(product);
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