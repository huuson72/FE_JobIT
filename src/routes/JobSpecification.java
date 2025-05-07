package vn.hstore.jobhunter.util;

import org.springframework.data.jpa.domain.Specification;

import vn.hstore.jobhunter.domain.Job;
import vn.hstore.jobhunter.util.constant.LevelEnum;
import vn.hstore.jobhunter.util.constant.LocationEnum;

public class JobSpecification {

    public static Specification<Job> hasLevel(LevelEnum level) {
        return (root, query, criteriaBuilder)
                -> level == null ? criteriaBuilder.conjunction() : criteriaBuilder.equal(root.get("level"), level);
    }

    public static Specification<Job> hasLocation(String location) {
        return (root, query, criteriaBuilder) -> {
            if (location == null || location.trim().isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            
            // Nếu location là "Others", tìm các job không phải ở HN, HCM, ĐN
            if (location.equalsIgnoreCase("Others")) {
                return criteriaBuilder.and(
                    criteriaBuilder.not(criteriaBuilder.like(criteriaBuilder.lower(root.get("location")), "%" + LocationEnum.HA_NOI.getDisplayName().toLowerCase() + "%")),
                    criteriaBuilder.not(criteriaBuilder.like(criteriaBuilder.lower(root.get("location")), "%" + LocationEnum.HO_CHI_MINH.getDisplayName().toLowerCase() + "%")),
                    criteriaBuilder.not(criteriaBuilder.like(criteriaBuilder.lower(root.get("location")), "%" + LocationEnum.DA_NANG.getDisplayName().toLowerCase() + "%"))
                );
            }
            
            // Kiểm tra xem location có phải là một tỉnh thành hợp lệ không
            LocationEnum locationEnum = LocationEnum.fromDisplayName(location);
            if (locationEnum != null) {
                return criteriaBuilder.like(criteriaBuilder.lower(root.get("location")), 
                    "%" + locationEnum.getDisplayName().toLowerCase() + "%");
            }
            
            // Nếu không phải là tỉnh thành hợp lệ, tìm kiếm theo từ khóa
            return criteriaBuilder.like(criteriaBuilder.lower(root.get("location")), 
                "%" + location.toLowerCase() + "%");
        };
    }

    public static Specification<Job> hasSalaryBetween(Double minSalary, Double maxSalary) {
        return (root, query, criteriaBuilder) -> {
            if (minSalary == null && maxSalary == null) {
                return criteriaBuilder.conjunction();
            }

            if (minSalary != null && maxSalary != null) {
                return criteriaBuilder.between(root.get("salary"), minSalary, maxSalary);
            }

            return minSalary != null
                    ? criteriaBuilder.greaterThanOrEqualTo(root.get("salary"), minSalary)
                    : criteriaBuilder.lessThanOrEqualTo(root.get("salary"), maxSalary);
        };
    }

}
