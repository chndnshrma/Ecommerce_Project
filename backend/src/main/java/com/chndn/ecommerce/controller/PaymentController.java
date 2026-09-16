package com.chndn.ecommerce.controller;

import com.chndn.ecommerce.dto.request.PaymentRequest;
import com.chndn.ecommerce.dto.response.PaymentOrderResponse;
import com.chndn.ecommerce.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/{orderId}/create")
    public PaymentOrderResponse createPaymentOrder(@PathVariable UUID orderId) throws Exception {
        return paymentService.createPaymentOrder(orderId);
    }

    @PostMapping("/{orderId}/verify")
    public void verifyPayment(
            @PathVariable UUID orderId,
            @Valid @RequestBody PaymentRequest.VerifyPayment request
    ) throws Exception {
        paymentService.verifyAndConfirmPayment(orderId, request);
    }
}