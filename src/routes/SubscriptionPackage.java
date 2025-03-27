package vn.hstore.jobhunter.domain;

import java.time.Instant;
import java.math.BigDecimal;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import vn.hstore.jobhunter.util.SecurityUtil;

@Entity
@Table(name = "subscription_packages")
@Getter
@Setter
public class SubscriptionPackage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Tên gói không được để trống")
    private String name;
    
    private String description;
    
    @NotNull(message = "Giá gói không được để trống")
    private BigDecimal price;
    
    @NotNull(message = "Số ngày hiệu lực không được để trống")
    private Integer durationDays;
    
    @NotNull(message = "Số lượt đăng tin không được để trống")
    private Integer jobPostLimit;
    
    private Boolean isHighlighted = false;
    
    private Boolean isPrioritized = false;
    
    private Boolean isActive = true;
    
    private Instant createdAt;
    private Instant updatedAt;
    private String createdBy;
    private String updatedBy;

    @PrePersist
    public void handleBeforeCreate() {
        this.createdBy = SecurityUtil.getCurrentUserLogin().isPresent() 
                ? SecurityUtil.getCurrentUserLogin().get()
                : "";
        this.createdAt = Instant.now();
    }

    @PreUpdate
    public void handleBeforeUpdate() {
        this.updatedBy = SecurityUtil.getCurrentUserLogin().isPresent() 
                ? SecurityUtil.getCurrentUserLogin().get()
                : "";
        this.updatedAt = Instant.now();
    }
} 