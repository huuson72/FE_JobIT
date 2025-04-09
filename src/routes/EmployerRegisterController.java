package vn.hstore.jobhunter.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import vn.hstore.jobhunter.domain.Company;
import vn.hstore.jobhunter.domain.Role;
import vn.hstore.jobhunter.domain.User;
import vn.hstore.jobhunter.domain.request.EmployerRegisterDTO;
import vn.hstore.jobhunter.domain.response.ResCreateUserDTO;
import vn.hstore.jobhunter.domain.response.RestResponse;
import vn.hstore.jobhunter.service.CompanyService;
import vn.hstore.jobhunter.service.RoleService;
import vn.hstore.jobhunter.service.UserService;
import vn.hstore.jobhunter.util.annotation.ApiMessage;
import vn.hstore.jobhunter.util.constant.RoleConstants;
import vn.hstore.jobhunter.util.error.IdInvalidException;

@RestController
@RequestMapping("/api/v1/auth")
public class EmployerRegisterController {

    private final UserService userService;
    private final RoleService roleService;
    private final CompanyService companyService;
    private final PasswordEncoder passwordEncoder;

    public EmployerRegisterController(
            UserService userService,
            RoleService roleService,
            CompanyService companyService,
            PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.roleService = roleService;
        this.companyService = companyService;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/employer-register")
    @ApiMessage("Register a new employer")
    public ResponseEntity<RestResponse<ResCreateUserDTO>> registerEmployer(
            @Valid @RequestBody EmployerRegisterDTO registerRequest) {
        
        try {
            // Kiểm tra email đã tồn tại chưa
            boolean isEmailExist = this.userService.isEmailExist(registerRequest.getEmail());
            if (isEmailExist) {
                throw new IdInvalidException(
                        "Email " + registerRequest.getEmail() + " đã tồn tại, vui lòng sử dụng email khác.");
            }
            
            // Tạo công ty mới
            Company company = new Company();
            company.setName(registerRequest.getCompanyName());
            company.setAddress(registerRequest.getCompanyAddress());
            company.setDescription(registerRequest.getCompanyDescription());
            company.setLogo(registerRequest.getCompanyLogo());
            
            Company savedCompany = this.companyService.handleCreateCompany(company);
            
            // Tạo người dùng mới
            User user = new User();
            user.setEmail(registerRequest.getEmail());
            user.setPassword(this.passwordEncoder.encode(registerRequest.getPassword()));
            user.setName(registerRequest.getName());
            user.setAddress(registerRequest.getAddress());
            user.setAge(registerRequest.getAge());
            user.setGender(registerRequest.getGender());
            user.setPhone(registerRequest.getPhone());
            
            // Lưu đường dẫn giấy phép kinh doanh
            user.setBusinessLicense(registerRequest.getBusinessLicense());
            
            // Gán công ty cho người dùng
            user.setCompany(savedCompany);
            
            // Tìm role HR và gán cho người dùng
            Role hrRole = this.roleService.findByName(RoleConstants.ROLE_HR);
            if (hrRole == null) {
                throw new RuntimeException("Không tìm thấy vai trò HR trong hệ thống.");
            }
            user.setRole(hrRole);
            
            // Lưu người dùng
            User savedUser = this.userService.handleCreateUser(user);
            
            // Tạo response
            ResCreateUserDTO userDTO = this.userService.convertToResCreateUserDTO(savedUser);
            
            RestResponse<ResCreateUserDTO> response = new RestResponse<>();
            response.setStatusCode(201);
            response.setError(null);
            response.setMessage("Đăng ký nhà tuyển dụng thành công!");
            response.setData(userDTO);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (IdInvalidException e) {
            RestResponse<ResCreateUserDTO> errorResponse = new RestResponse<>();
            errorResponse.setStatusCode(400);
            errorResponse.setError("Bad Request");
            errorResponse.setMessage(e.getMessage());
            errorResponse.setData(null);
            
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (Exception e) {
            RestResponse<ResCreateUserDTO> errorResponse = new RestResponse<>();
            errorResponse.setStatusCode(500);
            errorResponse.setError("Internal Server Error");
            errorResponse.setMessage(e.getMessage());
            errorResponse.setData(null);
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
} 