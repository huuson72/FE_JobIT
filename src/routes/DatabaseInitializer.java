package vn.hstore.jobhunter.config;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import vn.hstore.jobhunter.domain.Permission;
import vn.hstore.jobhunter.domain.Role;
import vn.hstore.jobhunter.domain.User;
import vn.hstore.jobhunter.repository.PermissionRepository;
import vn.hstore.jobhunter.repository.RoleRepository;
import vn.hstore.jobhunter.repository.UserRepository;
import vn.hstore.jobhunter.util.constant.GenderEnum;

@Service
public class DatabaseInitializer implements CommandLineRunner {

    private final PermissionRepository permissionRepository;
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DatabaseInitializer(
            PermissionRepository permissionRepository,
            RoleRepository roleRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        this.permissionRepository = permissionRepository;
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        System.out.println(">>> START INIT DATABASE");
        long countPermissions = this.permissionRepository.count();
        long countRoles = this.roleRepository.count();
        long countUsers = this.userRepository.count();

        if (countPermissions == 0) {
            ArrayList<Permission> arr = new ArrayList<>();
            arr.add(new Permission("Create a company", "/api/v1/companies", "POST", "COMPANIES"));
            arr.add(new Permission("Update a company", "/api/v1/companies", "PUT", "COMPANIES"));
            arr.add(new Permission("Delete a company", "/api/v1/companies/{id}", "DELETE", "COMPANIES"));
            arr.add(new Permission("Get a company by id", "/api/v1/companies/{id}", "GET", "COMPANIES"));
            arr.add(new Permission("Get companies with pagination", "/api/v1/companies", "GET", "COMPANIES"));

            arr.add(new Permission("Create a job", "/api/v1/jobs", "POST", "JOBS"));
            arr.add(new Permission("Update a job", "/api/v1/jobs", "PUT", "JOBS"));
            arr.add(new Permission("Delete a job", "/api/v1/jobs/{id}", "DELETE", "JOBS"));
            arr.add(new Permission("Get a job by id", "/api/v1/jobs/{id}", "GET", "JOBS"));
            arr.add(new Permission("Get jobs with pagination", "/api/v1/jobs", "GET", "JOBS"));

            arr.add(new Permission("Create a permission", "/api/v1/permissions", "POST", "PERMISSIONS"));
            arr.add(new Permission("Update a permission", "/api/v1/permissions", "PUT", "PERMISSIONS"));
            arr.add(new Permission("Delete a permission", "/api/v1/permissions/{id}", "DELETE", "PERMISSIONS"));
            arr.add(new Permission("Get a permission by id", "/api/v1/permissions/{id}", "GET", "PERMISSIONS"));
            arr.add(new Permission("Get permissions with pagination", "/api/v1/permissions", "GET", "PERMISSIONS"));

            arr.add(new Permission("Create a resume", "/api/v1/resumes", "POST", "RESUMES"));
            arr.add(new Permission("Update a resume", "/api/v1/resumes", "PUT", "RESUMES"));
            arr.add(new Permission("Delete a resume", "/api/v1/resumes/{id}", "DELETE", "RESUMES"));
            arr.add(new Permission("Get a resume by id", "/api/v1/resumes/{id}", "GET", "RESUMES"));
            arr.add(new Permission("Get resumes with pagination", "/api/v1/resumes", "GET", "RESUMES"));

            arr.add(new Permission("Create a role", "/api/v1/roles", "POST", "ROLES"));
            arr.add(new Permission("Update a role", "/api/v1/roles", "PUT", "ROLES"));
            arr.add(new Permission("Delete a role", "/api/v1/roles/{id}", "DELETE", "ROLES"));
            arr.add(new Permission("Get a role by id", "/api/v1/roles/{id}", "GET", "ROLES"));
            arr.add(new Permission("Get roles with pagination", "/api/v1/roles", "GET", "ROLES"));

            arr.add(new Permission("Create a user", "/api/v1/users", "POST", "USERS"));
            arr.add(new Permission("Update a user", "/api/v1/users", "PUT", "USERS"));
            arr.add(new Permission("Delete a user", "/api/v1/users/{id}", "DELETE", "USERS"));
            arr.add(new Permission("Get a user by id", "/api/v1/users/{id}", "GET", "USERS"));
            arr.add(new Permission("Get users with pagination", "/api/v1/users", "GET", "USERS"));

            arr.add(new Permission("Create a subscriber", "/api/v1/subscribers", "POST", "SUBSCRIBERS"));
            arr.add(new Permission("Update a subscriber", "/api/v1/subscribers", "PUT", "SUBSCRIBERS"));
            arr.add(new Permission("Delete a subscriber", "/api/v1/subscribers/{id}", "DELETE", "SUBSCRIBERS"));
            arr.add(new Permission("Get a subscriber by id", "/api/v1/subscribers/{id}", "GET", "SUBSCRIBERS"));
            arr.add(new Permission("Get subscribers with pagination", "/api/v1/subscribers", "GET", "SUBSCRIBERS"));

            arr.add(new Permission("Download a file", "/api/v1/files", "POST", "FILES"));
            arr.add(new Permission("Upload a file", "/api/v1/files", "GET", "FILES"));

            // Thêm quyền cho các API gói đăng ký VIP
            arr.add(new Permission("Get all subscription packages", "/api/v1/packages", "GET", "SUBSCRIPTION_PACKAGES"));
            arr.add(new Permission("Get subscription package by id", "/api/v1/packages/{id}", "GET", "SUBSCRIPTION_PACKAGES"));
            arr.add(new Permission("Create subscription package", "/api/v1/packages", "POST", "SUBSCRIPTION_PACKAGES"));
            arr.add(new Permission("Update subscription package", "/api/v1/packages/{id}", "PUT", "SUBSCRIPTION_PACKAGES"));
            arr.add(new Permission("Delete subscription package", "/api/v1/packages/{id}", "DELETE", "SUBSCRIPTION_PACKAGES"));
            arr.add(new Permission("Get all subscription packages (admin)", "/api/v1/packages/all", "GET", "SUBSCRIPTION_PACKAGES"));

            // Thêm quyền cho các API đăng ký nhà tuyển dụng
            arr.add(new Permission("Purchase subscription", "/api/v1/employer/subscribe", "POST", "EMPLOYER_SUBSCRIPTION"));
            arr.add(new Permission("Get active subscriptions", "/api/v1/employer/{userId}/subscriptions", "GET", "EMPLOYER_SUBSCRIPTION"));
            arr.add(new Permission("Get subscription status", "/api/v1/employer/{userId}/company/{companyId}/status", "GET", "EMPLOYER_SUBSCRIPTION"));
            
            // Thêm quyền cho API thống kê công việc
            arr.add(new Permission("Get job statistics", "/api/v1/jobs/statistics", "GET", "JOB_STATISTICS"));
            arr.add(new Permission("Get total job count", "/api/v1/jobs/count", "GET", "JOB_STATISTICS"));

            // Thêm quyền cho các API thanh toán
            arr.add(new Permission("Create payment", "/api/v1/payments/create", "POST", "PAYMENTS"));
            arr.add(new Permission("Handle payment callback", "/api/v1/payments/vnpay-callback", "GET", "PAYMENTS"));

            this.permissionRepository.saveAll(arr);
        }

        if (countRoles == 0) {
            List<Permission> allPermissions = this.permissionRepository.findAll();

            // Tạo role SUPER_ADMIN với tất cả các quyền
            Role adminRole = new Role();
            adminRole.setName("SUPER_ADMIN");
            adminRole.setDescription("Quản trị viên hệ thống - có tất cả quyền");
            adminRole.setActive(true);
            adminRole.setPermissions(allPermissions);
            this.roleRepository.save(adminRole);
            
            // Tạo role HR với các quyền liên quan đến quản lý công việc
            Role hrRole = new Role();
            hrRole.setName("HR");
            hrRole.setDescription("Nhà tuyển dụng - Quản lý việc làm");
            hrRole.setActive(true);
            
            // Lọc các quyền cho HR (quản lý công việc và công ty)
            List<Permission> hrPermissions = allPermissions.stream()
                    .filter(p -> p.getModule().equals("JOBS") || 
                                 p.getModule().equals("COMPANIES") || 
                                 p.getModule().equals("EMPLOYER_SUBSCRIPTION") ||
                                 p.getModule().equals("PAYMENTS"))  // Thêm quyền thanh toán
                    .collect(Collectors.toList());
            hrRole.setPermissions(hrPermissions);
            this.roleRepository.save(hrRole);
            
            // Tạo role USER cho người dùng thông thường
            Role userRole = new Role();
            userRole.setName("USER");
            userRole.setDescription("Người dùng thông thường - Tìm việc");
            userRole.setActive(true);
            
            // Lọc các quyền cho USER (xem việc làm, quản lý CV)
            List<Permission> userPermissions = allPermissions.stream()
                    .filter(p -> (p.getModule().equals("JOBS") && p.getMethod().equals("GET")) ||
                                 p.getModule().equals("RESUMES") ||
                                 p.getModule().equals("SUBSCRIBERS"))
                    .collect(Collectors.toList());
            userRole.setPermissions(userPermissions);
            this.roleRepository.save(userRole);
        }

        if (countUsers == 0) {
            // Tạo tài khoản admin
            User adminUser = new User();
            adminUser.setEmail("admin@gmail.com");
            adminUser.setAddress("hue");
            adminUser.setAge(25);
            adminUser.setGender(GenderEnum.MALE);
            adminUser.setName("Admin");
            adminUser.setPassword(this.passwordEncoder.encode("123456"));

            Role adminRole = this.roleRepository.findByName("SUPER_ADMIN");
            if (adminRole != null) {
                adminUser.setRole(adminRole);
            }
            this.userRepository.save(adminUser);
            
            // Tạo tài khoản HR mẫu
            User hrUser = new User();
            hrUser.setEmail("hr@example.com");
            hrUser.setAddress("Hà Nội");
            hrUser.setAge(30);
            hrUser.setGender(GenderEnum.FEMALE);
            hrUser.setName("Nguyễn Thị HR");
            hrUser.setPassword(this.passwordEncoder.encode("123456"));

            Role hrRole = this.roleRepository.findByName("HR");
            if (hrRole != null) {
                hrUser.setRole(hrRole);
            }
            this.userRepository.save(hrUser);
            
            // Tạo tài khoản người dùng mẫu
            User normalUser = new User();
            normalUser.setEmail("user@example.com");
            normalUser.setAddress("TP.HCM");
            normalUser.setAge(22);
            normalUser.setGender(GenderEnum.MALE);
            normalUser.setName("Trần Văn User");
            normalUser.setPassword(this.passwordEncoder.encode("123456"));

            Role userRole = this.roleRepository.findByName("USER");
            if (userRole != null) {
                normalUser.setRole(userRole);
            }
            this.userRepository.save(normalUser);
        }

        if (countPermissions > 0 && countRoles > 0 && countUsers > 0) {
            System.out.println(">>> SKIP INIT DATABASE ~ ALREADY HAVE DATA...");
        } else {
            System.out.println(">>> END INIT DATABASE");
        }
    }

}
