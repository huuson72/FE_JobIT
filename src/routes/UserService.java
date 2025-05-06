package vn.hstore.jobhunter.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import vn.hstore.jobhunter.domain.Company;
import vn.hstore.jobhunter.domain.Role;
import vn.hstore.jobhunter.domain.User;
import vn.hstore.jobhunter.domain.response.ResCreateUserDTO;
import vn.hstore.jobhunter.domain.response.ResUpdateUserDTO;
import vn.hstore.jobhunter.domain.response.ResUserDTO;
import vn.hstore.jobhunter.domain.response.ResultPaginationDTO;
import vn.hstore.jobhunter.repository.UserRepository;
import vn.hstore.jobhunter.util.constant.VerificationStatus;
import vn.hstore.jobhunter.util.constant.GenderEnum;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final CompanyService companyService;
    private final RoleService roleService;

    public UserService(UserRepository userRepository,
            CompanyService companyService,
            RoleService roleService) {
        this.userRepository = userRepository;
        this.companyService = companyService;
        this.roleService = roleService;
    }

    public User getUserById(long id) {
        Optional<User> userOptional = userRepository.findById(id);
        return userOptional.orElseThrow(() -> new IllegalArgumentException("Người dùng không tồn tại"));
    }

    // public User handleCreateUser(User user) {
    //     // check company
    //     if (user.getCompany() != null) {
    //         Optional<Company> companyOptional = this.companyService.findById(user.getCompany().getId());
    //         user.setCompany(companyOptional.isPresent() ? companyOptional.get() : null);
    //     }
    //     // check role
    //     if (user.getRole() != null) {
    //         Role r = this.roleService.fetchById(user.getRole().getId());
    //         user.setRole(r != null ? r : null);
    //     }
    //     return this.userRepository.save(user);
    // }
    public User handleCreateUser(User user) {
        // check company
        if (user.getCompany() != null) {
            Optional<Company> companyOptional = this.companyService.findById(user.getCompany().getId());
            user.setCompany(companyOptional.orElse(null));
        }

        // check role
        if (user.getRole() != null) {
            Role r = this.roleService.fetchById(user.getRole().getId());
            user.setRole(r);
            
            // Nếu người dùng là admin, tự động xác minh
            if (r.getName().equals("ADMIN") || r.getName().equals("SUPER_ADMIN")) {
                user.setVerificationStatus(VerificationStatus.VERIFIED);
            }
        } else {
            // Gán role có ID = 3 nếu user không có role
            Role defaultRole = this.roleService.fetchById(3);
            user.setRole(defaultRole);
        }

        return this.userRepository.save(user);
    }

    public void handleDeleteUser(long id) {
        this.userRepository.deleteById(id);
    }

    public User fetchUserById(long id) {
        Optional<User> userOptional = this.userRepository.findById(id);
        if (userOptional.isPresent()) {
            return userOptional.get();
        }
        return null;
    }

    public ResultPaginationDTO fetchAllUser(Specification<User> spec, Pageable pageable) {
        Page<User> pageUser = this.userRepository.findAll(spec, pageable);
        ResultPaginationDTO rs = new ResultPaginationDTO();
        ResultPaginationDTO.Meta mt = new ResultPaginationDTO.Meta();

        mt.setPage(pageable.getPageNumber() + 1);
        mt.setPageSize(pageable.getPageSize());

        mt.setPages(pageUser.getTotalPages());
        mt.setTotal(pageUser.getTotalElements());

        rs.setMeta(mt);

        // remove sensitive data
        List<ResUserDTO> listUser = pageUser.getContent()
                .stream().map(item -> this.convertToResUserDTO(item))
                .collect(Collectors.toList());

        rs.setResult(listUser);

        return rs;
    }

    // public User handleUpdateUser(User reqUser) {
    //     User currentUser = this.fetchUserById(reqUser.getId());
    //     if (currentUser != null) {
    //         currentUser.setAddress(reqUser.getAddress());
    //         currentUser.setGender(reqUser.getGender());
    //         currentUser.setAge(reqUser.getAge());
    //         currentUser.setName(reqUser.getName());
    //         // check company
    //         if (reqUser.getCompany() != null) {
    //             Optional<Company> companyOptional = this.companyService.findById(reqUser.getCompany().getId());
    //             currentUser.setCompany(companyOptional.isPresent() ? companyOptional.get() : null);
    //         }
    //         // check role
    //         if (reqUser.getRole() != null) {
    //             Role r = this.roleService.fetchById(reqUser.getRole().getId());
    //             currentUser.setRole(r != null ? r : null);
    //         }
    //         // update
    //         currentUser = this.userRepository.save(currentUser);
    //     }
    //     return currentUser;
    // }
    public User handleUpdateUser(User reqUser) {
        User currentUser = this.fetchUserById(reqUser.getId());
        if (currentUser != null) {
            // Kiểm tra email trùng lặp nếu email mới khác email hiện tại
            if (reqUser.getEmail() != null && !reqUser.getEmail().equals(currentUser.getEmail())) {
                boolean isEmailExist = this.isEmailExist(reqUser.getEmail());
                if (isEmailExist) {
                    throw new IllegalArgumentException("Email " + reqUser.getEmail() + " đã tồn tại, vui lòng sử dụng email khác.");
                }
            }
            
            currentUser.setAddress(reqUser.getAddress());
            currentUser.setGender(reqUser.getGender());
            currentUser.setAge(reqUser.getAge());
            currentUser.setName(reqUser.getName());
            currentUser.setEmail(reqUser.getEmail());

            // Check công ty (tránh lỗi NullPointerException)
            if (reqUser.getCompany() != null && reqUser.getCompany().getId() != null) {
                Optional<Company> companyOptional = this.companyService.findById(reqUser.getCompany().getId());
                currentUser.setCompany(companyOptional.orElse(null));
            } else {
                currentUser.setCompany(null); // Nếu không chọn công ty, set null luôn
            }

            // Check role
            if (reqUser.getRole() != null) {
                Role r = this.roleService.fetchById(reqUser.getRole().getId());
                currentUser.setRole(r);
            }

            // Update user
            currentUser = this.userRepository.save(currentUser);
        }
        return currentUser;
    }

    public User handleGetUserByUsername(String username) {
        return this.userRepository.findByEmail(username);
    }

    public boolean isEmailExist(String email) {
        return this.userRepository.existsByEmail(email);
    }

    public ResCreateUserDTO convertToResCreateUserDTO(User user) {
        ResCreateUserDTO res = new ResCreateUserDTO();
        ResCreateUserDTO.CompanyUser com = new ResCreateUserDTO.CompanyUser();

        res.setId(user.getId());
        res.setEmail(user.getEmail());
        res.setName(user.getName());
        res.setAge(user.getAge());
        res.setCreatedAt(user.getCreatedAt());
        res.setGender(user.getGender());
        res.setAddress(user.getAddress());

        if (user.getCompany() != null) {
            com.setId(user.getCompany().getId());
            com.setName(user.getCompany().getName());
            res.setCompany(com);
        }
        return res;
    }

    public ResUpdateUserDTO convertToResUpdateUserDTO(User user) {
        ResUpdateUserDTO res = new ResUpdateUserDTO();
        ResUpdateUserDTO.CompanyUser com = new ResUpdateUserDTO.CompanyUser();
        if (user.getCompany() != null) {
            com.setId(user.getCompany().getId());
            com.setName(user.getCompany().getName());
            res.setCompany(com);
        }

        res.setId(user.getId());
        res.setName(user.getName());
        res.setAge(user.getAge());
        res.setUpdatedAt(user.getUpdatedAt());
        res.setGender(user.getGender());
        res.setAddress(user.getAddress());
        return res;
    }

    public ResUserDTO convertToResUserDTO(User user) {
        ResUserDTO res = new ResUserDTO();
        ResUserDTO.CompanyUser com = new ResUserDTO.CompanyUser();
        ResUserDTO.RoleUser roleUser = new ResUserDTO.RoleUser();
        if (user.getCompany() != null) {
            com.setId(user.getCompany().getId());
            com.setName(user.getCompany().getName());
            res.setCompany(com);
        }

        if (user.getRole() != null) {
            roleUser.setId(user.getRole().getId());
            roleUser.setName(user.getRole().getName());
            res.setRole(roleUser);
        }

        res.setId(user.getId());
        res.setEmail(user.getEmail());
        res.setName(user.getName());
        res.setAge(user.getAge());
        res.setUpdatedAt(user.getUpdatedAt());
        res.setCreatedAt(user.getCreatedAt());
        res.setGender(user.getGender());
        res.setAddress(user.getAddress());
        res.setPhone(user.getPhone());
        return res;
    }

    public void updateUserToken(String token, String email) {
        User currentUser = this.handleGetUserByUsername(email);
        if (currentUser != null) {
            currentUser.setRefreshToken(token);
            this.userRepository.save(currentUser);
        }
    }

    public User getUserByRefreshTokenAndEmail(String token, String email) {
        return this.userRepository.findByRefreshTokenAndEmail(token, email);
    }

    /**
     * Get the currently authenticated user.
     * 
     * @return the currently authenticated user, or null if not authenticated
     */
    public User getCurrentUser() {
        Optional<String> currentUserLogin = vn.hstore.jobhunter.util.SecurityUtil.getCurrentUserLogin();
        if (currentUserLogin.isPresent()) {
            return this.handleGetUserByUsername(currentUserLogin.get());
        }
        return null;
    }

    public ResultPaginationDTO getUsers(Specification<User> spec, Pageable pageable) {
        Page<User> pUser = this.userRepository.findAll(spec, pageable);
        ResultPaginationDTO rs = new ResultPaginationDTO();
        ResultPaginationDTO.Meta mt = new ResultPaginationDTO.Meta();

        mt.setPage(pageable.getPageNumber() + 1);
        mt.setPageSize(pageable.getPageSize());

        mt.setPages(pUser.getTotalPages());
        mt.setTotal(pUser.getTotalElements());

        rs.setMeta(mt);
        rs.setResult(pUser.getContent());
        return rs;
    }
    
    /**
     * Lấy danh sách nhà tuyển dụng đang chờ xác minh
     */
    public ResultPaginationDTO getPendingEmployers(Specification<User> spec, Pageable pageable) {
        // Tạo specification để lọc nhà tuyển dụng đang chờ xác minh
        Specification<User> pendingSpec = (root, query, criteriaBuilder) -> {
            return criteriaBuilder.and(
                criteriaBuilder.equal(root.get("role").get("name"), "HR"),
                criteriaBuilder.equal(root.get("verificationStatus"), VerificationStatus.PENDING)
            );
        };
        
        // Kết hợp với specification được truyền vào
        Specification<User> combinedSpec = spec.and(pendingSpec);
        
        return getUsers(combinedSpec, pageable);
    }
    
    /**
     * Cập nhật trạng thái xác minh của nhà tuyển dụng
     */
    @Transactional
    public User updateEmployerVerificationStatus(Long userId, VerificationStatus status) {
        User user = getUserById(userId);
        
        // Kiểm tra xem người dùng có phải là HR không
        if (user.getRole() == null || !user.getRole().getName().equals("HR")) {
            throw new RuntimeException("Người dùng không phải là nhà tuyển dụng");
        }
        
        // Nếu người dùng là admin, tự động xác minh
        if (user.getRole().getName().equals("ADMIN") || user.getRole().getName().equals("SUPER_ADMIN")) {
            user.setVerificationStatus(VerificationStatus.VERIFIED);
        } else {
            user.setVerificationStatus(status);
        }
        
        return userRepository.save(user);
    }

    @Transactional
    public ResUserDTO updateHRCompany(Long hrId, Long companyId, String name, String description, String address, String logo) {
        // Lấy thông tin HR
        User hr = getUserById(hrId);
        
        // Kiểm tra xem người dùng có phải là HR không
        if (hr.getRole() == null || !hr.getRole().getName().equals("HR")) {
            throw new RuntimeException("Người dùng không phải là HR");
        }
        
        // Kiểm tra công ty mới có tồn tại không
        Optional<Company> companyOptional = companyService.findById(companyId);
        if (!companyOptional.isPresent()) {
            throw new RuntimeException("Công ty không tồn tại");
        }
        
        // Cập nhật thông tin công ty
        Company company = companyOptional.get();
        if (name != null) company.setName(name);
        if (description != null) company.setDescription(description);
        if (address != null) company.setAddress(address);
        if (logo != null) company.setLogo(logo);
        
        // Lưu thông tin công ty đã cập nhật
        company = companyService.handleUpdateCompany(company);
        
        // Cập nhật công ty cho HR
        hr.setCompany(company);
        User updatedUser = userRepository.save(hr);
        
        // Chuyển đổi sang DTO và trả về
        return convertToResUserDTO(updatedUser);
    }

    @Transactional
    public ResUserDTO updateCompanyInfo(String companyName, String companyAddress, 
                                      String companyDescription, String companyLogo, String businessLicense) {
        // Lấy thông tin HR hiện tại từ token
        User hr = getCurrentUser();
        
        // Kiểm tra xem người dùng có phải là HR không
        if (hr.getRole() == null || !hr.getRole().getName().equals("HR")) {
            throw new RuntimeException("Người dùng không phải là HR");
        }
        
        // Kiểm tra HR có công ty không
        if (hr.getCompany() == null) {
            throw new RuntimeException("HR chưa được gán vào công ty nào");
        }
        
        // Cập nhật thông tin công ty
        Company company = hr.getCompany();
        company.setName(companyName);
        company.setAddress(companyAddress);
        if (companyDescription != null) company.setDescription(companyDescription);
        if (companyLogo != null) company.setLogo(companyLogo);
        
        // Lưu thông tin công ty đã cập nhật
        company = companyService.handleUpdateCompany(company);
        
        // Cập nhật giấy phép kinh doanh cho HR nếu có
        if (businessLicense != null) {
            hr.setBusinessLicense(businessLicense);
            hr = userRepository.save(hr);
        }
        
        // Chuyển đổi sang DTO và trả về
        return convertToResUserDTO(hr);
    }

    @Transactional
    public ResUserDTO updateEmployerInfo(Long hrId, Long companyId, String companyName, String companyAddress, 
                                        String companyDescription, String companyLogo, String businessLicense,
                                        String name, String address, String phone, int age, GenderEnum gender) {
        // Lấy thông tin HR
        User hr = getUserById(hrId);
        
        // Kiểm tra xem người dùng có phải là HR không
        if (hr.getRole() == null || !hr.getRole().getName().equals("HR")) {
            throw new RuntimeException("Người dùng không phải là HR");
        }
        
        // Kiểm tra công ty có tồn tại không
        Optional<Company> companyOptional = companyService.findById(companyId);
        if (!companyOptional.isPresent()) {
            throw new RuntimeException("Công ty không tồn tại");
        }
        
        // Kiểm tra HR có thuộc công ty này không
        if (!hr.getCompany().getId().equals(companyId)) {
            throw new RuntimeException("HR không thuộc công ty này");
        }
        
        // Cập nhật thông tin công ty
        Company company = companyOptional.get();
        company.setName(companyName);
        company.setAddress(companyAddress);
        if (companyDescription != null) company.setDescription(companyDescription);
        if (companyLogo != null) company.setLogo(companyLogo);
        
        // Lưu thông tin công ty đã cập nhật
        company = companyService.handleUpdateCompany(company);
        
        // Cập nhật thông tin cá nhân của HR
        if (name != null) hr.setName(name);
        if (address != null) hr.setAddress(address);
        if (phone != null) hr.setPhone(phone);
        if (age > 0) hr.setAge(age);
        if (gender != null) hr.setGender(gender);
        if (businessLicense != null) hr.setBusinessLicense(businessLicense);
        
        // Lưu thông tin HR đã cập nhật
        hr = userRepository.save(hr);
        
        // Chuyển đổi sang DTO và trả về
        return convertToResUserDTO(hr);
    }

    @Transactional
    public ResUserDTO updateHRInfo(String name, String address, String phone, 
                                  Integer age, GenderEnum gender, String businessLicense,
                                  String companyName, String companyAddress, 
                                  String companyDescription, String companyLogo) {
        // Lấy thông tin HR hiện tại từ token
        User hr = getCurrentUser();
        
        // Kiểm tra xem người dùng có phải là HR không
        if (hr.getRole() == null || !hr.getRole().getName().equals("HR")) {
            throw new RuntimeException("Người dùng không phải là HR");
        }
        
        // Cập nhật thông tin cá nhân
        hr.setName(name);
        hr.setAddress(address);
        hr.setPhone(phone);
        hr.setAge(age);
        hr.setGender(gender);
        if (businessLicense != null) {
            hr.setBusinessLicense(businessLicense);
        }
        
        // Cập nhật thông tin công ty nếu HR đã có công ty
        if (hr.getCompany() != null) {
            Company company = hr.getCompany();
            company.setName(companyName);
            company.setAddress(companyAddress);
            if (companyDescription != null) company.setDescription(companyDescription);
            if (companyLogo != null) company.setLogo(companyLogo);
            
            // Lưu thông tin công ty đã cập nhật
            company = companyService.handleUpdateCompany(company);
        }
        
        // Lưu thông tin HR đã cập nhật
        hr = userRepository.save(hr);
        
        // Chuyển đổi sang DTO và trả về
        return convertToResUserDTO(hr);
    }
}
