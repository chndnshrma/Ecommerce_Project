package com.chndn.ecommerce.controller;

import com.chndn.ecommerce.dto.request.ProductRequest;
import com.chndn.ecommerce.dto.response.ProductResponse;
import com.chndn.ecommerce.service.ProductService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.UUID;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public Page<ProductResponse> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return productService.search(new ProductRequest(keyword, category, minPrice, maxPrice, page, size));
    }

    @GetMapping("/{slug}")
    public ProductResponse getBySlug(@PathVariable String slug) {
        return productService.getBySlug(slug);
    }
    @PostMapping
public ProductResponse create(@Valid @RequestBody ProductRequest.AdminCreate request) {
    return productService.createProduct(request);
}

@PutMapping("/{id}")
public ProductResponse update(@PathVariable UUID id, @Valid @RequestBody ProductRequest.AdminUpdate request) {
    return productService.updateProduct(id, request);
}

@DeleteMapping("/{id}")
public void delete(@PathVariable UUID id) {
    productService.deactivateProduct(id);
}
}