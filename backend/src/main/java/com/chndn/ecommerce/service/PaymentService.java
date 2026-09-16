package com.chndn.ecommerce.service;

import com.chndn.ecommerce.dto.request.PaymentRequest;
import com.chndn.ecommerce.dto.response.PaymentOrderResponse;
import com.chndn.ecommerce.entity.Order;
import com.chndn.ecommerce.exception.PaymentVerificationException;
import com.chndn.ecommerce.exception.ResourceNotFoundException;
import com.chndn.ecommerce.repository.OrderRepository;
import com.razorpay.RazorpayClient;
import com.razorpay.Utils;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final RazorpayClient razorpayClient;
    private final OrderRepository orderRepository;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    @Transactional
    public PaymentOrderResponse createPaymentOrder(UUID orderId) throws Exception {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));

        if (order.getStatus() != Order.Status.PENDING) {
            throw new PaymentVerificationException("Order is not in a payable state: " + order.getStatus());
        }

        // Razorpay expects amount in the smallest currency unit (paise for INR)
        int amountInPaise = order.getTotalAmount().multiply(BigDecimal.valueOf(100)).intValue();

        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", amountInPaise);
        orderRequest.put("currency", "INR");
        orderRequest.put("receipt", order.getId().toString());

        com.razorpay.Order razorpayOrder = razorpayClient.orders.create(orderRequest);
        String razorpayOrderId = razorpayOrder.get("id");

        order.setRazorpayOrderId(razorpayOrderId);
        orderRepository.save(order);

        return new PaymentOrderResponse(
                razorpayOrderId,
                String.valueOf(amountInPaise),
                "INR",
                order.getId().toString()
        );
    }

    @Transactional
    public void verifyAndConfirmPayment(UUID orderId, PaymentRequest.VerifyPayment request) throws Exception {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));

        if (order.getStatus() == Order.Status.PAID) {
            return;
        }

        if (!order.getRazorpayOrderId().equals(request.razorpayOrderId())) {
            throw new PaymentVerificationException("Order ID mismatch — possible tampering");
        }

        JSONObject attributes = new JSONObject();
        attributes.put("razorpay_order_id", request.razorpayOrderId());
        attributes.put("razorpay_payment_id", request.razorpayPaymentId());
        attributes.put("razorpay_signature", request.razorpaySignature());

        boolean isValidSignature = Utils.verifyPaymentSignature(attributes, keySecret);

        if (!isValidSignature) {
            throw new PaymentVerificationException("Payment signature verification failed");
        }

        order.setRazorpayPaymentId(request.razorpayPaymentId());
        order.setStatus(Order.Status.PAID);
        orderRepository.save(order);
    }
}