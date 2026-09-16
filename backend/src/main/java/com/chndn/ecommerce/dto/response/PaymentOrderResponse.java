package com.chndn.ecommerce.dto.response;

public record PaymentOrderResponse(
        String razorpayOrderId,
        String amount,
        String currency,
        String internalOrderId
) {}