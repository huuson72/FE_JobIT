package vn.hstore.jobhunter.controller;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.turkraft.springfilter.boot.Filter;

import jakarta.validation.Valid;
import vn.hstore.jobhunter.domain.EmployerSubscription;
import vn.hstore.jobhunter.domain.SubscriptionPackage;
import vn.hstore.jobhunter.domain.request.PurchaseSubscriptionRequest;
import vn.hstore.jobhunter.domain.response.RestResponse;
import vn.hstore.jobhunter.domain.response.ResultPaginationDTO;
import vn.hstore.jobhunter.service.EmployerSubscriptionService;
import vn.hstore.jobhunter.service.SubscriptionPackageService;
import vn.hstore.jobhunter.util.annotation.ApiMessage;

@RestController
@RequestMapping("/api/v1")
public class SubscriptionController {

    private final SubscriptionPackageService subscriptionPackageService;
    private final EmployerSubscriptionService employerSubscriptionService;

    public SubscriptionController(
            SubscriptionPackageService subscriptionPackageService,
            EmployerSubscriptionService employerSubscriptionService) {
        this.subscriptionPackageService = subscriptionPackageService;
        this.employerSubscriptionService = employerSubscriptionService;
    }

    // ========= SUBSCRIPTION PACKAGES MANAGEMENT =========
    
