package com.chndn.ecommerce.dto.request;

import jakarta.validation.constraints.NotBlank;

public class PaymentRequest {

    public record VerifyPayment(
            @NotBlank String razorpayOrderId,
            @NotBlank String razorpayPaymentId,
            @NotBlank String razorpaySignature
    ) {}
}