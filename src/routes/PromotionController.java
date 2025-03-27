package vn.hstore.jobhunter.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import vn.hstore.jobhunter.domain.Promotion;
import vn.hstore.jobhunter.domain.SubscriptionPackage;
import vn.hstore.jobhunter.dto.PromotionDTO;
import vn.hstore.jobhunter.repository.PromotionRepository;
import vn.hstore.jobhunter.repository.SubscriptionPackageRepository;

@RestController
@RequestMapping("/api/v1/promotions")
public class PromotionController {

    @Autowired
    private PromotionRepository promotionRepository;

    @Autowired
    private SubscriptionPackageRepository subscriptionPackageRepository;

    @GetMapping
    public ResponseEntity<?> getAllPromotions() {
        try {
            List<Promotion> promotions = promotionRepository.findAll();
            return ResponseEntity.ok(Map.of(
                    "data", promotions,
                    "success", true
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Lỗi khi lấy danh sách ưu đãi: " + e.getMessage(),
                    "success", false
            ));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getPromotionById(@PathVariable Long id) {
        try {
            Promotion promotion = promotionRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy ưu đãi"));
            return ResponseEntity.ok(Map.of(
                    "data", promotion,
                    "success", true
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Lỗi khi lấy thông tin ưu đãi: " + e.getMessage(),
                    "success", false
            ));
        }
    }

    @PostMapping
    public ResponseEntity<?> createPromotion(@RequestBody PromotionDTO promotionDTO) {
        try {
            SubscriptionPackage subscriptionPackage = subscriptionPackageRepository
                    .findById(promotionDTO.getSubscriptionPackageId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy gói VIP"));

            Promotion promotion = new Promotion();
            promotion.setName(promotionDTO.getName());
            promotion.setDescription(promotionDTO.getDescription());
            promotion.setDiscountPercentage(promotionDTO.getDiscountPercentage());
            promotion.setStartDate(promotionDTO.getStartDate());
            promotion.setEndDate(promotionDTO.getEndDate());
            promotion.setActive(promotionDTO.isActive());
            promotion.setCode(promotionDTO.getCode());
            promotion.setSubscriptionPackage(subscriptionPackage);
            promotion.setCreatedAt(LocalDateTime.now());
            promotion.setUpdatedAt(LocalDateTime.now());

            Promotion savedPromotion = promotionRepository.save(promotion);
            return ResponseEntity.ok(Map.of(
                    "data", savedPromotion,
                    "success", true
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Lỗi khi tạo ưu đãi: " + e.getMessage(),
                    "success", false
            ));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updatePromotion(@PathVariable Long id, @RequestBody PromotionDTO promotionDTO) {
        try {
            Promotion promotion = promotionRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy ưu đãi"));

            if (promotionDTO.getSubscriptionPackageId() != null) {
                SubscriptionPackage subscriptionPackage = subscriptionPackageRepository
                        .findById(promotionDTO.getSubscriptionPackageId())
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy gói VIP"));
                promotion.setSubscriptionPackage(subscriptionPackage);
            }

            promotion.setName(promotionDTO.getName());
            promotion.setDescription(promotionDTO.getDescription());    
            promotion.setDiscountPercentage(promotionDTO.getDiscountPercentage());
            promotion.setStartDate(promotionDTO.getStartDate());
            promotion.setEndDate(promotionDTO.getEndDate());
            promotion.setActive(promotionDTO.isActive());
            promotion.setCode(promotionDTO.getCode());
            promotion.setUpdatedAt(LocalDateTime.now());

            Promotion updatedPromotion = promotionRepository.save(promotion);
            return ResponseEntity.ok(Map.of(
                    "data", updatedPromotion,
                    "success", true
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Lỗi khi cập nhật ưu đãi: " + e.getMessage(),
                    "success", false
            ));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePromotion(@PathVariable Long id) {
        try {
            Promotion promotion = promotionRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy ưu đãi"));
            promotionRepository.delete(promotion);
            return ResponseEntity.ok(Map.of(
                    "message", "Xóa ưu đãi thành công",
                    "success", true
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Lỗi khi xóa ưu đãi: " + e.getMessage(),
                    "success", false
            ));
        }
    }

    @GetMapping("/package/{packageId}")
    public ResponseEntity<?> getPromotionsByPackage(@PathVariable Long packageId) {
        try {
            List<Promotion> promotions = promotionRepository.findBySubscriptionPackageId(packageId);
            return ResponseEntity.ok(Map.of(
                    "data", promotions,
                    "success", true
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Lỗi khi lấy danh sách ưu đãi của gói: " + e.getMessage(),
                    "success", false
            ));
        }
    }

    @GetMapping("/active")
    public ResponseEntity<?> getActivePromotions() {
        try {
            LocalDateTime now = LocalDateTime.now();
            List<Promotion> promotions = promotionRepository.findByIsActiveTrueAndStartDateBeforeAndEndDateAfter(now, now);
            return ResponseEntity.ok(Map.of(
                    "data", promotions,
                    "success", true
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Lỗi khi lấy danh sách ưu đãi đang hoạt động: " + e.getMessage(),
                    "success", false
            ));
        }
    }
} 