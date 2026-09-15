package com.chndn.ecommerce.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "product_variants")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductVariant {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @NotBlank
    @Column(nullable = false, unique = true)
    private String sku;

    private String size;

    private String color;

    // Overrides product.basePrice when set; null means "use base price"
    @Column(precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "image_url")
    private String imageUrl;

    @OneToOne(mappedBy = "variant", cascade = CascadeType.ALL, orphanRemoval = true)
    private Inventory inventory;
}