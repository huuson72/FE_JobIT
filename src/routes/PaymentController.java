package vn.hstore.jobhunter.controller;

import vn.hstore.jobhunter.dto.PaymentRequestDTO;
import vn.hstore.jobhunter.domain.Transaction;
import vn.hstore.jobhunter.domain.User;
import vn.hstore.jobhunter.repository.TransactionRepository;
import vn.hstore.jobhunter.service.VNPayService;
import vn.hstore.jobhunter.util.SecurityUtil;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/payments")
public class PaymentController {

    @Autowired
    private VNPayService vnPayService;
    
    @Autowired
    private TransactionRepository transactionRepository;

    @PostMapping("/create")
    public ResponseEntity<?> createPayment(@RequestBody PaymentRequestDTO paymentRequest) {
        try {
            String paymentUrl = vnPayService.createPaymentUrl(paymentRequest);
            return ResponseEntity.ok().body(paymentUrl);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error creating payment: " + e.getMessage());
        }
    }

    @GetMapping("/vnpay-callback")
    public ResponseEntity<?> vnPayCallback(@RequestParam Map<String, String> queryParams) {
        try {
            boolean isValid = vnPayService.validateResponse(queryParams);
            if (isValid) {
                vnPayService.handlePaymentCallback(queryParams);
                String responseCode = queryParams.get("vnp_ResponseCode");
                if ("00".equals(responseCode)) {
                    // Payment successful
                    return ResponseEntity.ok().body("Payment successful");
                } else {
                    // Payment failed
                    return ResponseEntity.badRequest().body("Payment failed");
                }
            } else {
                return ResponseEntity.badRequest().body("Invalid signature");
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error processing callback: " + e.getMessage());
        }
    }
    @GetMapping("/status/{orderId}")
    public ResponseEntity<?> getTransactionStatus(@PathVariable String orderId) {
        try {
            Transaction transaction = transactionRepository.findByOrderId(orderId);
            if (transaction != null) {
                return ResponseEntity.ok().body(Map.of(
                    "data", transaction,
                    "success", true
                ));
            } else {
                return ResponseEntity.badRequest().body(Map.of(
                    "message", "Không tìm thấy giao dịch với mã " + orderId,
                    "success", false
                ));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "message", "Lỗi khi kiểm tra giao dịch: " + e.getMessage(),
                "success", false
            ));
        }
    }
  

} 