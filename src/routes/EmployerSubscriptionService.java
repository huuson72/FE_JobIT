package vn.hstore.jobhunter.service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import vn.hstore.jobhunter.domain.Company;
import vn.hstore.jobhunter.domain.EmployerSubscription;
import vn.hstore.jobhunter.domain.JobPostingUsage;
import vn.hstore.jobhunter.domain.SubscriptionPackage;
import vn.hstore.jobhunter.domain.User;
import vn.hstore.jobhunter.repository.CompanyRepository;
import vn.hstore.jobhunter.repository.EmployerSubscriptionRepository;
import vn.hstore.jobhunter.repository.JobPostingUsageRepository;
import vn.hstore.jobhunter.repository.SubscriptionPackageRepository;
import vn.hstore.jobhunter.repository.UserRepository;
import vn.hstore.jobhunter.service.PromotionService.DiscountResult;
import vn.hstore.jobhunter.util.constant.VerificationStatus;

@Service
public class EmployerSubscriptionService {

    @Autowired
    private EmployerSubscriptionRepository employerSubscriptionRepository;

    @Autowired
    private JobPostingUsageRepository jobPostingUsageRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private SubscriptionPackageRepository subscriptionPackageRepository;

    @Autowired
    private PromotionService promotionService;

    @Transactional
    public EmployerSubscription purchaseSubscription(
            Long userId, 
            Long companyId, 
            Long packageId,
            String paymentMethod) {
        
        // Kiểm tra user tồn tại
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        // Kiểm tra trạng thái xác minh (bỏ qua nếu là admin)
        if ((user.getVerificationStatus() == null || 
            user.getVerificationStatus() != VerificationStatus.VERIFIED) && 
            (user.getRole() == null || !user.getRole().getName().equals("SUPER_ADMIN"))) {
            throw new RuntimeException("Tài khoản của bạn chưa được xác minh. Vui lòng đợi admin phê duyệt.");
        }

        // Kiểm tra công ty tồn tại
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy công ty"));
        
        // Kiểm tra gói VIP tồn tại
        SubscriptionPackage subscriptionPackage = subscriptionPackageRepository.findById(packageId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy gói VIP"));

        // Tính toán giá sau khi áp dụng ưu đãi
        DiscountResult discountResult = promotionService.calculateDiscountedPrice(packageId);

        // Tạo subscription mới
        EmployerSubscription subscription = new EmployerSubscription();
        subscription.setUser(user);
        subscription.setCompany(company);
        subscription.setSubscriptionPackage(subscriptionPackage);
        subscription.setStartDate(Instant.now());
        subscription.setEndDate(Instant.now().plusSeconds(subscriptionPackage.getDurationDays() * 24 * 60 * 60));
        subscription.setPaymentMethod(paymentMethod);
        subscription.setAmount(discountResult.getFinalPrice());
        subscription.setOriginalAmount(discountResult.getOriginalPrice());
        subscription.setDiscountPercentage(discountResult.getDiscountPercentage());
        subscription.setStatus("ACTIVE");
        subscription.setRemainingPosts(subscriptionPackage.getJobPostLimit());

        return employerSubscriptionRepository.save(subscription);
    }
    
    /**
     * Kiểm tra và cập nhật số lượt đăng tin còn lại khi người dùng đăng tin mới
     */
    @Transactional
    public Map<String, Object> checkAndUpdateJobPostingQuota(Long userId, Long companyId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy công ty"));
        
        Map<String, Object> result = new HashMap<>();
        result.put("canPost", false);
        result.put("message", "");
        
        // Kiểm tra quota miễn phí hàng ngày
        LocalDate today = LocalDate.now();
        Optional<JobPostingUsage> usageOpt = jobPostingUsageRepository.findByUserAndCompanyAndPostingDate(
                user, company, today);
        
        JobPostingUsage usage;
        if (usageOpt.isPresent()) {
            usage = usageOpt.get();
            // Nếu chưa dùng hết quota miễn phí
            if (usage.getUsedCount() < usage.getFreeLimit()) {
                usage.setUsedCount(usage.getUsedCount() + 1);
                jobPostingUsageRepository.save(usage);
                
                result.put("canPost", true);
                result.put("message", "Sử dụng lượt đăng miễn phí. Còn lại " + 
                            (usage.getFreeLimit() - usage.getUsedCount()) + "/" + usage.getFreeLimit() + " lượt miễn phí hôm nay.");
                return result;
            }
        } else {
            // Tạo bản ghi mới theo dõi sử dụng hằng ngày
            usage = new JobPostingUsage();
            usage.setUser(user);
            usage.setCompany(company);
            usage.setPostingDate(today);
            usage.setUsedCount(1); // Đã sử dụng 1 lượt
            jobPostingUsageRepository.save(usage);
            
            result.put("canPost", true);
            result.put("message", "Sử dụng lượt đăng miễn phí. Còn lại " + 
                        (usage.getFreeLimit() - usage.getUsedCount()) + "/" + usage.getFreeLimit() + " lượt miễn phí hôm nay.");
            return result;
        }
        
        // Nếu đã hết quota miễn phí, kiểm tra gói VIP
        Instant now = Instant.now();
        List<EmployerSubscription> activeSubscriptions = employerSubscriptionRepository
                .findByUserIdAndStatusAndEndDateAfter(userId, "ACTIVE", now);
        
        if (activeSubscriptions.isEmpty()) {
            result.put("message", "Bạn đã hết lượt đăng miễn phí hôm nay. Vui lòng mua gói VIP để đăng thêm.");
            return result;
        }
        
        // Ưu tiên sử dụng gói sắp hết hạn trước
        for (EmployerSubscription subscription : activeSubscriptions) {
            if (subscription.getRemainingPosts() > 0) {
                subscription.setRemainingPosts(subscription.getRemainingPosts() - 1);
                employerSubscriptionRepository.save(subscription);
                
                result.put("canPost", true);
                result.put("message", "Sử dụng lượt đăng từ gói " + subscription.getSubscriptionPackage().getName() + 
                            ". Còn lại " + subscription.getRemainingPosts() + " lượt.");
                return result;
            }
        }
        
        result.put("message", "Bạn đã hết lượt đăng tin từ tất cả các gói đăng ký. Vui lòng mua thêm gói VIP.");
        return result;
    }
    
    public Integer getTotalRemainingPostsByUserId(Long userId) {
        return employerSubscriptionRepository.getTotalRemainingPostsByUserId(userId, Instant.now());
    }
    
    public List<EmployerSubscription> getActiveSubscriptionsByUserId(Long userId) {
        return employerSubscriptionRepository.findByUserIdAndStatusAndEndDateAfter(
                userId, "ACTIVE", Instant.now());
    }
    
    public Map<String, Object> getEmployerSubscriptionStatus(Long userId, Long companyId) {
        List<EmployerSubscription> activeSubscriptions = getActiveSubscriptionsByUserId(userId);
        
        boolean hasActiveSubscription = activeSubscriptions.stream()
                .anyMatch(sub -> sub.getCompany().getId().equals(companyId));
        
        int remainingJobPosts = 0;
        if (hasActiveSubscription) {
            EmployerSubscription subscription = activeSubscriptions.stream()
                    .filter(sub -> sub.getCompany().getId().equals(companyId))
                    .findFirst()
                    .orElse(null);
            
            if (subscription != null) {
                remainingJobPosts = subscription.getSubscriptionPackage().getJobPostLimit();
            }
        }

        return Map.of(
                "hasActiveSubscription", hasActiveSubscription,
                "remainingJobPosts", remainingJobPosts
        );
    }
} 