    @GetMapping("/packages")
    @ApiMessage("Get all active subscription packages")
    public ResponseEntity<RestResponse<List<SubscriptionPackage>>> getAllActivePackages() {
        List<SubscriptionPackage> packages = subscriptionPackageService.findAllActivePackages();
        
        RestResponse<List<SubscriptionPackage>> response = new RestResponse<>();
        response.setStatusCode(200);
        response.setError(null);
        response.setMessage("Lấy danh sách gói VIP thành công");
        response.setData(packages);
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/packages/all")
    @ApiMessage("Get all subscription packages with pagination")
    public ResponseEntity<ResultPaginationDTO> getAllPackages(
            @Filter Specification<SubscriptionPackage> spec, 
            Pageable pageable) {
        
        return ResponseEntity.ok(subscriptionPackageService.findAllPackages(spec, pageable));
    }
    
    @GetMapping("/packages/{id}")
    @ApiMessage("Get subscription package by ID")
    public ResponseEntity<RestResponse<SubscriptionPackage>> getPackageById(@PathVariable("id") Long id) {
        Optional<SubscriptionPackage> packageOpt = subscriptionPackageService.findById(id);
        
        if (!packageOpt.isPresent()) {
            RestResponse<SubscriptionPackage> errorResponse = new RestResponse<>();
            errorResponse.setStatusCode(404);
            errorResponse.setError("Not Found");
            errorResponse.setMessage("Không tìm thấy gói VIP với ID: " + id);
            errorResponse.setData(null);
            
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }
        
        RestResponse<SubscriptionPackage> response = new RestResponse<>();
        response.setStatusCode(200);
        response.setError(null);
        response.setMessage("Lấy thông tin gói VIP thành công");
        response.setData(packageOpt.get());
        
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/packages")
    @ApiMessage("Create new subscription package")
    public ResponseEntity<RestResponse<SubscriptionPackage>> createPackage(
            @Valid @RequestBody SubscriptionPackage subscriptionPackage) {
        
        SubscriptionPackage newPackage = subscriptionPackageService.createPackage(subscriptionPackage);
        
        RestResponse<SubscriptionPackage> response = new RestResponse<>();
        response.setStatusCode(201);
        response.setError(null);
        response.setMessage("Tạo gói VIP thành công");
        response.setData(newPackage);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @PutMapping("/packages/{id}")
    @ApiMessage("Update subscription package")
    public ResponseEntity<RestResponse<SubscriptionPackage>> updatePackage(
            @PathVariable("id") Long id,
            @Valid @RequestBody SubscriptionPackage subscriptionPackage) {
        
        // Ensure the ID matches
        subscriptionPackage.setId(id);
        
        SubscriptionPackage updatedPackage = subscriptionPackageService.updatePackage(subscriptionPackage);
        
        if (updatedPackage == null) {
            RestResponse<SubscriptionPackage> errorResponse = new RestResponse<>();
            errorResponse.setStatusCode(404);
            errorResponse.setError("Not Found");
            errorResponse.setMessage("Không tìm thấy gói VIP với ID: " + id);
            errorResponse.setData(null);
            
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }
        
        RestResponse<SubscriptionPackage> response = new RestResponse<>();
        response.setStatusCode(200);
        response.setError(null);
        response.setMessage("Cập nhật gói VIP thành công");
        response.setData(updatedPackage);
        
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/packages/{id}")
    @ApiMessage("Delete subscription package")
    public ResponseEntity<RestResponse<Void>> deletePackage(@PathVariable("id") Long id) {
        Optional<SubscriptionPackage> packageOpt = subscriptionPackageService.findById(id);
        
        if (!packageOpt.isPresent()) {
            RestResponse<Void> errorResponse = new RestResponse<>();
            errorResponse.setStatusCode(404);
            errorResponse.setError("Not Found");
            errorResponse.setMessage("Không tìm thấy gói VIP với ID: " + id);
            errorResponse.setData(null);
            
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }
        
        subscriptionPackageService.deletePackage(id);
        
        RestResponse<Void> response = new RestResponse<>();
        response.setStatusCode(200);
        response.setError(null);
        response.setMessage("Xóa gói VIP thành công");
        response.setData(null);
        
        return ResponseEntity.ok(response);
    }
    
    // ========= EMPLOYER SUBSCRIPTION MANAGEMENT =========
    
    @PostMapping("/employer/subscribe")
    @ApiMessage("Purchase a subscription package")
    public ResponseEntity<RestResponse<EmployerSubscription>> purchaseSubscription(
            @Valid @RequestBody PurchaseSubscriptionRequest request) {
        
        try {
            EmployerSubscription subscription = employerSubscriptionService.purchaseSubscription(
                    request.getUserId(), 
                    request.getCompanyId(), 
                    request.getPackageId(),
                    request.getPaymentMethod());
            
            RestResponse<EmployerSubscription> response = new RestResponse<>();
            response.setStatusCode(201);
            response.setError(null);
            response.setMessage("Đăng ký gói VIP thành công");
            response.setData(subscription);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            RestResponse<EmployerSubscription> errorResponse = new RestResponse<>();
            errorResponse.setStatusCode(400);
            errorResponse.setError("Bad Request");
            errorResponse.setMessage(e.getMessage());
            errorResponse.setData(null);
            
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }
    
    @GetMapping("/employer/{userId}/subscriptions")
    @ApiMessage("Get active subscriptions for an employer")
    public ResponseEntity<RestResponse<List<EmployerSubscription>>> getActiveSubscriptions(
            @PathVariable("userId") Long userId) {
        
        List<EmployerSubscription> subscriptions = employerSubscriptionService
                .getActiveSubscriptionsByUserId(userId);
        
        RestResponse<List<EmployerSubscription>> response = new RestResponse<>();
        response.setStatusCode(200);
        response.setError(null);
        response.setMessage("Lấy danh sách gói VIP đang hoạt động thành công");
        response.setData(subscriptions);
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/employer/{userId}/company/{companyId}/status")
    @ApiMessage("Get subscription status for an employer")
    public ResponseEntity<RestResponse<Map<String, Object>>> getSubscriptionStatus(
            @PathVariable("userId") Long userId,
            @PathVariable("companyId") Long companyId) {
        
        Map<String, Object> status = employerSubscriptionService
                .getEmployerSubscriptionStatus(userId, companyId);
        
        RestResponse<Map<String, Object>> response = new RestResponse<>();
        response.setStatusCode(200);
        response.setError(null);
        response.setMessage("Lấy thông tin trạng thái đăng tin thành công");
        response.setData(status);
        
        return ResponseEntity.ok(response);
    }
} 