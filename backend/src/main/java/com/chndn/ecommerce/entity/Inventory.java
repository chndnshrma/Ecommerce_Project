package com.chndn.ecommerce.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "inventory")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Inventory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variant_id", nullable = false, unique = true)
    private ProductVariant variant;

    @PositiveOrZero
    @Column(name = "quantity_available", nullable = false)
    @Builder.Default
    private Integer quantityAvailable = 0;

    @PositiveOrZero
    @Column(name = "quantity_reserved", nullable = false)
    @Builder.Default
    private Integer quantityReserved = 0;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @PreUpdate
    @PrePersist
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }
}